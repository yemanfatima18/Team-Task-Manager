const router = require('express').Router();
const db = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');
router.use(authenticate);

router.get('/', (req,res) => {
  const rows = db.prepare(`
    SELECT p.*, u.name as owner_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id=p.id) as task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id=p.id AND t.status='done') as done_count
    FROM projects p LEFT JOIN users u ON u.id=p.owner_id ORDER BY p.created_at DESC`).all();
  res.json(rows);
});

router.get('/:id', (req,res) => {
  const p = db.prepare('SELECT p.*,u.name as owner_name FROM projects p LEFT JOIN users u ON u.id=p.owner_id WHERE p.id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error:'Project not found' });
  res.json(p);
});

router.post('/', adminOnly, (req,res) => {
  const { name, description, status } = req.body;
  if (!name||name.trim().length<2) return res.status(400).json({ error:'Project name must be at least 2 characters' });
  if (status && !['active','on-hold','completed'].includes(status)) return res.status(400).json({ error:'Invalid status' });
  const r = db.prepare('INSERT INTO projects (name,description,status,owner_id) VALUES (?,?,?,?)').run(name.trim(),description||'',status||'active',req.user.id);
  res.status(201).json(db.prepare('SELECT * FROM projects WHERE id=?').get(r.lastInsertRowid));
});

router.put('/:id', adminOnly, (req,res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error:'Project not found' });
  const { name,description,status } = req.body;
  db.prepare('UPDATE projects SET name=?,description=?,status=? WHERE id=?').run(name||p.name,description??p.description,status||p.status,req.params.id);
  res.json(db.prepare('SELECT * FROM projects WHERE id=?').get(req.params.id));
});

router.delete('/:id', adminOnly, (req,res) => {
  if (!db.prepare('SELECT id FROM projects WHERE id=?').get(req.params.id)) return res.status(404).json({ error:'Project not found' });
  db.prepare('DELETE FROM projects WHERE id=?').run(req.params.id);
  res.json({ message:'Project deleted' });
});

module.exports = router;
