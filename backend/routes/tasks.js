const router = require('express').Router();
const db = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');
router.use(authenticate);

const taskJoin = `SELECT t.*,u.name as assignee_name,u.color as assignee_color,p.name as project_name,c.name as created_by_name
  FROM tasks t LEFT JOIN users u ON u.id=t.assignee_id LEFT JOIN projects p ON p.id=t.project_id LEFT JOIN users c ON c.id=t.created_by`;

router.get('/dashboard', (req,res) => {
  const isAdmin = req.user.role==='Admin';
  const uid = req.user.id;
  const w = isAdmin ? '' : `WHERE assignee_id=${uid}`;
  const wa = isAdmin ? 'WHERE' : `WHERE assignee_id=${uid} AND`;
  const total   = db.prepare(`SELECT COUNT(*) as c FROM tasks ${w}`).get().c;
  const done    = db.prepare(`SELECT COUNT(*) as c FROM tasks ${wa} status='done'`).get().c;
  const inprog  = db.prepare(`SELECT COUNT(*) as c FROM tasks ${wa} status='in-progress'`).get().c;
  const overdue = db.prepare(`SELECT COUNT(*) as c FROM tasks ${wa} due_date < date('now') AND status!='done'`).get().c;
  const projects= db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  const members = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const overdueList = db.prepare(`${taskJoin} WHERE t.due_date<date('now') AND t.status!='done' ${isAdmin?'':'AND t.assignee_id='+uid} LIMIT 5`).all();
  const projectProgress = db.prepare(`SELECT p.id,p.name,p.status,COUNT(t.id) as task_count,SUM(CASE WHEN t.status='done' THEN 1 ELSE 0 END) as done_count FROM projects p LEFT JOIN tasks t ON t.project_id=p.id GROUP BY p.id ORDER BY p.created_at DESC LIMIT 5`).all();
  res.json({ stats:{total,done,inprog,overdue,projects,members}, overdueList, projectProgress });
});

router.get('/', (req,res) => {
  const isAdmin = req.user.role==='Admin';
  const tasks = isAdmin
    ? db.prepare(`${taskJoin} ORDER BY t.created_at DESC`).all()
    : db.prepare(`${taskJoin} WHERE t.assignee_id=? ORDER BY t.created_at DESC`).all(req.user.id);
  res.json(tasks);
});

router.get('/:id', (req,res) => {
  const t = db.prepare(`${taskJoin} WHERE t.id=?`).get(req.params.id);
  if (!t) return res.status(404).json({ error:'Task not found' });
  if (req.user.role!=='Admin'&&t.assignee_id!==req.user.id) return res.status(403).json({ error:'Access denied' });
  res.json(t);
});

router.post('/', adminOnly, (req,res) => {
  const { title,status,priority,due_date,project_id,assignee_id } = req.body;
  if (!title||title.trim().length<2) return res.status(400).json({ error:'Title must be at least 2 characters' });
  if (status&&!['todo','in-progress','done'].includes(status)) return res.status(400).json({ error:'Invalid status' });
  if (priority&&!['low','medium','high'].includes(priority)) return res.status(400).json({ error:'Invalid priority' });
  const r = db.prepare('INSERT INTO tasks (title,status,priority,due_date,project_id,assignee_id,created_by) VALUES (?,?,?,?,?,?,?)')
              .run(title.trim(),status||'todo',priority||'medium',due_date||null,project_id||null,assignee_id||null,req.user.id);
  res.status(201).json(db.prepare(`${taskJoin} WHERE t.id=?`).get(r.lastInsertRowid));
});

router.patch('/:id/status', (req,res) => {
  const { status } = req.body;
  if (!['todo','in-progress','done'].includes(status)) return res.status(400).json({ error:'Invalid status' });
  const t = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error:'Task not found' });
  if (req.user.role!=='Admin'&&t.assignee_id!==req.user.id) return res.status(403).json({ error:'You can only update your own tasks' });
  db.prepare('UPDATE tasks SET status=? WHERE id=?').run(status,req.params.id);
  res.json({...t,status});
});

router.put('/:id', adminOnly, (req,res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error:'Task not found' });
  const { title,status,priority,due_date,project_id,assignee_id } = req.body;
  db.prepare('UPDATE tasks SET title=?,status=?,priority=?,due_date=?,project_id=?,assignee_id=? WHERE id=?')
    .run(title||t.title,status||t.status,priority||t.priority,due_date??t.due_date,project_id??t.project_id,assignee_id??t.assignee_id,req.params.id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id));
});

router.delete('/:id', adminOnly, (req,res) => {
  if (!db.prepare('SELECT id FROM tasks WHERE id=?').get(req.params.id)) return res.status(404).json({ error:'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
  res.json({ message:'Task deleted' });
});

module.exports = router;
