const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/profile
router.get('/', authMiddleware, (req, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

// PATCH /api/profile
router.patch('/', authMiddleware, (req, res) => {
  const allowed = ['name', 'tagline', 'bio', 'location', 'website', 'github', 'linkedin', 'twitter', 'template', 'accent_color', 'is_published'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  updates.updated_at = new Date().toISOString();

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.user.id];
  db.prepare(`UPDATE profiles SET ${setClauses} WHERE user_id = ?`).run(...values);

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
  res.json(profile);
});

// PATCH /api/profile/avatar  (after multer processes it)
router.patch('/avatar', authMiddleware, (req, res) => {
  if (!req.avatarUrl) return res.status(400).json({ error: 'No avatar uploaded' });
  db.prepare('UPDATE profiles SET avatar_url = ? WHERE user_id = ?').run(req.avatarUrl, req.user.id);
  res.json({ avatar_url: req.avatarUrl });
});

module.exports = router;
