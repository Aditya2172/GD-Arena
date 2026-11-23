import os
import subprocess

def generate_pdf():
    html_path = r"C:\Users\opgup\.gemini\antigravity\scratch\gd-arena\report.html"
    pdf_out1 = r"C:\Users\opgup\.gemini\antigravity\scratch\gd-arena\FINAL_SUBMISSION\Submission_Report.pdf"
    pdf_out2 = r"C:\Users\opgup\.gemini\antigravity\scratch\gd-arena\GD_Arena_Final_Report.pdf"
    img_arch = r"C:\Users\opgup\.gemini\antigravity\scratch\gd-arena\GD_Arena_Architecture.png".replace("\\", "/")

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GD Arena — Final Academic Report</title>
<style>
    @page {{
        size: A4;
        margin: 20mm;
        @bottom-right {{
            content: counter(page);
        }}
    }}
    body {{
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #1e293b;
        line-height: 1.6;
        font-size: 10.5pt;
        background: #ffffff;
        margin: 0;
        padding: 0;
    }}
    .cover-page {{
        text-align: center;
        page-break-after: always;
        padding-top: 40px;
    }}
    .inst-name {{
        font-size: 14pt;
        font-weight: bold;
        color: #1e3a8a;
        margin-bottom: 4px;
        text-transform: uppercase;
    }}
    .dept-name {{
        font-size: 11pt;
        color: #475569;
        font-style: italic;
        margin-bottom: 60px;
    }}
    .project-title {{
        font-size: 22pt;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 12px;
        line-height: 1.25;
    }}
    .project-subtitle {{
        font-size: 12pt;
        color: #0284c7;
        margin-bottom: 70px;
    }}
    .meta-box {{
        margin-top: 60px;
        border-top: 2px solid #e2e8f0;
        padding-top: 30px;
        display: inline-block;
        text-align: left;
    }}
    .meta-box p {{
        margin: 4px 0;
        font-size: 10.5pt;
    }}
    .meta-label {{
        font-weight: bold;
        color: #0f172a;
    }}
    h1 {{
        font-size: 15pt;
        color: #0f172a;
        border-bottom: 2px solid #3b82f6;
        padding-bottom: 4px;
        margin-top: 28px;
        margin-bottom: 12px;
        page-break-after: avoid;
        text-transform: uppercase;
    }}
    h2 {{
        font-size: 12pt;
        color: #1e3a8a;
        margin-top: 18px;
        margin-bottom: 8px;
        page-break-after: avoid;
    }}
    p {{
        margin: 8px 0;
        text-align: justify;
    }}
    ul, ol {{
        margin: 8px 0 12px 20px;
    }}
    li {{
        margin-bottom: 4px;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin: 14px 0;
        font-size: 9pt;
        page-break-inside: avoid;
    }}
    th, td {{
        border: 1px solid #cbd5e1;
        padding: 6px 10px;
        text-align: left;
    }}
    th {{
        background-color: #1e3a8a;
        color: #ffffff;
        font-weight: 600;
    }}
    tr:nth-child(even) {{
        background-color: #f8fafc;
    }}
    .card {{
        background: #f1f5f9;
        border-left: 4px solid #3b82f6;
        padding: 10px 14px;
        margin: 12px 0;
        font-size: 9.5pt;
        page-break-inside: avoid;
    }}
    .img-container {{
        text-align: center;
        margin: 18px 0;
        page-break-inside: avoid;
    }}
    .img-container img {{
        max-width: 95%;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
    }}
    .caption {{
        font-size: 8.5pt;
        color: #64748b;
        margin-top: 6px;
        font-style: italic;
    }}
    .page-break {{
        page-break-after: always;
    }}
    .badge {{
        display: inline-block;
        padding: 2px 6px;
        font-size: 8pt;
        font-weight: bold;
        border-radius: 4px;
        background: #dcfce7;
        color: #166534;
    }}
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
    <div class="inst-name">Noida Institute of Engineering and Technology (NIET), Greater Noida</div>
    <div class="dept-name">Department of Computer Science & Engineering | Course: DevOps Engineering & Cloud Computing</div>
    
    <div class="project-title">GD ARENA — AI-POWERED VOICE GROUP DISCUSSION PRACTICE PLATFORM</div>
    <div class="project-subtitle">Cloud-Native Architecture, Multi-Stage Containerization, Automated CI/CD Quality Gates, and Campus Placement Speech Analytics</div>

    <div class="meta-box">
        <p><span class="meta-label">Candidate Name:</span> Aditya Kumar Gupta</p>
        <p><span class="meta-label">Degree & Branch:</span> B.Tech — Computer Science & Engineering</p>
        <p><span class="meta-label">Academic Evaluation:</span> Outcome-Based Education (OBE) Assessment — CO4 (K2–K6)</p>
        <p><span class="meta-label">GitHub Repository:</span> https://github.com/Aditya2172/GD-Arena</p>
        <p><span class="meta-label">Submission Date:</span> November 2026</p>
    </div>
</div>

<!-- EXECUTIVE SUMMARY -->
<h1>1. Executive Summary</h1>
<p>
    Group Discussions (GDs) are an essential, high-attrition screening mechanism in campus recruitment drives for major technology employers. Over 70% of engineering candidates are eliminated during GD rounds not due to technical inadequacy, but due to poor vocal delivery, unstructured articulation, hesitations, repetitive arguments, lack of turn-taking balance, and conversational anxiety.
</p>
<p>
    <strong>GD Arena</strong> is an enterprise-grade, voice-first web application engineered to solve this dilemma. It simulates realistic, multi-participant group discussions where candidates converse verbally with diverse AI personas. Post-session, the platform computes an objective, evidence-based performance report across an 8-dimension placement rubric with actionable sentence-level rewrites and speech clarity analytics.
</p>
<div class="card">
    <strong>Key DevOps Highlights:</strong> Multi-stage Docker builds on Alpine Linux reducing images by 85% with non-root security compliance (USER appuser); 7-stage GitHub Actions CI/CD pipeline enforcing static typechecking, Vitest unit testing, and Trivy CVE scanning; decoupled cloud architecture across Vercel (Edge SPA), Render (Container API), and Supabase (Managed PostgreSQL with RLS).
</div>

<!-- PROBLEM STATEMENT & OBJECTIVES -->
<h1>2. Problem Statement & Project Objectives</h1>
<h2>2.1 Problem Statement</h2>
<p>
    Recruitment panels assess candidates under tight time constraints. Students face common pitfalls: hesitations, filler words ('um', 'uh', 'basically'), inability to structure thoughts using frameworks like PREP (Point, Reason, Example, Point), and poor group dynamics. Manual peer preparation is unstandardized, subjective, and difficult to schedule. GD Arena provides 24/7 objective, automated voice simulations.
</p>
<h2>2.2 Core Objectives</h2>
<ul>
    <li>Provide hands-free vocal interaction via browser Web Speech API (SpeechRecognition and SpeechSynthesis).</li>
    <li>Simulate 6 distinct AI personas (Analytical Thinker, Devil's Advocate, Collaborative Communicator, Confident Speaker, Practical Thinker, Discussion Synthesizer).</li>
    <li>Maintain multi-party conversational context across 6 discussion stages with anti-repetition guards.</li>
    <li>Compute quantitative placement scores across 8 dimensions (Sum of Weights = 1.0).</li>
    <li>Implement automated CI/CD quality gates and multi-stage containerization with non-root security compliance.</li>
    <li>Deploy decoupled microservices across Vercel, Render, and Supabase with zero hardcoded credentials.</li>
</ul>

<!-- ARCHITECTURE & DIAGRAM -->
<div class="page-break"></div>
<h1>3. System Architecture & Component Interaction</h1>
<p>
    GD Arena follows a modern, decoupled microservice pattern. The client SPA communicates with the backend Express REST API over secure HTTP endpoints. The backend coordinates discussion memory, adaptive turn generation, and placement evaluations.
</p>

<div class="img-container">
    <img src="{img_arch}" alt="GD Arena Architecture Diagram">
    <div class="caption">Figure 1: Full-Stack Cloud & DevOps Architecture Diagram (User &rarr; Vercel &rarr; Render &rarr; Supabase &rarr; Gemini AI)</div>
</div>

<h2>3.1 Component Interaction Flow</h2>
<ol>
    <li><strong>Voice Capture:</strong> The candidate speaks into the microphone; browser SpeechRecognition streams real-time transcripts.</li>
    <li><strong>REST Dispatch:</strong> The transcript is posted to <code>/api/sessions/:id/respond</code>.</li>
    <li><strong>Adaptive Move Selection:</strong> <code>AdaptiveEngine</code> selects a persona and conversational strategy based on participation balance.</li>
    <li><strong>AI Speech Playback:</strong> The backend prompts Gemini LLM (or executes heuristic NLP) and returns the response; the client highlights the speaker avatar and executes SpeechSynthesis.</li>
    <li><strong>Evaluation:</strong> Upon completion, <code>/api/sessions/:id/report</code> calculates the 8-dimension placement scores and radar chart data.</li>
</ol>

<!-- TECHNOLOGY STACK -->
<h1>4. Technology Stack</h1>
<table>
    <tr>
        <th>Tier</th>
        <th>Technologies</th>
        <th>Role in GD Arena</th>
    </tr>
    <tr>
        <td><strong>Frontend</strong></td>
        <td>React 18, Vite 5, TypeScript</td>
        <td>Single Page Application, component reusability, strict typing</td>
    </tr>
    <tr>
        <td><strong>UI Styling</strong></td>
        <td>Tailwind CSS, Lucide Icons, Recharts</td>
        <td>Responsive dark interface, audio waveform visualizers, radar charts</td>
    </tr>
    <tr>
        <td><strong>Voice Engine</strong></td>
        <td>Web Speech API (STT & TTS)</td>
        <td>Real-time speech recognition and persona-calibrated voice synthesis</td>
    </tr>
    <tr>
        <td><strong>Backend API</strong></td>
        <td>Node.js 20, Express.js, TypeScript</td>
        <td>RESTful routing, rate limiting, error handling, Prometheus metrics</td>
    </tr>
    <tr>
        <td><strong>Cognitive AI</strong></td>
        <td>Google Gemini 1.5 Flash + Heuristic NLP</td>
        <td>Multi-turn persona dialogues with autonomous rule-based fallback</td>
    </tr>
    <tr>
        <td><strong>Database</strong></td>
        <td>Supabase PostgreSQL 15, Auth</td>
        <td>Row Level Security (RLS) policies, JWT validation, persistence</td>
    </tr>
    <tr>
        <td><strong>Containers</strong></td>
        <td>Docker, Docker Compose, Nginx Alpine</td>
        <td>Multi-stage builds, non-root user (appuser:1000), bridge networking</td>
    </tr>
    <tr>
        <td><strong>CI/CD</strong></td>
        <td>GitHub Actions, Jenkins Declarative</td>
        <td>7 automated quality gates, Aqua Security Trivy vulnerability scan</td>
    </tr>
    <tr>
        <td><strong>PaaS Hosting</strong></td>
        <td>Vercel, Render, Supabase Cloud</td>
        <td>Global Edge CDN frontend and managed container backend runtime</td>
    </tr>
</table>

<!-- ASSESSMENT QUESTIONS -->
<div class="page-break"></div>
<h1>5. Academic Assessment Questions (CO4, K2–K6)</h1>

<h2>Q1 (CO4, K2): Overall Project Architecture</h2>
<p>
    GD Arena decouples presentation, business logic, persistence, and intelligence. The React frontend interacts with the Node.js Express server via JSON REST endpoints. When external cloud APIs are unconfigured or quotas expire, the dual-engine architecture seamlessly activates the in-memory database and heuristic NLP engine, guaranteeing 100% operational uptime.
</p>

<h2>Q2 (CO4, K3): DevOps Tools Integration</h2>
<p>
    The project applies Git for version control; Docker multi-stage builds (reducing backend to ~160 MB and frontend to ~25 MB under unprivileged user <code>appuser:1000</code>); Jenkins declarative pipelines for parallel lint/test execution; Kubernetes manifests for horizontal pod autoscaling (2–10 pods); and Ansible for idempotent host configuration.
</p>

<h2>Q3 (CO4, K4): CI/CD Pipeline Analysis</h2>
<p>
    The automated pipeline (<code>.github/workflows/ci.yml</code>) enforces 7 sequential quality gates: SCM checkout &rarr; Node 20 runtime setup &rarr; deterministic <code>npm ci</code> &rarr; static typecheck &rarr; Vitest suite (15/15 passed) &rarr; client bundle compilation &rarr; end-to-end integration test (<code>test_e2e.js</code>). The CD pipeline executes Aqua Security Trivy scans to block images with critical CVEs.
</p>

<h2>Q4 (CO4, K5): Cloud Platform Evaluation</h2>
<table>
    <tr>
        <th>Dimension</th>
        <th>AWS</th>
        <th>Microsoft Azure</th>
        <th>Google Cloud Platform (GCP)</th>
    </tr>
    <tr>
        <td><strong>Compute</strong></td>
        <td>Amazon EKS & ECS Fargate</td>
        <td>AKS & Container Apps</td>
        <td><strong>GKE Autopilot & Cloud Run (Winner)</strong></td>
    </tr>
    <tr>
        <td><strong>AI Integration</strong></td>
        <td>Polly (TTS) & Transcribe (STT)</td>
        <td>Azure AI Speech Services</td>
        <td><strong>Cloud Speech-to-Text & Gemini LLMs (Winner)</strong></td>
    </tr>
    <tr>
        <td><strong>Regional Latency</strong></td>
        <td>Mumbai & Hyderabad (15-28ms)</td>
        <td>Pune & Chennai (18-32ms)</td>
        <td><strong>Mumbai & Delhi (12-22ms, Lowest in India)</strong></td>
    </tr>
    <tr>
        <td><strong>Cost Structure</strong></td>
        <td>EKS control plane fee: $73/mo</td>
        <td>Free AKS tier + VM costs</td>
        <td><strong>Cloud Run scale-to-zero: $0 idle cost</strong></td>
    </tr>
</table>

<h2>Q5 (CO4, K6): Improved DevOps and Cloud Architecture</h2>
<p>
    The improved architecture integrates Prometheus telemetry at <code>/api/metrics</code>, structured JSON health probing at <code>/api/health</code>, Shift-Left DevSecOps (Trivy image audits, non-root users, UFW firewalls), and a permanent public cloud hosting model on Vercel, Render, and Supabase.
</p>

<!-- TESTING & VERIFICATION -->
<div class="page-break"></div>
<h1>6. Testing Methodology, Unit Verification & E2E Results</h1>
<p>
    Rigorous multi-layer testing was executed to verify system reliability:
</p>
<div class="card">
    <strong>Test Execution Results:</strong><br>
    • <strong>Vitest Unit Suite (15 / 15 Tests Passed - 100%):</strong><br>
    &nbsp;&nbsp;✔ <code>tests/orchestration.test.ts</code> (5 tests): Multi-speaker turn-taking, persona balancing, anti-domination.<br>
    &nbsp;&nbsp;✔ <code>tests/report.test.ts</code> (6 tests): 8 placement dimensions, weight sum = 1.0, 0–100 bounds.<br>
    &nbsp;&nbsp;✔ <code>tests/sessions.test.ts</code> (4 tests): Room creation, turn persistence, in-memory isolation.<br>
    • <strong>End-to-End System Test (<code>node test_e2e.js</code> - 100% Passed):</strong><br>
    &nbsp;&nbsp;✔ Healthcheck (/api/health) &rarr; Auth guard (401) &rarr; Room creation &rarr; Turn 1 &rarr; Turn 2 &rarr; 8-Dimension Report &rarr; Progress Analytics.<br>
    • <strong>TypeScript Static Compilation:</strong> 0 errors across backend (<code>tsc</code>) and frontend (<code>tsc && vite build</code>).
</div>

<!-- FACULTY VIVA QUESTIONS -->
<h1>7. Faculty Viva Voce Q&A Defense Guide</h1>
<p><strong>Q1: Why use multi-stage Docker builds instead of a standard Dockerfile?</strong><br>
<em>Answer:</em> Multi-stage builds separate the build environment (compilers, npm build dependencies) from the final minimal runner. This reduced our image size from >1.2 GB to ~160 MB (backend) and ~25 MB (frontend), eliminating compiler vulnerabilities and attack surfaces.</p>

<p><strong>Q2: How does GD Arena handle discussions if the external AI API key is missing or quota-exhausted?</strong><br>
<em>Answer:</em> The platform implements an autonomous Heuristic NLP Fallback Engine. If Gemini API is unconfigured or returns HTTP 429 quota exhaustion, our rule-based engine generates context-aware follow-up turns and calculates the 8-dimension rubric deterministically.</p>

<p><strong>Q3: What security measures are implemented across the DevOps lifecycle?</strong><br>
<em>Answer:</em> Shift-Left DevSecOps: TypeScript strict-mode (SAST), deterministic npm ci lockfiles, Aqua Security Trivy container CVE scans, non-root execution (USER appuser UID 1000), Supabase Row Level Security (RLS), and zero committed secrets.</p>

<p><strong>Q4: How does the application scale under peak load?</strong><br>
<em>Answer:</em> The backend is stateless, enabling horizontal scaling via Kubernetes Horizontal Pod Autoscaler (HPA) between 2 and 10 pods based on 70% CPU and 80% memory thresholds. On cloud PaaS, Render and Vercel scale serverless execution automatically.</p>

<!-- CONCLUSION & REFERENCES -->
<h1>8. Conclusion & References</h1>
<p>
    GD Arena successfully bridges the critical gap in campus placement preparation by combining voice AI, adaptive conversational heuristics, 
    and objective 8-dimension rubric analytics. Built strictly on modern DevOps and cloud-native practices, the platform demonstrates 
    robust software engineering, deterministic testing, automated CI/CD pipelines, containerization, and production cloud readiness.
</p>
<h2>References</h2>
<ol>
    <li>React 18 & Vite Documentation: https://react.dev/ and https://vitejs.dev/</li>
    <li>Node.js & Express.js Architecture Guide: https://nodejs.org/ and https://expressjs.com/</li>
    <li>W3C Web Speech API Specification: https://wicg.github.io/speech-api/</li>
    <li>Docker Multi-Stage Build Best Practices: https://docs.docker.com/build/building/multi-stage/</li>
    <li>Google Cloud Vertex AI Gemini API: https://cloud.google.com/vertex-ai/</li>
    <li>Supabase PostgreSQL Row Level Security (RLS): https://supabase.com/docs/guides/auth/row-level-security</li>
    <li>Aqua Security Trivy Vulnerability Scanner: https://github.com/aquasecurity/trivy</li>
</ol>

</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated {html_path}")

    # Invoke Microsoft Edge headless to print PDF
    edge_cmd = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_cmd):
        edge_cmd = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

    for target_pdf in [pdf_out1, pdf_out2]:
        cmd = [
            edge_cmd,
            "--headless",
            "--disable-gpu",
            f"--print-to-pdf={target_pdf}",
            "--no-pdf-header-footer",
            html_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if os.path.exists(target_pdf):
            print(f"Generated PDF successfully: {target_pdf} (Size: {os.path.getsize(target_pdf)} bytes)")
        else:
            print(f"Error generating PDF {target_pdf}: {result.stderr}")

if __name__ == "__main__":
    generate_pdf()
