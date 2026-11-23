# GD ARENA — CONTINUOUS INTEGRATION & CONTINUOUS DELIVERY (CI/CD) MANUAL

This document provides complete documentation of the automated CI/CD pipelines engineered for **GD Arena**, covering GitHub Actions workflows and the enterprise Jenkins declarative pipeline.

---

## 1. CI/CD PIPELINE ARCHITECTURE

GD Arena enforces automated quality gates and container security scans on every commit and pull request to the `main` branch:

```
+--------------------------------------------------------------------------------------------------+
|                                CI/CD PIPELINE WORKFLOW & GATES                                    |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   1. Developer Commits & Pushes -> GitHub Repository (main branch)                                |
|          |                                                                                       |
|          v                                                                                       |
|   2. GitHub Actions CI Runner (ubuntu-latest)                                                    |
|      +-- SCM Checkout (actions/checkout@v4)                                                      |
|      +-- Setup Node.js 20 with npm dependency cache                                              |
|      +-- Deterministic Install (npm ci)                                                          |
|      +-- Static Typecheck Server (tsc - 0 errors)                                                |
|      +-- Vitest Automated Unit Test Suite (15/15 Tests Passed)                                   |
|      +-- React Production Bundle Build (Vite - 0 errors)                                         |
|      +-- End-to-End System Test (node test_e2e.js - 7 stages passed)                             |
|          |                                                                                       |
|          v (If all 7 quality gates pass)                                                         |
|   3. Container Security & CD Deployment                                                          |
|      +-- Multi-Stage Docker Image Build (Docker Buildx)                                          |
|      +-- Aqua Security Trivy Vulnerability Scan (--severity CRITICAL,HIGH)                       |
|      +-- Post-Verification Deployment Webhook Trigger                                            |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. GITHUB ACTIONS CI WORKFLOW (`.github/workflows/ci.yml`)

### Pipeline Triggers:
* `push` to `main`, `master`
* `pull_request` targeting `main`, `master`

### Detailed Stage Breakdown:

| Stage # | Stage Name | Command Executed | Purpose & Quality Gate |
|:---|:---|:---|:---|
| **1** | **SCM Checkout** | `actions/checkout@v4` | Clones repository commit tree with complete history |
| **2** | **Runtime Setup** | `actions/setup-node@v4` | Sets up Node.js 20.x runtime; caches `~/.npm` |
| **3** | **Clean Installation** | `npm ci` | Strict deterministic install referencing `package-lock.json` |
| **4** | **Server Typecheck** | `npm --prefix server run build` | Compiles TypeScript; enforces zero strict type errors |
| **5** | **Vitest Test Suite** | `npm --prefix server test` | Executes 15 unit tests covering rubrics and turn-taking |
| **6** | **Client Bundle Build** | `npm --prefix client run build` | Minifies React SPA, purges unused Tailwind CSS |
| **7** | **E2E Integration Test** | `node test_e2e.js` | Launches server, tests healthcheck, auth guard, turns, reports |
| **8** | **Deploy Webhook** | `curl -X POST $RENDER_DEPLOY_HOOK_URL` | Optional post-verification trigger to deploy on Render |

---

## 3. CONTAINER SECURITY & CD WORKFLOW (`.github/workflows/deploy.yml`)

### Pipeline Triggers:
* Tag pushes matching `v*.*.*` (e.g. `v1.0.0`)
* Manual execution via `workflow_dispatch`

### Security Scanner: Aqua Security Trivy
Trivy interrogates container base layers and npm dependencies against the National Vulnerability Database (NVD):
* Flags `HIGH` and `CRITICAL` vulnerabilities.
* Blocks vulnerable images from reaching production container registries.

---

## 4. ENTERPRISE JENKINS DECLARATIVE PIPELINE (`Jenkinsfile`)

For self-hosted private enterprise clusters, a declarative `Jenkinsfile` is provided:

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
        stage('6. Security Vulnerability Scan') {
            steps {
                sh 'trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE_BACKEND}'
            }
        }
        stage('7. Deployment Verification') {
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

## 5. LOCAL VERIFICATION & TEST EVIDENCE

All tests integrated into the CI/CD pipeline have been executed and verified locally:

```text
> vitest run
 ✓ tests/orchestration.test.ts (5 tests)
 ✓ tests/report.test.ts (6 tests)
 ✓ tests/sessions.test.ts (4 tests)

 Test Files  3 passed (3)
      Tests  15 passed (15)

> node test_e2e.js
✅ ALL APPLICATION MODULES VERIFIED 100%
```
