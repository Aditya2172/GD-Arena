# GD ARENA — DOCKER CONTAINERIZATION & EXECUTION MANUAL

This document provides complete, verified instructions for building, running, verifying, and stopping GD Arena using Docker and Docker Compose.

---

## 1. DOCKER ARCHITECTURE OVERVIEW

GD Arena is containerized using a multi-tier, multi-stage microservices pattern:

```
+--------------------------------------------------------------------------------------------------+
|                                DOCKER HOST (Bridge: gdarena-network)                              |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   Frontend Container (gdarena-frontend)              Backend Container (gdarena-backend)         |
|   - Image: nginx:alpine (~25 MB)                     - Image: node:20-alpine (~160 MB)           |
|   - Port: 5173:80 (HTTP)                             - Port: 5000:5000 (REST API)                |
|   - SPA Static Routing & Gzip                        - Non-Root: USER appuser (UID 1000)         |
|   - Reverse Proxy: /api/ -> http://backend:5000/api/ - Healthcheck: curl /api/health (20s)       |
|                                                                                                  |
|   Client Browser -> http://localhost:5173                                                        |
|   API Endpoint   -> http://localhost:5000/api/health                                             |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

### Key Engineering Features:
1. **Multi-Stage Builds**:
   * *Builder*: `node:20-alpine` installs full dependencies, compiles TypeScript, and runs Vite bundler.
   * *Runner*: Minimal runtime layers discard compilers and developer tools, reducing image size by ~85%.
2. **Security Compliance**:
   * Backend container executes under unprivileged system user `appuser:appgroup` (UID/GID 1000).
   * Eliminates root-level container breakout risks.
3. **Automated Health Probes**:
   * Backend probes `curl -f http://localhost:5000/api/health`.
   * Frontend waits for backend healthy status (`condition: service_healthy`) before accepting traffic.

---

## 2. PREREQUISITES & INSTALLATION

To run GD Arena with Docker:
1. **Docker Desktop for Windows**:
   * Download from: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   * Ensure WSL 2 (Windows Subsystem for Linux) backend is enabled in Docker Desktop settings.
   * Verify installation in PowerShell:
     ```powershell
     docker --version
     docker compose version
     ```

---

## 3. DOCKER BUILD & RUN COMMANDS

### Step 1: Clone or Navigate to Project Directory
```powershell
cd C:\Users\opgup\.gemini\antigravity\scratch\gd-arena
```

### Step 2: (Optional) Configure Environment Variables
You may create a `.env` file from the provided template:
```powershell
Copy-Item .env.example .env
```
*(If no API keys are provided, the containers will automatically run in high-speed in-memory demo mode).*

### Step 3: Build Container Images
Build both frontend and backend images using the multi-stage build definitions:
```powershell
docker compose build
```

### Step 4: Start Multi-Container Stack (Detached Mode)
```powershell
docker compose up -d
```

### Step 5: Verify Running Containers
Verify container status, health, and port mappings:
```powershell
docker ps --filter "name=gdarena"
```
*Expected Output:*
```text
CONTAINER ID   IMAGE                 COMMAND                  STATUS                   PORTS                    NAMES
a1b2c3d4e5f6   gdarena-backend       "node server/dist/in…"   Up 30s (healthy)         0.0.0.0:5000->5000/tcp   gdarena-backend
b2c3d4e5f6a1   gdarena-frontend      "/docker-entrypoint.…"   Up 15s (healthy)         0.0.0.0:5173->80/tcp     gdarena-frontend
```

---

## 4. VERIFICATION COMMANDS & HEALTH PROBES

### 1. Test Backend Health Check
```powershell
curl http://localhost:5000/api/health
```
*Expected JSON Response:*
```json
{
  "status": "healthy",
  "service": "GD Arena Backend API",
  "version": "1.0.0",
  "aiEngineMode": "adaptive_heuristic_engine",
  "database": "in_memory_isolated_mode"
}
```

### 2. Test Prometheus Metrics Telemetry
```powershell
curl http://localhost:5000/api/metrics
```

### 3. Test Frontend Web Access
Open your web browser at:
```text
http://localhost:5173
```
*Verify that the landing page loads, microphone permissions can be granted, and discussion rooms can be initiated.*

### 4. Inspect Container Logs
```powershell
# View backend logs
docker logs -f gdarena-backend

# View frontend nginx access logs
docker logs -f gdarena-frontend
```

---

## 5. STOPPING & CLEANING UP CONTAINERS

### Stop Containers
```powershell
docker compose stop
```

### Stop and Remove Containers & Networks
```powershell
docker compose down
```

### Stop and Remove Images and Volumes (Complete Cleanup)
```powershell
docker compose down --rmi local -v
```

---

## 6. PRODUCTION PROFILE WITH RESOURCE LIMITS

For production deployments requiring CPU and memory constraints:
```powershell
# Start production profile with resource limits and log rotation
docker compose -f docker-compose.prod.yml up -d

# Check resource consumption in real-time
docker stats
```
*Resource Limits Enforced:*
* `gdarena-backend`: Max 1.0 CPU, 512 MB RAM
* `gdarena-frontend`: Max 0.5 CPU, 256 MB RAM
* Log rotation: Maximum 10MB per file, 3 backup files.
