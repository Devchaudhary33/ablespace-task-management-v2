# AbleSpace Task Management

Full-stack task-management application using **Next.js + TypeScript**, **NestJS + MongoDB/Mongoose**, JWT authentication and a responsive workspace UI.

## Folder structure

```text
ablespace-task-management/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── teams/
│   │   └── users/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Requirements

- Node.js 20+
- npm 10+
- MongoDB Atlas or local MongoDB

## 1. Backend setup

Open PowerShell in the project root:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set your MongoDB URI and JWT secret.

Start the API:

```powershell
npm run start:dev
```

API: `http://localhost:3001/api`

### Seed demo data

With `backend/.env` configured:

```powershell
npm run seed
```

Demo login:

```text
Email:    demo@ablespace.dev
Password: Demo@12345
```

## 2. Frontend setup

Open a second PowerShell window:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`

## Features

- JWT authentication
- Registration and guest/demo login
- Task CRUD
- Four-column Kanban board
- Task list view
- Search, priority and status filters
- Task assignment and projects
- Due dates and labels
- Subtasks with completion state
- Task comments with ownership-protected deletion
- Project CRUD
- Teams and member/lead display
- Profile editing
- Light/dark theme
- Six persistent accent themes
- Responsive mobile navigation
- MongoDB/Mongoose persistence
- DTO validation and REST API
- Demo seed data

## Build checks

Run these locally after `npm install`:

```powershell
cd backend
npm run build

cd ..\frontend
npm run lint
npm run build
```

The repository intentionally does **not** include `node_modules` or real `.env` files.
