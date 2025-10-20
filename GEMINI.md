# Gemini Project Context: iOuija73k

## Project Overview

This is a text-based horror game called "iOuija73k". The game is disguised as a fantasy adventure, but the player is actually interacting with a demon-possessed AI named Paimon. The game is built with Svelte 5, Panda CSS, and uses the Anthropic Claude API for dynamic horror narrative.

The game progresses through a series of psychological trials designed to manipulate and deceive the player. The horror is progressive, starting with a friendly tone and gradually becoming more sinister.

## Building and Running

### 1. Install dependencies:
```bash
npm install
```

### 2. Configure your environment:
```bash
cp .env.example .env
```
Add your Anthropic Claude API key to the `.env` file:
```
VITE_CLAUDE_API_KEY=your_api_key_here
```

### 3. Run the development server:
```bash
npm run dev:all
```
This starts both the backend proxy server (port 3001) and the frontend dev server (port 5173).

### 4. Running Tests:
To run the test suite:
```bash
npm run test
```

### 5. Linting and Formatting:
To check for linting errors:
```bash
npm run lint
```
To automatically fix linting errors:
```bash
npm run lint:fix
```
To format the code:
```bash
npm run format
```

## Development Conventions

*   **UI Framework:** Svelte 5 with the new runes API.
*   **Styling:** Panda CSS is used for styling.
*   **AI:** The Anthropic Claude API is used for the AI dungeon master. The `claude-3-5-sonnet-20241022` model is used.
*   **State Management:** Game state is managed within the `ChatInterface.svelte` component.
*   **Trials:** The game is structured into a series of "trials", each with its own logic contained in the `src/trials/` directory.
*   **API Communication:** All communication with the Claude API is handled by the `src/ai/claude.js` module. A proxy server is used to avoid CORS issues.
*   **Code Style:** The project uses ESLint for linting and Prettier for formatting. Configuration files are `eslint.config.js` and `.prettierrc`.
