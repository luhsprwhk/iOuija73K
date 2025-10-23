# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

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

**Local Development:**

1. Copy `.env.example` to `.env`
2. Add your Anthropic API key: `VITE_CLAUDE_API_KEY=sk-ant-...`
3. Get API key from: <https://console.anthropic.com/>
4. Run `npm run dev:all` to start both dev server and proxy server
5. The app will automatically use the local Express proxy at `localhost:3001`

**Production Deployment (Netlify):**

1. Connect your repository to Netlify
2. In Netlify dashboard, go to: Site settings > Environment variables
3. Add environment variable: `CLAUDE_API_KEY=sk-ant-...` (note: no `VITE_` prefix)
4. Deploy! The app will automatically use Netlify Functions for secure API calls

**Security Note:** The API key is NEVER exposed to the client in production. All Claude API calls go through serverless functions (Netlify Functions in production, Express proxy in development).

### Audio Setup

Place dark ambient music files in `/public/audio/` as:

- `dark-ambient.mp3` (primary)
- `dark-ambient.ogg` (fallback)

**Asset Optimization**: Use `npm run build:assets` to convert PNG images to WebP and MP3 audio to OGG for better performance.

## Architecture

### Configuration Management

All game configuration values and "magic numbers" are centralized in `src/config/gameConfig.js`:

- **Hangman settings**: `MAX_ATTEMPTS` (6), `TIME_LIMIT_SECONDS` (50)
- **Name validation**: `MAX_ATTEMPTS` (3) - maximum invalid name attempts before lockout
- **Lockout system**: `DURATION_MS` (300000) - 5 minute lockout duration
- **Message timing**: Standard, dramatic, and quick delay values

**Important**: Always use `GAME_CONFIG` from this file instead of hardcoded numbers. This makes the game easily tunable and documents the reasoning behind each value via JSDoc comments.

### Achievement System

The game features a **meta-recognition achievement system** that rewards player observations and clever actions. Achievements are distinct from codex entries (in-world lore) - they break the fourth wall slightly to acknowledge player cleverness.

**Core Implementation** (`src/achievements/`):

- **achievementData.js**: Defines all achievements with ID, title, description, and icon
- **achievementManager.js**: Handles localStorage persistence and unlock logic
- **Storage key**: `io73k_achievements` in localStorage
- **Persistence**: Achievements carry across playthroughs for replayability

**UI Components** (`src/lib/components/`):

- **AchievementToast**: Animated slide-in notification when achievement unlocks (5-second auto-dismiss)
- **AchievementPanel**: Modal showing all achievements, completion percentage, locked/unlocked states
- **Trophy button (🏆)**: Fixed in header, opens achievement panel

**Current Achievements**:

1. **Jigsaw's Apprentice** 🎭 - Recognize the Saw movie scenario in White Room trial
   - Triggered when player mentions "saw", "jigsaw", "saw movie" etc. in their input
   - Detection: `detectSawReference()` in `whiteRoom.js`

2. **True Name** 👑 - Discover Paimon's real identity
   - **No explicit reveal in game** - demon always introduces as "Raphael"
   - Only hint: Paimon's sigil (from Hereditary) appears after name exchange
   - Triggered when player types "Paimon" anywhere in their input
   - **Effect**: Demon's name in chat dynamically changes from "Raphael" → "Paimon"
   - Uses derived state: `demonName = $derived(hasTrueNameAchievement ? 'Paimon' : 'Raphael')`

3. **Summoning Circle** 👁️ - Find the console easter egg _(Issue #28 - pending)_
4. **Truth Beneath** 🕯️ - Examine convent basement _(Issue #29 - blocked by Issue #16)_
5. **Merciful Executioner** ⚖️ - Try to save hangman client _(Issue #30 - pending)_

**Integration Pattern**:

```javascript
// In trial handlers, pass achievement callback
const result = await handleWhiteRoomInput(
  userInput,
  history,
  triggerAchievement
);

// In trial code, detect condition and trigger
if (sawDetected && onAchievement) {
  onAchievement('jigsaw_apprentice');
}

// triggerAchievement() function (in ChatInterface.svelte)
function triggerAchievement(achievementId) {
  const wasUnlocked = unlockAchievement(achievementId);
  if (wasUnlocked) {
    const achievement = getAchievementById(achievementId);
    currentAchievement = achievement; // Shows toast
  }
}
```

**Design Philosophy**:

- Achievements are **meta-awareness** (recognizing references, player cleverness)
- Codex entries (future) are **in-world** (lore, backstory, evidence)
- Achievements persist across playthroughs
- Reward curiosity, observation, and connecting dots
- Can affect gameplay (True Name changes demon's displayed name)

### State Management Pattern

The app uses **Svelte 5 runes** (`$state`, `$props`) instead of stores. All game state lives in `ChatInterface.svelte`:

- `gameState`: Tracks progression through trials (initial → name_exchange → convent → hangman → white_room → playing)
- `messages`: Chat message history with roles (user/assistant), supports images, buttons, and audio
- `conventState`: Sub-state for convent trial progression
- `hangmanState`: Sub-state for hangman trial (word, guesses, timer)
- `hangmanTimer`: Interval ID for countdown timer updates
- `playerName`: Player's entered name
- `hasTrueNameAchievement`: Tracks if "True Name" achievement is unlocked
- `demonName`: Derived state - "Raphael" by default, "Paimon" if True Name achievement unlocked
- `isProcessing`: Prevents concurrent API calls
- `showConfetti`: Triggers confetti effect during key moments (e.g., after name exchange)
- `currentAchievement`: Currently displayed achievement toast notification
- `showAchievementPanel`: Controls visibility of achievement panel modal
- `currentRiddleIndex`: Tracks which riddle tooltip to display on hover

### Trial System

Trials are **scripted psychological mini-games** located in `src/trials/`:

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

```text
App.svelte (container layout + console easter egg)
├── ChatInterface.svelte (main game logic + state)
│   ├── ChatMessage.svelte (individual message bubbles with button/image support)
│   ├── PaimonSigil.svelte (animated demon sigil, appears after name exchange)
│   ├── Confetti.svelte (dark red confetti effect during key moments)
│   ├── AchievementToast.svelte (animated toast notification for achievement unlocks)
│   └── AchievementPanel.svelte (modal showing all achievements and progress)
└── Footer.svelte (game credits, fades in)
```

**ChatInterface.svelte** is the **single source of truth** for game state. It orchestrates:

- Trial progression logic
- Message timing/sequencing via `setTimeout`
- Input handling with state-specific branching (text input + button responses)
- Achievement unlock triggers via `triggerAchievement()`
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
2. **name_exchange** → **convent**: After player enters name and clicks OK, shows confetti/sigil reveal and starts dark ambient music
3. **convent** → **hangman**: When convent trial completes
4. **hangman** → **white_room**: When hangman trial completes
5. **white_room** → **complete**: When white room trial completes
6. **playing**: Free-form Claude API responses with horror DM persona (currently unused)

### Name Reveal Mechanic

- Initial demon name: "Raphael" (false identity)
- True name: "Paimon" (only discovered through achievement)
- Tracked via `demonName` derived state: `$derived(hasTrueNameAchievement ? 'Paimon' : 'Raphael')`
- Changes dynamically when player types "Paimon" and unlocks the "True Name" achievement
- Affects chat input placeholder and message attribution

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

### API Proxy Architecture

The app uses different proxy configurations for development and production:

**Development (Express Server):**

- Located in `server.js`, Express proxy server for local development
- Proxies Claude API requests to avoid CORS issues
- Keeps API key server-side (reads `VITE_CLAUDE_API_KEY` from `.env`)
- Endpoints:
  - `GET /api/health`: Health check, returns if API key is configured
  - `POST /api/claude`: Proxies requests to Claude API
- Run with `npm run server` (port 3001 by default)
- Use `npm run dev:all` to start both dev server and proxy concurrently

**Production (Netlify Functions):**

- Located in `netlify/functions/claude.js`, serverless function
- Automatically deployed with your site on Netlify
- Uses `CLAUDE_API_KEY` environment variable (set in Netlify dashboard)
- Endpoint: `/.netlify/functions/claude` (called automatically in production)
- Zero configuration required - works out of the box

**Client Code (`src/ai/claude.js`):**

- Automatically detects environment (dev vs. prod)
- Uses Netlify Functions in production (`import.meta.env.PROD === true`)
- Uses Express proxy in development (localhost:3001)
- Can be overridden with `VITE_CLAUDE_PROXY_URL` environment variable

## Testing & Quality Assurance

### Automated Testing

The project uses **Vitest** for unit testing (config: `vitest.config.js`):

- Test files: `src/**/*.test.js` or `src/**/*.spec.js`
- Environment: Node.js (trials are pure functions)
- Current coverage:
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
6. Click "OK" to start convent trial
7. Verify confetti appears after name entry
8. Verify Paimon's sigil appears in bottom left
9. Verify dark ambient music starts before convent trial
10. Test convent trial combat with violent actions
11. Test convent trial with non-violent attempts (talk, flee, help)
12. Verify images display in convent encounters
13. Verify audio plays during convent combat (scream)
14. Test hangman trial exploration phase (talk to condemned man, examine scene)
15. Verify glitching timer displays correctly
16. Verify hangman trial ends after attempts exhausted
17. Verify hangman reveal plays correctly
18. Test white room trial exploration and choice
19. Verify white room reveal matches player's choice
20. Verify game ends correctly after white room trial

## Important Conventions

- **Svelte 5 syntax**: Use runes (`$state`, `$props`, `$effect`, `$derived`), NOT stores
- **No TypeScript**: Plain JavaScript throughout
- **Panda CSS only**: Do not add traditional CSS files (some component-scoped `<style>` blocks for animations are OK)
- **Timing-based UX**: Horror atmosphere relies on careful message delays
- **State-driven logic**: All branching in `ChatInterface.svelte` uses `gameState` and sub-states
- **API key security**: Never commit `.env`, always use `VITE_` prefix for client-side vars
- **Asset optimization**: Images should be WebP, audio should have both MP3 and OGG formats
- **Text input flow**: All trials use text input after name exchange
- **AI integration**: Convent trial uses Claude API for dynamic non-violent subversion responses
- **Timer management**: Hangman trial uses `setInterval` for real-time countdown, must be cleared on completion
- **llms.txt file**: The `llms.txt` file contains Svelte 5 API documentation (1640 lines) to help LLMs understand Svelte syntax when working on this codebase. It's committed to version control intentionally, not generated/fetched.

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
8. **Subversive celebration**: Confetti after name exchange creates unsettling contrast with horror atmosphere
