# iOuija73k

> **Halloween Project Challenge 2024** 🎃
> A text-based horror game disguised as a fantasy adventure, dungeon-mastered by a demon-possessed AI.

**Project Goal:** Launch before Halloween to take advantage of the spooky season (ideally the week before Halloween).

---

## ⚠️ SPOILER WARNING ⚠️

**If you're a player who hasn't completed the game yet, STOP READING NOW!**

This README and the source code contain major spoilers about the game's mechanics, twists, and narrative structure. Reading further will significantly diminish your experience.

**For players:** Close this file and just play the game at the deployed URL.

**For developers/contributors:** Continue below to understand how the horror experience works.

---

## What is this?

You think you're playing a friendly fantasy adventure with an AI dungeon master named "Raphael." You're not.

This is an interactive horror experience where you're actually conversing with **Paimon**, a demon that manipulates your perception through psychological trials. What starts as a cute text game gradually reveals itself to be something much darker.

Built with Svelte 5, Panda CSS, and powered by Anthropic's Claude API for dynamic horror narrative.

## Features

- **Scripted psychological trials** that deceive the player
- **Progressive horror** - starts friendly, becomes sinister
- **Perception manipulation** - you think you're doing one thing, you're actually doing another
- **AI-driven narrative** using Claude API for dynamic responses
- **Dark ambient music** integration for atmosphere
- **Demon sigil animations** and creepy visual aesthetics

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

Place your creepy ambient audio file in `/public/audio/` as:

- `dark-ambient.mp3` (primary)
- `dark-ambient.ogg` (fallback)

See `/public/audio/README.md` for recommendations and sources.

### 4. Run the development server

```bash
npm run dev:all
```

This starts both the backend proxy server (port 3001) and the frontend dev server (port 5173).

Alternatively, run them separately:

```bash
# Terminal 1 - Backend proxy server
npm run server

# Terminal 2 - Frontend dev server
npm run dev
```

Visit `http://localhost:5173` and prepare to be unsettled.

> **Note:** The backend proxy server is required to avoid CORS issues when calling the Claude API from the browser.

## Tech Stack

- **Svelte 5** - Reactive UI with new runes API
- **Vite** - Lightning-fast dev server and build tool
- **Panda CSS** - Atomic CSS-in-JS for styling
- **Anthropic Claude API** - AI-powered horror dungeon master

## Project Structure

```
src/
├── App.svelte                    # Main app container
├── lib/
│   ├── ChatInterface.svelte      # Core game logic and state management
│   ├── ChatMessage.svelte        # Individual message bubbles
│   ├── PaimonSigil.svelte        # Animated demon sigil
│   └── helpers/
│       └── getBrowserDetails.js  # Extract user metadata for "omniscience"
├── trials/
│   ├── numberGuessing.js         # First trial: psychological number trick
│   └── convent.js                # Second trial: perception manipulation horror
└── ai/
    └── claude.js                 # Claude API integration
```

## How It Works

The game progresses through distinct phases:

1. **Initial Contact** - Friendly AI introduction
2. **Name Exchange** - Building false trust
3. **Number Guessing Trial** - Paimon demonstrates "psychic" abilities
4. **Convent Trial** - You think you're fighting monsters... you're not
5. **Revelation** - The demon reveals its true nature
6. **Free-form Horror** - Dynamic AI-driven narrative using Claude API

Each trial is carefully scripted with timed message reveals to build tension and manipulate player perception.

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Contributing

This is a Halloween challenge project! If you want to contribute:

- **New trials** - Create additional psychological horror scenarios in `src/trials/`
- **Visual effects** - Enhance the creepy aesthetic
- **Sound design** - Add more ambient audio layers or sound effects
- **Narrative branches** - Expand the post-trial AI-driven horror

Just remember: the goal is to ship before Halloween! 🎃

## License

MIT

## Warning

This is a horror experience that uses psychological manipulation tactics. It may be unsettling for some players. The game references violence and dark themes. Play at your own discretion.

---

_"One of thousands. Your participation is required."_
