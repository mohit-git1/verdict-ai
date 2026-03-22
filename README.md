# VedaAI — AI Assessment Creator

> A full-stack AI-powered assessment creator that allows teachers to generate structured question papers using LLMs, with real-time updates via WebSockets.

## 🔗 Live Demo
- **Frontend:** https://veda-ai-iota.vercel.app
- **Backend:** https://veda-ai-backend-okmj.onrender.com
- **Health Check:** https://veda-ai-backend-okmj.onrender.com/health

> ⚠️ **Note:** Backend is hosted on Render free tier. First request may take 30-60 seconds to wake up from sleep. Subsequent requests are fast. This is a free tier limitation, not a bug.

---
> 💡 **Quick Tip:** If the page stops loading or gets stuck for more than 30 seconds, simply refresh the page. Your assignment is saved and will continue generating in the background.

---
## 🧠 Architecture Overview
```
Teacher fills form
       ↓
POST /api/assignments (Express)
       ↓
Assignment saved to MongoDB
       ↓
Job added to BullMQ queue (Redis-backed)
       ↓
Worker picks up job
       ↓
Builds structured prompt → Calls NVIDIA LLM API
       ↓
LLM response validated with Zod schema
       ↓
Result saved to MongoDB
       ↓
WebSocket emits generation:complete
       ↓
Frontend updates live (no page refresh needed)
```

### Why this architecture?
- **BullMQ + Redis** — LLM generation can take 15-30 seconds. Running it synchronously in an API request would timeout. BullMQ handles it as a background job, keeping the API responsive.
- **WebSocket** — Instead of the frontend polling every few seconds, the worker notifies the frontend instantly when generation completes via Socket.io.
- **Zod validation** — LLMs can return malformed JSON. Every LLM response is validated against a strict Zod schema before being saved to MongoDB. Bad responses are rejected and the job retries automatically.
- **Worker inside Express (production)** — Render free tier allows only 1 service. In production, the BullMQ worker runs inside the same Express process. Locally, it runs as a separate process for easier debugging.

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** — App Router, Server + Client components
- **TypeScript** — Full type safety
- **Tailwind CSS** — Styling
- **Zustand** — Global state management (assignments, user profile)
- **Socket.io-client** — WebSocket real-time updates
- **react-dropzone** — File upload (PDF/image)
- **axios** — HTTP client
- **date-fns** — Date formatting

### Backend
- **Node.js + Express** — REST API server
- **TypeScript** — Full type safety
- **MongoDB + Mongoose** — Store assignments and generated results
- **Redis (Upstash)** — BullMQ backing store + job state
- **BullMQ** — Background job queue for LLM generation
- **Socket.io** — Real-time WebSocket notifications
- **Zod** — LLM response validation
- **Multer** — File upload handling

### AI
- **NVIDIA API** — `meta/llama-3.1-8b-instruct` model
- **OpenAI-compatible client** — via `openai` npm package pointed at NVIDIA base URL
- **Structured prompting** — Custom prompt builder that converts form input into detailed LLM instructions
- **JSON-only responses** — LLM instructed to return only valid JSON, never raw text

---

## 📁 Project Structure
```
veda-ai/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server + Socket.io
│   │   ├── routes/
│   │   │   └── assignments.ts    # POST, GET, DELETE, regenerate
│   │   ├── models/
│   │   │   ├── Assignment.ts     # Assignment schema
│   │   │   └── Result.ts         # Generated paper schema
│   │   ├── queues/
│   │   │   ├── queue.ts          # BullMQ queue setup
│   │   │   └── worker.ts         # BullMQ worker (processes jobs)
│   │   ├── services/
│   │   │   ├── promptBuilder.ts  # Builds structured LLM prompt
│   │   │   └── llm.ts            # NVIDIA API call + Zod validation
│   │   ├── socket/
│   │   │   └── index.ts          # Socket.io event handlers
│   │   └── keepAlive.ts          # Prevents Render free tier sleep
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── assignments/
    │   │   ├── page.tsx           # Assignments list (empty + filled state)
    │   │   ├── create/page.tsx    # Create assignment form
    │   │   └── [id]/page.tsx      # Output page (generated paper)
    │   ├── groups/page.tsx        # My Groups
    │   ├── toolkit/page.tsx       # AI Teacher's Toolkit
    │   ├── library/page.tsx       # My Library
    │   └── settings/page.tsx      # User settings + profile
    ├── components/
    │   └── layout/
    │       ├── Sidebar.tsx        # Navigation sidebar
    │       ├── Topbar.tsx         # Top navigation bar
    │       └── AppShell.tsx       # Layout wrapper
    ├── store/
    │   ├── assignmentStore.ts     # Zustand assignments state
    │   └── userStore.ts           # Zustand user profile state
    ├── hooks/
    │   └── useWebSocket.ts        # Socket.io connection hook
    ├── lib/
    │   └── api.ts                 # Axios API client
    └── public/
        ├── VedaAI.png             # App logo
        └── icons/                 # Navigation icons (SVG)
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Upstash Redis account (free)
- NVIDIA API key (free at build.nvidia.com)

### Step 1 — Clone the repo
```bash
git clone https://github.com/mohit-git1/veda-ai.git
cd veda-ai
```

### Step 2 — Backend setup
```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/vedaai?retryWrites=true&w=majority
REDIS_URL=rediss://default:YOUR_PASS@YOUR_HOST.upstash.io:6380
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```
```bash
npm install
npm run dev        # Terminal 1 — API server on port 5000
npm run dev:worker # Terminal 2 — BullMQ worker
```

### Step 3 — Frontend setup
```bash
cd frontend
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
```bash
npm install
npm run dev        # Terminal 3 — Frontend on port 3000
```

### Step 4 — Open the app
```
http://localhost:3000
```

---

## 🌐 Production Deployment

### Services used
| Service | Purpose | Tier |
|---------|---------|------|
| Vercel | Frontend hosting | Free |
| Render | Backend + Worker | Free (1 service) |
| MongoDB Atlas | Database | Free |
| Upstash | Redis | Free |

### Key production decisions
- **Single Render service** — Worker runs inside Express process in production (`NODE_ENV=production`) to stay within free tier limits
- **Keep-alive ping** — Backend pings itself every 14 minutes to prevent Render free tier sleep
- **CORS** — Configured to allow both Vercel deployment URLs

### Environment variables on Render
```
MONGODB_URI=your_atlas_connection_string
REDIS_URL=your_upstash_redis_url
NVIDIA_API_KEY=your_nvidia_api_key
FRONTEND_URL=https://veda-ai-iota.vercel.app
NODE_ENV=production
PORT=5000
RENDER_URL=https://veda-ai-backend-okmj.onrender.com
```

### Environment variables on Vercel
```
NEXT_PUBLIC_API_URL=https://veda-ai-backend-okmj.onrender.com
```

---

## 🎯 Approach

### Problem breakdown
The core challenge was building a system where:
1. A teacher fills a form
2. An AI generates a structured question paper
3. The frontend updates in real-time without polling

### Key decisions

**BullMQ for generation** — LLM calls take 15-30 seconds. A synchronous API call would timeout and give a bad UX. BullMQ queues the job, the worker processes it, and WebSocket notifies the frontend when done.

**Structured prompting** — Raw LLM output is unpredictable. The prompt builder converts form input into a detailed instruction with an exact JSON schema. The LLM is told to return ONLY JSON, nothing else.

**Zod validation** — Even with structured prompting, LLMs sometimes return malformed JSON or miss fields. Every response is validated against a Zod schema. Invalid responses fail the job and trigger automatic retry (up to 3 times with exponential backoff).

**Worker architecture** — Locally: separate process for easier debugging. Production: runs inside Express to stay within Render free tier (1 service limit).

**Zustand for state** — Assignments list, generating status, and user profile are all managed in Zustand stores. This ensures state persists across page navigations without re-fetching.

---

## ✅ Features Implemented

### Core
- [x] Assignment creation form with validation
- [x] File upload (PDF/image) via react-dropzone
- [x] Due date, question types, marks configuration
- [x] AI question paper generation via NVIDIA LLM
- [x] Structured sections (A, B, C...)
- [x] Difficulty tags (Easy/Medium/Hard)
- [x] Real-time WebSocket updates during generation
- [x] Structured output page (exam paper format)
- [x] Student info section (Name, Roll, Section)
- [x] Answer key generation

### Bonus
- [x] Download as PDF (window.print with print stylesheet)
- [x] Regenerate button
- [x] Difficulty badges with color coding
- [x] Mobile responsive design
- [x] Notification bell (shows pending assignments)
- [x] User profile with avatar upload
- [x] Settings page
- [x] My Groups page (create groups, invite links)
- [x] AI Teacher's Toolkit (Quiz Generator, Lesson Planner, etc.)
- [x] My Library (saved papers)
- [x] Keep-alive ping (prevents Render sleep)

---

## ⚠️ Known Limitations & Usage Tips

- **Cold start delay** — Backend is hosted on Render free tier and sleeps after 15 mins of inactivity. First request may take 30-60 seconds to wake up. Keep-alive ping reduces this but doesn't eliminate it entirely.

- **Assignment generation time** — After clicking "Next", please wait up to 60 seconds for the AI to generate your question paper. The page will update automatically when ready. If it stays on "Starting generation..." for more than 60 seconds, refresh the page once.

- **Page stuck on "Starting generation..."** — If the output page doesn't update after 60 seconds, simply refresh the page. Your assignment is saved and the generated paper will appear after refresh.

- **LLM response time** — NVIDIA free tier can take 15-30 seconds to generate a full paper depending on server load.

- **File uploads** — Only text (.txt) files are used for AI context. Image uploads are accepted but not processed by the AI (only the form details are used for generation).
## 👨‍💻 Author

Built by Mohit Sharma as part of the VedaAI Full Stack Engineering Assignment.