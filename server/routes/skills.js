const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/skills
router.get('/', authMiddleware, (req, res) => {
  const skills = db.prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY category, sort_order ASC').all(req.user.id);
  res.json(skills);
});

// POST /api/skills
router.post('/', authMiddleware, (req, res) => {
  const { name, level, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name is required' });
  const id = uuidv4();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM skills WHERE user_id = ?').get(req.user.id);
  const sort_order = (maxOrder?.m ?? -1) + 1;
  db.prepare('INSERT INTO skills (id, user_id, name, level, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, name, level || 3, category || 'General', sort_order);
  res.status(201).json(db.prepare('SELECT * FROM skills WHERE id = ?').get(id));
});

// PATCH /api/skills/:id
router.patch('/:id', authMiddleware, (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  const { name, level, category } = req.body;
  db.prepare('UPDATE skills SET name = ?, level = ?, category = ? WHERE id = ?')
    .run(name ?? skill.name, level ?? skill.level, category ?? skill.category, req.params.id);
  res.json(db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id));
});

// DELETE /api/skills/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM skills WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Skill not found' });
  res.json({ success: true });
});

module.exports = router;
