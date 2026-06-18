import { Router } from 'express'
import db from '../db.js'

const router = Router()

// Helper to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1'
}

// GET like count + whether current IP has liked
router.get('/:id/likes', (req, res) => {
  const ip = getClientIP(req)
  const postId = req.params.id

  const count = db.prepare('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?').get(postId)
  const liked = db.prepare('SELECT COUNT(*) AS count FROM likes WHERE post_id = ? AND ip_address = ?').get(postId, ip)

  res.json({
    count: count.count,
    liked: liked.count > 0,
  })
})

// TOGGLE like (like if not liked, unlike if already liked)
router.post('/:id/likes', (req, res) => {
  const ip = getClientIP(req)
  const postId = req.params.id

  // Verify post exists
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
  if (!post) return res.status(404).json({ error: '文章不存在' })

  const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND ip_address = ?').get(postId, ip)

  if (existing) {
    // Unlike
    db.prepare('DELETE FROM likes WHERE post_id = ? AND ip_address = ?').run(postId, ip)
  } else {
    // Like
    db.prepare('INSERT INTO likes (post_id, ip_address) VALUES (?, ?)').run(postId, ip)
  }

  const count = db.prepare('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?').get(postId)
  res.json({
    count: count.count,
    liked: !existing,
  })
})

export default router
