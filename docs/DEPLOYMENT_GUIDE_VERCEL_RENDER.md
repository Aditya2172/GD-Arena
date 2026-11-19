# GD ARENA — PRODUCTION CLOUD DEPLOYMENT MANUAL
## STEP-BY-STEP GUIDE: GITHUB &rarr; RENDER &rarr; VERCEL &rarr; SUPABASE

This document provides the exact procedural instructions to publish GD Arena publicly on permanent HTTPS URLs accessible from any device or browser without running local development servers.

---

## DEPLOYMENT ARCHITECTURE

```
+--------------------------------------------------------------------------------------------------+
|                                  PRODUCTION CLOUD TOPOLOGY                                       |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. GitHub Repository: https://github.com/<your-username>/GD-Arena                              |
|          |                                              |                                        |
|          | Git Integration / Push Trigger               | Git Integration / Push Trigger         |
|          v                                              v                                        |
|   2. Vercel (Frontend SPA)                       3. Render (Backend REST API)                    |
|      URL: https://gd-arena.vercel.app               URL: https://gd-arena-backend.onrender.com   |
|      - React 18, Vite, Tailwind                     - Node.js 20, Express, TypeScript            |
|      - Automatic HTTPS / SSL                        - Bound to 0.0.0.0:10000                     |
|      - Web Speech API microphone enabled            - Health Probe: /api/health                  |
|      - SPA Routing (vercel.json)                    - Prometheus: /api/metrics                   |
|          |                                              |                                        |
|          +------------ REST Requests /api ------------->+                                        |
|                                                         |                                        |
|                                                         | PostgreSQL Connection                  |
|                                                         v                                        |
|                                                  4. Supabase Database                            |
|                                                     URL: https://<id>.supabase.co                |
|                                                     - Profiles, Sessions, Messages, Reports      |
|                                                     - Row Level Security (RLS)                   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## PART 1: PUSH CODE TO GITHUB

### Step 1.1: Create Public Repository on GitHub
1. Open your browser and go to [https://github.com/new](https://github.com/new).
2. Repository name: `GD-Arena`
3. Description: `GD Arena — AI-Powered Voice Group Discussion Practice and Evaluation Platform`
4. Visibility: Select **Public**.
5. Initialize this repository with: **DO NOT** check README, .gitignore, or license (these already exist in your project).
6. Click **Create repository**.

### Step 1.2: Push Your Local Repository to GitHub
Open PowerShell and run the following commands:
```powershell
# Navigate to your project directory
cd C:\Users\opgup\.gemini\antigravity\scratch\gd-arena

# Add your GitHub repository as remote origin (replace with your actual GitHub username)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/GD-Arena.git

# Set branch name to main and push
git branch -M main
git push -u origin main
```
*When prompted by Git Credential Manager, log into your GitHub account.*

---

## PART 2: DEPLOY BACKEND TO RENDER

### Step 2.1: Create Web Service on Render
1. Open [https://dashboard.render.com](https://dashboard.render.com) and sign in (using GitHub recommended).
2. Click **New +** (top right) &rarr; select **Web Service**.
3. Under **Connect a repository**, select **`GD-Arena`**.
4. Configure the service:
   * **Name**: `gd-arena-backend`
   * **Region**: `Singapore` (or nearest region)
   * **Branch**: `main`
   * **Root Directory**: *(Leave empty to use root monorepo)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free` (\$0/month)

### Step 2.2: Add Environment Variables in Render
In the **Environment Variables** section on Render, add:

| Key | Value | Notes |
|:---|:---|:---|
| `NODE_ENV` | `production` | Enables production caching |
| `PORT` | `10000` | Render standard port |
| `CLIENT_URL` | `https://gd-arena.vercel.app` | Updated after Vercel deployment |
| `AI_PROVIDER` | `gemini` | LLM provider (or fallback if empty) |
| `GEMINI_API_KEY` | `<your-gemini-api-key>` | Optional: From Google AI Studio |
| `SUPABASE_URL` | `https://<id>.supabase.co` | Optional: From Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | `<your-service-role-key>` | Optional: Backend secret key |
| `SUPABASE_ANON_KEY` | `<your-anon-key>` | Optional: Public key |

*Note: If `GEMINI_API_KEY` or `SUPABASE_URL` are not provided, GD Arena automatically operates in its high-speed in-memory heuristic mode.*

### Step 2.3: Configure Health Check
1. Under **Advanced** settings on Render:
   * **Health Check Path**: `/api/health`
2. Click **Create Web Service**.
3. Wait 2–3 minutes for the build to complete. Once finished, Render displays your public backend URL:  
   `https://gd-arena-backend.onrender.com` (save this exact URL).
4. Verify by opening in browser: `https://gd-arena-backend.onrender.com/api/health`.

---

## PART 3: DEPLOY FRONTEND TO VERCEL

### Step 3.1: Import Project on Vercel
1. Open [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** &rarr; select **Project**.
3. Import the **`GD-Arena`** repository.

### Step 3.2: Configure Build & Output Settings
1. Under **Project Name**: `gd-arena`
2. **Framework Preset**: `Vite`
3. **Root Directory**: `./` (Root directory, handled by `vercel.json`)
4. **Build and Output Settings**:
   * Build Command: `npm run build:client` (already defined in `vercel.json`)
   * Output Directory: `client/dist` (already defined in `vercel.json`)

### Step 3.3: Add Environment Variables in Vercel
In the **Environment Variables** section, add:

| Key | Value | Notes |
|:---|:---|:---|
| `VITE_API_URL` | `https://gd-arena-backend.onrender.com/api` | Your Render backend URL |
| `VITE_SUPABASE_URL` | `https://<id>.supabase.co` | Optional: Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `<your-public-anon-key>` | Optional: Public anon key only |

### Step 3.4: Deploy & Verify
1. Click **Deploy**.
2. Vercel will bundle the React application and provide your public permanent HTTPS domain:  
   `https://gd-arena.vercel.app` (or `https://gd-arena-<username>.vercel.app`).
3. Click the domain to open the live application.

---

## PART 4: CONNECT SERVICES & FINAL VERIFICATION

1. **Update Render CORS**:
   In your Render backend dashboard, ensure `CLIENT_URL` is set to your actual Vercel domain (`https://gd-arena.vercel.app`). Note that GD Arena's dynamic CORS middleware also automatically accepts any `*.vercel.app` domain.
2. **Test Speech Recognition on Mobile & Desktop**:
   Open `https://gd-arena.vercel.app` on your smartphone (Android Chrome / iOS Safari) or laptop:
   * Click **Start Discussion** &rarr; select a topic (e.g., "AI in College Placements").
   * When prompted: **Allow Microphone Access**.
   * Speak your opening argument. Notice the live audio waveform and real-time transcript.
   * Listen to the AI persona's voice response via browser speech synthesis.
   * Click **End Discussion & View Report** to inspect the 8-dimension placement evaluation.

---

## PART 5: TROUBLESHOOTING & COMMON SCENARIOS

1. **Render Free Tier Cold Start (30–50s sleep)**:
   Render free web services spin down after 15 minutes of inactivity. When visiting the website after some time, the top connectivity banner may briefly show "Connecting...". Once the instance wakes up (~30s), it turns green and stays active.
2. **Microphone Permission Denied**:
   If a user accidentally clicks "Block" microphone permissions:
   * In Chrome: Click the padlock icon in the browser address bar &rarr; toggle **Microphone** to **Allow** &rarr; refresh the page.
   * Note: The UI provides an instantaneous typed text fallback input box so the discussion can continue without interruption.
