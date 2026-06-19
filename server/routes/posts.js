import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET all posts (with like and comment counts)
router.get('/', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
    FROM posts p
    ORDER BY p.created_at DESC
  `).all()
  res.json(posts)
})

// GET single post
router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
    FROM posts p
    WHERE p.id = ?
  `).get(req.params.id)

  if (!post) return res.status(404).json({ error: '文章不存在' })
  res.json(post)
})

// CREATE post (需要登录)
router.post('/', requireAuth, (req, res) => {
  const { title, content, tags, image_url } = req.body
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' })
  }
  const result = db.prepare(
    'INSERT INTO posts (title, content, tags, image_url) VALUES (?, ?, ?, ?)'
  ).run(title, content, tags || '', image_url || '')
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(post)
})

// UPDATE post (需要登录)
router.put('/:id', requireAuth, (req, res) => {
  const { title, content, tags, image_url } = req.body
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: '文章不存在' })

  db.prepare(`
    UPDATE posts
    SET title = ?, content = ?, tags = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || existing.title,
    content || existing.content,
    tags ?? existing.tags,
    image_url ?? existing.image_url,
    req.params.id
  )
  const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// DELETE post (需要登录)
router.delete('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: '文章不存在' })

  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id)
  res.json({ message: '文章已删除' })
})

export default router
