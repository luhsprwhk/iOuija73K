# iOuija73k

> **A psychological horror game where your choices are remembered forever**
>
> Text-based horror disguised as fantasy adventure, dungeon-mastered by Paimon — a demon that tracks every violent act, every mercy attempt, every moment of hesitation.

[![Svelte 5](https://img.shields.io/badge/Svelte-5-orange)](https://svelte.dev/)
[![Panda CSS](https://img.shields.io/badge/Panda-CSS-yellow)](https://panda-css.com/)
[![Claude API](https://img.shields.io/badge/Claude-Haiku%204.5-purple)](https://www.anthropic.com/claude)

---

## ⚠️ SPOILER WARNING ⚠️

**If you're a player who hasn't completed the game yet, STOP READING NOW!**

This README and the source code contain major spoilers about the game's mechanics, twists, and narrative structure. Reading further will significantly diminish your experience.

**For players:** Close this file and just play the game at the deployed URL.

**For developers/contributors:** Continue below to understand how the horror experience works.

---

## What is this?

You think you're playing a friendly fantasy adventure with an AI dungeon master named "Raphael." You're not.

This is an interactive psychological horror experience where you're actually conversing with **Paimon**, a demon that manipulates your perception through three psychological trials. What starts as a campy monster-fighting game gradually reveals itself to be something much darker — and **Paimon never forgets your choices**.

**The core mechanic:** A persistent corruption system that tracks your behavior across multiple playthroughs. Every violent act increases your corruption score, making future encounters harder. Every mercy attempt is remembered, influencing Paimon's tone and difficulty. Your profile persists across browser sessions, creating a personalized horror experience that evolves with your choices.

Built with Svelte 5, Panda CSS, and powered by Anthropic's Claude API (Haiku 4.5) for dynamic AI-driven narrative.

## Core Features

### **🩸 Persistent Corruption System**
- **Every choice is tracked** - Violent actions increase corruption (0-10+)
- **Difficulty scales with corruption** - Higher corruption = harder combat (75% → 15% win rate)
- **Paimon's personality evolves** - From disappointed teacher to cruel mirror
- **Profile persists across sessions** - Your corruption follows you between playthroughs
- **Multi-playthrough design** - Return to attempt redemption or embrace violence

### **🏆 Achievement System (Meta-Recognition)**
- **True Name** 👑 - Discover Paimon's real identity (unlocks by typing "Paimon")
- **Jigsaw's Apprentice** 🎭 - Recognize the Saw movie reference
- **Summoning Circle** 👁️ - Find the console easter egg [Planned]
- **Truth Beneath** 🕯️ - Examine the convent basement [Planned]
- **Merciful Executioner** ⚖️ - Try extensively to save the hangman client [Planned]
- **Killjoy** 💀 - Get locked out 3 times for meta-breaking

### **📖 Codex System (In-World Lore)**
- Discover lore entries by exploring the convent
- Examples: Bloodstained Rosary, Sister Margaret's Diary, The Basement, Philosopher's Stone
- Reveals the nuns' corruption through alchemical experiments
- Persistent across playthroughs

### **🗺️ Exploration Mechanics**
- **3x3 grid-based convent map** with 9 unique rooms
- **Directional movement** (north/south/east/west)
- **Room searching** for healing potions (30% chance, max 2 per room)
- **Codex discovery** in specific locations
- **Alarm system** - Nuns discover you after 12 exploration actions
- **Sister Agnes tracking** - If you flee from her, she hunts you during exploration (30% chance)

### **🎭 Three Psychological Trials**

1. **The Convent (8-12 min)** - Perception manipulation horror
   - Combat dice roll system (d20 + corruption bonus)
   - Sister Agnes boss fight (flee or kill determines future encounters)
   - HP system (2 HP, healing potions, death = 1-minute lockout)
   - Glitching descriptions hint at the truth: you're killing innocent nuns

2. **The Hangman (5-8 min)** - False agency and frontier justice
   - 50-second real-time timer countdown
   - AI-powered exploration phase (talk to condemned man)
   - System is rigged - he dies no matter what you do
   - Theme: Some systems are designed for cruelty

3. **The White Room (6-10 min)** - Self-destruction and sacrifice
   - Free-form AI conversation with your reflection
   - Choose: attack yourself or surrender
   - Paimon needed a willing act of self-harm
   - Max 15 exploration turns before forced confrontation

### **🤖 AI-Powered Dynamic Content**
- **Intent classification** - Determine player actions (fight/flee/talk/help)
- **Combat narratives** - Dynamic damage descriptions based on dice rolls
- **Free-form conversations** - Contextual responses in Hangman/White Room trials
- **Meta-breaking detection** - AI identifies fourth-wall breaks (3-strike lockout system)
- **Anachronism detection** - Spots modern items in historical settings

### **🎨 Horror Design Elements**
- **Dark ambient music** loops throughout
- **Paimon's sigil** (from Hereditary) pulses when AI is processing
- **Glitching text effects** during perception breaks
- **Timed message delays** create atmospheric tension
- **Console easter egg** - Elaborate Paimon invocation with ARG-style riddles
- **Riddle tooltips** - Hover subtitle for cryptic hints

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your environment

```bash
cp .env.example .env
```

Add your Anthropic Claude API key to `.env`:

```
VITE_CLAUDE_API_KEY=your_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 3. Add dark ambient music (optional but recommended)

Place your creepy ambient audio file in `/public/audio/muzak/` as:

- `main-theme.mp3` (primary)
- `main-theme.ogg` (fallback)

The build script will automatically convert MP3 → OGG:

```bash
npm run convert-mp3-to-ogg
```

### 4. Run the development server

```bash
npm run dev:all
```

This starts both the Express proxy server (port 3001) and the Vite dev server (port 5173).

Alternatively, run them separately:

```bash
# Terminal 1 - Backend proxy server (required for API calls)
npm run server

# Terminal 2 - Frontend dev server
npm run dev
```

Visit `http://localhost:5173` and prepare to be unsettled.

> **Note:** The backend proxy server is required in development to avoid CORS issues when calling the Claude API from the browser. In production, Netlify Functions handle this automatically.

## Tech Stack

- **Svelte 5** - Reactive UI with new runes API ($state, $derived, $effect)
- **Vite** - Lightning-fast dev server and build tool
- **Panda CSS** - Atomic CSS-in-JS for styling
- **Claude Haiku 4.5** - AI-powered horror dungeon master (fast, cost-effective)
- **Express** - Development proxy server
- **Netlify Functions** - Production serverless API calls

## Project Structure

```
src/
├── App.svelte                          # Main app container + console easter egg
├── lib/
│   ├── components/
│   │   ├── ChatInterface.svelte        # Core game logic and state management
│   │   ├── ChatMessage.svelte          # Individual message bubbles with media support
│   │   ├── PaimonSigil.svelte          # Animated demon sigil (pulses when processing)
│   │   ├── Confetti.svelte             # Dark red confetti effect
│   │   ├── LockoutScreen.svelte        # Lockout timer UI (meta-breaking/death)
│   │   ├── AnimatedSubtitle.svelte     # Typewriter subtitle with riddle tooltips
│   │   ├── AchievementToast.svelte     # Achievement unlock notification
│   │   ├── AchievementPanel.svelte     # Modal showing all achievements
│   │   ├── CodexToast.svelte           # Codex entry unlock notification
│   │   ├── StatusBox.svelte            # HP display (convent) / Timer (hangman)
│   │   ├── MovementControls.svelte     # Directional navigation UI
│   │   └── Footer.svelte               # Game credits (fades in on start)
│   └── helpers/
│       ├── getBrowserDetails.js        # Extract user metadata for "omniscience"
│       ├── validateName.js             # Name validation (blocks fake names)
│       ├── lockoutManager.js           # Lockout timing and persistence
│       ├── corruptionManager.js        # Corruption profile tracking
│       ├── metaLockoutTracker.js       # Meta-breaking lockout count
│       ├── playerProfile.js            # Player name persistence
│       └── chat.js                     # Message timing utilities
├── trials/
│   ├── convent.js                      # Trial 1: Perception manipulation + exploration
│   ├── hangman.js                      # Trial 2: False agency + frontier justice
│   └── whiteRoom.js                    # Trial 3: Self-destruction + sacrifice
├── ai/
│   ├── claude.js                       # Claude API integration and utilities
│   └── metaDetection.js                # Meta-breaking and anachronism detection
├── achievements/
│   ├── achievementData.js              # Achievement definitions
│   └── achievementManager.js           # Unlock/check/reset functions
├── codex/
│   ├── codexData.js                    # Codex entry definitions
│   └── codexManager.js                 # Unlock/check/reset functions
├── config/
│   └── gameConfig.js                   # Centralized configuration (all magic numbers)
└── assets/
    ├── trials/                         # Encounter images and videos (WebP optimized)
    └── audio/                          # Sound effects (woman scream, trapdoor)

netlify/
└── functions/
    └── claude.js                       # Serverless API proxy for production

server.js                               # Express proxy server for development
```

## How It Works

### Game Flow

1. **Opening** - Confetti + music start immediately, Paimon's sigil appears
2. **Name Exchange** - Build false trust, validate real names (3 attempts max)
3. **Convent Trial** - Combat, exploration, perception breaks
4. **Hangman Trial** - Timed exploration, inevitable execution
5. **White Room Trial** - Mirror conversation, forced choice
6. **Ending** - Final dismissal [WIP]

### State Management

All game state lives in `ChatInterface.svelte` using Svelte 5 runes:

- `gameState` - Progression: initial → name_exchange → convent → hangman → white_room → complete
- `conventState` - HP, position, visited rooms, codex, Sister Agnes tracking
- `hangmanState` - Exploration history, attempts, timer
- `whiteRoomState` - Exploration history, choice made
- `corruptionProfile` - Persistent player profile (localStorage)
- `demonName` - Derived: "Raphael" or "Paimon" based on True Name achievement

### Combat System

Dice roll mechanics with corruption-based difficulty:

```javascript
playerRoll = d20 + bonus
enemyRoll = d20
playerWins = playerRoll >= enemyRoll

// Corruption penalty
baseBonus = +5 (75% win rate)
bonus = baseBonus - (corruptionScore * 0.5)
minBonus = -5 (15% win rate at 10+ corruption)
```

### API Architecture

**Development:**
- Express proxy server (`server.js`) on port 3001
- API key stored in `.env` as `VITE_CLAUDE_API_KEY`
- Keeps credentials server-side

**Production:**
- Netlify Functions (`netlify/functions/claude.js`)
- API key stored as `CLAUDE_API_KEY` environment variable in Netlify dashboard
- Serverless, auto-scaling, zero config

**Client code** (`src/ai/claude.js`) auto-detects environment and uses appropriate endpoint.

### Persistent Systems

**Corruption Profile** (`localStorage: io73k_corruption_profile`):
- Corruption score, violent actions, non-violent attempts
- Play count, first violent action timestamp
- Trial completion times
- `metSisterAgnes` flag for intro encounter skipping

**Achievements** (`localStorage: io73k_achievements`):
- Unlocked achievement IDs
- Toast notifications on unlock
- Some affect gameplay (True Name changes demon's name)

**Codex** (`localStorage: io73k_codex_entries`):
- Unlocked entry IDs
- Toast notifications on discovery
- Readable in Codex panel

**Lockout State** (`localStorage: io73k_lockout_expiry` + `io73k_meta_lockout_count`):
- Lockout expiry timestamp
- Total meta-breaking lockouts across all sessions
- 5 minutes (meta-breaking), 1 minute (death)

## Available Scripts

### Development

```bash
npm run dev           # Start Vite dev server (http://localhost:5173)
npm run server        # Start Express proxy server (http://localhost:3001)
npm run dev:all       # Start both servers concurrently
```

### Building

```bash
npm run build         # Build for production (includes asset optimization)
npm run build:assets  # Convert PNG→WebP, MP3→OGG
npm run build:all     # Build assets then build app
npm run preview       # Preview production build locally
```

### Asset Optimization

```bash
npm run convert-png-to-webp  # Optimize images (requires ImageMagick)
npm run convert-mp3-to-ogg   # Convert audio to OGG format (requires FFmpeg)
```

### Testing & Quality

```bash
npm run test          # Run Vitest tests once
npm run test:watch    # Run Vitest in watch mode
npm run test:ui       # Open Vitest UI (interactive test runner)
npm run lint          # Run ESLint (fails on warnings)
npm run lint:fix      # Run ESLint and auto-fix issues
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without modifying files
```

### Panda CSS

```bash
npm run prepare       # Generate Panda CSS styles (runs automatically on install)
```

## Configuration

All tunable values are centralized in `src/config/gameConfig.js`:

**Trial Settings:**
- Hangman: 50 seconds, 6 max attempts
- White Room: 15 max exploration turns
- Convent: 12 max exploration turns, 30% potion chance, 2 potions per room

**Combat:**
- Base win rate: 75%
- Corruption penalty: -10% per point
- Minimum win rate: 15%

**Meta-Breaking:**
- Max offenses: 2 (3rd triggers lockout)
- Lockout: 5 minutes (meta-breaking), 1 minute (death)
- Can be disabled for testing

**Name Validation:**
- Max attempts: 3
- 5-minute lockout on failure

**AI:**
- Model: Claude Haiku 4.5
- Max tokens: 1024 (responses), 10 (classification)

**Timing:**
- Min delay: 3000ms
- Standard: 2000ms
- Dramatic: 6000ms

## Deployment

Ready to unleash the horror on the world? See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment instructions.

**Quick Deploy to Netlify:**

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository to [Netlify](https://app.netlify.com/)
3. Set environment variable: `CLAUDE_API_KEY=your_api_key` (no `VITE_` prefix!)
4. Deploy! (automatic via `netlify.toml` config)

The app uses Netlify Functions for secure serverless API calls — your API key is never exposed to the client. Zero additional configuration required!

## Testing Checklist

### First Playthrough (Violent Path)
1. ✅ Enter real name
2. ✅ Fight Sister Agnes → kill her
3. ✅ Explore convent briefly
4. ✅ Trigger second encounter → kill
5. ✅ Verify corruption increases
6. ✅ Verify Paimon's mocking tone
7. ✅ Complete Hangman trial
8. ✅ Complete White Room trial
9. ✅ Verify profile saved in localStorage

### Second Playthrough (Merciful Path)
1. ✅ Name persists, skip exchange
2. ✅ Flee from Sister Agnes
3. ✅ Explore extensively
4. ✅ Sister Agnes ambushes you (30% chance)
5. ✅ Try non-violent options (takes damage)
6. ✅ Verify Paimon acknowledges mercy attempts
7. ✅ Try to save hangman client
8. ✅ Complete White Room with surrender
9. ✅ Compare corruption scores (should be lower)

### Achievement Testing
1. ✅ Type "Paimon" anywhere → True Name unlocks, name changes
2. ✅ Hover subtitle → Riddles rotate randomly
3. ✅ Open browser console → Invocation displays
4. ✅ Reference "Saw" in White Room → Jigsaw's Apprentice unlocks

### Edge Cases
1. ✅ Provide fake name 3 times → 5-minute lockout
2. ✅ Meta-break 3 times → 5-minute lockout + Killjoy achievement (3rd total)
3. ✅ Lose all HP → 1-minute death lockout
4. ✅ Explore 12+ turns in convent → Alarm bell sequence
5. ✅ Sister Agnes alive + explore 2+ turns → Possible ambush

## Contributing

Contributions are welcome! This project explores psychological horror through interactive narrative and persistent player tracking.

**Areas for contribution:**

- **New trials** - Additional psychological horror scenarios (`src/trials/`)
- **Achievement ideas** - More meta-recognition rewards
- **Codex entries** - Expand the convent lore
- **Visual effects** - Enhance the creepy aesthetic
- **Sound design** - More ambient layers or sound effects
- **AI prompt tuning** - Improve Paimon's personality evolution
- **Corruption mechanics** - More nuanced behavioral tracking

**Before submitting a PR:**

```bash
npm run lint:fix
npm run format
npm run test
```

See `CLAUDE.md` for detailed development guidelines.

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Project instructions for AI assistants
- **[docs/gamebook.md](./docs/gamebook.md)** - Complete game design document
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[llms.txt](./llms.txt)** - Svelte 5 API reference for LLMs

## License

MIT

## Warning

**Content Warning:** This is a psychological horror experience that uses perception manipulation, moral dilemmas, and dark themes. The game references violence against innocents, systemic injustice, and self-destruction. Some players may find the content disturbing.

**Technical Warning:** This game uses localStorage to persist your corruption profile across sessions. Your choices are remembered permanently (unless you clear browser data). This is intentional and part of the horror experience.

Play at your own discretion.

---

_"Paimon is watching. Paimon is learning. Paimon remembers."_

_Will you?_
