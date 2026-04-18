# VerdictAI — AI-Powered Hiring Assessment Platform

> ⚠️ **Important Notes:**
> - Backend runs on Render free tier — first request may take **30-60 seconds** to wake up. Please wait.
> - If generation is stuck for more than 30 seconds, refresh the page. Your assessment is saved and generating in the background.

## 🔗 Live Demo
- **Frontend:** https://verdict-ai-iota.vercel.app
- **Backend:** https://verdict-ai-backend-okmj.onrender.com/health

## 💡 What is VerdictAI?
VerdictAI helps HR teams and engineering managers generate role-specific technical assessments in seconds. Input a job title, required skills, and experience level — the AI generates a complete assessment paper with questions, difficulty ratings, and answer keys.

## 🧠 Architecture

```
HR fills assessment form
        ↓
POST /api/assignments (Express)
        ↓
Assignment saved to MongoDB
        ↓
Job added to BullMQ queue (Redis-backed)
        ↓
API returns immediately — user sees "Generating..."
        ↓
Worker picks up job from queue
        ↓
Builds structured hiring prompt → Calls NVIDIA LLM
        ↓
LLM response validated with Zod schema
        ↓
Result saved to MongoDB
        ↓
WebSocket emits generation:complete
        ↓
Frontend updates live — assessment ready
```

### Why this architecture?
- **BullMQ + Redis** — LLM generation takes 15-30 seconds. Running it synchronously would timeout. BullMQ queues it as a background job, keeping the API fast.
- **WebSocket** — Worker notifies frontend instantly when generation completes via Socket.io. No polling needed.
- **Zod validation** — LLMs return inconsistent JSON. Every response is validated against a strict schema with automatic type coercion. Invalid responses trigger automatic retry (up to 3 attempts).
- **Single Render service** — Worker runs inside Express process in production to stay within free tier limits.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State | Zustand with persist middleware |
| Realtime | Socket.io (WebSocket) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Queue | BullMQ + Redis (Upstash) |
| AI | NVIDIA API (meta/llama-3.1-8b-instruct) |
| Validation | Zod schema with type coercion |
| Deployment | Vercel (frontend) + Render (backend) |

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Upstash Redis account (free)
- NVIDIA API key (free at build.nvidia.com)

### Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI, REDIS_URL, NVIDIA_API_KEY, FRONTEND_URL, NODE_ENV=development
npm install
npm run dev        # Terminal 1 — API server
npm run dev:worker # Terminal 2 — BullMQ worker
```

### Frontend
```bash
cd frontend
# Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev        # Terminal 3
```

## ✅ Features

### Core
- [x] Role-specific assessment creation (job title, skills, experience level)
- [x] AI generation via NVIDIA LLM with structured prompting
- [x] Async job processing with BullMQ — no API timeouts
- [x] Real-time WebSocket updates during generation
- [x] Zod schema validation with automatic retry on failure
- [x] Structured output — sections, questions, difficulty tags, answer keys
- [x] Mobile responsive design

### Bonus
- [x] Download assessment as PDF
- [x] Regenerate assessment with one click
- [x] Notification bell with pending assessment status
- [x] User profile with avatar upload
- [x] Assessment library with templates
- [x] AI Hiring Toolkit (Assessment Generator, JD Analyzer, Scoring Assistant)
- [x] Keep-alive ping to prevent Render cold starts

## ⚠️ Known Limitations
- Render free tier cold start: 30-60 seconds on first request
- NVIDIA free tier LLM: 15-30 seconds generation time
- LLM occasionally returns inconsistent JSON — handled by retry logic (max 3 attempts)