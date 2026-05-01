const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'ethara.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL CHECK(role IN ('Admin','Member')) DEFAULT 'Member',
    color      TEXT DEFAULT '#2563eb',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL CHECK(status IN ('active','on-hold','completed')) DEFAULT 'active',
    owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    status      TEXT NOT NULL CHECK(status IN ('todo','in-progress','done')) DEFAULT 'todo',
    priority    TEXT NOT NULL CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
    due_date    TEXT,
    project_id  INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed only if empty
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const colors = ['#2563eb','#7c3aed','#0891b2','#16a34a','#dc2626'];
  const ins = db.prepare('INSERT INTO users (name,email,password,role,color) VALUES (?,?,?,?,?)');

  const a = ins.run('Alex Admin',  'admin@ethara.com',  bcrypt.hashSync('admin123',10),  'Admin',  colors[0]);
  const m = ins.run('Mia Member',  'member@ethara.com', bcrypt.hashSync('member123',10), 'Member', colors[1]);

  const ip = db.prepare('INSERT INTO projects (name,description,status,owner_id) VALUES (?,?,?,?)');
  const p1 = ip.run('Website Redesign','Full redesign of the company site','active', a.lastInsertRowid);
  const p2 = ip.run('Mobile App','iOS & Android app development','active', a.lastInsertRowid);
  const p3 = ip.run('API Integration','Third-party API connections','on-hold', m.lastInsertRowid);

  const it = db.prepare('INSERT INTO tasks (title,status,priority,due_date,project_id,assignee_id,created_by) VALUES (?,?,?,?,?,?,?)');
  it.run('Design homepage wireframes','done',     'high',  '2026-04-25', p1.lastInsertRowid, m.lastInsertRowid, a.lastInsertRowid);
  it.run('Setup authentication flow', 'in-progress','high','2026-05-05', p1.lastInsertRowid, a.lastInsertRowid, a.lastInsertRowid);
  it.run('Build task list API',       'todo',      'medium','2026-05-10', p2.lastInsertRowid, a.lastInsertRowid, a.lastInsertRowid);
  it.run('Write unit tests',          'todo',      'low',   '2026-04-20', p2.lastInsertRowid, m.lastInsertRowid, a.lastInsertRowid);
  it.run('Deploy to Railway',         'todo',      'high',  '2026-05-15', p1.lastInsertRowid, a.lastInsertRowid, a.lastInsertRowid);
}

module.exports = db;
