import { Router } from 'express'
import db from '../db.js'

const router = Router()

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1'
}

// GET bookmark status + count for a post
router.get('/:id/bookmarks', (req, res) => {
  const ip = getClientIP(req)
  const postId = req.params.id

  const count = db.prepare('SELECT COUNT(*) AS count FROM bookmarks WHERE post_id = ?').get(postId)
  const bookmarked = db.prepare('SELECT COUNT(*) AS count FROM bookmarks WHERE post_id = ? AND ip_address = ?').get(postId, ip)

  res.json({ count: count.count, bookmarked: bookmarked.count > 0 })
})

// TOGGLE bookmark
router.post('/:id/bookmarks', (req, res) => {
  const ip = getClientIP(req)
  const postId = req.params.id

  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId)
  if (!post) return res.status(404).json({ error: '文章不存在' })

  const existing = db.prepare('SELECT id FROM bookmarks WHERE post_id = ? AND ip_address = ?').get(postId, ip)

  if (existing) {
    db.prepare('DELETE FROM bookmarks WHERE post_id = ? AND ip_address = ?').run(postId, ip)
  } else {
    db.prepare('INSERT INTO bookmarks (post_id, ip_address) VALUES (?, ?)').run(postId, ip)
  }

  const count = db.prepare('SELECT COUNT(*) AS count FROM bookmarks WHERE post_id = ?').get(postId)
  res.json({ count: count.count, bookmarked: !existing })
})

// GET all bookmarked posts (by IP)
router.get('/', (req, res) => {
  const ip = getClientIP(req)
  const posts = db.prepare(`
    SELECT p.*, b.created_at AS bookmarked_at,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
    FROM bookmarks b
    JOIN posts p ON p.id = b.post_id
    WHERE b.ip_address = ?
    ORDER BY b.created_at DESC
  `).all(ip)

  res.json(posts)
})

export default router
