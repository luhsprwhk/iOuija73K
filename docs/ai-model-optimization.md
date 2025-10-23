# AI Model Optimization

## Overview

The game now uses **Claude Haiku 4.5** for ALL AI tasks to optimize cost and performance:

- **Classification tasks** - Intent detection, player action categorization
- **Narrative responses** - DM dialogue, exploration responses, Paimon conversations
- **Structured outputs** - JSON responses for complex game logic

After testing, we found that Haiku 4.5's near-frontier performance handles all our use cases excellently, so we simplified to use one model for everything.

## Model Comparison

### Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)

- **Use for:** Creative narrative, complex reasoning, nuanced dialogue
- **Cost:** ~$3 per million input tokens, ~$15 per million output tokens
- **Speed:** Slower (baseline)
- **Quality:** Highest quality, most capable

### Claude Haiku 4.5 (`claude-haiku-4-5`) - **NEW!**

- **Released:** October 21, 2025
- **Use for:** Simple classification, intent detection, yes/no decisions
- **Performance:** Near-frontier - similar to Claude Sonnet 4 from 5 months ago
- **Cost:** $1 per million input tokens, $5 per million output tokens
- **Speed:** 2x+ faster than Sonnet 4, even faster than 3.5 Haiku
- **Quality:** More capable than 3.5 Haiku, even surpasses Sonnet 4 at certain tasks
- **Note:** This is a significant upgrade - we get near-frontier performance at exceptional speed and cost

## Implementation

### Configuration (`src/config/gameConfig.js`)

```javascript
ai: {
  MODEL_SONNET: 'claude-3-5-sonnet-20241022',
  MODEL_HAIKU: 'claude-haiku-4-5',  // Updated to Haiku 4.5!
  MAX_TOKENS: 1024,
  MAX_TOKENS_CLASSIFICATION: 10,
}
```

### Model Usage - All Functions Use Haiku 4.5

All AI calls now use Claude Haiku 4.5 by default:

1. **`classifyPlayerIntent()`** - Binary VIOLENT/NONVIOLENT classification
2. **`classifyConventIntent()`** - 5-category action classification
3. **`handleHangmanExploration()`** - DM narrative responses during exploration
4. **`getWhiteRoomExplorationResponse()`** - Complex JSON responses with intent + narrative
5. **`callClaude()`** default - Free-form Paimon dialogue

Haiku 4.5's near-frontier performance handles all these tasks excellently while providing significant cost and speed benefits.

## Cost Impact

### Before Optimization

All API calls used Sonnet:

- Classification: $3-15 per million tokens
- Narrative: $3-15 per million tokens

### After Optimization (All Haiku 4.5)

- **ALL tasks** (Classification + Narrative): $1-5 per million tokens

### Estimated Savings

For a typical playthrough with ~50 API calls:

- **ALL 50 calls** → **67-80% cheaper** with Haiku 4.5
- **Overall savings: ~67-80% reduction in AI costs**
- **Speed improvement:** 2x+ faster responses across the board
- **Quality:** Near-frontier performance (similar to Sonnet 4) for all tasks

## Usage in Code

The `callClaude()` function now accepts an optional `options` parameter:

```javascript
// Use Haiku for classification (fast & cheap)
await callClaude([{ role: 'user', content: userInput }], systemPrompt, {
  model: MODEL_HAIKU,
  maxTokens: MAX_TOKENS_CLASSIFICATION,
});

// Use Sonnet for narrative (creative & nuanced)
await callClaude(messages, systemPrompt, {
  model: MODEL_SONNET,
  maxTokens: MAX_TOKENS,
});

// Default (no options) uses Sonnet
await callClaude(messages, systemPrompt);
```

## Future Optimization Opportunities

1. **Cache system prompts** - Reduce token usage for repeated prompts
2. **Batch classification** - Combine multiple classifications into one call
3. **Local classification** - Use keyword matching for very simple cases
4. **Streaming responses** - Improve perceived speed for long narratives

## Testing

All 233 tests pass with the new dual-model approach, confirming backward compatibility and correct implementation.
