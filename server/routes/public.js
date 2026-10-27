const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/public/:username  — public portfolio data (no auth required)
router.get('/:username', (req, res) => {
  const user = db.prepare('SELECT id, username FROM users WHERE username = ?').get(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'Portfolio not found' });

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
  if (!profile || !profile.is_published) return res.status(404).json({ error: 'This portfolio is not published yet' });

  // Increment view count
  db.prepare('UPDATE profiles SET views = views + 1 WHERE user_id = ?').run(user.id);

  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY sort_order ASC').all(user.id)
    .map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') }));

  const skills = db.prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY category, sort_order ASC').all(user.id);

  const experiences = db.prepare('SELECT * FROM experiences WHERE user_id = ? ORDER BY sort_order ASC').all(user.id);

  const education = db.prepare('SELECT * FROM education WHERE user_id = ? ORDER BY sort_order ASC').all(user.id);

  res.json({
    profile: { ...profile, views: profile.views + 1 },
    projects,
    skills,
    experiences,
    education,
    username: user.username
  });
});

module.exports = router;
