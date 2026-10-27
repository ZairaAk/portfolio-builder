const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/projects
router.get('/', authMiddleware, (req, res) => {
  const projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY sort_order ASC, created_at DESC').all(req.user.id);
  res.json(projects.map(p => ({ ...p, tags: JSON.parse(p.tags || '[]') })));
});

// POST /api/projects
router.post('/', authMiddleware, (req, res) => {
  const { title, description, image_url, tags, live_url, github_url } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuidv4();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM projects WHERE user_id = ?').get(req.user.id);
  const sort_order = (maxOrder?.m ?? -1) + 1;

  db.prepare('INSERT INTO projects (id, user_id, title, description, image_url, tags, live_url, github_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, title, description || '', image_url || '', JSON.stringify(tags || []), live_url || '', github_url || '', sort_order);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.status(201).json({ ...project, tags: JSON.parse(project.tags || '[]') });
});

// PATCH /api/projects/:id
router.patch('/:id', authMiddleware, (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const allowed = ['title', 'description', 'image_url', 'live_url', 'github_url', 'sort_order'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (req.body.tags !== undefined) updates.tags = JSON.stringify(req.body.tags);

  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE projects SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), req.params.id);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json({ ...updated, tags: JSON.parse(updated.tags || '[]') });
});

// DELETE /api/projects/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true });
});

// POST /api/projects/reorder
router.post('/reorder', authMiddleware, (req, res) => {
  const { order } = req.body; // array of { id, sort_order }
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

  const update = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ? AND user_id = ?');
  const reorderAll = db.transaction((items) => {
    for (const item of items) {
      update.run(item.sort_order, item.id, req.user.id);
    }
  });
  reorderAll(order);
  res.json({ success: true });
});

module.exports = router;
