# Architecture Overview – FreelanceHub

## High-Level Architecture

```
User's Browser
    │
    ▼
React Frontend (Vite, port 5173)
    │  HTTP requests via Axios (all calls go to /api/*)
    │  Vite proxy forwards to → http://localhost:8000
    ▼
FastAPI Backend (Python, port 8000)
    │  JWT authentication on protected routes
    │  Modular routers: auth, jobs, bids, projects, payments, reviews
    ▼
SQLite (dev) / PostgreSQL (production, port 5432)
    │  Async SQLAlchemy ORM
    │  One shared database with 6 tables
    ▼
Docker Compose (optional – orchestrates all three services)
```

## Layer Descriptions

### 1. React Frontend
- **Tech**: React 18 + Vite + React Router v6 + Axios
- **Responsibility**: All UI pages, forms, and API calls
- **Auth**: Stores JWT in `localStorage`, auto-attaches via Axios interceptor
- **Communication**: Every API call goes to `/api/*`. Vite dev server proxies these to `http://localhost:8000`

### 2. FastAPI Backend
- **Tech**: Python 3.12, FastAPI, SQLAlchemy (async), Uvicorn
- **Responsibility**: Business logic, request validation, database access
- **Auth**: Issues + verifies JWT tokens using `python-jose` and `passlib`
- **Modules**: Each feature area is its own folder with `models.py`, `schemas.py`, `service.py`, `routes.py`

### 3. Database
- **Dev**: SQLite (zero config, file-based)
- **Prod**: PostgreSQL 16 (via Docker or cloud)
- **ORM**: SQLAlchemy async – same code works for both databases

## Module Communication

All modules are **independent routers** registered in `main.py`. They communicate only through shared **SQLAlchemy ORM models** and the **database session**. They do NOT import each other's routes.

```
main.py
  ├── includes auth.routes    → /auth/*
  ├── includes jobs.routes    → /jobs/*
  ├── includes bids.routes    → /bids/*
  ├── includes projects.routes → /projects/*
  ├── includes payments.routes → /payments/*
  └── includes reviews.routes → /reviews/*
```

## Database Relationships

```
users ──< jobs          (one client → many jobs)
jobs  ──< bids          (one job → many bids)
users ──< bids          (one freelancer → many bids)
bids  ──  projects      (one accepted bid → one project)
projects ──  transactions  (one project → one payment)
projects ──< reviews    (one project → up to two reviews)
```

## Request Flow (Example: Submit a Bid)

1. Freelancer fills in `BidFormPage.jsx` and clicks Submit
2. React calls `bidService.submit(data)` → `POST /api/bids`
3. Vite proxy forwards to `POST http://localhost:8000/bids`
4. `bids/routes.py` receives request; `get_current_user` dependency validates the JWT
5. `bids/service.py` validates the job is open, no duplicate bid, then inserts into DB
6. Response returns the created `BidOut` schema as JSON
7. React shows success and redirects back to the job page
