# Nexlance - Freelance Marketplace Platform

A professional, industry-standard freelance marketplace platform where **Clients** post high-quality projects and **Freelancers** compete to deliver excellence. Designed with a modern, premium dark-themed glassmorphic aesthetic and built on a robust, asynchronous architecture.

Built with **FastAPI + React + PostgreSQL** by a dedicated team of engineers.

---

## 🏗️ System Architecture

Nexlance follows a modern micro-monolith approach with a clear separation between the presentation layer and the business logic.

```text
Browser → React (Vite, :5173) → FastAPI (:8000) → PostgreSQL (Primary) / SQLite (Dev)
```

- **Frontend**: React 18 + Vite + React Router v6 + Axios (Centralized Service)
- **Backend**: Python 3.12, FastAPI, SQLAlchemy (Asynchronous), JWT Authentication
- **Database**: 
  - **PostgreSQL**: Primary production-grade database for high-concurrency and data integrity.
  - **SQLite**: Lightweight, zero-config option for local architectural testing and rapid development.
- **Security**: Advanced JWT-based authorization and Google SSO integration.

## 📁 Project Structure

```text
freelance-marketplace-platform/
├── backend/                   # Asynchronous FastAPI Service
│   ├── main.py                # Entry point & Router Registry
│   ├── database.py            # SQLAlchemy Async Engine & Session Orchestration
│   ├── config.py              # Pydantic-based Environment Management
│   ├── requirements.txt       # Backend Dependencies
│   ├── auth/                  # Advanced Identity & Access Management
│   ├── jobs/                  # Job Lifecycle & Discovery
│   ├── bids/                  # Competitive Proposal System
│   ├── projects/              # Active Workflow & Delivery Management
│   ├── messages/              # Direct User-to-User Messaging
│   ├── payments/              # Simulated Escrow & Security System
│   ├── reviews/               # Reputation & Rating Module
│   ├── notifications/         # Real-time User Alert System
│   └── support/               # Complaints & Ticket Management
├── frontend/                  # Responsive React Application
│   ├── src/
│   │   ├── pages/             # Feature-driven page components
│   │   ├── components/        # Reusable UI Library (Navbar, Cards, Modals)
│   │   ├── services/api.js    # Optimized Axios API Client
│   │   ├── context/           # Global State Management (Auth, Theme)
│   │   ├── App.jsx            # Router Configuration
│   │   └── main.jsx           # Application Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/schema.sql        # Core DDL & Data Seeding
├── docs/                      # Technical Documentation & Workflow Guides
├── tests/                     # Automated Pytest Integration Suite
├── .env.example               # Configuration Template
└── docker-compose.yml         # Containerized Environment Orchestration
```

---

## 🚀 Deployment & Quick Start

### 1. Backend Initialization

```bash
cd backend

# 1. Environment Setup
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Dependency Installation
pip install -r requirements.txt

# 3. Configuration
cp ../.env.example .env

# 4. Service Launch
  uvicorn main:app --reload
# → API: http://localhost:8000
# → Docs: http://localhost:8000/docs
```

### 2. Frontend Initialization

```bash
cd frontend

# 1. Install Dependencies
npm install

# 2. Launch Dev Server
npm run dev
# → Client: http://localhost:5173
```

---

## 🗄️ Database Strategy: PostgreSQL

Nexlance is optimized for **PostgreSQL** to handle production-level transaction volumes.

### 1. Instance Configuration

#### **🐧 Linux / Ubuntu**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo service postgresql start

# Create the Nexlance Instance
sudo -u postgres psql
# CREATE USER nexlance_user WITH PASSWORD 'nexlance_secure_password';
# CREATE DATABASE nexlance_db OWNER nexlance_user;
```

#### **🪟 Windows**
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/).
2. Run SQL Shell (psql) or pgAdmin:
```sql
CREATE DATABASE nexlance_db;
CREATE USER nexlance_user WITH PASSWORD 'nexlance_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nexlance_db TO nexlance_user;
```

### 2. Integration & Migration
Update your `backend/.env` and execute the migration script to synchronize models:
```bash
cd backend
python migrate_to_postgres.py
```

---

## 🐳 Docker Deployment (Recommended)

Streamline your environment setup with a single command:
```bash
docker compose up --build
```
*Note: This automatically orchestrates the FastAPI service, React frontend, and a PostgreSQL container.*

---

## 📡 Specialized API Reference

Interactive documentation is available at **http://localhost:8000/docs**.

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Auth** | POST | `/auth/login` | Secure JWT Session Generation |
| **Jobs** | GET | `/jobs` | Optimized Job Querying & Filtering |
| **Bids** | POST | `/bids` | Proposal Submission for Freelancers |
| **Projects**| PUT | `/projects/{id}/approve` | Client-Side Project Finalization |
| **Payments**| GET | `/payments/history` | Financial Transaction Logs |
| **Support** | POST | `/support/tickets` | Conflict Resolution & Complaints |
| **Alerts**  | GET | `/notifications` | Personalized User Alert Stream |

---

## 🧪 Testing Protocol

Ensure system stability by running the automated suite:
```bash
cd backend
pytest ../tests/ -v
```

---

## 🗄️ Database Schema Overview

| Table | Purpose |
|-------|---------|
- **Architecture Guide**: [docs/architecture.md](docs/architecture.md)
- **GitHub Workflow**: [docs/github_workflow.md](docs/github_workflow.md)
