# Daily Mission - AI-Powered Education Platform

Production-quality BiPC preparation platform for **NEET** and **EAPCET** (AP/TS students).

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS v4, Framer Motion, Recharts, Zustand
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** SQLite (local) / PostgreSQL (production via Render)
- **AI:** LangChain-style chains via Ollama + Mistral (with smart fallback)

## Quick Start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env   # set DATABASE_URL and JWT_SECRET
npm run db:push
npm run db:seed
npm run dev
```

**Demo accounts (after seed):**
- Student: `student@dailymission.com` / `student123`
- Admin: `admin@dailymission.com` / `admin123`

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env
npm run dev
```

Open http://localhost:5173

### 4. AI (optional)
Install [Ollama](https://ollama.ai) and run:
```bash
ollama pull mistral
```
Set in `backend/.env`:
```
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

## Features
- **Real analytics dashboard** — stats from MCQ attempts, study sessions, mock scores
- **AI Study Planner** — daily missions, weekly schedule, weak-topic focus
- **Notes, MCQs, Mock Tests** — full REST APIs with seeded BiPC content
- **Revision Tracker** — chapter completion, weak marking, streaks
- **Formula Hub, Diagrams, Handbook**
- **AI Quiz Generator**
- **Admin Panel** — user & content stats

## API Overview
| Endpoint | Description |
|----------|-------------|
| `GET /api/dashboard/dashboard` | Real dashboard stats (auth) |
| `GET /api/dashboard/analytics` | Full analytics + charts data |
| `GET /api/notes` | Chapter-wise notes |
| `GET /api/mcqs` | MCQ bank |
| `POST /api/mcqs/:id/attempt` | Submit answer (tracks analytics) |
| `POST /api/ai/study-plan` | Generate AI study plan |
| `POST /api/ai/quiz` | Generate AI quiz |
| `GET /api/mock-tests` | Mock test list |
| `GET /api/revisions` | Revision tracker |

## Deploy
- **Frontend:** Vercel (root: `daily-mission`, output: `frontend/dist`)
- **Backend:** Render (`backend/render.yaml`)
