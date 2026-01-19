# SpeakFlow v1 Architecture

## Overview

SpeakFlow is a mobile-first public speaking training system. The architecture follows a simple flow:

```
Mobile App → API → Worker → API → Mobile App
   (Record)  (Upload)  (Analyze)  (Retrieve)  (Display)
```

## Components

### 1. Shared Contracts (`/contracts`)

**Purpose**: Single source of truth for all data schemas.

| File | Description |
|------|-------------|
| `schemas/score_contract.json` | Session analysis results schema |
| `schemas/drill_schema.json` | Practice drill definition |
| `schemas/coaching_response.json` | LLM coaching output |
| `fixtures/speakflow_v1_drills.json` | 15 drills for v1 |
| `python/` | Pydantic models implementing schemas |

### 2. API (`/api`)

**Tech Stack**: FastAPI + PostgreSQL + Redis

**Key Routes**:
- `POST /api/v1/sessions/` - Upload audio, create session
- `GET /api/v1/sessions/{id}/status` - Poll processing status
- `GET /api/v1/sessions/{id}` - Get full report

**Flow**:
1. Receive audio upload
2. Store audio in object storage (S3 or local)
3. Create session record in Postgres
4. Enqueue analysis job to Redis
5. Return session_id

### 3. Worker (`/worker`)

**Tech Stack**: Whisper + NumPy/SciPy + OpenAI

**Pipeline**:
1. **ASR**: Whisper → word-level transcript with timestamps
2. **Feature Extraction**: WPM, fillers, pauses, pitch, volume
3. **Scoring**: Rule-based, deterministic scoring (0-100)
4. **Coaching**: LLM interprets scores, selects drills from library

**Key Constraint**: LLM NEVER invents drills - only selects from library.

### 4. Mobile App (`/mobile`)

**Tech Stack**: React Native + Expo

**Screens**:
- **RecordScreen**: Audio recording with real-time HUD (volume only in v1)
- **ReportScreen**: Scorecard, transcript, coaching tabs

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │     │    API      │     │   Worker    │
│    App      │     │  (FastAPI)  │     │  (Whisper)  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │ 1. Upload audio   │                    │
      │──────────────────>│                    │
      │                   │ 2. Store + Enqueue │
      │                   │───────────────────>│
      │                   │                    │
      │ 3. Poll status    │                    │
      │<─ ─ ─ ─ ─ ─ ─ ─ ─>│                    │
      │                   │                    │
      │                   │ 4. Process audio   │
      │                   │<───────────────────│
      │                   │    (ASR → Score    │
      │                   │     → Coach)       │
      │                   │                    │
      │ 5. Get report     │                    │
      │<──────────────────│                    │
      │                   │                    │
```

## Contract Enforcement

### Score Contract

```json
{
  "session_id": "uuid",
  "duration_sec": 180.5,
  "metrics": {
    "wpm": 165.3,
    "filler_per_min": 4.2,
    "pause_events": 12,
    "power_pauses": 3,
    "pitch_variance": 42.5,
    "volume_stability": 0.25
  },
  "scores": {
    "pace": 78,
    "fluency": 65,
    "clarity": 82,
    "vocal_variety": 71,
    "overall": 74
  },
  "focus_metric": "fluency",
  "flags": [...]
}
```

### Coaching Response

```json
{
  "session_id": "uuid",
  "summary": "...",
  "strengths": [...],
  "focus_area": {...},
  "recommended_drills": [
    {"drill_id": "drill_fluency_silence", "reason": "...", "priority": 1}
  ],
  "next_session_goal": "..."
}
```

## Scoring Engine (Deterministic)

All scoring is rule-based, no ML:

| Metric | Scoring Logic |
|--------|---------------|
| Pace | Distance from 150 WPM optimal |
| Fluency | Filler words per minute |
| Clarity | Pause patterns (long pauses bad, power pauses good) |
| Vocal Variety | Pitch variance + volume stability |
| Overall | Weighted average |

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Start Services

```bash
# Terminal 1: API
cd api
pip install -e .
uvicorn app.main:app --reload

# Terminal 2: Worker
cd worker
pip install -e .
python -m app.worker

# Terminal 3: Mobile
cd mobile
npm install
npx expo start
```

### Environment Variables

```env
# API
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/speakflow
REDIS_URL=redis://localhost:6379/0

# Worker
OPENAI_API_KEY=sk-...
WHISPER_MODEL=base
```

## Integration Checklist

- [x] Mobile can start a session and upload audio
- [x] API stores metadata + enqueues job
- [x] Worker pulls audio, runs ASR, extracts features, scores
- [x] Worker generates coaching (LLM selects drills from library)
- [x] API returns report by session_id
- [x] Mobile renders scorecard + transcript + coaching

## File Boundaries

| Directory | Can Write | Cannot Write |
|-----------|-----------|--------------|
| `/contracts` | Schemas, fixtures | Implementation |
| `/api` | API code | Worker, Mobile |
| `/worker` | Worker code | API, Mobile |
| `/mobile` | App code | API, Worker |

## v1 Constraints

1. **v1 HUD**: Pace + volume only (no real-time filler)
2. **ASR**: Whisper (not streaming)
3. **Scoring**: Deterministic rules (no ML)
4. **Coaching**: LLM selects drills, never invents
5. **Storage**: Local or S3 (abstracted)
