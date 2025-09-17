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

    // Safe fallbacks
    const project = process.env.VERTEX_PROJECT_ID || 'theinstructorshub-472219';
    const location = process.env.VERTEX_LOCATION || 'us-central1';

    const vertex = new VertexAI({ project, location });
    const model = vertex.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];

    // Future image support:
    // if (body.imageUrl) contents[0].parts.push({ fileData: { fileUri: body.imageUrl, mimeType: 'image/png' } });
    // if (body.imageData && body.mimeType) contents[0].parts.push({ inlineData: { data: body.imageData, mimeType: body.mimeType } });

    const result = await model.generateContent({ contents });
    res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('Vertex AI error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
});
