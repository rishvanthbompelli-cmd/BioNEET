# BioNEET Daily Mission
email ravali 
mobile css improve cheyali blue color change cheyali
css improve cheyali blue color change cheyali
something 3d secens petali about bioneet videoes petali in bg
notification ravali in email and after deployed in hosting.



AI-powered BiPC preparation platform for **NEET** and **EAPCET** (AP/TS students).

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS v4, Framer Motion, Recharts, Zustand
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL
- **AI:** Groq API (server-side only — key never exposed to frontend)

## Quick Start

### 1. Start PostgreSQL
```powershell
# From daily-mission folder — requires Docker Desktop running
docker compose up -d
```

Or use a hosted PostgreSQL (Neon, Supabase, Render) and set `DATABASE_URL` in `backend/.env`.

### 2. Install & seed
```powershell
npm run install:all
cd backend
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, GROQ_API_KEY
npm run db:push
npm run db:seed
npm run dev
```

**Demo accounts (after seed):**
- Student: `student@dailymission.com` / `student123`
- Admin: `bompellirishvanth@gmail.com` / `241707`

### 3. Frontend
```powershell
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev
```

Open http://localhost:5173 — public BioNEET landing page; login for dashboard.

### 4. EAPCET papers
Place papers in `Documents/eapcet papers/` (AP/TS folders). Seed copies them to `frontend/public/papers/` and creates DB entries.

## Features
- **Public landing** — hero, features, papers preview, testimonials, pricing, FAQ
- **JWT + refresh tokens** — session persists after browser close
- **Google Login** — set `GOOGLE_CLIENT_ID` (backend) + `VITE_GOOGLE_CLIENT_ID` (frontend)
- **Forgot / reset password**
- **Notes CRUD** — 88 chapter notes + personal notes (auth required)
- **Revision tracker** — Not Started / In Progress / Revised / Mastered
- **Previous EAPCET papers** — AP & TS, view & download
- **BioNEET AI chatbot** — Groq-powered NEET/EAPCET tutor
- **AI Study Planner & Quiz Generator**

## API (auth required unless noted)
| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health + DB status (public) |
| `POST /api/auth/login` | Login → JWT + refresh token |
| `POST /api/auth/refresh` | Refresh access token |
| `POST /api/auth/google` | Google OAuth login |
| `GET /api/notes` | Notes (shared + personal) |
| `GET /api/revisions` | Revision tracker |
| `GET /api/papers` | Previous EAPCET papers |
| `POST /api/chat` | AI chatbot |

## Deploy
- **Frontend:** Vercel — Root Directory: `daily-mission`, build: `cd frontend && npm run build`, output: `frontend/dist`
- **Backend:** Render (`backend/render.yaml`) with PostgreSQL
- Set env: `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`
