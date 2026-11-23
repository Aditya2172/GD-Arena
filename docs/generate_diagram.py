import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(16, 12), dpi=300)
    fig.patch.set_facecolor('#0f172a') # Slate 900 background
    ax.set_facecolor('#0f172a')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color Palette
    primary_blue = '#3b82f6'
    emerald_green = '#10b981'
    purple_accent = '#8b5cf6'
    amber_accent = '#f59e0b'
    cyan_accent = '#06b6d4'
    rose_accent = '#f43f5e'
    dark_card = '#1e293b'
    light_text = '#f8fafc'
    muted_text = '#94a3b8'

    # Title Banner
    ax.text(50, 96, "GD ARENA — FULL-STACK CLOUD & DEVOPS ARCHITECTURE", 
            ha='center', va='center', color=light_text, fontsize=18, fontweight='bold', fontfamily='sans-serif')
    ax.text(50, 93, "AI-Powered Voice Group Discussion Practice Platform | End-to-End System Topology", 
            ha='center', va='center', color=cyan_accent, fontsize=11, fontfamily='sans-serif')

    # Helper for drawing cards
    def draw_box(x, y, w, h, title, subtitle, items, border_color, fill_color=dark_card):
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.8,rounding_size=1.2",
                                     edgecolor=border_color, facecolor=fill_color, linewidth=1.8)
        ax.add_patch(box)
        # Header
        ax.text(x + w/2, y + h - 2.5, title, ha='center', va='center', color=border_color, fontsize=11, fontweight='bold')
        if subtitle:
            ax.text(x + w/2, y + h - 5.0, subtitle, ha='center', va='center', color=muted_text, fontsize=8.5, style='italic')
        # Bullet items
        start_y = y + h - 8.0 if subtitle else y + h - 5.5
        for i, item in enumerate(items):
            ax.text(x + 2, start_y - (i * 2.8), f"• {item}", ha='left', va='center', color=light_text, fontsize=8.5)

    # 1. User & Client Tier (Top-Left)
    draw_box(4, 72, 26, 17, "1. USER / CLIENT TIER", "Candidate Voice & Web Interface", 
             ["Student Microphone / Audio", "Web Speech API (STT & TTS)", "React 18 Single Page App", "Tailwind CSS & Lucide Icons"], 
             cyan_accent)

    # 2. Vercel Hosting Tier (Top-Center)
    draw_box(37, 72, 26, 17, "2. VERCEL HOSTING", "Global Edge CDN & SSL Routing", 
             ["Frontend SPA Deployment", "Automatic HTTPS / SSL", "SPA Route Rewrite (vercel.json)", "Dynamic URL Normalization"], 
             primary_blue)

    # 3. GitHub & CI/CD Tier (Top-Right)
    draw_box(70, 72, 26, 17, "3. VERSION CONTROL & CI/CD", "Aditya2172/GD-Arena", 
             ["GitHub Repository (main)", "GitHub Actions (7 Quality Gates)", "Jenkins Declarative Pipeline", "Trivy CVE Vulnerability Scan"], 
             purple_accent)

    # 4. Backend Application Tier (Middle-Center)
    draw_box(37, 43, 26, 22, "4. BACKEND REST API", "Node.js 20 & Express Runtime", 
             ["Bound to 0.0.0.0:5000 / 10000", "Adaptive Discussion Engine", "Shared Discussion Memory", "8-Dimension Placement Rubric", "Prometheus Telemetry (/api/metrics)", "Health Probing (/api/health)"], 
             emerald_green)

    # 5. Render Web Service Tier (Middle-Left)
    draw_box(4, 43, 26, 22, "5. RENDER CLOUD HOSTING", "Containerized Backend Hosting", 
             ["Render Web Service (PaaS)", "Auto-deploy via GitHub", "Dynamic CORS Validation", "Graceful Shutdown (SIGTERM)", "Zero-downtime Health Probing"], 
             amber_accent)

    # 6. AI Intelligence Tier (Middle-Right)
    draw_box(70, 43, 26, 22, "6. AI COGNITIVE LAYER", "Multi-Provider Conversational AI", 
             ["Google Gemini 1.5 Flash API", "Persona Generation (3 Personas)", "Turn-Taking Balance Evaluator", "Local Heuristic NLP Fallback", "Speech Clarity Lab (WPM/Fluency)"], 
             rose_accent)

    # 7. Database Tier (Bottom-Left)
    draw_box(4, 12, 26, 22, "7. PERSISTENCE TIER", "Supabase PostgreSQL Database", 
             ["Profiles (1:1 with auth.users)", "Discussion Sessions (UUID PK)", "Discussion Messages (Logs)", "Session Reports (Rubric Scores)", "Row Level Security (RLS)", "In-Memory Isolation Fallback"], 
             emerald_green)

    # 8. Docker Microservices (Bottom-Center)
    draw_box(37, 12, 26, 22, "8. DOCKER CONTAINERS", "Multi-Stage Containerization", 
             ["Backend: node:20-alpine (~160MB)", "Frontend: nginx:alpine (~25MB)", "Non-Root USER appuser (UID 1000)", "Docker Compose (gdarena-network)", "Production Resource Limits"], 
             cyan_accent)

    # 9. Kubernetes & Ansible (Bottom-Right)
    draw_box(70, 12, 26, 22, "9. ORCHESTRATION & IaC", "Cloud-Native Infrastructure", 
             ["Kubernetes Deployments (k8s/)", "Horizontal Pod Autoscaler (2-10)", "Nginx Ingress + TLS Routing", "Ansible Automation (4 Roles)", "Idempotent Ubuntu Host Setup"], 
             purple_accent)

    # Helper for drawing connecting arrows with labels
    def draw_arrow(x1, y1, x2, y2, label="", color=primary_blue, style='->', rad=0.0):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle=style, color=color, lw=2.0, shrinkA=4, shrinkB=4,
                                   connectionstyle=f"arc3,rad={rad}"))
        if label:
            mid_x = (x1 + x2) / 2
            mid_y = (y1 + y2) / 2
            ax.text(mid_x, mid_y + 1.2, label, ha='center', va='center', color=light_text, fontsize=7.5,
                    bbox=dict(boxstyle="round,pad=0.2", facecolor=dark_card, edgecolor=color, alpha=0.9))

    # Flow Connections
    # User -> Vercel
    draw_arrow(30, 80.5, 37, 80.5, "HTTPS Voice Access", cyan_accent)
    # Vercel -> Backend
    draw_arrow(50, 72, 50, 65, "REST API (/api/)", primary_blue)
    # GitHub -> Vercel (Auto Deploy)
    draw_arrow(70, 83, 63, 83, "Git Integration", purple_accent)
    # GitHub -> Render (Auto Deploy)
    draw_arrow(70, 75, 23, 65, "CI/CD Webhook", purple_accent, rad=0.15)
    # Render -> Backend
    draw_arrow(30, 54, 37, 54, "Manages Container", amber_accent)
    # Backend -> AI
    draw_arrow(63, 54, 70, 54, "Prompts / LLM API", rose_accent)
    # Backend -> Database
    draw_arrow(37, 46, 25, 34, "PostgreSQL / RLS", emerald_green)
    # Backend -> Docker
    draw_arrow(50, 43, 50, 34, "Container Images", cyan_accent)
    # Docker -> Kubernetes
    draw_arrow(63, 23, 70, 23, "K8s Scheduling", purple_accent)

    # Footer Metadata
    ax.text(50, 4, "Student: Aditya Kumar Gupta | Course: DevOps Engineering & Cloud Computing | NIET Noida", 
            ha='center', va='center', color=muted_text, fontsize=9.5)
    ax.text(50, 1.5, "Repository: https://github.com/Aditya2172/GD-Arena | Verified Architecture Specification", 
            ha='center', va='center', color=muted_text, fontsize=8)

    plt.tight_layout()
    output_path = r"C:\Users\opgup\.gemini\antigravity\scratch\gd-arena\GD_Arena_Architecture.png"
    plt.savefig(output_path, facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
    plt.close()
    print(f"Generated {output_path} successfully.")

if __name__ == "__main__":
    generate_architecture_diagram()
