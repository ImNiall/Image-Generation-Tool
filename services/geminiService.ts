
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { GEMINI_IMAGE_EDIT_MODEL, AI_PROMPT } from '../constants';
import type { DiagramResult } from '../types';

const apiKey = (import.meta as any).env.VITE_API_KEY;

if (!apiKey) {
    console.warn("VITE_API_KEY environment variable not set. Using mock data.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });

const fileToGenerativePart = (base64Data: string, mimeType: string): Part => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const transformImageToDiagram = async (base64ImageData: string, mimeType: string): Promise<Pick<DiagramResult, 'imageUrl' | 'explanation'>> => {
  // MOCK BEHAVIOR FOR DEVELOPMENT if API_KEY is missing
  if (!apiKey) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          imageUrl: `https://picsum.photos/seed/${Date.now()}/800/600`,
          explanation: "This is a mock diagram as the API key is not configured."
        });
      }, 3000);
    });
  }

  try {
    const imagePart = fileToGenerativePart(base64ImageData, mimeType);
    const textPart = { text: AI_PROMPT };

    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_EDIT_MODEL,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let imageUrl: string | null = null;
    let explanation: string | undefined;

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Bytes = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          imageUrl = `data:${imageMimeType};base64,${base64Bytes}`;
        } else if (part.text) {
          explanation = part.text.trim();
        }
      }
    }

    if (!imageUrl) {
      throw new Error("API did not return an image. The content may have been blocked.");
    }
    
    return { imageUrl, explanation };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};