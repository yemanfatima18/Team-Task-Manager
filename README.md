# Team-Task-ManagerTeam Task Manager (Ethara Project)

About the Project
This is a full-stack web application where teams can manage their work
easily.
Users can create projects, assign tasks, and track progress in one
place.

The main goal of this project is to make teamwork simple and organized.

Features

-   User signup and login
-   Create and manage projects
-   Add team members
-   Create and assign tasks
-   Track task status (pending, in progress, completed)
-   Dashboard to see progress and overdue tasks
-   Role-based access:
    -   Admin → full control
    -   Member → only their tasks

Tech Stack

Frontend: React (Vite)
Backend: Node.js + Express
Database: SQLite
Authentication: JWT + bcrypt

How to Run the Project

Step 1: Backend
cd backend
npm install
npm run dev

Backend runs on:
http://localhost:5000

Step 2: Frontend
cd frontend
npm install
npm run dev

Frontend runs on:
http://localhost:5173

Demo Login

Admin:
email: admin@ethara.com
password: admin123

Member:
email: member@ethara.com
password: member123

API Endpoints

Authentication: POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me

Projects: GET /api/projects
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id

Tasks: GET /api/tasks
GET /api/tasks/dashboard
POST /api/tasks
PATCH /api/tasks/:id/status
DELETE /api/tasks/:id

Team: GET /api/team
POST /api/team
DELETE /api/team/:id

Why this Project

This project helps teams stay organized, track work easily, and improve
productivity.

