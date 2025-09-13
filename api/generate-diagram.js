import { GoogleGenAI, Modality } from "@google/genai";

// Netlify function configuration
export const config = {
  maxDuration: 30 // 30 seconds timeout
};

const GEMINI_IMAGE_EDIT_MODEL = "gemini-2.0-flash-exp";
const AI_PROMPT = `You are an expert at creating clear, professional driving scenario diagrams. 

Analyze this image and create a simplified, clean diagram that shows:
1. Road layout and structure
2. Key landmarks or buildings
3. Traffic flow directions with arrows
4. Important signage or signals
5. Any notable features for driving navigation

Style requirements:
- Clean, minimalist design
- Clear labels and arrows
- High contrast colors
- Professional appearance suitable for driving instruction
- Remove unnecessary visual clutter
- Focus on elements relevant to driving and navigation

Create a diagram that would help someone understand the driving scenario and navigation at this location.`;

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug logging
    console.log('Request method:', req.method);
    console.log('Request body type:', typeof req.body);
    console.log('Request body:', req.body);

    // Parse JSON body for Netlify Functions
    let body;
    try {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else {
        body = req.body;
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    
    const { imageData, mimeType } = body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ error: 'Missing imageData or mimeType' });
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.VITE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType,
      },
    };
    
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

    let imageUrl = null;
    let explanation = undefined;

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
      return res.status(500).json({ 
        error: "API did not return an image. The content may have been blocked or the response was empty." 
      });
    }
    
    return res.status(200).json({ imageUrl, explanation });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ 
      error: `Gemini API Error: ${error.message}` 
    });
  }
}
