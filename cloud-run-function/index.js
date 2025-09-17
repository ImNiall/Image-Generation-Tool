const functions = require('@google-cloud/functions-framework');
const { VertexAI } = require('@google-cloud/vertexai');

functions.http('handler', async (req, res) => {
  // CORS for browser calls
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Optional browser health-check
    if (req.method === 'GET') {
      res.status(200).json({ ok: true, health: 'up' });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = body.prompt || 'Analyze the provided image and return a clear diagram explanation.';
    const imageData = body.imageData; // base64 (no data URL prefix expected)
    const mimeType = body.mimeType || 'image/png';

    // Safe fallbacks
    const project = process.env.VERTEX_PROJECT_ID || 'theinstructorshub-472219';
    const location = process.env.VERTEX_LOCATION || 'us-central1';

    const vertex = new VertexAI({ project, location });
    // Use user's requested preview model by default; allow override via env VERTEX_MODEL
    const modelName = process.env.VERTEX_MODEL || 'gemini-2.5-flash-image-preview';
    const model = vertex.getGenerativeModel({ model: modelName });

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];

    // If frontend supplied base64 image data, attach as inlineData
    if (imageData && typeof imageData === 'string' && imageData.trim().length > 0) {
      // If the string accidentally contains a data URL prefix, strip it
      const cleaned = imageData.includes(',') ? imageData.split(',').pop() : imageData;
      contents[0].parts.push({ inlineData: { data: cleaned, mimeType } });
    }

    const result = await model.generateContent({ contents });

    // Try to extract a human-readable explanation from common Vertex shapes
    const text =
      result?.output_text ||
      result?.text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join('\n') ||
      JSON.stringify(result).slice(0, 2000);

    // Normalize to the UI contract expected by the frontend
    res.status(200).json({
      imageUrl: '', // Placeholder for future image-generation endpoint
      explanation: String(text || 'No explanation generated.'),
    });
  } catch (err) {
    console.error('Vertex AI error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
});
