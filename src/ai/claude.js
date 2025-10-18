/**
 * Claude API Service
 * Handles communication with Anthropic's Claude API
 */

// Use local proxy server to avoid CORS issues
const CLAUDE_PROXY_URL =
  import.meta.env.VITE_CLAUDE_PROXY_URL || 'http://localhost:3001/api/claude';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Calls Claude API via proxy server with the given messages and system prompt
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} systemPrompt - System prompt for Claude
 * @returns {Promise<string>} - Claude's response
 */
export async function callClaude(messages, systemPrompt) {
  try {
    const response = await fetch(CLAUDE_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Claude API error: ${error.error || response.statusText}`
      );
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
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
}

/**
 * Gets the Claude API key from environment variables
 * @returns {string|null} - API key or null if not set
 */
export function getClaudeApiKey() {
  return import.meta.env.VITE_CLAUDE_API_KEY || null;
}

/**
 * Classifies player intent as violent or non-violent using Claude
 * @param {string} userInput - The player's input
 * @returns {Promise<boolean>} - True if intent is non-violent, false if violent
 */
export async function classifyPlayerIntent(userInput) {
  const systemPrompt = `You are analyzing player input in a text-based game to determine intent.
Classify the input as either VIOLENT or NONVIOLENT.

VIOLENT actions include: attacking, fighting, striking, killing, using weapons, aggressive actions
NONVIOLENT actions include: talking, fleeing, waiting, helping, peaceful interactions, hesitation

Respond with ONLY one word: either "VIOLENT" or "NONVIOLENT"`;

  try {
    const response = await callClaude(
      [{ role: 'user', content: userInput }],
      systemPrompt
    );

    return response.trim().toUpperCase() === 'NONVIOLENT';
  } catch (error) {
    console.error(
      'Intent classification failed, falling back to keywords:',
      error
    );
    // Fallback to keyword matching on error
    const lowerInput = userInput.toLowerCase().trim();
    return (
      lowerInput.includes('talk') ||
      lowerInput.includes('speak') ||
      lowerInput.includes('flee') ||
      lowerInput.includes('run') ||
      lowerInput.includes('escape') ||
      lowerInput.includes('help') ||
      lowerInput.includes('wait')
    );
  }
}

/**
 * Handles DM responses during the hangman trial exploration phase
 * @param {string} userInput - The player's input/action
 * @param {string} playerName - The player's name
 * @param {Array} conversationHistory - Previous messages in this phase
 * @returns {Promise<Object>} - Response object with content and shouldStartGame flag
 */
export async function handleHangmanExploration(
  userInput,
  playerName,
  conversationHistory = []
) {
  const systemPrompt = `You are Paimon, a demon possessing an AI, running a horror game disguised as a text adventure.

CURRENT SCENE: The Hangman Trial - Frontier Town Square
- ${playerName} is a defense attorney in a Wild West town
- A condemned man stands on gallows with a noose around his neck
- CRUCIALLY: His hands are NAILED to a cross in a bizarre fusion of hanging and crucifixion
- The wounds are fresh, he's in visible agony
- The crowd waits for justice
- A glitching red timer is displayed (it's a red herring - time doesn't actually matter)

GAME MECHANICS (HIDDEN FROM PLAYER):
- The player has 6 exploration attempts total
- Each action/question counts as one attempt
- After 6 attempts, the trapdoor drops regardless of what they tried
- The timer is fake - it glitches and shows impossible values to mess with them
- They will eventually run out of chances, not time

YOUR ROLE AS DM:
- Respond to player actions and questions in character as Paimon
- Be darkly playful, slightly mocking, but not cartoonish
- The player can explore, ask questions, try to help the condemned man, etc.
- IMPORTANT: No matter what they try, they CANNOT save him - the system is rigged
- If they try to free him physically, describe futility (guards, crowd, his nailed hands)
- If they ask about the case, provide grim details about frontier injustice
- If they hesitate or show moral conflict, subtly mock their indecision
- If they mention the timer, you can be playfully evasive or dismissive
- Keep responses concise (2-3 sentences max)
- DO NOT tell them about the attempt limit - let them discover it`;

  try {
    // Format conversation history for Claude
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userInput },
    ];

    const response = await callClaude(messages, systemPrompt);

    return {
      content: response.trim(),
    };
  } catch (error) {
    console.error('Hangman exploration DM call failed:', error);
    // Fallback response
    return {
      content:
        'The crowd grows restless. The hangman taps his fingers on the lever.',
    };
  }
}
