# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**iOuija73k** is a text-based horror game disguised as a fantasy adventure. It's a single-page application built with Svelte 5, using Panda CSS for styling and the Anthropic Claude API for dynamic AI-driven narrative.

**Core Concept**: The player interacts with what appears to be a friendly AI dungeon master named "Raphael," but is actually the demon Paimon. Through scripted "trials" (mini-games), Paimon gradually reveals its true nature and manipulates the player's perception, leading to dark psychological horror twists.

## Commands

### Development
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run prepare      # Generate Panda CSS styles (runs automatically on install)
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add your Anthropic API key: `VITE_CLAUDE_API_KEY=sk-ant-...`
3. Get API key from: https://console.anthropic.com/

### Audio Setup
Place dark ambient music files in `/public/audio/` as:
- `dark-ambient.mp3` (primary)
- `dark-ambient.ogg` (fallback)

## Architecture

### State Management Pattern
The app uses **Svelte 5 runes** (`$state`, `$props`) instead of stores. All game state lives in `ChatInterface.svelte`:
- `gameState`: Tracks progression through trials (initial → name_exchange → number_game → convent → music_interlude → playing)
- `messages`: Chat message history with roles (user/assistant)
- `conventState`: Sub-state for convent trial progression
- `playerName`, `demonName`: Character identity tracking
- `isProcessing`: Prevents concurrent API calls

### Trial System
Trials are **scripted psychological mini-games** located in `src/trials/`:

**Number Guessing Trial** (`numberGuessing.js`):
- Paimon "guesses" the player's number using psychological manipulation
- Uses common picks (37, 13, 17) that most people choose
- Fallback: Shows browser metadata to demonstrate "omniscience"
- **Reveals demon's true name ("Paimon") upon completion**

**Convent Trial** (`convent.js`):
- Player thinks they're fighting monsters (spider-nun, scorpion-sister)
- Actually killing innocent nuns - Paimon manipulates perception
- Progressive glitching in descriptions hints at the truth
- Non-violent choices are subverted ("your body moves on its own")
- **Dramatic reveal**: "There were never any monsters"

Each trial module exports:
- Handler functions that return `{messages, nextState, gameComplete}`
- Messages use `{delay, content}` format for timed reveals
- State machines track progression through trial phases

### Styling Architecture
**Panda CSS** (atomic CSS-in-JS):
- Config: `panda.config.mjs` defines theme tokens (colors, etc.)
- Generated output: `styled-system/` (git-ignored, regenerated via `npm run prepare`)
- Usage: Import `css()` function, create class strings inline
- Theme colors use dark horror aesthetic (darkBg, bloodRed, etc.)

**DO NOT** write traditional CSS files. Use Panda's `css()` function in Svelte components.

### Claude API Integration
Located in `src/ai/claude.js`:
- `callClaude(messages, systemPrompt, apiKey)`: Makes API requests
- `formatMessagesForClaude(messages)`: Converts app format to Claude API format
- Model: `claude-3-5-sonnet-20241022`
- Used in `playing` gameState for free-form horror narrative after scripted trials

### Component Hierarchy
```
App.svelte (container layout)
└── ChatInterface.svelte (main game logic + state)
    ├── ChatMessage.svelte (individual message bubbles)
    └── PaimonSigil.svelte (animated demon sigil, appears after name exchange)
```

**ChatInterface.svelte** is the **single source of truth** for game state. It orchestrates:
- Trial progression logic
- Message timing/sequencing via `setTimeout`
- Input handling with state-specific branching
- Auto-scrolling (`scrollToBottom()`)

## Key Implementation Details

### Message Timing Pattern
All trial responses use delayed message arrays:
```javascript
[
  { delay: 1000, content: "First message..." },
  { delay: 3000, content: "Second message..." },
  // ...
]
```
These are rendered via `setTimeout` loops in `ChatInterface.svelte:handleSubmit()`.

### State Transitions
Critical transitions occur in `handleSubmit()`:
1. **name_exchange** → **number_game**: After player enters name
2. **number_game** → **convent**: When number trial completes (gameComplete: true)
3. **convent** → **music_interlude**: When convent trial completes
4. **music_interlude** → **playing**: After music starts and delays elapse
5. **playing**: Free-form Claude API responses with horror DM persona

### Name Reveal Mechanic
- Initial demon name: "Raphael" (false identity)
- True name: "Paimon" (revealed after first trial)
- Tracked via `demonName` state variable
- Updated when trial returns `revealName: true`
- Affects chat input placeholder and message attribution

### Browser Metadata Usage
`getBrowserDetails.js` extracts user metadata for the "omniscience" effect:
- Time of day calculation
- Browser/OS detection from user agent
- Used as fallback in number guessing trial to demonstrate supernatural knowledge

## Testing Notes

No formal test suite exists. Manual testing flow:
1. Start dev server
2. Click "OK" to begin
3. Enter name when prompted
4. Type any response to number guessing prompts
5. Test both successful guess path and fallback path
6. Test convent trial combat vs. non-violent attempts
7. Verify music plays after convent completion
8. Test free-form Claude API responses in `playing` state

## Important Conventions

- **Svelte 5 syntax**: Use runes (`$state`, `$props`), NOT stores
- **No TypeScript**: Plain JavaScript throughout
- **Panda CSS only**: Do not add traditional CSS files
- **Timing-based UX**: Horror atmosphere relies on careful message delays
- **State-driven logic**: All branching in `ChatInterface.svelte` uses `gameState` and sub-states
- **API key security**: Never commit `.env`, always use `VITE_` prefix for client-side vars

## Horror Design Philosophy

The game's effectiveness depends on:
1. **Gradual revelation**: Start friendly, slowly reveal sinister nature
2. **Timed message delivery**: Silence and pauses create tension
3. **Perception manipulation**: Player thinks they're doing X, actually doing Y
4. **False choices**: Non-violent options are overridden to create helplessness
5. **Meta-horror**: The "AI" itself is the threat, not just the narrative
