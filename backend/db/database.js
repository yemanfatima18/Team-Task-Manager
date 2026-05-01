const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// ✅ Create DB in root (Railway safe)
const dbPath = path.join(process.cwd(), 'ethara.db');

// create file if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

const db = new Database(dbPath);

// ❌ DO NOT use WAL (causes Railway errors)
// db.pragma('journal_mode = WAL');

db.pragma('foreign_keys = ON');

// ================= TABLES =================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Admin','Member')) DEFAULT 'Member',
    color TEXT DEFAULT '#2563eb',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('active','on-hold','completed')) DEFAULT 'active',
    owner_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('todo','in-progress','done')) DEFAULT 'todo',
    priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
    due_date TEXT,
    project_id INTEGER,
    assignee_id INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  );
`);

// ================= SEED DATA =================
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;

if (userCount === 0) {
  const colors = ['#2563eb','#7c3aed','#0891b2','#16a34a','#dc2626'];

  const insUser = db.prepare(
    'INSERT INTO users (name,email,password,role,color) VALUES (?,?,?,?,?)'
  );

  const admin = insUser.run(
    'Admin User',
    'admin@ethara.com',
    bcrypt.hashSync('admin123', 10),
    'Admin',
    colors[0]
  );

  const member = insUser.run(
    'Member User',
    'member@ethara.com',
    bcrypt.hashSync('member123', 10),
    'Member',
    colors[1]
  );

  const insProject = db.prepare(
    'INSERT INTO projects (name,description,status,owner_id) VALUES (?,?,?,?)'
  );

  const p1 = insProject.run(
    'Website Redesign',
    'Full redesign',
    'active',
    admin.lastInsertRowid
  );

  const insTask = db.prepare(
    'INSERT INTO tasks (title,status,priority,due_date,project_id,assignee_id,created_by) VALUES (?,?,?,?,?,?,?)'
  );

  insTask.run(
    'Setup project',
    'todo',
    'high',
    '2026-05-10',
    p1.lastInsertRowid,
    member.lastInsertRowid,
    admin.lastInsertRowid
  );
}

module.exports = db;