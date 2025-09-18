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

    // Robust body parsing (Cloud Run / FF can give object already)
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const prompt = body.prompt || 'Analyze the provided image and return a clear diagram explanation.';
    const imageData = body.imageData; // base64 (no data URL prefix expected)
    const mimeType = body.mimeType || 'image/png';

    // Safe fallbacks
    const project = process.env.VERTEX_PROJECT_ID || 'theinstructorshub-472219';
    const location = process.env.VERTEX_LOCATION || 'us-central1';

    // Use user's requested model by default; allow override via env VERTEX_MODEL
    const modelName = String(process.env.VERTEX_MODEL || 'gemini-2.5-flash-image-preview').trim();

    // Build common contents array
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    if (imageData && typeof imageData === 'string' && imageData.trim().length > 0) {
      const cleaned = imageData.includes(',') ? imageData.split(',').pop() : imageData;
      contents[0].parts.push({ inlineData: { data: cleaned, mimeType } });
    }

    let explanationText = '';

    // Route preview models (e.g., *image-preview) to global Gemini API.
    const forceGlobal = String(process.env.GEMINI_FORCE_GLOBAL || '').trim() === '1';
    const isPreview = /image-preview/i.test(modelName) || /preview/i.test(modelName) || forceGlobal;

    console.log('[handler] project:', project, 'location:', location, 'modelName:', modelName, 'isPreview:', isPreview);

    if (isPreview) {
      // Route preview model to the global Gemini API endpoint (AI Studio)
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ ok: false, error: 'Missing GEMINI_API_KEY for preview model call.' });
        return;
      }
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const aiResp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });
      const aiText = await aiResp.text();
      if (!aiResp.ok) {
        console.error('[handler] Gemini global error:', aiResp.status, aiText.slice(0, 2000));
        res.status(aiResp.status).json({ ok: false, source: 'gemini-global', status: aiResp.status, error: aiText.slice(0, 4000) });
        return;
      }
      let aiJson;
      try { aiJson = JSON.parse(aiText); } catch { aiJson = { raw: aiText }; }
      explanationText =
        aiJson?.candidates?.[0]?.content?.parts?.[0]?.text ||
        (Array.isArray(aiJson?.candidates?.[0]?.content?.parts)
          ? aiJson.candidates[0].content.parts.map(p => p?.text).filter(Boolean).join('\n')
          : '') ||
        JSON.stringify(aiJson).slice(0, 2000);
    } else {
      // Use Vertex AI regional SDK for GA models
      const vertex = new VertexAI({ project, location });
      const model = vertex.getGenerativeModel({ model: modelName });
      let result;
      try {
        result = await model.generateContent({ contents });
      } catch (e) {
        console.error('[handler] Vertex SDK error:', e?.message || e);
        res.status(500).json({ ok: false, source: 'vertex-sdk', error: e?.message || String(e) });
        return;
      }
      explanationText =
        result?.output_text ||
        result?.text ||
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        (Array.isArray(result?.candidates?.[0]?.content?.parts)
          ? result.candidates[0].content.parts.map(p => p?.text).filter(Boolean).join('\n')
          : '') ||
        JSON.stringify(result).slice(0, 2000);
    }

    res.status(200).json({
      imageUrl: '',
      explanation: String(explanationText || 'No explanation generated.'),
    });
  } catch (err) {
    console.error('Vertex AI error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
});
