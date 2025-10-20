/**
 * Netlify Function to proxy Claude API requests
 * This keeps the API key secure on the server-side
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check if API key is configured
  if (!CLAUDE_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          'Claude API key not configured. Please set CLAUDE_API_KEY in Netlify environment variables.',
      }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const {
      messages,
      system,
      model = 'claude-3-5-sonnet-20241022',
      max_tokens = 1024,
    } = requestBody;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid request: messages array is required',
        }),
      };
    }

    // Make request to Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: error.error?.message || response.statusText,
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Claude API proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
      }),
    };
  }
}
