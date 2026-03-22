import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import assignmentRoutes from './routes/assignments'
import { initSocket } from './socket/index'

const app = express()
const httpServer = createServer(app)

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://veda-ai-git-main-mohit-git1s-projects.vercel.app',
  'https://veda-ai-iota.vercel.app',
]
export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/assignments', assignmentRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

initSocket(io)

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err))

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

// Run worker in same process on production (single Render service)
if (process.env.NODE_ENV === 'production') {
  require('./queues/worker')
}

export const startKeepAlive = () => {
  const url = process.env.RENDER_URL || 'https://veda-ai-backend-okmj.onrender.com'
  
  setInterval(async () => {
    try {
      await fetch(`${url}/health`)
      console.log(' Keep-alive ping sent')
    } catch (err) {
      console.log('Keep-alive failed:', err)
    }
  }, 14 * 60 * 1000)
}