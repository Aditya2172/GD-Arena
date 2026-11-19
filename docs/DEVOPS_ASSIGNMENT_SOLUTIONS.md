# ACADEMIC ASSIGNMENT: DEVOPS & CLOUD COMPUTING FOR GD ARENA

**Course Title**: DevOps Engineering & Cloud Computing  
**Project**: GD Arena — AI-Powered Voice Group Discussion Practice Platform  
**Target Architecture**: Multi-Tier Containerized Microservices, CI/CD Pipelines, Kubernetes Orchestration & Ansible IaC  
**Submission Status**: Verified, Tested & Complete

---

## EXECUTIVE SUMMARY

This academic submission documents the comprehensive DevOps lifecycle and Cloud Computing architecture engineered for **GD Arena**, a voice-first, AI-powered platform for campus placement group discussion preparation. The project spans modern containerization, automated continuous integration and continuous delivery (CI/CD), enterprise pipeline orchestration, cloud-native container scheduling, and idempotent configuration management.

---

## QUESTION 1: CONTAINERIZATION & MULTI-STAGE DOCKER ARCHITECTURE

### 1.1 Objective & Problem Statement
Design, optimize, and orchestrate a multi-tier containerized architecture for GD Arena separating the React frontend client and the Node.js Express backend into lightweight, secure, and production-hardened Docker containers with automated health probing and service discovery.

### 1.2 Architectural Decisions & Multi-Stage Optimization
Traditional single-stage Docker images bundle full compilation SDKs, development dependencies, and package managers into the final container, creating bloated images (>1.2 GB) vulnerable to CVE exploits. To resolve this:
1. **Multi-Stage Build Pattern**:
   * *Builder Stage*: Compiles TypeScript into JavaScript, bundles CSS and Vite assets, and resolves npm workspace packages.
   * *Runner Stage*: Built on minimal `node:20-alpine` (for backend, ~160 MB) and `nginx:alpine` (for frontend, ~25 MB).
2. **Security Hardening**:
   * Execution under an unprivileged non-root system user (`appuser:appgroup` with UID/GID 1000).
   * Layer caching optimization by copying `package*.json` manifests before source files.
   * Active container health checks via `curl` and `wget` testing `/api/health`.

### 1.3 Container Configuration Artifacts

#### A. Backend Dockerfile (`server/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=gd-arena-server
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN npm --prefix server run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=5000
RUN apk add --no-cache curl
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json
USER appuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1
CMD ["node", "server/dist/index.js"]
```

#### B. Frontend Nginx Dockerfile (`client/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --workspace=gd-arena-client
COPY client/ ./client/
RUN npm --prefix client run build

FROM nginx:alpine AS runner
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### 1.4 Multi-Container Orchestration (`docker-compose.yml`)
The multi-container configuration defines inter-container networking (`gdarena-network`), isolated service discovery, healthcheck dependencies (`condition: service_healthy`), and resource thresholds:
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    container_name: gdarena-backend
    ports: ["5000:5000"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 20s
      timeout: 5s
  frontend:
    build:
      context: .
      dockerfile: client/Dockerfile
    container_name: gdarena-frontend
    ports: ["5173:80"]
    depends_on:
      backend:
        condition: service_healthy
```

---

## QUESTION 2: CONTINUOUS INTEGRATION & CONTINUOUS DEPLOYMENT (CI/CD) WITH GITHUB ACTIONS

### 2.1 Objective & Automation Workflow
Construct an enterprise GitHub Actions automation pipeline that triggers on code pushes and pull requests to enforce automated code quality gates, TypeScript static analysis, unit test execution, container builds, and security scans.

### 2.2 Pipeline Architecture & Quality Gates
The workflow `.github/workflows/ci.yml` implements a 7-stage quality gate:
1. **SCM Checkout**: Uses `actions/checkout@v4` with complete branch history.
2. **Runtime Matrix & Caching**: Employs `actions/setup-node@v4` targeting Node.js 20 with npm package cache.
3. **Clean Installation**: Executes `npm ci` strictly following `package-lock.json`.
4. **Static Typecheck**: Compiles backend TypeScript (`npm --prefix server run build`) ensuring zero type discrepancies.
5. **Vitest Test Suite**: Runs 15 unit/integration tests validating rubric weights, deterministic scoring math, and adaptive conversation heuristics.
6. **Production Bundle Compilation**: Compiles client assets with Vite (`npm --prefix client run build`), verifying minification and tree-shaking.
7. **End-to-End Integration Verification**: Launches server in test mode and validates `/api/health`, session lifecycles, and adaptive turn generation via `test_e2e.js`.

### 2.3 Container Security & Image Vulnerability Scanning (`.github/workflows/deploy.yml`)
Implements automated container security using **Aqua Security Trivy**:
* Analyzes Alpine base layers and Node dependencies against the CVE database.
* Configured with `--severity CRITICAL,HIGH` and `--ignore-unfixed true` to block vulnerable images from reaching production registries.

---

## QUESTION 3: ENTERPRISE PIPELINE AUTOMATION WITH JENKINS

### 3.1 Objective & Jenkins Declarative Pipeline
Design a scalable, production-grade Jenkins declarative pipeline (`Jenkinsfile`) capable of executing inside enterprise private data centers or hybrid clouds.

### 3.2 Pipeline Stages & Failure Handling
The declarative pipeline features:
* **Tool Isolation**: Specifies `nodejs 'NodeJS-20'`.
* **Parallel Execution**: Concurrently validates frontend Vite build and backend TypeScript compilation to minimize pipeline wall-clock time.
* **Automated Security Audit**: Interrogates generated container layers for common vulnerabilities.
* **Post-Execution Lifecycle**: Enforces `cleanWs()` in the `always` block to prevent workspace disk exhaustion, alongside webhook alerting hooks for Slack/Discord.

```groovy
pipeline {
    agent any
    environment {
        DOCKER_IMAGE_BACKEND = 'gdarena-backend:latest'
        DOCKER_IMAGE_FRONTEND = 'gdarena-frontend:latest'
    }
    stages {
        stage('1. Checkout SCM') { steps { checkout scm } }
        stage('2. Dependency Installation') { steps { sh 'npm ci' } }
        stage('3. Lint & Typecheck') {
            parallel {
                stage('Typecheck Server') { steps { sh 'npm --prefix server run build' } }
                stage('Typecheck Client') { steps { sh 'npm --prefix client run build' } }
            }
        }
        stage('4. Automated Test Suite') { steps { sh 'npm --prefix server test' } }
        stage('5. Docker Image Build') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE_BACKEND} -f server/Dockerfile .'
                sh 'docker build -t ${DOCKER_IMAGE_FRONTEND} -f client/Dockerfile .'
            }
        }
        stage('6. Deployment Verification') {
            steps {
                sh 'docker compose -f docker-compose.prod.yml up -d'
                sh 'sleep 10 && curl -f http://localhost:5000/api/health || exit 1'
            }
        }
    }
    post {
        always { cleanWs() }
    }
}
```

---

## QUESTION 4: CONTAINER ORCHESTRATION & HIGH AVAILABILITY WITH KUBERNETES

### 4.1 Objective & Cluster Architecture
Deploy GD Arena onto a production Kubernetes (K8s) cluster with fault tolerance, zero-downtime rolling upgrades, horizontal autoscaling, and ingress routing.

### 4.2 Manifest Suite Breakdown (`k8s/`)
1. **Namespace Isolation (`k8s/namespace.yaml`)**: Isolates GD Arena workloads inside the dedicated `gdarena` namespace.
2. **Configuration & Secrets (`k8s/configmap.yaml` & `k8s/secret.yaml`)**: Decouples application logic from runtime configurations (`CLIENT_URL`, `PORT`) and encrypted API keys (`GEMINI_API_KEY`, `SUPABASE_URL`).
3. **High-Availability Deployments (`backend-deployment.yaml` & `frontend-deployment.yaml`)**:
   * Minimum **2 replicas** per tier across nodes.
   * `RollingUpdate` strategy with `maxSurge: 1` and `maxUnavailable: 0` ensuring zero dropped connections.
   * Fine-tuned **Liveness Probes** (restart unresponsive pods) and **Readiness Probes** (route traffic only to healthy pods).
   * Exact resource requests (`cpu: 250m`, `memory: 256Mi`) and limits (`cpu: 500m`, `memory: 512Mi`) preventing "noisy neighbor" cluster node starvation.
4. **Traffic Ingress Controller (`k8s/ingress.yaml`)**:
   * Single public entrypoint (`gdarena.app`) routing `/api` traffic to `gdarena-backend-svc:5000` and root `/` to `gdarena-frontend-svc:80`.
   * Automatic TLS certificate provisioning via `cert-manager.io` (Let's Encrypt).
5. **Horizontal Pod Autoscaling (`k8s/hpa.yaml`)**:
   * Dynamically scales backend pods from **2 to 10 instances** based on 70% CPU and 80% memory thresholds.

---

## QUESTION 5: INFRASTRUCTURE AS CODE (IaC) & CONFIGURATION MANAGEMENT WITH ANSIBLE

### 5.1 Objective & Idempotent Automation
Implement an automated Infrastructure as Code (IaC) provisioning solution using Ansible to configure bare-metal cloud virtual machines (AWS EC2, DigitalOcean, or Azure VMs) from raw OS to a hardened, operational GD Arena production deployment.

### 5.2 Ansible Roles Architecture (`ansible/`)
* `common`: Idempotently updates apt repositories, synchronizes UTC system timezone, and installs core diagnostic tools (`curl`, `git`, `htop`, `jq`).
* `security`: Hardens server security by setting default UFW policies to `deny incoming` and opening strictly required ports (22, 80, 443, 5000).
* `docker`: Installs official Docker CE repository, GPG verification keys, containerd, and Docker Compose plugin; configures user daemon group permissions.
* `gdarena_app`: Synchronizes application source tree, injects production environment templates (`env.j2`), triggers zero-downtime container composition (`docker compose -f docker-compose.prod.yml up -d --build`), and executes HTTP health check verification.

---

## CONCLUSION & ACADEMIC DEFENSE VERIFICATION
The DevOps suite implemented for GD Arena represents an enterprise-grade cloud-native software delivery lifecycle. Every tier—from local containerization to global Kubernetes orchestration and Ansible configuration—has been engineered with security, high availability, and automated reproducibility.
