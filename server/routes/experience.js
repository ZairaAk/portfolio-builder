const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/experience
router.get('/', authMiddleware, (req, res) => {
  const exp = db.prepare('SELECT * FROM experiences WHERE user_id = ? ORDER BY sort_order ASC').all(req.user.id);
  res.json(exp);
});

// POST /api/experience
router.post('/', authMiddleware, (req, res) => {
  const { role, company, from_date, to_date, is_current, description } = req.body;
  if (!role || !company) return res.status(400).json({ error: 'Role and company are required' });
  const id = uuidv4();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM experiences WHERE user_id = ?').get(req.user.id);
  const sort_order = (maxOrder?.m ?? -1) + 1;
  db.prepare('INSERT INTO experiences (id, user_id, role, company, from_date, to_date, is_current, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, role, company, from_date || '', to_date || '', is_current ? 1 : 0, description || '', sort_order);
  res.status(201).json(db.prepare('SELECT * FROM experiences WHERE id = ?').get(id));
});

// PATCH /api/experience/:id
router.patch('/:id', authMiddleware, (req, res) => {
  const exp = db.prepare('SELECT * FROM experiences WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!exp) return res.status(404).json({ error: 'Experience not found' });
  const { role, company, from_date, to_date, is_current, description } = req.body;
  db.prepare('UPDATE experiences SET role=?, company=?, from_date=?, to_date=?, is_current=?, description=? WHERE id=?')
    .run(role ?? exp.role, company ?? exp.company, from_date ?? exp.from_date, to_date ?? exp.to_date, is_current !== undefined ? (is_current ? 1 : 0) : exp.is_current, description ?? exp.description, req.params.id);
  res.json(db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id));
});

// DELETE /api/experience/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM experiences WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Experience not found' });
  res.json({ success: true });
});

module.exports = router;
