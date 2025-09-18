
import type { DiagramResult } from '../types';

// Use the Cloud Run URL directly to avoid accidental overrides that may point
// to the static site origin (which would cause XML 400 errors from GCS).
const API_URL = 'https://generate-diagram-569099138803.us-central1.run.app';

export const transformImageToDiagram = async (
  base64ImageData: string,
  mimeType: string
): Promise<Pick<DiagramResult, 'imageUrl' | 'explanation'>> => {
  try {
    // First attempt: send the original payload your UI already prepares
    // so we stay backward compatible if the backend supports it.
    const payload = {
      imageData: base64ImageData,
      mimeType,
      // Helpful default prompt for backends that accept it
      prompt:
        'Analyze the provided image data and return a clear, concise diagram explanation and a rendered diagram URL if available.',
    } as Record<string, unknown>;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('[geminiService] API_URL:', API_URL);
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
