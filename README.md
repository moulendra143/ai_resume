# 🚀 AI Resume Builder & ATS Analyzer

## 📌 Project Title

**AI Resume Builder & ATS Analyzer**

An AI-powered web application that helps job seekers create professional resumes and evaluate them against job descriptions using ATS (Applicant Tracking System) analysis powered by Google Gemini AI.

---

# 📖 Problem Statement

In today's hiring process, most companies use Applicant Tracking Systems (ATS) to filter resumes before they reach recruiters.

Common challenges faced by candidates include:

* Low ATS scores due to missing keywords.
* Poor resume formatting.
* Lack of personalized feedback.
* Difficulty tailoring resumes for specific job descriptions.
* No centralized platform for resume creation and ATS evaluation.

As a result, many qualified candidates are rejected before a recruiter even reviews their resumes.

---

# 💡 Proposed Solution

AI Resume Builder & ATS Analyzer provides a unified platform where users can:

* Build professional resumes.
* Analyze resumes against job descriptions.
* Receive ATS compatibility scores.
* Identify missing keywords.
* Get AI-generated suggestions for improvement.
* Manage resumes and analysis history.

The platform leverages Google Gemini AI to deliver intelligent recommendations and resume optimization insights.

---

# 🎯 Objectives

* Improve resume quality and ATS compatibility.
* Help candidates increase interview opportunities.
* Provide personalized resume feedback.
* Simplify resume creation and management.
* Offer an end-to-end career preparation solution.

---

# ✨ Key Features

## 🔐 Authentication & Security

* User Registration
* Secure Login
* JWT Authentication
* Role-Based Access Control
* Email Verification
* Forgot Password
* Password Reset via OTP
* Secure Logout

---

## 👤 User Module

* Profile Management
* Dashboard Overview
* Resume Management
* Analysis History
* Activity Tracking

---

## 📄 Resume Builder

* Personal Information
* Education
* Experience
* Projects
* Skills
* Certifications
* Achievements
* Resume Versioning

---

## 🤖 AI ATS Analyzer

* Resume Upload
* Job Description Upload/Input
* ATS Match Score
* Keyword Analysis
* Missing Keywords Detection
* Resume Improvement Suggestions
* AI-Powered Feedback

---

## 🛡️ Admin Module

* User Management
* System Monitoring
* Analytics Dashboard
* Activity Logs

---

# 🏗️ System Architecture

```text
┌─────────────────────┐
│      Frontend       │
│ React + Vite + CSS  │
└──────────┬──────────┘
           │ REST API
           ▼
┌─────────────────────┐
│   Spring Boot API   │
│ Authentication      │
│ Resume Services     │
│ ATS Services        │
└──────────┬──────────┘
           │
 ┌─────────┴─────────┐
 ▼                   ▼
MySQL Database   Gemini AI API
(User Data)      (ATS Analysis)
```

---

# 📐 High-Level Architecture Diagram

```text
User
 │
 ▼
Frontend (React)
 │
 ▼
REST Controllers
 │
 ▼
Service Layer
 │
 ├── Authentication Service
 ├── Resume Service
 ├── ATS Analysis Service
 ├── AI Service
 │
 ▼
Repository Layer
 │
 ▼
MySQL Database

AI Service
 │
 ▼
Google Gemini API
```

---

# 🗂️ Repository Structure

```text
AI_Resume/
│
├── backend/
│   ├── src/main/java
│   ├── src/main/resources
│   ├── uploads
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│
├── README.md
├── LICENSE
└── .gitignore
```

---

# ⚙️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* JWT Authentication

## Database

* MySQL

## AI Integration

* Google Gemini API

## Tools & DevOps

* Git
* GitHub
* Maven
* Postman

---

# 🔄 Application Workflow

1. User registers and verifies account.
2. User logs into dashboard.
3. User creates or uploads resume.
4. User provides job description.
5. Resume and JD are sent for analysis.
6. Gemini AI processes content.
7. ATS score is generated.
8. Missing keywords are identified.
9. Suggestions are displayed.
10. Results are stored for future reference.

---

# 🛠️ Installation

## Clone Repository

```bash
git clone https://github.com/moulendra143/ai_resume.git
cd ai_resume
```

---

# ▶️ Backend Setup

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

---

# ▶️ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

Create an application.properties file:

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/ai_resume_db
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Email
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

⚠️ Never commit API keys or secrets to GitHub.

---

# 🚀 Future Enhancements

## Phase 2

* Resume Templates Marketplace
* Resume PDF Export
* Drag & Drop Resume Builder
* Resume Version Comparison

## Phase 3

* AI Cover Letter Generator
* AI Mock Interview Assistant
* Job Recommendation Engine
* LinkedIn Profile Analyzer

## Phase 4

* Multi-language Resume Support
* Voice-Based Resume Creation
* AI Career Roadmap Generator
* Resume Benchmarking Against Industry Standards

---

# 🎯 Expected Impact

* Improve ATS pass rates.
* Increase recruiter visibility.
* Help students and professionals build stronger resumes.
* Reduce manual resume optimization efforts.
* Enhance overall job application success rates.

---

# 🏆 Learning Outcomes

Through this project:

* Full Stack Java Development
* Spring Boot Security
* JWT Authentication
* MySQL Database Design
* REST API Development
* React Frontend Development
* AI Integration using Gemini API
* Production-Level Project Architecture

---

# 📄 License

This project is licensed under the Apache License.

---

# 👨‍💻 Author

**Moulendra Reddy**

Java Full Stack Developer | AI Enthusiast | Problem Solver

GitHub: https://github.com/moulendra143
LinkedIn: Add Your LinkedIn Profile

---

# ✅ Conclusion

AI Resume Builder & ATS Analyzer bridges the gap between resume creation and ATS optimization by combining modern full-stack technologies with AI-driven insights. The platform empowers job seekers to create stronger resumes, improve ATS scores, and increase their chances of securing interviews in a competitive job market.
