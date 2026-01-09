# CivicPulse Hub – Unified Smart City Feedback System

CivicPulse Hub is a modern, full-stack smart city management platform designed to bridge the gap between citizens and local government. It streamlines the process of reporting, tracking, and resolving urban issues through an intelligent, role-based workflow.

## 🌟 Key Modules & Features

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC)**: Secure access for **Citizens**, **Officers**, and **Admins**.
- **JWT Authentication**: Secure, stateless token-based authentication.
- **Officer Verification**: Multi-step onboarding process requiring Admin approval and a secure Secret Key for officer logins.
- **Secure Storage**: BCrypt hashing for passwords and sensitive keys.

### 📝 Complaint Management Module
- **Intuitive Filing**: Citizens can report issues with descriptions, departments, and geographic locations.
- **Photo Support**: Upload visual evidence (photos) directly with complaints.
- **Smart Assignment**: Admins can assign complaints to the most suitable officers based on current **Workload Awareness** (least busy officers recommended first).
- **Duplicate Detection**: automatic identification of similar reports to reduce redundancy.
- **Progress Tracking**: Real-time visual tracker for citizens to monitor their complaint's journey from "Pending" to "Resolved".

### ⚖️ Workload & Escalation System
- **Priority-Based SLAs**: Automatic deadline calculation based on priority (High: 48h, Medium: 96h, Low: 168h).
- **Automated Escalation**: Hourly background jobs identify overdue tasks and escalate them to Admin oversight.
- **Workload Balancing**: Real-time monitoring of officer task loads to ensure efficient distribution.
- **Audit Trail**: Full escalation history tracking for every complaint.

### 💬 Feedback & Validation Module
- **Proof of Work**: Officers must upload visual proof and descriptions before marking a task as resolved.
- **Admin Validation**: Multi-stage verification where Admins review officer submissions before final resolution.
- **Citizen Rating System**: Multi-faceted feedback loop including 1-5 star ratings and detailed comments.
- **Satisfaction Tracking**: Citizens can explicitly mark their satisfaction and trigger complaint **Reopening** if the resolution is unsatisfactory.
- **Performance Analytics**: Real-time rating statistics and feedback summaries for officers.

---

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security 6 & JWT
- **Database**: PostgreSQL
- **ORM**: JPA / Hibernate
- **Tools**: Lombok, Maven

### Frontend
- **Library**: React 18.2.0
- **Build Tool**: Vite
- **Styling**: Modern Vanilla CSS with Glassmorphism & Animations
- **Utilities**: Axios, React Router 6, React Toastify

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- PostgreSQL 12+
- Node.js 16+ & npm
- Maven 3.6+

### Quick Setup

1. **Database Setup**
   - Create a PostgreSQL database: `civicpulse_db`
   - Update `src/main/resources/application.properties` with your credentials.

2. **Backend Execution**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *Runs on http://localhost:8080*

3. **Frontend Execution**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on http://localhost:3000*

4. **Default Admin Credentials**
   - **Email**: `admin@civicpulse.com`
   - **Password**: `Admin@123`

---

## 📁 Project Structure

```text
CivicPulse/
├── src/main/java/com/project/
│   ├── auth/             # JWT, RBAC, and User Management
│   ├── complaint/        # Complaint logic, Escalations, and Feedback
│   └── config/           # Security and App configurations
├── frontend/
│   ├── src/
│   │   ├── components/   # UI Components (Dashboards, Forms, Modals)
│   │   ├── services/     # API Integration (Axios)
│   │   └── context/      # Auth State Management
└── uploads/              # Storage for complaint photos and proof-of-work
```

---

## 📈 API Overview

### Authentication
- `POST /auth/signup` - Register a new Citizen or Officer
- `POST /auth/login` - Secure login for all roles

### Admin Operations
- `GET /admin/officers/pending` - List officers awaiting approval
- `POST /admin/officers/{id}/approve` - Approve officer and generate Secret Key
- `GET /api/complaints/officers/workload` - Monitor staff workload

### Complaint Workflow
- `POST /api/complaints` - File a new complaint (Multipart/Form-Data)
- `PUT /api/complaints/{id}/assign` - Assign to officer with priority/deadline
- `POST /api/complaints/{id}/proof` - Upload officer proof of work
- `POST /api/complaints/{id}/validate` - Final Admin approval of resolution
- `POST /api/complaints/{id}/rate` - Citizen feedback submission
- `POST /api/complaints/{id}/reopen` - Re-active a resolved issue

---

## 📄 Documentation Links
- [Detailed Setup Guide](./SETUP_GUIDE.md)
- [PostgreSQL Configuration](./POSTGRESQL_SETUP.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)

---
© 2024 CivicPulse Hub. All rights reserved.

