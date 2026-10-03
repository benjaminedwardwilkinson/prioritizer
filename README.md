# Prioritizer

**Your life. Your priorities. Your choice.**

Prioritizer is a mobile-first audiovisual game that helps people explore what matters to them, compare those stated priorities with how they currently allocate real-world resources (money, time, and attention), identify areas of friction, experiment with different allocations, and revisit their priorities across an annual 12-month orbit.

---

## Deployment Procedure

Deploy Prioritizer from a clean checkout with a single command:

```bash
git clone <repository>
cd <repository>
docker compose up -d --build
```

Access the application in your browser:

```text
http://localhost:8080
```

To run with a custom host port (e.g., 3000):

```bash
APP_PORT=3000 docker compose up -d --build
```

---

## Architecture & Features

- **Discover (Dilemma Quiz)**: Tactile forced-choice dilemmas and tradeoffs to infer your core motivational profile.
- **Top 5 Reveal**: Confirm, reorder, swap, or drill down into hierarchical sub-priorities to establish your Declared Priorities.
- **The Three Behavioral Resource Votes**:
  - 💰 **Money Game**: Rank where monthly capital flows.
  - ⏱️ **Calendar Game**: Rank where waking weekly hours are spent.
  - 🧠 **Attention Game**: Scenario dilemmas measuring where mind drifts and worries lodge.
- **3D / 2D Priority Universe**: Interactive Three.js celestial world where celestial orbits, sizes, and vector rays reflect resource alignment and divergence.
- **Insight Engine & Friction Exploration**: Uncover priority gaps, hidden priorities, and cross-signal splits with non-judgmental reflective inquiry.
- **What-If Sandbox**: Rebalance monthly hours or dollars and calculate compound impacts (+hours/week, +hours/year).
- **Life Experiments**: Commit to low-pressure 30-day life design experiments with check-ins.
- **12-Month Priority Orbit**: Explore seasonal themes, monthly questions, and record seasonal snapshots.
- **How You Changed (History)**: Compare temporal snapshots and watch rank trajectories shift over time.
- **Milestone Trophy Collection**: 16 collectible achievements with rarity scores.
- **Social Sharing**: Live Canvas export of your personal Priority Card.
- **Zero External AI / Cloud Dependency**: Completely self-contained with synthetic Web Audio sound effects and deterministic behavioral math.

---

## Data Persistence

Persistent application data (user profiles, temporal snapshots, life experiments, and anonymized research aggregations) is stored in:

```text
/app/data/prioritizer.json
```

In Docker Compose, this path is mounted to a named Docker volume:

```yaml
volumes:
  prioritizer_data:
    name: prioritizer_data
```

User data persists across container restarts and `docker compose down` / `docker compose up -d` lifecycles.

To reset data completely:

```bash
docker compose down -v
```

---

## Health Check

A built-in container health check probes the `/api/health` endpoint:

```bash
curl -f http://localhost:8080/api/health
```

Returns:

```json
{
  "status": "ok",
  "service": "prioritizer",
  "environment": "production",
  "timestamp": "2026-10-02T...",
  "uptimeSeconds": 42
}
```

---

## Hardware & Architecture Compatibility (Intel x86_64 & ARM64)

Prioritizer is **100% compatible with Intel** as well as ARM-based architectures:

- **Intel Processors (x86_64 / amd64)**: Runs natively on any Intel Core (i3/i5/i7/i9), Intel Xeon, or Pentium machine running Windows, macOS, or Linux.
- **ARM64**: Also runs natively on Apple Silicon (M1/M2/M3/M4), Raspberry Pi 4/5, and AWS Graviton.
- **Browsers**: Runs identically in Chrome, Safari, Firefox, Edge, and Brave across all Intel and ARM devices.
- **Docker**: The container image uses `node:22-slim`, which has native multi-architecture manifests for both `linux/amd64` (Intel/AMD 64-bit) and `linux/arm64`. No emulation or special flags are needed.

---

## How to Download as a ZIP

You can download the entire source code, assets, and Docker configurations as a `.zip` archive using any of these methods:

1. **One-Click In-App / Direct URL**:
   - Click the **"ZIP"** button in the top navigation bar of the application, or
   - Directly navigate in your browser to:
     ```text
     http://localhost:8080/api/download-zip
     ```
     (or `https://<your-app-url>/api/download-zip`) to immediately download `prioritizer-project.zip`.

2. **Google AI Studio Interface**:
   - In the top-right header or workspace options menu (`⋮`), select **"Export"** or **"Download ZIP"**.

3. **Terminal / Git**:
   ```bash
   # From a cloned git repo:
   git archive -o prioritizer.zip HEAD
   ```
# prioritizer
# prioritizer
