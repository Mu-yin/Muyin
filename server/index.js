import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDB } from './db.js'
import postsRouter from './routes/posts.js'
import commentsRouter from './routes/comments.js'
import likesRouter from './routes/likes.js'
import uploadRouter from './routes/upload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API routes
app.use('/api/posts', postsRouter)
app.use('/api/posts', commentsRouter)
app.use('/api/posts', likesRouter)
app.use('/api/upload', uploadRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Initialize DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🌸 Muyinの博客 后端已启动: http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('数据库初始化失败:', err)
  process.exit(1)
})
