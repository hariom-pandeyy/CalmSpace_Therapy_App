import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

console.log('GEMINI_API_KEY:', GEMINI_KEY); // Log the API key

if (!GEMINI_KEY) {
  console.error('Missing GEMINI_API_KEY in server .env');
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = (req.body.message || '').trim();
    if (!userMessage) {
      res.status(400).json({ error: 'empty_message', details: 'Message must not be empty.' });
      return;
    }

    // Gemini 2.5 Flash supports generateContent requests
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ]
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const rawText = await r.text();
    let json;
    try {
      json = rawText ? JSON.parse(rawText) : null;
    } catch(parseErr) {
      console.error('Failed to parse Gemini response as JSON:', parseErr, rawText);
      res.status(502).json({ error: 'invalid_gemini_response', details: parseErr.message, raw: rawText });
      return;
    }

    if (!r.ok) {
      console.error('Gemini API error:', r.status, json);
      res.status(r.status).json(json || { error: 'gemini_error', details: 'Unknown error' });
      return;
    }

    res.status(r.status).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'proxy_error', details: err.message });
  }
});

app.listen(PORT, ()=> console.log(`Proxy listening on http://localhost:${PORT}`));
