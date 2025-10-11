# CORS Fix for Claude API

## Problem
The application was getting a CORS error when calling the Claude API directly from the browser. This is because Anthropic's API doesn't allow direct browser requests due to security restrictions.

## Solution
Created a backend proxy server that handles Claude API requests, keeping the API key secure on the server side.

## Changes Made

### 1. New Backend Server (`server.js`)
- Express server running on port 3001
- Proxies requests to Claude API
- Handles API key securely on the server
- Includes health check endpoint at `/api/health`

### 2. Updated Frontend (`src/ai/claude.js`)
- Changed from calling Claude API directly to calling the proxy endpoint
- Removed `apiKey` parameter from `callClaude()` and `classifyPlayerIntent()`
- API key is now handled entirely by the backend

### 3. Updated Dependencies (`package.json`)
Added:
- `express` - Backend web framework
- `cors` - Enable CORS for the proxy
- `dotenv` - Environment variable management
- `concurrently` - Run multiple npm scripts simultaneously

### 4. New npm Scripts
- `npm run server` - Start the backend proxy server
- `npm run dev:all` - Start both backend and frontend simultaneously

## How to Use

### Development
Run both servers together:
```bash
npm run dev:all
```

Or run them separately:
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

### Environment Setup
Make sure your `.env` file has:
```
VITE_CLAUDE_API_KEY=your_api_key_here
```

The backend server will read this key and use it for API requests.

## Production Deployment
For production, you'll need to:
1. Deploy the backend server (`server.js`) to a hosting service
2. Set the `VITE_CLAUDE_PROXY_URL` environment variable to point to your deployed backend
3. Deploy the frontend separately

Example:
```bash
# Backend deployed at https://your-backend.com
VITE_CLAUDE_PROXY_URL=https://your-backend.com/api/claude
```
