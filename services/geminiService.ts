
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

    // DEBUG: Log raw response
    const responseText = await response.text();
    console.log('Raw response status:', response.status);
    console.log('Raw response text:', responseText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('Non-OK response:', response.status, responseText);
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse failed:', parseError);
      console.error('Response was:', responseText.substring(0, 500));
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }

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
