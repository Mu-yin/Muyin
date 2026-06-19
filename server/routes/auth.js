import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Yxfl0316'
const JWT_SECRET = process.env.JWT_SECRET || 'muyin-blog-secret-key-2024'

// 登录
router.post('/login', (req, res) => {
  const { password } = req.body
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密码错误' })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, message: '登录成功' })
})

// 检查登录状态
router.get('/check', (req, res) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.json({ authenticated: false })
  }
  try {
    jwt.verify(header.split(' ')[1], JWT_SECRET)
    res.json({ authenticated: true })
  } catch {
    res.json({ authenticated: false })
  }
})

export default router
