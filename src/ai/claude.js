/**
 * Claude API Service
 * Handles communication with Anthropic's Claude API
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Calls Claude API with the given messages and system prompt
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} systemPrompt - System prompt for Claude
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<string>} - Claude's response
 */
export async function callClaude(messages, systemPrompt, apiKey) {
  if (!apiKey) {
    throw new Error('Claude API key is required. Please set VITE_CLAUDE_API_KEY in your environment.');
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API call failed:', error);
    throw error;
  }
}

/**
 * Formats conversation history for Claude API
 * @param {Array} messages - Array of message objects from the chat
 * @returns {Array} - Formatted messages for Claude API
 */
export function formatMessagesForClaude(messages) {
  return messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
}

/**
 * Gets the Claude API key from environment variables
 * @returns {string|null} - API key or null if not set
 */
export function getClaudeApiKey() {
  return import.meta.env.VITE_CLAUDE_API_KEY || null;
}
