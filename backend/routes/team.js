const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');
router.use(authenticate);

router.get('/', (req,res) => {
  res.json(db.prepare(`SELECT u.id,u.name,u.email,u.role,u.color,u.created_at,COUNT(t.id) as task_count,SUM(CASE WHEN t.status='done' THEN 1 ELSE 0 END) as done_count FROM users u LEFT JOIN tasks t ON t.assignee_id=u.id GROUP BY u.id ORDER BY u.created_at ASC`).all());
});

router.post('/', adminOnly, (req,res) => {
  const { name,email,password,role } = req.body;
  if (!name||!email||!password) return res.status(400).json({ error:'Name, email and password are required' });
  if (password.length<6) return res.status(400).json({ error:'Password must be at least 6 characters' });
  if (!['Admin','Member'].includes(role)) return res.status(400).json({ error:'Role must be Admin or Member' });
  if (db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase())) return res.status(409).json({ error:'Email already registered' });
  const colors=['#2563eb','#7c3aed','#0891b2','#16a34a','#dc2626','#d97706','#db2777'];
  const r = db.prepare('INSERT INTO users (name,email,password,role,color) VALUES (?,?,?,?,?)').run(name,email.toLowerCase(),bcrypt.hashSync(password,10),role||'Member',colors[Math.floor(Math.random()*colors.length)]);
  res.status(201).json(db.prepare('SELECT id,name,email,role,color FROM users WHERE id=?').get(r.lastInsertRowid));
});

router.delete('/:id', adminOnly, (req,res) => {
  if (parseInt(req.params.id)===req.user.id) return res.status(400).json({ error:'Cannot remove yourself' });
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(req.params.id)) return res.status(404).json({ error:'User not found' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ message:'Member removed' });
});

module.exports = router;
