# 📋 Product Requirement Document (PRD)

## 1. Project Title
**VantagePoint - Premium Freelance Marketplace Platform**

---

## 2. Problem Statement
Traditional freelance platforms often suffer from high transaction fees, cluttered user interfaces, and a lack of focus on high-quality professional aesthetics. Clients struggle to find vetted talent quickly, and freelancers need a secure, premium environment to showcase their expertise and manage projects without unnecessary overhead.

---

## 3. Objectives
*   **Streamline Talent Acquisition**: Provide a focused marketplace where clients can post jobs and hire top-tier freelancers in minutes.
*   **Ensure Payment Security**: Implement a simulated escrow system where funds are held securely and only released upon project approval.
*   **Deliver Premium UI/UX**: Create a modern, dark-themed, and responsive interface that feels professional and production-ready.
*   **Maintain Transparency**: Build a robust rating and review system to ensure accountability and build trust within the community.

---

## 4. Key Features
*   🔐 **Advanced Authentication**: Secure JWT-based login, registration, and integrated **Google SSO** for seamless access.
*   💼 **Job Management**: Complete lifecycle for job postings—from creation and categorization to filtering and status tracking.
*   🤝 **Bidding System**: Dynamic proposal submission for freelancers with the ability for clients to accept/reject bids.
*   📈 **Project Tracking**: Dedicated dashboard for monitoring active projects, submitting work, and client approvals.
*   🛡️ **Escrow Payments**: Simulated financial system to handle budget holding, releasing funds, and transaction history.
*   🌟 **Reputation & Support**: User reviews/ratings and a dedicated support ticket system for handling complaints.

---

## 5. Technologies Used

### Frontend
- **Framework**: React 18 + Vite
- **Navigation**: React Router v6
- **API Client**: Axios (Centralized service)
- **Styling**: Modern Premium CSS (Glassmorphism, Dark Theme)

### Backend
- **Framework**: Python 3.12 + FastAPI
- **ORM**: SQLAlchemy (Async)
- **Security**: JWT (python-jose), Passlib (bcrypt)
- **Google Auth**: Google Auth Library

### Database
- **Development**: SQLite (Zero-config)
- **Production**: PostgreSQL (Docker-ready)

---

## 6. Work Items

*   **Member 1 – Authentication & User Profiles**
    *   Implement user registration and login, allow users to choose client or freelancer role, and build profile creation and profile editing features.
*   **Member 2 – Job Posting & Job Listing**
    *   Create the job posting form for clients, store jobs in the database, and build pages where freelancers can view the list of jobs and job details.
*   **Member 3 – Bidding / Proposal System**
    *   Develop the system where freelancers can submit bids or proposals for jobs, and create a page where clients can view and compare all proposals.
*   **Member 4 – Project Workflow & Work Submission**
    *   Create the project when a freelancer is selected, allow freelancers to submit completed work, and build the client approval or revision system.
*   **Member 5 – Payment & Wallet System**
    *   Implement a simple payment simulation system, handle payment holding and release after approval, and show freelancer earnings history.
*   **Member 6 – Reviews, Testing & GitHub Management**
    *   Build the review and rating system, perform testing and bug fixes, and manage GitHub tasks such as issues, pull requests, documentation, and deployment.

---

> [!NOTE]
> This PRD is the primary reference for the VantagePoint development team. All features and work items must align with the premium, high-quality standard defined here.
