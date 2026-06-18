import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET comments for a post
router.get('/:id/comments', (req, res) => {
  const comments = db.prepare(
    'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC'
  ).all(req.params.id)
  res.json(comments)
})

// ADD comment to a post
router.post('/:id/comments', (req, res) => {
  const { author, content } = req.body
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '评论内容不能为空' })
  }

  // Verify post exists
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: '文章不存在' })

  const result = db.prepare(
    'INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)'
  ).run(req.params.id, (author || '匿名').trim(), content.trim())

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(comment)
})

export default router
