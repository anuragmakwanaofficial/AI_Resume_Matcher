# AI Resume Matcher — Project Memory File

> **Purpose:** This file provides full context for any AI model (Gemini, Claude, or other) to immediately understand and continue development on this project without prior conversation history.

---

## 🗂️ Project Location
```
c:\Users\anura\OneDrive\Documents\AI_inter\AI_Resume_Matcher\
├── backend/          ← FastAPI Python backend
├── frontend/         ← React + Vite + Tailwind frontend
├── design-system.md  ← Stitch design tokens
└── PROJECT_MEMORY.md ← This file
```

---

## 🎯 What This App Does
An **AI-powered Resume–Job Description Matching Tool** built for E2M Solutions' practical assessment.

**Core Flow:**
1. User uploads a **Resume** (PDF/DOCX/text) and **Job Description** (text/file)
2. Backend sends both to **HuggingFace Mistral-7B LLM** via Inference API
3. LLM returns structured JSON: `overall_score`, `narrative`, `suggestions`, `matched_skills`, `missing_skills`
4. Results displayed on a **Results Page** with animated score ring, skill matrix, and improvement tips
5. Each analysis is **saved to PostgreSQL** and viewable in **History**

---

## 🏗️ Architecture

```
Frontend (React 18 + Vite + Tailwind)
   │  HTTP via Vite proxy → /api → localhost:8000
Backend (FastAPI Python)
   ├── POST /api/match/      → Run new analysis
   ├── GET  /api/match/{id}  → Get specific analysis
   ├── GET  /api/history/    → Paginated history
   └── GET  /health          → Health check
         │
PostgreSQL DB (tables: analyses, skill_matches)
         │
HuggingFace API (Mistral-7B-Instruct-v0.3)
```

---

## 🔑 Credentials & Config

### Backend `.env` (already set at `backend/.env`):
```
DATABASE_URL=postgresql://postgres:your_password_here@127.0.0.1:5432/ai_resume_matcher
HF_API_KEY=your_huggingface_api_key_here
HF_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.3
LLM_BACKEND=api
LLM_MAX_NEW_TOKENS=800
LLM_TEMPERATURE=0.3
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### PostgreSQL
- Host: `127.0.0.1:5432`
- Database: `ai_resume_matcher` (must be created manually if not exists)
- User: `postgres`, Password: `your_password_here`

---

## 📁 Key Files Reference

### Backend
| File | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI app, CORS, router registration, DB table creation |
| `backend/app/config.py` | pydantic-settings config, reads `.env` |
| `backend/app/database.py` | SQLAlchemy engine, SessionLocal, get_db() |
| `backend/app/models/analysis.py` | `Analysis` + `SkillMatch` ORM models |
| `backend/app/schemas/analysis.py` | Pydantic request/response schemas |
| `backend/app/routers/matcher.py` | POST /api/match/ + GET /api/match/{id} |
| `backend/app/routers/history.py` | GET /api/history/ |
| `backend/app/services/matcher_service.py` | **Core AI logic** — LLM call + heuristic fallback |
| `backend/app/services/text_extractor.py` | PDF (pdfplumber) + DOCX (python-docx) extraction |
| `backend/requirements.txt` | Python dependencies |
| `backend/run.py` | `uvicorn app.main:app --reload` |

### Frontend
| File | Purpose |
|---|---|
| `frontend/src/App.jsx` | React Router: `/` → Matcher, `/results/:id` → Results, `/history` → History |
| `frontend/src/pages/MatcherPage.jsx` | **Screen 1**: Upload/text inputs, Analyze button |
| `frontend/src/pages/ResultsPage.jsx` | **Screen 2**: Score ring, skill matrix, suggestions |
| `frontend/src/pages/HistoryPage.jsx` | Paginated list of past analyses |
| `frontend/src/services/api.js` | Axios client: `matcherAPI`, `historyAPI` |
| `frontend/src/index.css` | Global CSS: glass-card, hero-gradient, score ring, skill tag styles |
| `frontend/tailwind.config.js` | All Stitch design tokens |
| `frontend/vite.config.js` | Vite + proxy `/api` → `localhost:8000` |

---

## 🎨 Design System (Stitch: "AI Resume Matcher")

### Key Colors
- `secondary`: `#0058be` (primary blue for actions, highlights)
- `background`: `#f8f9ff` (cool light gray)
- `surface-container-lowest`: `#ffffff`
- `on-surface`: `#0b1c30` (deep navy text)
- Error: `#ba1a1a`

### Stitch Screens
- **Project ID**: `16151506268849004986`
- **Screen 1**: `ecc7d3b82a8d4ce1aebfc4ff09a36ec3` — Initial State (upload inputs)
- **Screen 2**: `e0f9c460ae1a4c8f8902b5c9bb1fd672` — Analysis Results (score + matrix)

### Components
- `glass-card` — rgba(255,255,255,0.75) + blur(12px)
- `hero-gradient` — linear-gradient(135deg, #f8f9ff, #e5eeff, #dce9ff)
- `score-ring-fill` — SVG circle with `stroke-dasharray` animation
- `skill-tag-matched` — solid bg-e5eeff pill
- `skill-tag-missing` — dashed border pill

---

## 🗄️ Database Schema

### `analyses` table
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| resume_filename | VARCHAR | Original filename |
| jd_filename | VARCHAR | Original JD filename |
| resume_text | TEXT | Extracted/pasted text |
| jd_text | TEXT | Extracted/pasted JD text |
| overall_score | FLOAT | 0-100 |
| narrative | TEXT | AI summary paragraph |
| suggestions | JSON | List of strings |
| created_at | TIMESTAMP | Auto-set |

### `skill_matches` table
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| analysis_id | UUID (FK) | → analyses.id |
| skill_name | VARCHAR | e.g. "Python", "Docker" |
| category | VARCHAR | "must_have" or "nice_to_have" |
| status | VARCHAR | "matched" or "missing" |

---

## 🤖 AI / LLM Details

### Prompt Strategy (`matcher_service.py`)
- Uses Mistral-7B-Instruct via `[INST]...[/INST]` format
- Resume truncated to 3000 chars, JD to 2000 chars (token safety)
- Returns **structured JSON only** — no markdown, no prose
- `_extract_json()` parses JSON with regex fallback
- **Heuristic fallback** (`_heuristic_match`) when LLM unavailable: keyword overlap + common tech skills list

### Expected LLM JSON Response Shape
```json
{
  "overall_score": 85,
  "narrative": "2-3 sentence summary...",
  "suggestions": ["tip1", "tip2", "tip3"],
  "matched_skills": {
    "must_have": ["Python", "SQL"],
    "nice_to_have": ["AWS", "React"]
  },
  "missing_skills": {
    "must_have": ["Docker"],
    "nice_to_have": ["Kubernetes", "Agile"]
  }
}
```

---

## 🚀 How to Run

### Backend
```powershell
cd c:\Users\anura\OneDrive\Documents\AI_inter\AI_Resume_Matcher\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
# → Running at http://localhost:8000
# → Swagger UI at http://localhost:8000/docs
```

### Frontend
```powershell
cd c:\Users\anura\OneDrive\Documents\AI_inter\AI_Resume_Matcher\frontend
npm install
npm run dev
# → Running at http://localhost:5173
```

### PostgreSQL DB Setup
```sql
CREATE DATABASE ai_resume_matcher;
-- Tables are auto-created by SQLAlchemy on first backend startup
```

---

## ✅ Known Working State
- Backend: All files created and structured correctly
- Frontend: All files created matching Stitch design
- DB: Tables auto-created on first startup via `Base.metadata.create_all(bind=engine)`
- LLM: HuggingFace token configured, heuristic fallback available

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|---|---|
| `psycopg2` import error | Ensure `psycopg2-binary` installed, NOT `psycopg2` |
| DB `ai_resume_matcher` doesn't exist | Run: `CREATE DATABASE ai_resume_matcher;` in psql |
| LLM timeout | HF free tier can be slow — 60-120s timeout set in Axios |
| PDF extraction fails | Ensure `pdfplumber` installed; fallback: paste text directly |
| CORS error | Check `CORS_ORIGINS` in `.env` includes frontend URL |
| `pydantic_settings` not found | Install `pydantic-settings>=2.7.0` (separate from pydantic) |

---

## 📋 Remaining Enhancements (Future Work)
- [ ] JWT-based user authentication (login/register)
- [ ] Admin panel to view all analyses
- [ ] Resume parsing improvements (table extraction, multi-column)
- [ ] Batch analysis (multiple resumes vs one JD)
- [ ] Export results as PDF using `reportlab` or `weasyprint`
- [ ] Email notifications with analysis summary
- [ ] Dark mode toggle
- [ ] Candidate ranking dashboard

---

## 🤝 Reference Projects
- **ai_interviewer-main**: `c:\Users\anura\OneDrive\Documents\AI_inter\ai_interviewer-main\`
  - Same FastAPI + PostgreSQL + HuggingFace + React stack
  - Reference for LLM service pattern, auth, WebSocket, admin panel
- **Stitch Project**: ID `16151506268849004986` → "AI Resume Matcher" (DESKTOP)
- **design-system.md**: `c:\Users\anura\OneDrive\Documents\AI_inter\AI_Resume_Matcher\design-system.md`

---

*Last updated: 2026-07-06 | Built by Antigravity (Claude Sonnet 4.6)*
