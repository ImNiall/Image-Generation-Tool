import { VertexAI } from "@google-cloud/vertexai";

// Netlify function configuration
export const config = {
  maxDuration: 30 // 30 seconds timeout
};

const GEMINI_IMAGE_EDIT_MODEL = process.env.VERTEX_MODEL_ID || "gemini-2.5-flash-image-preview";
const AI_PROMPT = `
### SYSTEM PERSONA ###
You are "Diagrammaton-5000," a hyper-precise visual AI specializing in the transformation of complex aerial photography into flawless, minimalist vector diagrams for educational purposes. Your sole purpose is to execute the user's request with absolute fidelity to the following rules. You are not a creative artist; you are a master of clean, informational illustration.

### CORE DIRECTIVE ###
Analyze the provided aerial source image of a road layout. Your mission is to re-create it as a simplified, clean, professional clip-art style diagram. Adherence to the style guide and removal rules is paramount.

---

### NON-NEGOTIABLE RULES OF TRANSFORMATION ###

#### RULE 1: THE AESTHETIC - FLAT VECTOR CLIP-ART
This is the required visual style. There are no exceptions.
- **Outlines:** Every single distinct object MUST have a clean, uniform, thin black outline. This includes roads, curbs, buildings, trees, grass patches, and every individual road marking.
- **Color Fills:** Use ONLY solid, flat, block colors. Gradients, shading, lighting, shadows, and textures are FORBIDDEN.
- **Simplification:** Reduce all forms to their fundamental geometric shapes. Buildings are simple blocks. Trees are circles or basic cloud shapes. Detail is noise; eliminate it.

#### RULE 2: THE PURGE - MANDATORY REMOVALS
The following elements from the source image MUST be completely and utterly eradicated from the final diagram. The resulting scene must be sterile and unoccupied.
- **ERADICATE ALL VEHICLES:** The roads must be perfectly empty. Remove every car, truck, bus, motorcycle, bicycle, or any other form of transport.
- **ERADICATE ALL TEXT:** Eliminate all textual information. This includes street names, building signs, traffic sign text, and any other lettering.
- **ERADICATE ALL DIRECTIONAL ARROWS:** Completely remove all painted directional arrows on the road surface (e.g., straight, left-turn, right-turn arrows).

#### RULE 3: THE PRESERVATION - CRITICAL ELEMENTS TO RETAIN
While you purge the unwanted elements, you MUST faithfully preserve and stylize the following core infrastructure. **DO NOT REMOVE THESE.**
- **Road Geometry:** The exact layout of roads, intersections, curves, and roundabouts must be perfectly maintained.
- **ESSENTIAL ROAD MARKINGS:** All road markings—**EXCEPT for directional arrows**—are CRITICAL. You MUST re-draw them in the clip-art style. This includes:
    - Lane divider lines (dashed and solid)
    - Stop lines
    - Pedestrian crossings (zebra crossings)
    - Edge lines
    - Give way/yield lines
    - Box junctions (yellow criss-cross)
- **Surrounding Environment:**
    - **Buildings:** Render as simple, outlined blocks with flat colors.
    - **Greenery:** Render grass and trees as simple, outlined shapes with flat green colors.
    - **Sidewalks:** Render as simple, outlined paths.

#### RULE 4: THE INTEGRITY - AVOID HALLUCINATION
- **ABSOLUTE FIDELITY:** You MUST NOT invent, create, add, or "hallucinate" any objects or markings that are not present in the original source image. Your job is to simplify and clean, not to imagine or embellish. If a road marking (like a directional arrow) is NOT in the source, you do NOT add it.
- **PERSPECTIVE:** The top-down aerial perspective of the source image must be strictly maintained.

---

### FINAL OUTPUT SPECIFICATION ###
- **Image Only:** Your response MUST be the generated image file.
- **No Textual Response:** Do NOT provide any accompanying text, explanation, title, or description. Your only output is the visual diagram.
`;

export const handler = async (event, context) => {
  // Debug logging for method detection
  console.log('Event object:', JSON.stringify(event, null, 2));
  console.log('HTTP Method from event:', event.httpMethod);
  console.log('HTTP Method from headers:', event.headers);
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed. Received:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
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
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }
    
    const { imageData, mimeType } = body;

    if (!imageData || !mimeType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing imageData or mimeType' }),
      };
    }

// Service account authentication (server-side only)
    const serviceAccountJson = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION;

    if (!serviceAccountJson) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing VERTEX_SERVICE_ACCOUNT_KEY environment variable' }),
      };
    }

    if (!location) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing VERTEX_LOCATION environment variable' }),
      };
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error('Failed to parse VERTEX_SERVICE_ACCOUNT_KEY JSON:', e);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid VERTEX_SERVICE_ACCOUNT_KEY JSON' }),
      };
    }

    // Normalize project ID: users sometimes set the service account email by mistake
    let resolvedProjectId = projectId || credentials.project_id;
    if (resolvedProjectId && /@|\.iam\.gserviceaccount\.com$/i.test(resolvedProjectId)) {
      console.warn('[VertexAI] VERTEX_PROJECT_ID appears to be a service account email; falling back to credentials.project_id');
      resolvedProjectId = credentials.project_id;
    }
    if (!resolvedProjectId) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing VERTEX_PROJECT_ID and project_id not found in service account JSON' }),
      };
    }

    const vertex = new VertexAI({
      project: resolvedProjectId,
      location,
      googleAuthOptions: {
        credentials,
      },
    });
    // Debug logging to verify correct project/region/model
    console.log('[VertexAI] Project:', resolvedProjectId);
    console.log('[VertexAI] Location:', location);
    console.log('[VertexAI] Model:', GEMINI_IMAGE_EDIT_MODEL);
    
    const generativeModel = vertex.getGenerativeModel({ model: GEMINI_IMAGE_EDIT_MODEL });

    const contents = [
      {
        role: 'user',
        parts: [
          { inlineData: { data: imageData, mimeType } },
          { text: AI_PROMPT },
        ],
      },
    ];

    const response = await generativeModel.generateContent({ contents });

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
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: "API did not return an image. The content may have been blocked or the response was empty." 
        }),
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl, explanation }),
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: `Gemini API Error: ${error.message}` 
      }),
    };
  }
}
