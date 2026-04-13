# Personal Finance Tracker + AI Agent

Render-ready full-stack fintech dashboard built with React, Tailwind, Recharts, Express, and MongoDB Atlas (with in-memory fallback).

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, Recharts
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas (fallback to in-memory data if unavailable)

## Project Structure

- `frontend/`
- `backend/`
- `render.yaml`

## Features

- Full CRUD transactions: add, edit, delete, list
- Filters: category, date range, type
- Fields: amount, type, category, date, notes
- Dashboard metrics: balance, income, expense, savings
- Charts: pie, bar, monthly trend
- AI assistant panel + `/api/ai/chat`
- Budget tracking, notifications, CSV export
- Dark/light mode + glassmorphism UI
- Auth (signup/login) with user-specific data isolation

## API Endpoints

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Analytics
- `GET /api/analytics/summary`
- `GET /api/analytics/categories`
- `GET /api/analytics/trends`

### AI
- `POST /api/ai/chat`

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

## Environment Variables

### Backend (`backend/.env`)
```bash
PORT=4000
MONGO_URI=your_mongodb_atlas_connection
JWT_SECRET=replace-with-strong-secret
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL=http://localhost:4000
```

For Render frontend deployment:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

## Local Run

### Backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

## Render Deployment

### Backend service
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`

### Frontend static site
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_URL=https://your-backend.onrender.com`

`render.yaml` is included at project root for optional blueprint deployment.
