import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET profile
router.get('/', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get()
  if (!profile) return res.json({ name: 'Muyin', bio: '', avatar: '', interests: '[]', experience: '[]', photos: '[]', contact: '{}' })

  // Parse JSON fields
  res.json({
    ...profile,
    interests: JSON.parse(profile.interests || '[]'),
    experience: JSON.parse(profile.experience || '[]'),
    photos: JSON.parse(profile.photos || '[]'),
    contact: JSON.parse(profile.contact || '{}'),
  })
})

// PUT profile (需要登录)
router.put('/', requireAuth, (req, res) => {
  const { avatar, name, bio, interests, experience, photos, contact } = req.body

  db.prepare(`
    UPDATE profile SET
      avatar = ?, name = ?, bio = ?,
      interests = ?, experience = ?, photos = ?,
      contact = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    avatar || '',
    name || 'Muyin',
    bio || '',
    JSON.stringify(interests || []),
    JSON.stringify(experience || []),
    JSON.stringify(photos || []),
    JSON.stringify(contact || {})
  )

  const updated = db.prepare('SELECT * FROM profile WHERE id = 1').get()
  res.json({
    ...updated,
    interests: JSON.parse(updated.interests || '[]'),
    experience: JSON.parse(updated.experience || '[]'),
    photos: JSON.parse(updated.photos || '[]'),
    contact: JSON.parse(updated.contact || '{}'),
  })
})

export default router
