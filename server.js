/**
 * Simple Express server to proxy Claude API requests
 * This avoids CORS issues and keeps the API key secure on the server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.VITE_CLAUDE_API_KEY;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!CLAUDE_API_KEY });
});

// Proxy endpoint for Claude API
app.post('/api/claude', async (req, res) => {
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({
      error: 'Claude API key not configured. Please set VITE_CLAUDE_API_KEY in your .env file.'
    });
  }

  try {
    const { messages, system, model = 'claude-3-5-sonnet-20241022', max_tokens = 1024 } = req.body;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: error.error?.message || response.statusText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Claude API proxy error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Claude API proxy server running on http://localhost:${PORT}`);
  console.log(`   API key configured: ${CLAUDE_API_KEY ? '✓' : '✗'}`);
});
