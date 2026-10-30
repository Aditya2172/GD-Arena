# GD ARENA — AI-Powered Voice Group Discussion Practice Platform

> **"Speak Confidently. Think Critically. Lead Discussions."**

**GD Arena** is an enterprise-grade, voice-first AI web application built specifically for college students and job seekers preparing for campus recruitment, corporate group discussions (GDs), and communication assessments.

Candidates enter a virtual discussion room, speak naturally through their microphone, debate in real-time with multiple AI participants possessing distinct personas, listen to spoken AI responses, and receive comprehensive rubric-based performance assessments with actionable sentence rewrites, 8 quantitative metrics, and longitudinal growth tracking.

---

## 🌟 Key Highlights & Features

### 1. 🎙️ Voice-First Multi-Agent Discussion Arena
* **Real-time Speech Recognition**: Speech-to-Text via browser `SpeechRecognition` with live visual transcript streaming.
* **Calibrated Text-to-Speech (TTS)**: Contextual TTS with speech rates and pitches tailored to each AI persona.
* **Typed-Chat Fallback**: Seamless keyboard input fallback when microphones are unavailable or permissions are denied.
* **Turn Completion & Interrupt Controls**: Stop AI audio playback immediately when you decide to take the floor.

### 2. 🎭 6 Distinct AI Debate Personas
* **Dr. Aarav Mehta (The Analytical Thinker)**: Employs structured frameworks, empirical reasoning, and trade-off analysis.
* **Rohan Verma (The Devil's Advocate)**: Challenges assumptions, questions data sources, and presents provocative counterpoints.
* **Ananya Sharma (The Collaborative Communicator)**: Synthesizes divergent views, finds win-win compromises, and encourages group participation.
* **Vikram Malhotra (The Confident Speaker)**: Delivers assertive, punchy rhetoric, stakes clear stances, and speaks with conviction.
* **Neha Kulkarni (The Practical Thinker)**: Evaluates execution friction, logistical feasibility, and fiscal constraints.
* **Kabir Sen (The Discussion Synthesizer)**: Identifies emerging consensus, resolves conflicts, and structures actionable conclusions.

### 3. 🧠 Realistic Adaptive Discussion Engine & Shared Memory
* **Shared Discussion Memory (`discussionMemoryService.ts`)**: Tracks discussion progress through 6 stages (`topic_intro` ➡️ `initial_viewpoints` ➡️ `argument_development` ➡️ `counterarguments` ➡️ `evidence_deepening` ➡️ `synthesis_conclusion`).
* **Argument Extraction & Contextual Moves (`adaptiveEngine.ts`)**: Analyzes the candidate's actual words and selects optimal conversational moves (`introduce_counterexample`, `explore_consequence`, `ask_supporting_evidence`, `request_clarification`, `move_to_synthesis`).
* **Anti-Repetition Guard**: Tracks previously asked questions and prevents repetitive inquiries across subsequent turns.
* **Turn Balancing**: Prevents the same AI participant from speaking twice in a row, ensuring genuine multi-party group dynamics.

### 4. 📊 8-Dimension Campus Placement Rubric
Final scores are computed strictly through programmatic arithmetic (`Final = Sum(Score * Weight)`):

| Rubric Dimension | Weight | Placement Focus |
| :--- | :---: | :--- |
| **Content & Logical Reasoning** | **20%** | Thesis clarity, premise validity, logical fallacies |
| **Communication & Clarity** | **15%** | Articulation, sentence structure, audience engagement |
| **Fluency & Speech Delivery** | **15%** | Pacing (110–150 WPM benchmark), natural cadence |
| **Vocabulary & Professional Language** | **10%** | Lexical variety, formal idioms, precision |
| **Grammar & Sentence Construction** | **10%** | Syntactic accuracy, clause coordination |
| **Listening & Active Teamwork** | **10%** | Acknowledging peers, constructive building |
| **Leadership & Turn Initiative** | **10%** | Decisive opening, guiding discussions, synthesizing |
| **Relevance & Supporting Evidence** | **10%** | Citing examples, statistics, and verifiable precedents |
| **Total** | **100%** | Programmatic weighted calculation |

### 5. 🔍 7 Evaluator Perspectives & Evidence-Based Marking
* **7 Specialized Evaluators**: Content & Reasoning Evaluator, Communication Coach, Vocabulary Specialist, Speech & Fluency Analyst, Teamwork Observer, Leadership Assessor, and Campus Placement Panel Verdict.
* **Evidence-Based Marking**: Cites verbatim candidate quotes directly from the transcript with turn sequence numbers.
* **Vocabulary & Language Coach**: Side-by-side before/after sentence rewrites (Original ➡️ Suggested Alternative ➡️ Why It Helps ➡️ Contextual Example).

### 6. ⏱️ Speech Clarity Lab & Pronunciation Transparency
* **Delivery Rate**: Analyzes candidate WPM against the campus placement benchmark (110–150 WPM).
* **Verbal Filler Suppression**: Automatically identifies and tallies verbal fillers (`um`, `uh`, `basically`, `actually`, `like`, `you know`).
* **Interactive Live Microphone Pacing Tester**: Live speech practice tool with real-time feedback.
* **Honest Technical Disclosure**: Clarifies that browser STT does not provide acoustic phoneme vectors, avoiding fake pronunciation scores while respecting regional Indian English variations.

### 7. 🎯 Placement Micro-Drills & Progression Comparison
* **Interactive Micro-Drills**: 20-Second High-Impact Opening Hook, PREP Structure Drill (Point, Reason, Example, Point), 1-Minute Deliberate Pause Challenge, and Diplomatic Rebuttal Drill.
* **Longitudinal Session Comparison**: Side-by-side comparison of two discussion sessions showing score delta (+/- points), 8-dimension progression matrix, and speech delivery trends.

---

## 🛠️ Technology Stack

* **Frontend**:
  * React 18 with Vite & TypeScript
  * Tailwind CSS (Dark Navy `#0B0F19` with Blue `#3B82F6`, Cyan `#06B6D4`, and Violet `#8B5CF6` accents)
  * Lucide React Icons
  * Recharts (Radar Chart & Performance Progression)
  * Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

* **Backend**:
  * Node.js & Express with TypeScript (`tsx` / `tsc`)
  * RESTful API architecture with Zod schema validation
  * Dual-mode server: Serves both REST APIs and the production-built React SPA simultaneously
  * Modular AI provider interface (Google Gemini, OpenAI, Groq, Anthropic, Adaptive Heuristic Engine)
  * In-memory Rate Limiting and centralized error handling

* **Database & Authentication**:
  * Supabase PostgreSQL with Row Level Security (RLS)
  * Supabase Auth with JWT verification
  * In-memory storage mode for instant local execution without external credentials

* **Testing**:
  * Vitest for backend unit & integration testing
  * Node.js automated end-to-end integration test (`test_e2e.js`)

---

## 📁 System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │                 BROWSER CLIENT               │
                  │   React 18 + Vite + Tailwind + Web Speech    │
                  └──────────────┬───────────────────────────────┘
                                 │
                   HTTP REST APIs│ (Proxy / Direct)
                                 ▼
                  ┌──────────────────────────────────────────────┐
                  │            EXPRESS BACKEND (PORT 5000)       │
                  │  Auth Middleware • Rate Limiting • Validators│
                  └──────────────┬───────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌──────────────┐       ┌──────────────────┐     ┌──────────────────┐
│ ADAPTIVE GD  │       │ PLACEMENT RUBRIC │     │ DATA PERSISTENCE │
│   ENGINE     │       │    EVALUATOR     │     │     LAYER        │
│ • Memory     │       │ • 8 Dimensions   │     │ • Supabase PG    │
│ • Anti-Repeat│       │ • 7 Perspectives │     │ • In-Memory Demo │
│ • 6 Personas │       │ • Evidence Quote │     │ • Session Store  │
└──────────────┘       └──────────────────┘     └──────────────────┘
```

---

## 🚀 Quick Start Guide (Windows)

### Option 1: 1-Click Launch (Recommended)
Double-click [`start.bat`](start.bat) in the project root directory. It will:
1. Check for Node.js and npm in your PATH.
2. Build frontend and backend bundles if needed.
3. Detect port conflicts.
4. Launch both frontend and backend concurrently.

### Option 2: Command Line
```powershell
# 1. Clone or navigate to the project directory
cd C:\Users\opgup\.gemini\antigravity\scratch\gd-arena

# 2. Install dependencies
npm install

# 3. Start development servers
npm run dev
```

### Access URLs:
* **Frontend Application**: [http://localhost:5173](http://localhost:5173)
* **Unified Full-Stack App**: [http://localhost:5000](http://localhost:5000)
* **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Diagnostics:
To check system health, double-click [`diagnose.bat`](diagnose.bat) or run:
```powershell
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:5000/api/health' | ConvertTo-Json"
```

---

## 🧪 Testing & Verification

### Run Automated Vitest Suite:
```powershell
npm --prefix server test
```
* **Coverage**: Multi-Agent Orchestration, Rubric Weights Validation (100% check), Programmatic Weighted Scoring, Filler Detection, and 6-Personality Turn Balancing.

### Run End-to-End Integration Test:
```powershell
node test_e2e.js
```
* **Coverage**: Health check ➡️ Session Creation ➡️ Turn 1 (Devil's Advocate) ➡️ Turn 2 (Analytical Thinker) ➡️ End Session ➡️ 8-Dimension Report Generation ➡️ Analytics Summary.

---

## 🎓 5–10 Minute Faculty Demonstration Guide

When presenting GD Arena to faculty or recruiters, follow this structured demo script:

1. **Dashboard & Readiness Hub (1 Minute)**:
   * Open [http://localhost:5173](http://localhost:5173).
   * Highlight the **Campus Placement Readiness Hub**: Speech Clarity Lab, Placement Micro-Drills, and Longitudinal Progress Comparison.
2. **Speech Clarity Lab (2 Minutes)**:
   * Navigate to **Speech Lab**.
   * Demonstrate the **Live Microphone Pacing Tester**: speak for 15 seconds to show live WPM calculation and automatic filler word detection (`um`, `basically`, `like`).
   * Point out the **Honest Pronunciation Disclosure** explaining that acoustic ML models are required for phonemic scoring, respecting Indian English variations.
3. **Interactive Discussion Arena (3 Minutes)**:
   * Click **New GD**, select topic *"Should AI Replace Human Knowledge Workers?"*.
   * Select 4 AI personalities (Dr. Aarav Mehta, Rohan Verma, Neha Kulkarni, Kabir Sen).
   * Click **Start Discussion Now**.
   * Dr. Aarav opens the floor with an opening frame.
   * Speak or type: *"AI will reduce some repetitive jobs, but it will create new opportunities in data science."*
   * Show that Rohan Verma (Devil's Advocate) **adaptively challenges** this: *"You mentioned opportunities in data science. What about graduates without coding skills?"*
   * Respond: *"Universities should restructure curricula to teach digital tools."*
   * Show that Neha Kulkarni (Practical Thinker) chimed in next: *"Who carries the financial burden of this training: colleges or employers?"*
4. **Placement Performance Report (2 Minutes)**:
   * Click **Conclude Discussion**.
   * Show the **Programmatic Final Score** (e.g. 72/100, Placement Ready).
   * Walk through the **8-Dimension Rubric Table** and **Skill Radar Chart**.
   * Show **Evidence-Based Marking** citing the candidate's exact words.
   * Show **Language Coach** with before/after sentence rewrites.
   * Show the **Print / Export PDF** feature.
5. **Session Comparison (1 Minute)**:
   * Navigate to **Compare** to show side-by-side progression between two sessions.

---

## 🌐 Public Cloud Deployment Guide

GD Arena is architected for zero-friction cloud deployment:

### 1. Backend + Frontend Unified (Render / Railway)
Since Express directly serves `client/dist`, the entire application can be hosted on a single web service:
1. Connect your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Choose **Web Service** with Node.js environment.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Configure environment variables from `.env.example` (`NODE_ENV=production`, `PORT=5000`).

### 2. Frontend on Vercel (Alternative)
If hosting frontend separately:
1. Connect repository to [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Set Build Command: `npm run build`
4. Output Directory: `dist`
5. Set `VITE_API_URL` to your hosted backend URL.

### 3. Database & Auth (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Run SQL migration from [`supabase/migrations/20261010_initial_schema.sql`](supabase/migrations/20261010_initial_schema.sql).
3. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` to your environment variables.

---

## 🔒 Security & Privacy

* **Zero Exposed Secrets**: All sensitive API keys reside exclusively on the server.
* **Clean Git Repository**: `.gitignore` strictly excludes `node_modules`, `dist`, `.env*`, and debug logs.
* **Deterministic Fallback Engine**: If cloud AI quotas are exceeded, the built-in heuristic engine ensures seamless demonstration without disruption.

---

## 📄 Academic Submission Checklist

- [x] Full-stack working code (Frontend + Backend + Database Schema)
- [x] 8-Dimension placement evaluation rubric with exact 100% weights
- [x] Context-aware multi-agent discussion engine with 6 distinct personas
- [x] Speech delivery analytics (WPM, fillers, speech pause cadence)
- [x] Placement micro-drills and longitudinal comparison
- [x] Localhost 1-click startup scripts (`start.bat`, `diagnose.bat`)
- [x] Automated test suite passing (15 Vitest tests + E2E test script)
- [x] Production build verified (`dist/` generated cleanly)
- [x] Faculty demonstration guide and documentation

---

*Developed for College Placements & Technical Evaluation.*
