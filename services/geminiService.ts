
import type { DiagramResult } from '../types';

export const transformImageToDiagram = async (base64ImageData: string, mimeType: string): Promise<Pick<DiagramResult, 'imageUrl' | 'explanation'>> => {
  try {
    const response = await fetch('/api/generate-diagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64ImageData,
        mimeType: mimeType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      imageUrl: result.imageUrl,
      explanation: result.explanation,
    };

  } catch (error) {
    console.error("Error calling backend API:", error);
    if (error instanceof Error) {
      throw new Error(`Backend API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the backend API.");
  }
};
