# GD ARENA — FACULTY VIVA & DEFENSE PREPARATION GUIDE

This guide prepares you to confidently present and defend **GD Arena** in front of your college faculty, project evaluators, and external examiners.

---

## SECTION 1: CORE PRODUCT & AI ARCHITECTURE

### Q1. What is GD Arena, and what real student pain point does it solve?
**Answer:**  
GD Arena is a voice-first, AI-powered platform for practicing group discussions (GDs), which are mandatory elimination rounds in campus placements (e.g. TCS, Infosys, Deloitte, Amazon, and product startups). Most students struggle due to nervousness, lack of structured argument frameworks (like PREP), or excessive verbal filler words. GD Arena gives candidates an on-demand, simulated multi-agent discussion room where they speak through a microphone, debate with realistic AI participants with distinct debate personas, and receive evidence-based rubrics citing their actual transcript statements.

---

### Q2. How is GD Arena different from a generic ChatGPT prompt?
**Answer:**  
1. **Multi-Agent Turn Orchestration**: Rather than a 1-on-1 chatbot, GD Arena simulates a 4-to-6 person room with distinct participants (e.g., Devil's Advocate, Analytical Thinker, Synthesizer) and prevents the same participant from monopolizing airtime.
2. **Shared Discussion Memory**: It tracks the progression across 6 stages (`topic_intro` to `synthesis`) and logs claims.
3. **Anti-Repetition Protection**: It prevents participants from asking repetitive questions.
4. **Programmatic Placement Rubric**: It evaluates candidates across an 8-dimension rubric totaling 100% using deterministic code, never fabricating scores or quotes.

---

### Q3. How does the speech and audio pipeline work?
**Answer:**  
We utilize the browser's native **Web Speech API** (`SpeechRecognition` for STT and `SpeechSynthesis` for TTS). When the candidate speaks, audio is transcribed into text in real time. When an AI participant speaks, their speech pitch and rate are customized (e.g., Dr. Aarav speaks at `0.95x` measured speed, while Rohan Verma speaks at `1.05x`). If a microphone is not permitted or unavailable, a typed-input fallback allows testing without audio hardware.

---

### Q4. Why does GD Arena state that it does not evaluate phonemic pronunciation?
**Answer:**  
This reflects **technical honesty**. Browser SpeechRecognition transcribes acoustic waves into text tokens without exposing raw acoustic phoneme vectors or formants. Fabricating arbitrary pronunciation scores from text alone is scientifically dishonest. Furthermore, placement recruiters value clear logical articulation and composure over penalizing regional Indian English accents.

---

## SECTION 2: DEVOPS, DOCKER & CONTAINERIZATION

### Q5. Why did you use multi-stage Docker builds instead of a single-stage build?
**Answer:**  
Multi-stage builds separate the **compilation environment** from the **production runtime**. In our `server/Dockerfile`, Stage 1 compiles TypeScript and runs npm workspace builds. Stage 2 copies only the compiled JavaScript (`dist/`) and production dependencies onto a minimal `node:20-alpine` image. This reduces the image footprint from ~1.2 GB to ~160 MB, eliminates compiler attack vectors, and speeds up deployment container startup.

---

### Q6. How does your Docker Compose setup achieve service discovery and resilience?
**Answer:**  
In `docker-compose.yml`, both `backend` and `frontend` services are connected via an isolated bridge network (`gdarena-network`). Service discovery allows Nginx to forward API calls to `http://backend:5000/api/` using container DNS. The frontend specifies `depends_on: backend` with `condition: service_healthy`, ensuring the frontend only serves requests once the backend passes its `/api/health` probe.

---

## SECTION 3: KUBERNETES & HIGH AVAILABILITY

### Q7. How does your Kubernetes deployment handle zero-downtime upgrades?
**Answer:**  
In `k8s/backend-deployment.yaml`, we define a `RollingUpdate` strategy with:
* `maxSurge: 1`: Kubernetes spins up one new container before terminating an old one.
* `maxUnavailable: 0`: No existing pods are taken down until the new pod passes its `readinessProbe` (`/api/health`).

---

### Q8. What is the role of the Horizontal Pod Autoscaler (HPA)?
**Answer:**  
In `k8s/hpa.yaml`, the HPA monitors pod CPU and memory utilization via the Kubernetes Metrics Server. When CPU usage exceeds 70% or memory exceeds 80% (e.g., during campus placement recruitment drives), the HPA automatically scales backend pods from 2 up to 10 instances.

---

## SECTION 4: CI/CD & ANSIBLE CONFIGURATION MANAGEMENT

### Q9. Walk me through the stages in your GitHub Actions CI/CD pipeline.
**Answer:**  
The workflow `.github/workflows/ci.yml` runs on every push and pull request:
1. Checks out the code (`actions/checkout@v4`).
2. Sets up Node.js 20 with npm caching.
3. Installs exact dependencies (`npm ci`).
4. Typechecks backend TypeScript (`npm --prefix server run build`).
5. Executes our 15 Vitest unit and integration tests (`npm --prefix server test`).
6. Builds the frontend React SPA with Vite.
7. Executes end-to-end integration tests (`node test_e2e.js`).

---

### Q10. What does Ansible do in your project, and why is it considered idempotent?
**Answer:**  
Ansible automates bare-metal or cloud VM provisioning (e.g., AWS EC2, DigitalOcean). Our playbook `ansible/playbooks/site.yml` configures UFW firewall rules, installs Docker and containerd, clones the application repository, injects production `.env` templates, and starts the container stack. It is **idempotent** because running the playbook multiple times produces the exact same state without duplicating packages, restarting healthy services unnecessarily, or corrupting files.
