<<<<<<< HEAD
# ⬡ Ethara – Team Task Manager

Full-stack web app: React + Node/Express + SQLite. Deploy-ready on Railway.

## Tech Stack
- **Frontend**: React 18, Vite, React Router
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3) — proper schema + foreign keys
- **Auth**: JWT + bcrypt

## Requirements Covered
| Requirement | Implementation |
|---|---|
| Authentication (Signup/Login) | JWT tokens, bcrypt hashing, email+password validation, confirm password |
| Project & team management | Full CRUD with role-based guards |
| Task creation, assignment & status | Assignee, project, priority, due date, status cycling |
| Dashboard | Live stats, overdue tasks, project progress bars |
| REST APIs | 13 endpoints across auth/projects/tasks/team |
| Database SQL | SQLite with FK constraints and seed data |
| Validations | Server-side + client-side on every form |
| Role-based access | Admin = full access, Member = own tasks only |

## Run Locally (VS Code)

**Step 1 — Fix Windows build issue (run once):**
```
npm install --global windows-build-tools
```
Or in Visual Studio Installer, add "Desktop development with C++" workload.

**Step 2 — Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```
Should show: `✅  Ethara API → http://localhost:5000`

**Step 3 — Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
Open: `http://localhost:5173`

**Demo Accounts:**
- Admin: `admin@ethara.com` / `admin123`
- Member: `member@ethara.com` / `member123`

## REST API Reference

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/projects
POST   /api/projects          [Admin]
PUT    /api/projects/:id      [Admin]
DELETE /api/projects/:id      [Admin]

GET    /api/tasks
GET    /api/tasks/dashboard
POST   /api/tasks             [Admin]
PATCH  /api/tasks/:id/status  [Assignee or Admin]
DELETE /api/tasks/:id         [Admin]

GET    /api/team
POST   /api/team              [Admin]
DELETE /api/team/:id          [Admin]
```

## Deploy on Railway
1. Push to GitHub
2. New Project → Deploy from GitHub
3. Railway reads `railway.toml` automatically
4. Set env var: `JWT_SECRET=your_secret_here`
5. Done — live at `https://your-app.railway.app`

## Database Schema
```sql
users    (id, name, email, password, role CHECK IN ('Admin','Member'), color, created_at)
projects (id, name, description, status CHECK IN ('active','on-hold','completed'), owner_id→users, created_at)
tasks    (id, title, status CHECK IN ('todo','in-progress','done'), priority CHECK IN ('low','medium','high'),
          due_date, project_id→projects, assignee_id→users, created_by→users, created_at)
```
=======
# Team-Task-Manager
>>>>>>> 071aaa84501bd6a6f0dcc970980f6f08c511b5ce
