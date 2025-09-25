// Express server for Cloud Run deployment
const express = require('express');
const cors = require('cors');
const { VertexAI } = require("@google-cloud/vertexai");
const { createClient } = require('@supabase/supabase-js');

// Import environment variables
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Constants for Gemini API
const GEMINI_IMAGE_EDIT_MODEL = process.env.VERTEX_MODEL_ID || "gemini-2.5-flash-image-preview";
const SYSTEM_PROMPT = `
### SYSTEM PERSONA ###
You are "Diagrammaton-5000," a hyper-precise visual AI that converts aerial photography into clean, minimalist clip‑art vector diagrams for educational driving scenarios. You strictly follow the rules below.

### CORE DIRECTIVE ###
Produce a strict 1:1 mirrored conversion of the uploaded aerial layout as a brand‑new illustration (no overlays). Remove all vehicles and all text.

---

### NON-NEGOTIABLE RULES ###

- **REMOVE ALL VEHICLES:** No cars, buses, bikes, motorcycles, or pedestrians. Also remove their shadows.
- **REMOVE ALL TEXT:** No labels, road names, shop names, lane numbers, or any typography.
- **PRESERVE GEOMETRY:** Keep exact road shapes, lane layout, junctions, islands, roundabouts, kerbs, and crossings. Do not invent or omit infrastructure.

-### ILLUSTRATED CLIP-ART STYLE (match this aesthetic) ###
- Flat, clean vector look with solid fills and no textures.
- Subtle thin outlines (~1–2 px) around roads, islands, buildings, and grass; avoid heavy borders.
- Lane markings in crisp white. Only include markings that are clearly present in the source.
- Muted palette (use these exact hex values):
  - Primary roads (main carriageway): #B3B3B3
  - Secondary/local roads: #C7C7C7
  - Lane markings/arrows: #FFFFFF
  - Kerbs/raised islands: #E6D7BD
  - Sidewalks/pavements: #D0D6E2
  - Grass/land: #6FA66B
  - Building walls/facades: #EDE9E2
  - Building roofs: #B6503A
- No text anywhere. No logos. No watermarks.

### HALLUCINATION GUARD ###
- Do not invent any symbols or markings that are not visible in the source (e.g., do not add new arrows or labels). If uncertain, leave the area blank.
`;
const USER_PROMPT = 'Mirror the uploaded layout exactly as a new flat vector diagram. Remove vehicles and all text. Keep only the directional arrows that exist in the source (do not add new ones). Apply the illustrated clip‑art style with thin outlines and the muted palette described.';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('API is running');
});

// Credits endpoint
app.get('/api/credits', async (req, res) => {
  try {
    // Get the JWT from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Query the user_credits table
    const { data: credits, error: dbError } = await supabaseAdmin
      .from('user_credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to fetch credits' });
    }

    // Return credits (0 if no record found)
    return res.status(200).json({ 
      credits_remaining: credits?.credits_remaining || 0,
      user_id: user.id
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Extracted handler to support multiple routes
async function handleGenerateDiagram(req, res) {
  try {
    const { imageData, mimeType } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ error: 'Missing imageData or mimeType' });
    }

    // Service account authentication
    const serviceAccountJson = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION;

    if (!serviceAccountJson) {
      return res.status(500).json({ error: 'Missing VERTEX_SERVICE_ACCOUNT_KEY environment variable' });
    }

    if (!location) {
      return res.status(500).json({ error: 'Missing VERTEX_LOCATION environment variable' });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error('Failed to parse VERTEX_SERVICE_ACCOUNT_KEY JSON:', e);
      return res.status(500).json({ error: 'Invalid VERTEX_SERVICE_ACCOUNT_KEY JSON' });
    }

    // Normalize project ID: users sometimes set the service account email by mistake
    let resolvedProjectId = projectId || credentials.project_id;
    if (resolvedProjectId && /@|\.iam\.gserviceaccount\.com$/i.test(resolvedProjectId)) {
      console.warn('[VertexAI] VERTEX_PROJECT_ID appears to be a service account email; falling back to credentials.project_id');
      resolvedProjectId = credentials.project_id;
    }
    if (!resolvedProjectId) {
      return res.status(500).json({ error: 'Missing VERTEX_PROJECT_ID and project_id not found in service account JSON' });
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
    
    const generativeModel = vertex.getGenerativeModel({
      model: GEMINI_IMAGE_EDIT_MODEL,
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    const contents = [
      {
        role: 'user',
        parts: [
          { inlineData: { data: imageData, mimeType } },
          { text: USER_PROMPT },
        ],
      },
    ];

    // Build request with strict decoding params for lower variance
    const request = {
      contents,
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        candidateCount: 1,
      },
    };

    const response = await generativeModel.generateContent(request);

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

// Generate diagram endpoints (both paths supported)
app.post('/api/generate-diagram', handleGenerateDiagram);
app.post('/api/generate', handleGenerateDiagram);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
