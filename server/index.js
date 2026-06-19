import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDB } from './db.js'
import postsRouter from './routes/posts.js'
import commentsRouter from './routes/comments.js'
import likesRouter from './routes/likes.js'
import uploadRouter from './routes/upload.js'
import profileRouter from './routes/profile.js'
import bookmarksRouter from './routes/bookmarks.js'
import authRouter from './routes/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API routes
app.use('/api/posts', postsRouter)
app.use('/api/posts', commentsRouter)
app.use('/api/posts', likesRouter)
app.use('/api/posts', bookmarksRouter)
app.use('/api/bookmarks', bookmarksRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/profile', profileRouter)
app.use('/api/auth', authRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Production: serve React build
const distPath = path.join(__dirname, '..', 'client', 'dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'))
  }
})

// Initialize DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🌸 Muyinの博客 已启动: http://localhost:${PORT}`)
    console.log(`📦 生产模式: 静态文件来自 ${distPath}`)
  })
}).catch(err => {
  console.error('数据库初始化失败:', err)
  process.exit(1)
})
