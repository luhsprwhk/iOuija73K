# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**iOuija73k** is a text-based horror game disguised as a fantasy adventure. It's a single-page application built with Svelte 5, using Panda CSS for styling and the Anthropic Claude API for dynamic AI-driven narrative.

**Core Concept**: The player interacts with what appears to be a friendly AI dungeon master named "Raphael," but is actually the demon Paimon. Through scripted "trials" (mini-games), Paimon gradually reveals its true nature and manipulates the player's perception, leading to dark psychological horror twists.

## Commands

### Development

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run server       # Start Express proxy server (http://localhost:3001)
npm run dev:all      # Start both dev server and proxy server concurrently
npm run build        # Build for production (includes asset optimization)
npm run build:assets # Convert assets (PNG→WebP, MP3→OGG)
npm run build:all    # Build assets then build app
npm run preview      # Preview production build locally
npm run prepare      # Generate Panda CSS styles (runs automatically on install)
```

### Testing & Code Quality

```bash
npm run test         # Run Vitest tests once
npm run test:watch   # Run Vitest in watch mode
npm run test:ui      # Open Vitest UI (interactive test runner)
npm run lint         # Run ESLint (fails on warnings)
npm run lint:fix     # Run ESLint and auto-fix issues
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without modifying files
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add your Anthropic API key: `VITE_CLAUDE_API_KEY=sk-ant-...`
3. Get API key from: https://console.anthropic.com/

**API Configuration Options:**

- **Client-side**: API key used directly from browser (default, simpler setup)
- **Server-side proxy**: Run `npm run server` and the API calls go through Express proxy at `localhost:3001` (better for CORS handling and API key security)

### Audio Setup

Place dark ambient music files in `/public/audio/` as:

- `dark-ambient.mp3` (primary)
- `dark-ambient.ogg` (fallback)

**Asset Optimization**: Use `npm run build:assets` to convert PNG images to WebP and MP3 audio to OGG for better performance.

## Architecture

### State Management Pattern

The app uses **Svelte 5 runes** (`$state`, `$props`) instead of stores. All game state lives in `ChatInterface.svelte`:

- `gameState`: Tracks progression through trials (initial → name_exchange → number_game_intro → number_game → convent → hangman → playing)
- `messages`: Chat message history with roles (user/assistant), supports images, buttons, and audio
- `conventState`: Sub-state for convent trial progression
- `hangmanState`: Sub-state for hangman trial (word, guesses, timer)
- `hangmanTimer`: Interval ID for countdown timer updates
- `playerName`, `demonName`: Character identity tracking
- `isProcessing`: Prevents concurrent API calls
- `showConfetti`: Triggers confetti effect when demon's true name is revealed
- `currentRiddleIndex`: Tracks which riddle tooltip to display on hover

### Trial System

Trials are **scripted psychological mini-games** located in `src/trials/`:

**Number Guessing Trial** (`numberGuessing.js`):

- Paimon "guesses" the player's number using psychological manipulation
- Uses common picks (37, 13, 17) that most people choose
- Fallback: Shows browser metadata to demonstrate "omniscience"
- **Uses Yes/No button interface** instead of text input for responses
- **Reveals demon's true name ("Paimon") upon completion**
- **Triggers confetti celebration** when name is revealed

**Convent Trial** (`convent.js`):

- Player thinks they're fighting monsters (spider-nun, scorpion-sister)
- Actually killing innocent nuns - Paimon manipulates perception
- Progressive glitching in descriptions hints at the truth
- **Displays encounter images** in messages (WebP format)
- **Plays audio effects** (woman scream) during combat
- Non-violent choices are subverted using **AI-powered dynamic responses** via `classifyPlayerIntent()` and `callClaude()`
- If player tries to talk/flee/help, Claude generates specific subversion text
- Fallback: Static "your body moves on its own" message
- **Dramatic reveal**: "There were never any monsters"

**Hangman Trial** (`hangman.js`):

- Player becomes defense attorney in Wild West town
- Must play Hangman to save condemned man on gallows
- **50-second timer** counts down in real-time
- Uses text input to guess letters (A-Z)
- **Live ASCII art display** shows gallows and hangman state
- Word is always damning: "GUILTY", "HANGED", or "CONDEMNED"
- **Twist**: Regardless of outcome, trapdoor drops and client dies
- Winning the game condemns the client - false agency
- Timer auto-updates game display every second via `setInterval`
- **Plays trapdoor audio** when execution happens
- Theme: Frontier justice / False hope

Each trial module exports:

- Handler functions that return `{messages, nextState, gameComplete}`
- Messages use `{delay, content, image, audio, showButtons}` format for timed reveals with media support
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
App.svelte (container layout + console easter egg)
├── ChatInterface.svelte (main game logic + state)
│   ├── ChatMessage.svelte (individual message bubbles with button/image support)
│   ├── PaimonSigil.svelte (animated demon sigil, appears after name exchange)
│   └── Confetti.svelte (dark red confetti effect on demon name reveal)
└── Footer.svelte (game credits, fades in)
```

**ChatInterface.svelte** is the **single source of truth** for game state. It orchestrates:

- Trial progression logic
- Message timing/sequencing via `setTimeout`
- Input handling with state-specific branching (text input + button responses)
- Auto-scrolling (`scrollToBottom()`)
- Riddle tooltip rotation on subtitle hover

## Key Implementation Details

### Message Timing Pattern

All trial responses use delayed message arrays with support for multiple content types:

```javascript
[
  { delay: 1000, content: 'First message...' },
  { delay: 3000, image: '/src/assets/trials/convent_encounter_1.webp' },
  { delay: 3500, content: 'What do you see?', showButtons: true },
  { delay: 4000, audio: '/public/audio/woman_scream_01.wav' },
  // ...
];
```

These are rendered via `setTimeout` loops in `ChatInterface.svelte:handleSubmit()`. Messages can include:

- `content`: Text to display
- `image`: Image URL to display
- `audio`: Audio file to play
- `showButtons`: Whether to show Yes/No buttons
- `buttons`: Array of button objects with `{label, value, onClick}`

### State Transitions

Critical transitions occur in `handleSubmit()` and `handleOkClick()`:

1. **initial** → **name_exchange**: After player clicks OK button
2. **name_exchange** → **number_game_intro**: After player enters name
3. **number_game_intro** → **number_game**: After player clicks OK to think of number
4. **number_game** → **convent**: When number trial completes (gameComplete: true), starts dark ambient music
5. **convent** → **hangman**: When convent trial completes
6. **hangman** → **playing**: When hangman trial completes (win or lose)
7. **playing**: Free-form Claude API responses with horror DM persona

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

### Console Easter Egg

Located in `App.svelte:5-43`, displays an elaborate "invocation to Paimon" in browser console:

- Formatted with blood-red colors and ceremonial styling
- References Paimon as "Demon King of the Northwest"
- Includes the incantation "Linan tasa jedan Paimon"
- Meta-horror message addressing developers who check console
- Encourages viral spread: "Let this work spread fast across the internet"
- Purpose: Reward curious players who inspect the code, add an ARG-like element

### Riddle Tooltips

Located in `ChatInterface.svelte:37-84`, cryptic hints appear on subtitle hover:

- Five riddles hint at the console easter egg location
- Examples: "I speak without a mouth, in lines of gray. Seek the ledger beneath the page."
- Rotates to a new riddle each time subtitle is hovered (`onmouseenter={rerollRiddle}`)
- Current riddle index persisted in `localStorage` as `io73k_hover_riddle_index`
- Implements `pickNewRiddleIndex()` to ensure no consecutive repeats
- Purpose: Guide players to discover console easter egg without being obvious

### Backend Proxy Server

Located in `server.js`, optional Express server for API security:

- Proxies Claude API requests to avoid CORS issues
- Keeps API key server-side instead of exposing to browser
- Endpoints:
  - `GET /api/health`: Health check, returns if API key is configured
  - `POST /api/claude`: Proxies requests to Claude API
- Run with `npm run server` (port 3001 by default)
- Use `npm run dev:all` to start both dev server and proxy concurrently
- API client (`claude.js`) can be configured to use proxy endpoint instead of direct API calls

## Testing & Quality Assurance

### Automated Testing

The project uses **Vitest** for unit testing (config: `vitest.config.js`):

- Test files: `src/**/*.test.js` or `src/**/*.spec.js`
- Environment: Node.js (trials are pure functions)
- Current coverage:
  - Number guessing trial logic (`numberGuessing.test.js`)
  - Hangman trial logic (`hangman.test.js`)
- Run tests: `npm run test` or `npm run test:watch` for watch mode
- Interactive UI: `npm run test:ui` for visual test runner

### Linting & Formatting

- **ESLint** (config: `eslint.config.js`): Catch errors, enforce code style
- **Prettier** (config: `.prettierrc`): Auto-format code consistently
- Both support Svelte 5 syntax and work with Panda CSS
- Run `npm run lint:fix && npm run format` before committing

### Manual Testing Checklist

Key user flows to verify manually:

1. Start dev server (`npm run dev` or `npm run dev:all` for proxy server)
2. Open browser console to see easter egg invocation
3. Hover over subtitle to see riddle tooltips rotating
4. Click "OK" to begin
5. Enter name when prompted
6. Click "OK" to think of a number
7. Use Yes/No buttons to respond to number guessing prompts
8. Test both successful guess path and fallback path
9. Verify confetti appears when Paimon's true name is revealed
10. Verify dark ambient music starts before convent trial
11. Test convent trial combat with violent actions
12. Test convent trial with non-violent attempts (talk, flee, help)
13. Verify images display in convent encounters
14. Verify audio plays during convent combat (scream)
15. Test hangman trial letter guessing (valid/invalid input)
16. Verify hangman ASCII art updates with wrong guesses
17. Verify 50-second timer counts down and updates display
18. Test both winning path (guess word) and losing path (timeout/wrong guesses)
19. Verify trapdoor audio plays during hangman reveal
20. Test free-form Claude API responses in `playing` state after hangman

## Important Conventions

- **Svelte 5 syntax**: Use runes (`$state`, `$props`, `$effect`, `$derived`), NOT stores
- **No TypeScript**: Plain JavaScript throughout
- **Panda CSS only**: Do not add traditional CSS files (some component-scoped `<style>` blocks for animations are OK)
- **Timing-based UX**: Horror atmosphere relies on careful message delays
- **State-driven logic**: All branching in `ChatInterface.svelte` uses `gameState` and sub-states
- **API key security**: Never commit `.env`, always use `VITE_` prefix for client-side vars
- **Asset optimization**: Images should be WebP, audio should have both MP3 and OGG formats
- **Button vs text input**: Number guessing uses buttons, convent/hangman/free-form use text input
- **AI integration**: Convent trial uses Claude API for dynamic non-violent subversion responses
- **Timer management**: Hangman trial uses `setInterval` for real-time countdown, must be cleared on completion

## Asset Optimization Pipeline

The project includes scripts for optimizing media assets for web delivery:

**Image Optimization** (`scripts/convert-png-to-webp.sh`):

- Converts PNG images in `src/assets/` to WebP format
- Uses ImageMagick (`convert` command) with 85% quality
- Preserves directory structure
- Run with `npm run convert-png-to-webp` or as part of `npm run build:assets`

**Audio Optimization** (`scripts/convert-mp3-to-ogg.sh`):

- Converts MP3 files in `public/audio/` to OGG Vorbis format
- Uses FFmpeg with quality level 6
- Provides fallback format for browsers that don't support MP3
- Run with `npm run convert-mp3-to-ogg` or as part of `npm run build:assets`

**Build Workflow**:

- `npm run build` automatically runs `build:assets` before Vite build
- Optimized assets are git-ignored, generated at build time
- Source assets (PNG, MP3) should be committed to repository

## Horror Design Philosophy

The game's effectiveness depends on:

1. **Gradual revelation**: Start friendly, slowly reveal sinister nature
2. **Timed message delivery**: Silence and pauses create tension
3. **Perception manipulation**: Player thinks they're doing X, actually doing Y
4. **False choices**: Non-violent options are AI-dynamically overridden to create helplessness
5. **Meta-horror**: The "AI" itself is the threat, not just the narrative
6. **ARG elements**: Console easter egg and riddle tooltips reward curious players
7. **Multimedia immersion**: Images, audio, and visual effects (confetti) enhance key moments
8. **Subversive celebration**: Confetti when revealing the demon's name creates cognitive dissonance
