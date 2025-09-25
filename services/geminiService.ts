import type { DiagramResult } from '../types';
import { supabase } from '../lib/supabase';

// Determine API base for image generation
// Only support GEMINI_API_KEY-backed service via VITE_IMAGE_API_URL
const ENV_API = (import.meta as any)?.env?.VITE_IMAGE_API_URL as string | undefined;
if (!ENV_API || typeof ENV_API !== 'string' || ENV_API.trim().length === 0) {
  throw new Error(
    'Missing VITE_IMAGE_API_URL. Configure your frontend build to point to your Cloud Run Function that uses GEMINI_API_KEY.'
  );
}
const API_BASE = ENV_API.trim();

function normalizeBase(url: string) {
  return url.replace(/\/$/, '');
}

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoffMs = 800
) {
  let attempt = 0;
  let lastError: any = null;
  while (attempt < retries) {
    try {
      const resp = await fetch(url, options);
      if (resp.ok) return resp;
      if ([429, 500, 502, 503, 504].includes(resp.status)) {
        const wait = backoffMs * Math.pow(2, attempt);
        await sleep(wait);
        attempt++;
        continue;
      }
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    } catch (e) {
      lastError = e;
      const wait = backoffMs * Math.pow(2, attempt);
      await sleep(wait);
      attempt++;
    }
  }
  throw lastError ?? new Error('Network error');
}

export const transformImageToDiagram = async (
  base64ImageData: string,
  mimeType: string,
  parentId?: string
): Promise<Pick<DiagramResult, 'imageUrl' | 'explanation'>> => {
  try {
    // Original payload used across backends
    const payload = {
      imageData: base64ImageData,
      mimeType,
      prompt:
        'Analyze the provided image data and return a clear, concise diagram explanation and a rendered diagram URL if available.',
      ...(parentId ? { parentId } : {}),
    } as Record<string, unknown>;

    // Get Supabase session token if logged in
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    // Call the Cloud Run Function/HTTP handler at its root
    const preferredUrl = normalizeBase(API_BASE);

    let response = await fetchWithRetry(preferredUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    // No alternate retry path; service must accept POST at root

    const responseText = await response.text();
    console.log('[geminiService] API_BASE:', API_BASE);
    console.log('[geminiService] status:', response.status);
    console.log('[geminiService] headers:', Object.fromEntries(response.headers.entries()));
    console.log('[geminiService] body (first 500):', responseText.slice(0, 500));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    // Parse JSON safely
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON from backend: ${responseText.slice(0, 200)}...`);
    }

    // Support multiple backend shapes
    // 1) Legacy shape: { imageUrl, explanation }
    if (parsed?.imageUrl || parsed?.explanation) {
      return {
        imageUrl: parsed.imageUrl ?? '',
        explanation: String(parsed.explanation ?? ''),
      };
    }

    // 2) Cloud Run sample: { ok: true, result: ... }
    if (parsed?.ok && parsed?.result) {
      // Try to find text within typical Vertex responses
      const maybeText =
        parsed.result?.output_text ||
        parsed.result?.text ||
        parsed.result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        parsed.result?.candidates?.[0]?.content?.parts?.[0]?.stringValue ||
        parsed.result?.candidates?.[0]?.content?.parts?.[0]?.rawText;

      return {
        imageUrl: parsed.result?.imageUrl ?? '',
        explanation: String(maybeText ?? JSON.stringify(parsed.result).slice(0, 1000)),
      };
    }

    // 3) Fallback: stringify entire object for visibility
    return {
      imageUrl: parsed?.imageUrl ?? '',
      explanation: JSON.stringify(parsed).slice(0, 1000),
    };
  } catch (error) {
    console.error('[geminiService] Backend call failed:', error);
    if (error instanceof Error) {
      throw new Error(`Backend API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the backend API.');
  }
};
