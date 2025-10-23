# Deployment Guide

This guide covers deploying iOuija73k to Netlify with secure serverless API handling.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup) (free tier works)
2. An [Anthropic API key](https://console.anthropic.com/)
3. Your repository pushed to GitHub, GitLab, or Bitbucket

## Step-by-Step Deployment

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select the `iOuija73k` repository
5. Configure build settings (should auto-detect from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

### 2. Set Environment Variables

1. In your Netlify site dashboard, go to: **Site settings** → **Environment variables**
2. Click "Add a variable"
3. Add the following:
   - **Key:** `CLAUDE_API_KEY`
   - **Value:** Your Anthropic API key (starts with `sk-ant-`)
   - **Scopes:** Select "Same value for all deploy contexts" (or customize per branch)

**Important:** Use `CLAUDE_API_KEY` (NOT `VITE_CLAUDE_API_KEY`). The `VITE_` prefix would expose it to the client bundle.

### 3. Deploy

1. Click "Deploy site"
2. Netlify will automatically:
   - Install dependencies
   - Run the build command (`npm run build`)
   - Deploy the `dist` folder
   - Deploy the Netlify Function at `/.netlify/functions/claude`

### 4. Verify Deployment

1. Once deployed, visit your site URL (e.g., `https://your-site-name.netlify.app`)
2. Open browser DevTools → Network tab
3. Interact with the game (enter name, number guessing, etc.)
4. Verify API calls are going to `/.netlify/functions/claude` (NOT directly to `api.anthropic.com`)
5. Check that no API keys appear in:
   - Network request headers
   - JavaScript source files
   - Environment variables in DevTools console

## Architecture Overview

### Local Development Flow

```
Browser → Vite Dev Server (localhost:5173)
            ↓
        Express Proxy (localhost:3001/api/claude)
            ↓
        Anthropic API (api.anthropic.com)
```

- API key stored in `.env` file (never committed)
- Express server reads `VITE_CLAUDE_API_KEY` from environment
- Client code automatically uses `http://localhost:3001/api/claude`

### Production Flow (Netlify)

```
Browser → Netlify CDN (your-site.netlify.app)
            ↓
        Netlify Function (/.netlify/functions/claude)
            ↓
        Anthropic API (api.anthropic.com)
```

- API key stored in Netlify environment variables (secure)
- Netlify Function reads `CLAUDE_API_KEY` from environment
- Client code automatically uses `/.netlify/functions/claude` (detected via `import.meta.env.PROD`)
- API key never exposed to client

## Security Features

### What This Setup Protects Against

✅ **API Key Exposure:** Key is never sent to or visible in the browser
✅ **Client Inspection:** API key not in JavaScript bundles or source maps
✅ **Network Sniffing:** Key not in HTTP headers visible to client
✅ **Rate Limiting:** Can implement rate limiting in serverless function
✅ **Domain Whitelisting:** Function only callable from your domain (via Netlify config)

### Additional Security Measures

The `netlify.toml` file includes:

- Content Security Policy headers
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME sniffing
- Referrer-Policy for privacy

## Troubleshooting

### Build Fails

**Error:** `npm ERR! missing script: build`

- **Fix:** Ensure `netlify.toml` is committed to repository

**Error:** Asset conversion scripts fail

- **Fix:** Scripts expect `imagemagick` and `ffmpeg` installed
- **Solution:** Run `npm run build` locally first to generate WebP/OGG files, then commit them

### API Calls Fail

**Error:** `Claude API key not configured`

- **Fix:** Check environment variable is named `CLAUDE_API_KEY` (not `VITE_CLAUDE_API_KEY`)
- **Fix:** Verify the variable is set for the correct deploy context (production/branch)

**Error:** `CORS error` or `Function not found`

- **Fix:** Check `netlify.toml` specifies `functions = "netlify/functions"`
- **Fix:** Verify `netlify/functions/claude.js` is committed to repository

### Function Times Out

**Error:** `Function execution timed out`

- **Cause:** Claude API taking too long (default Netlify function timeout is 10 seconds)
- **Fix:** Upgrade to Netlify Pro for 26-second timeout, or optimize prompts for faster responses

### API Key Still Exposed

**Problem:** API key visible in Network tab or source files

- **Check:** Ensure you're using `CLAUDE_API_KEY` (NOT `VITE_CLAUDE_API_KEY`) in Netlify
- **Check:** Search your codebase for `import.meta.env.VITE_CLAUDE_API_KEY` usage
- **Fix:** All Claude API calls should go through `callClaude()` in `src/ai/claude.js`

## Environment Variable Reference

| Variable                | Used In              | Purpose                                    |
| ----------------------- | -------------------- | ------------------------------------------ |
| `VITE_CLAUDE_API_KEY`   | Local dev (`.env`)   | API key for Express proxy server           |
| `CLAUDE_API_KEY`        | Production (Netlify) | API key for Netlify Functions (serverless) |
| `VITE_CLAUDE_PROXY_URL` | Both (optional)      | Override auto-detected proxy URL           |

## Custom Domain Setup (Optional)

1. In Netlify: **Domain management** → "Add a domain"
2. Follow instructions to configure DNS records
3. SSL certificate is automatically provisioned (via Let's Encrypt)
4. Update any hardcoded URLs in your app (if applicable)

## Monitoring & Analytics

### View Function Logs

1. Netlify dashboard → **Functions** tab
2. Click on `claude` function
3. View logs for debugging API call issues

### Set Up Alerts

1. Netlify dashboard → **Site settings** → **Build & deploy** → "Deploy notifications"
2. Add notifications for:
   - Deploy failures
   - Function errors
   - Build time warnings

## Cost Estimates

### Netlify (Free Tier)

- 100GB bandwidth/month
- 300 build minutes/month
- 125k function invocations/month (serverless)
- This is more than sufficient for most hobby projects

### Anthropic API

- Billed per token (input + output)
- Claude 3.5 Sonnet: ~$3 per million input tokens, ~$15 per million output tokens
- Typical game session: ~10-50 API calls with ~500-2000 tokens each
- Estimated cost: $0.01-0.10 per player session
- Monitor usage: https://console.anthropic.com/settings/usage

**Cost Control Tips:**

- Set usage limits in Anthropic console
- Implement rate limiting in Netlify Function
- Add caching for repeated requests (if applicable)
- Monitor function invocation count in Netlify dashboard

## Updating the Deployment

### Automatic Deploys (Recommended)

- Netlify automatically deploys when you push to your main branch
- Preview deploys created for pull requests
- Configure in: **Site settings** → **Build & deploy** → "Continuous deployment"

### Manual Deploys

1. Build locally: `npm run build`
2. In Netlify dashboard: **Deploys** tab → "Drag and drop" the `dist` folder
3. Or use Netlify CLI: `netlify deploy --prod`

## Rollback

If a deployment breaks something:

1. Netlify dashboard → **Deploys** tab
2. Find a working deploy
3. Click "⋯" menu → "Publish deploy"
4. Instant rollback (no rebuild required)

## Next Steps

- Set up a custom domain
- Configure deploy previews for PR review
- Add monitoring/analytics (Netlify Analytics, Plausible, etc.)
- Implement rate limiting in the Netlify Function
- Set up automated testing in CI/CD pipeline
