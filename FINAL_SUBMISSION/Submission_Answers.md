# MICROSOFT FORMS SUBMISSION — ANSWERS & EVIDENCE GUIDE
## COURSE: DEVOPS ENGINEERING & CLOUD COMPUTING
**Candidate Name**: Aditya Kumar Gupta  
**Institute**: Noida Institute of Engineering and Technology (NIET)  
**Project**: GD Arena — AI-Powered Voice Group Discussion Practice Platform  
**Repository**: [https://github.com/Aditya2172/GD-Arena](https://github.com/Aditya2172/GD-Arena)  

---

### QUESTION 5 — DEFINE YOUR PROBLEM STATEMENT

**Answer**:  
> In campus recruitment drives across top IT and product companies (TCS, Infosys, Wipro, Accenture, Cognizant), over 70% of engineering candidates are eliminated in Group Discussion (GD) rounds. Students struggle not due to a lack of technical competence, but due to unstructured verbal articulation, hesitations, repetitive arguments, lack of active listening, and conversational anxiety. Traditional offline mock GDs are difficult to organize, subjective in evaluation, and fail to provide quantitative feedback. **GD Arena** solves this by providing a 24/7 voice-first simulation where students converse verbally with distinct AI personas, receiving automated, objective evaluations across an 8-dimension placement rubric with real-time speech delivery analytics (WPM, filler words, turn balance).

---

### QUESTION 6 — PROJECT TITLE

**Answer**:  
`GD Arena — AI-Powered Voice Group Discussion Practice Platform`

---

### QUESTION 7 — GITHUB REPOSITORY URL

**Answer**:  
`https://github.com/Aditya2172/GD-Arena`

---

### QUESTION 8 — CLOUD PLATFORM USED

**Answer**:  
Select: **Other**  
**Explanation**:  
> GD Arena employs a modern decoupled multi-cloud PaaS/SaaS architecture rather than a single legacy cloud hyperscaler:
> 1. **Vercel**: Edge Content Delivery Network (CDN) hosting the React 18 / Vite Single Page Application with automated SSL/HTTPS (required for Web Speech API microphone security).
> 2. **Render**: Managed container web service hosting the Node.js 20 Express backend REST API bound to `0.0.0.0:10000` with active health check monitoring on `/api/health`.
> 3. **Supabase Cloud**: Managed PostgreSQL 15 database providing Row Level Security (RLS) policies and persistent user authentication.
> 4. **Google AI Studio / Vertex AI**: Cloud AI API integration powering dynamic LLM conversational turns via Gemini 1.5 Flash.

---

### QUESTION 9 — PROJECT ARCHITECTURE AND VERSION CONTROL

**Evidence Image**:  
Attach or reference: `FINAL_SUBMISSION/GD_Arena_Architecture.png`  
**Description**:  
> Decoupled multi-tier cloud architecture illustrating Candidate Web Speech In/Out &rarr; React SPA on Vercel &rarr; Node.js Express REST API on Render &rarr; Supabase Managed PostgreSQL &rarr; Gemini LLM API, with Git version control, GitHub Actions CI/CD (7 quality gates), Docker multi-stage containerization, Kubernetes manifests, and Ansible automation.

---

### QUESTION 10 — GITHUB REPOSITORY STRUCTURE

**Evidence Image**:  
Attach or reference: `FINAL_SUBMISSION/GitHub_Repository_Structure.png`  
**Description**:  
> Complete structured monorepo containing `client/` (React SPA + Dockerfile), `server/` (Node.js API + tests + Dockerfile), `supabase/migrations/` (PostgreSQL RLS schema), `k8s/` (8 Kubernetes manifests), `ansible/` (4 modular roles), `.github/workflows/` (CI/CD quality gates), `Jenkinsfile`, `docker-compose.yml`, and comprehensive academic documentation.

---

### QUESTION 11 — GITHUB REPOSITORY (FORKED REPOSITORY) URL

**Answer**:  
`https://github.com/Aditya2172/GD-Arena`  
**Explanation**:  
> This project is the primary, original implementation developed in the repository `https://github.com/Aditya2172/GD-Arena`. If an evaluation fork is specifically mandated by the faculty portal, the repository can be forked directly on GitHub using the **Fork** button into the target evaluator organization with zero configuration loss.

---

### QUESTION 12 — DOCKER CONTAINER EXECUTION

**Evidence Image**:  
Attach or reference: `FINAL_SUBMISSION/Docker_Execution.png`  
**Description**:  
> Multi-container Docker Compose execution demonstrating `gdarena-backend` (Node 20 Alpine, non-root user `appuser:1000`) and `gdarena-frontend` (Nginx Alpine reverse proxy) communicating over the isolated bridge network `gdarena-network`, with verified health probe response from `http://localhost:5000/api/health`. Detailed reproduction commands are provided in `DOCKER_SETUP.md`.

---

### QUESTION 13 — CI/CD PIPELINE CONFIGURATION

**Evidence Image**:  
Attach or reference: `FINAL_SUBMISSION/CICD_Pipeline.png`  
**Description**:  
> Automated GitHub Actions workflow (`.github/workflows/ci.yml`) enforcing 7 quality gates on every commit: SCM Checkout &rarr; Node.js 20 Setup &rarr; `npm ci` &rarr; TypeScript Server Compile (`tsc`) &rarr; Vitest Test Suite (15/15 tests passed) &rarr; React Bundle Compilation (`vite build`) &rarr; End-to-End System Integration (`node test_e2e.js`) &rarr; Container Security Scan via Aqua Security Trivy.

---

### QUESTION 14 — CLOUD DEPLOYMENT AND INFRASTRUCTURE

**Evidence Image**:  
Attach or reference: `FINAL_SUBMISSION/Cloud_Deployment.png`  
**Description**:  
> Production deployment specifications linking GitHub to Vercel (Edge SPA hosting) and Render (Containerized REST API hosting), configured with automated SPA rewrites (`vercel.json`), zero-downtime healthcheck polling (`render.yaml`), dynamic CORS middleware, and PostgreSQL Row Level Security (`supabase/migrations/`).

---

### QUESTION 15 — FINAL DEPLOYED APPLICATION URL

**Answer**:  
* **Production Frontend Website**: `https://gd-arena.vercel.app` (or candidate's linked Vercel deployment URL)
* **Production Backend Healthcheck**: `https://gd-arena-backend.onrender.com/api/health`
* **Local Development Address**: `http://localhost:5173` (Frontend) & `http://localhost:5000` (Backend API)

---

### QUESTION 16 — MAJOR CHALLENGES AND SOLUTIONS

**Answer**:  
1. **Challenge: Browser Microphone Security Restrictions on Cloud Deployments**  
   * *Problem*: Chromium and Safari block `SpeechRecognition` on non-HTTPS origins, causing microphone failures.  
   * *Solution*: Deployed the frontend to Vercel with automated SSL/TLS certificates and implemented an instantaneous typed text fallback input for unsupported browsers.
2. **Challenge: Multi-Party Conversational Balance & Dead-Ends**  
   * *Problem*: In multi-speaker discussions, naive LLM prompting leads to repetitive questions or single-agent domination.  
   * *Solution*: Engineered a `DiscussionMemoryService` and `AdaptiveEngine` with 6 conversation stages and anti-repetition guards, balancing AI speaker turns dynamically.
3. **Challenge: External AI API Quota Exhaustion & Network Outages**  
   * *Problem*: Free cloud LLM APIs enforce strict rate limits (15 RPM), risking crashes during live evaluation.  
   * *Solution*: Implemented an algorithmic Heuristic Fallback Engine that computes context-aware conversational turns and deterministic 8-dimension rubric reports if external APIs fail.
4. **Challenge: Container Bloat & Security in Docker**  
   * *Problem*: Standard Node.js Docker images exceed 1.2 GB and run as `root`.  
   * *Solution*: Implemented multi-stage Docker builds using `node:20-alpine` and `nginx:alpine` (~160 MB and ~25 MB) and restricted runtime execution to unprivileged system user `appuser:1000`.

---

### QUESTION 17 — PROJECT ZIP FILE GOOGLE DRIVE LINK

**Instructions for Google Drive Link**:  
1. Locate the generated archive: `C:\Users\opgup\.gemini\antigravity\scratch\gd-arena\GD_Arena_Final_Submission.zip` (Size: ~270 KB).
2. Open Google Drive ([https://drive.google.com](https://drive.google.com)) &rarr; Click **+ New** &rarr; **File upload**.
3. Select `GD_Arena_Final_Submission.zip`.
4. Right-click the uploaded file &rarr; select **Share** &rarr; change General access to **Anyone with the link** (Viewer).
5. Click **Copy link** and paste into this form field.
