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

export const handler = async (event, context) => {
  // Debug logging for method detection
  console.log('Event object:', JSON.stringify(event, null, 2));
  console.log('HTTP Method from event:', event.httpMethod);
  console.log('HTTP Method from headers:', event.headers);
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed. Received:', event.httpMethod);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Debug logging
    console.log('Request method:', event.httpMethod);
    console.log('Request body type:', typeof event.body);
    console.log('Request body:', event.body);

    // Parse JSON body for Netlify Functions
    let body;
    try {
      if (typeof event.body === 'string') {
        body = JSON.parse(event.body);
      } else {
        body = event.body;
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
    
    const { imageData, mimeType } = body;

    if (!imageData || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing imageData or mimeType' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // Get API key from environment (server-side only)
    const apiKey = process.env.VITE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
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
      return new Response(JSON.stringify({ 
        error: "API did not return an image. The content may have been blocked or the response was empty." 
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response(JSON.stringify({ imageUrl, explanation }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return new Response(JSON.stringify({ 
      error: `Gemini API Error: ${error.message}` 
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
