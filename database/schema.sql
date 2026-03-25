-- ============================================================
-- Freelance Marketplace Platform - Database Schema
-- ============================================================

-- Users table: stores both clients and freelancers
CREATE TABLE IF NOT EXISTS users (
    user_id     SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('client', 'freelancer')),
    bio         TEXT,
    skills      TEXT,                          -- comma-separated for freelancers
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table: posted by clients
CREATE TABLE IF NOT EXISTS jobs (
    job_id      SERIAL PRIMARY KEY,
    client_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    budget      NUMERIC(12, 2) NOT NULL,
    deadline    DATE NOT NULL,
    status      VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids table: submitted by freelancers on open jobs
CREATE TABLE IF NOT EXISTS bids (
    bid_id          SERIAL PRIMARY KEY,
    job_id          INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    freelancer_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    proposal_text   TEXT NOT NULL,
    bid_amount      NUMERIC(12, 2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (job_id, freelancer_id)              -- one bid per freelancer per job
);

-- Projects table: created when a bid is accepted
CREATE TABLE IF NOT EXISTS projects (
    project_id      SERIAL PRIMARY KEY,
    job_id          INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    client_id       INTEGER NOT NULL REFERENCES users(user_id),
    freelancer_id   INTEGER NOT NULL REFERENCES users(user_id),
    status          VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'work_submitted', 'approved', 'disputed', 'completed')),
    work_notes      TEXT,                       -- notes from freelancer when submitting
    start_date      DATE DEFAULT CURRENT_DATE,
    end_date        DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table: simulated payment records
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id  SERIAL PRIMARY KEY,
    project_id      INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    client_id       INTEGER NOT NULL REFERENCES users(user_id),
    freelancer_id   INTEGER NOT NULL REFERENCES users(user_id),
    amount          NUMERIC(12, 2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'refunded')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table: submitted after project completion
CREATE TABLE IF NOT EXISTS reviews (
    review_id       SERIAL PRIMARY KEY,
    project_id      INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    reviewer_id     INTEGER NOT NULL REFERENCES users(user_id),
    reviewee_id     INTEGER NOT NULL REFERENCES users(user_id),
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, reviewer_id)            -- one review per reviewer per project
);

-- ============================================================
-- Sample Seed Data
-- ============================================================

-- Passwords are hashed with bcrypt (plaintext: "password123")
INSERT INTO users (name, email, password_hash, role, bio, skills) VALUES
('Alice Johnson', 'alice@example.com', '$2b$12$examplehash1', 'client',  'Startup founder building SaaS products.', NULL),
('Bob Smith',     'bob@example.com',   '$2b$12$examplehash2', 'freelancer', 'Full-stack dev with 3 yrs exp.', 'Python,React,PostgreSQL'),
('Carol White',   'carol@example.com', '$2b$12$examplehash3', 'client',  'Small business owner.', NULL),
('Dave Brown',    'dave@example.com',  '$2b$12$examplehash4', 'freelancer', 'UI/UX designer and frontend dev.', 'React,CSS,Figma');

INSERT INTO jobs (client_id, title, description, budget, deadline, status) VALUES
(1, 'Build a REST API', 'Need a FastAPI backend for a todo app with auth and CRUD.', 500.00, '2026-04-01', 'open'),
(3, 'Design Landing Page', 'Modern landing page for my bakery business.', 200.00,  '2026-03-20', 'open');
