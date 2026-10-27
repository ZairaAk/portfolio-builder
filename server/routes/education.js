const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/education
router.get('/', authMiddleware, (req, res) => {
  const edu = db.prepare('SELECT * FROM education WHERE user_id = ? ORDER BY sort_order ASC').all(req.user.id);
  res.json(edu);
});

// POST /api/education
router.post('/', authMiddleware, (req, res) => {
  const { degree, institution, year, description } = req.body;
  if (!degree || !institution) return res.status(400).json({ error: 'Degree and institution are required' });
  const id = uuidv4();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM education WHERE user_id = ?').get(req.user.id);
  const sort_order = (maxOrder?.m ?? -1) + 1;
  db.prepare('INSERT INTO education (id, user_id, degree, institution, year, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, degree, institution, year || '', description || '', sort_order);
  res.status(201).json(db.prepare('SELECT * FROM education WHERE id = ?').get(id));
});

// PATCH /api/education/:id
router.patch('/:id', authMiddleware, (req, res) => {
  const edu = db.prepare('SELECT * FROM education WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!edu) return res.status(404).json({ error: 'Education not found' });
  const { degree, institution, year, description } = req.body;
  db.prepare('UPDATE education SET degree=?, institution=?, year=?, description=? WHERE id=?')
    .run(degree ?? edu.degree, institution ?? edu.institution, year ?? edu.year, description ?? edu.description, req.params.id);
  res.json(db.prepare('SELECT * FROM education WHERE id = ?').get(req.params.id));
});

// DELETE /api/education/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM education WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Education not found' });
  res.json({ success: true });
});

module.exports = router;
