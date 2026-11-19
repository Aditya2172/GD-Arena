# GD ARENA — CLOUD & DEVOPS ARCHITECTURE DIAGRAMS

This document contains visual architectural specifications for **GD Arena**, illustrating multi-tier containerization, CI/CD automation, Kubernetes clustering, and Infrastructure as Code.

---

## 1. High-Level System & Voice AI Architecture

```mermaid
graph TD
    User["Student Candidate (Browser Microphone / Speaker)"]
    
    subgraph ClientTier ["Frontend Tier (Port 5173 / Port 80)"]
        UI["React 18 Single Page Application"]
        STT["Web Speech API (SpeechRecognition)"]
        TTS["SpeechSynthesis Engine"]
        Banner["Connectivity Heartbeat Banner"]
    end
    
    subgraph BackendTier ["Backend Tier (Port 5000)"]
        API["Express.js REST API Layer"]
        Auth["Auth & Rate Limiter Middleware"]
        Memory["Shared Discussion Memory Service"]
        Adaptive["Adaptive Follow-Up Engine"]
        Rubric["8-Dimension Rubric Evaluator"]
        SpeechLab["Speech Clarity & WPM Analyzer"]
    end
    
    subgraph DataTier ["Persistence & Cloud Intelligence"]
        CloudAI["Google Gemini / LLM Provider"]
        Supabase["Supabase PostgreSQL (RLS Protected)"]
        MemFallback["In-Memory Isolated Demo Storage"]
    end

    User -->|Voice In| STT
    STT --> UI
    UI -->|JSON REST Requests| API
    Banner -->|Heartbeat /api/health| API
    API --> Auth
    Auth --> Memory
    Memory --> Adaptive
    Adaptive --> CloudAI
    Adaptive --> SpeechLab
    API --> Rubric
    Rubric --> Supabase
    Rubric -.->|Fallback| MemFallback
    API -->|Spoken Response Text| UI
    UI --> TTS
    TTS -->|Voice Out| User
```

---

## 2. Multi-Container Docker Compose Architecture

```mermaid
graph LR
    subgraph DockerHost ["Docker Host (Bridge Network: gdarena-network)"]
        subgraph FrontendContainer ["Container: gdarena-frontend (Port 5173:80)"]
            Nginx["Nginx Alpine Web Server"]
            StaticAssets["Compiled React SPA (HTML/JS/CSS)"]
            Nginx --> StaticAssets
        end

        subgraph BackendContainer ["Container: gdarena-backend (Port 5000:5000)"]
            NodeJS["Node.js 20 Alpine Runtime"]
            ExpressApp["Express Application Service"]
            HealthCheck["Docker Healthcheck (curl /api/health)"]
            NodeJS --> ExpressApp
            NodeJS --> HealthCheck
        end
    end

    Browser["Client Web Browser"] -->|Port 5173 (HTTP)| Nginx
    Nginx -->|Reverse Proxy /api/| ExpressApp
    Browser -->|Direct API (Port 5000)| ExpressApp
```

---

## 3. Automated CI/CD Pipeline (GitHub Actions & Jenkins)

```mermaid
graph TD
    Commit["Code Push to main branch"]
    
    subgraph CIPipeline ["Continuous Integration (CI)"]
        Checkout["1. SCM Checkout (actions/checkout@v4)"]
        SetupNode["2. Setup Node.js 20 with npm cache"]
        Install["3. Clean Install (npm ci)"]
        Typecheck["4. Static Typecheck (tsc)"]
        UnitTests["5. Vitest Suite (15 Unit Tests)"]
        BuildClient["6. Compile React SPA (Vite)"]
        E2ETest["7. Integration Test (test_e2e.js)"]
        
        Commit --> Checkout
        Checkout --> SetupNode
        SetupNode --> Install
        Install --> Typecheck
        Typecheck --> UnitTests
        UnitTests --> BuildClient
        BuildClient --> E2ETest
    end

    subgraph CDPipeline ["Continuous Delivery (CD)"]
        DockerBuild["8. Multi-Stage Docker Image Build"]
        TrivyScan["9. Vulnerability Scan (Aqua Trivy)"]
        DeployStaging["10. Blue/Green Container Deploy"]
        HealthVerify["11. Health Verification Probe"]
        
        E2ETest --> DockerBuild
        DockerBuild --> TrivyScan
        TrivyScan --> DeployStaging
        DeployStaging --> HealthVerify
    end
```

---

## 4. Kubernetes Cluster Pod Topology & Ingress Routing

```mermaid
graph TD
    Internet["Public Internet Traffic (https://gdarena.app)"]
    
    subgraph K8sCluster ["Kubernetes Cluster (Namespace: gdarena)"]
        Ingress["Nginx Ingress Controller (SSL/TLS Termination)"]
        
        subgraph Services ["Kubernetes ClusterIP Services"]
            FEService["Frontend Service (Port 80)"]
            BEService["Backend Service (Port 5000)"]
        end

        subgraph Pods ["Pod Replicas (HPA Managed)"]
            FEPod1["Frontend Pod 1 (Nginx)"]
            FEPod2["Frontend Pod 2 (Nginx)"]
            BEPod1["Backend Pod 1 (Express)"]
            BEPod2["Backend Pod 2 (Express)"]
            BEPodN["Backend Pod N (Autoscaled)"]
        end

        ConfigMap["ConfigMap (gdarena-config)"]
        Secret["Secret (gdarena-secrets)"]
        HPA["Horizontal Pod Autoscaler (HPA)"]
    end

    Internet --> Ingress
    Ingress -->|Path: /| FEService
    Ingress -->|Path: /api| BEService
    
    FEService --> FEPod1
    FEService --> FEPod2
    
    BEService --> BEPod1
    BEService --> BEPod2
    BEService --> BEPodN
    
    ConfigMap -.-> BEPod1
    Secret -.-> BEPod1
    HPA -.->|Scale on CPU/Mem| BEPodN
```

---

## 5. Ansible Infrastructure as Code (IaC) Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as DevOps Engineer
    participant Ansible as Ansible Control Node
    participant CloudVM as Target Cloud Host (Ubuntu 22.04)
    participant Containers as Docker Runtime

    Admin->>Ansible: Execute ansible-playbook playbooks/site.yml
    Ansible->>CloudVM: Role [common]: Update packages, install curl/git/htop
    Ansible->>CloudVM: Role [security]: Configure UFW firewall (allow 22, 80, 443, 5000)
    Ansible->>CloudVM: Role [docker]: Install Docker Engine CE & Docker Compose plugin
    Ansible->>CloudVM: Role [gdarena_app]: Clone repository & inject production .env
    CloudVM->>Containers: Execute docker compose -f docker-compose.prod.yml up -d
    Containers-->>CloudVM: Containers Running & Healthy
    Ansible->>CloudVM: Query http://localhost:5000/api/health
    CloudVM-->>Ansible: HTTP 200 OK (Service healthy)
    Ansible-->>Admin: Deployment Verified Successfully!
```
