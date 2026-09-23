# Planora - Next-Gen Intelligent Learning Management Workspace (v1.5.0)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%20Flash-orange.svg)](https://ai.google.dev/)
[![Version](https://img.shields.io/badge/version-1.5.0-indigo.svg)](package.json)

**Planora** is an end-to-end full-stack Academic Planning and Learning Management System (LMS) designed for modern students, software engineers, and educators. Built with an execute-first, type-safe architecture, Planora seamlessly unifies coursework tracking, intelligent timetable scheduling, deadline management, milestone goals, and AI-assisted study guidance into one cohesive workspace.

---

## 📑 Table of Contents

- [Overview & Key Highlights](#overview--key-highlights)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Core Features & Modules](#core-features--modules)
- [Authentication & Security Standards](#authentication--security-standards)
- [Tech Stack](#tech-stack)
- [Getting Started & Installation](#getting-started--installation)
- [Environment Configuration](#environment-configuration)
- [Database & Seed Data Guide](#database--seed-data-guide)
- [Default Demo Accounts](#default-demo-accounts)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## 🚀 Overview & Key Highlights

- **Unified Full-Stack Architecture**: Single-repository setup with React 19 on Vite powering the frontend and Express 5 on Node.js running the backend under `tsx`.
- **Gemini AI Integration**: Embedded Google GenAI assistant capable of decomposing complex projects into actionable 30-minute steps, debugging algorithmic code, and answering academic questions.
- **Bi-directional Timetable Synchronization**: Updating a course's schedule automatically reflects in the visual timetable with zero duplicate entries.
- **Enterprise-Grade Password Policy**: Enforces strict password criteria (minimum 8 characters, uppercase letter, number, and special character such as `@`).
- **Real-World Email OTP Reset**: Nodemailer-powered password recovery flow with one-time 6-digit verification codes and development email inbox previews.
- **Dual Persistence Strategy**: Native MongoDB (Mongoose ODM) with an automatic in-memory fallback for instant setup without external database dependencies.
- **Accessible & Adaptive UI**: Modern Tailwind CSS v4 styling, comprehensive Dark and Light mode support, and built-in bilingual localization (English and Vietnamese).

---

## 🏗️ System Architecture

Planora follows strict **Separation of Concerns (SoC)** and **Single Responsibility Principle (SRP)**:

```text
┌────────────────────────────────────────────────────────┐
│             Client Layer (React 19 + Vite)             │
│   • App Split Views (Landing, Auth, Main LMS Workspace)│
│   • Feature Modules (Courses, Timetable, Tasks, AI)    │
│   • Context Providers (Auth, Theme, Toast, Language)   │
└───────────────────────────┬────────────────────────────┘
                            │ RESTful JSON API
                            ▼
┌────────────────────────────────────────────────────────┐
│            Server Layer (Express 5 + TypeScript)       │
│   • Central Router & Modular Sub-routes                │
│   • JWT Authentication & Role-Based Access Control     │
│   • Password Policy Validator & Bcrypt/SHA Hashing     │
│   • Nodemailer Email Service (SMTP & Ethereal)         │
│   • Global Error Handling & Centralized Logging        │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     MongoDB (Mongoose)    │ │   Resilient Memory Store  │
│  Production Data Storage  │ │   Development & Fallback  │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 📁 Project Directory Structure

```text
planora/
├── docs/                               # System architecture & database documentation
│   ├── ARCHITECTURE.md                 # Full-stack architectural guidelines and flows
│   ├── API_SPEC.md                     # RESTful API specification and schemas
│   └── DATABASE_SCHEMA.md              # MongoDB collections and Mongoose models
├── server/                             # Backend application source code
│   ├── config/
│   │   └── db.ts                       # Database connection & memory store bootstrap
│   ├── errors/
│   │   └── apiError.ts                 # Standardized operational error classes
│   ├── middlewares/
│   │   └── errorHandler.ts             # Global error interceptor & error-logging
│   ├── models/                         # Mongoose ODM schema models
│   │   ├── course.model.ts             # Courses collection
│   │   ├── error.model.ts              # System error logs collection
│   │   ├── goal.model.ts               # Learning goals collection
│   │   ├── note.model.ts               # Markdown notes collection
│   │   ├── task.model.ts               # Tasks & deadlines collection
│   │   ├── timetable.model.ts          # Timetable schedule collection
│   │   └── user.model.ts               # User accounts & credentials collection
│   ├── modules/                        # Domain-driven feature route handlers
│   │   ├── ai/                         # Google Gemini AI integration routes
│   │   ├── auth/                       # Sign in, sign up, OTP reset, user manager
│   │   ├── courses/                    # Course CRUD & syllabus endpoints
│   │   ├── errors/                     # Administrative error log viewing & resolution
│   │   ├── goals/                      # Goals & study hours progress endpoints
│   │   ├── notes/                      # Notes management endpoints
│   │   ├── sync/                       # System backup & data synchronization
│   │   ├── tasks/                      # Task Kanban & subtask generator endpoints
│   │   ├── timetable/                  # Timetable scheduling endpoints
│   │   └── upload/                     # File attachments & material upload routes
│   ├── seed/                           # Independent sample data files
│   │   ├── sampleData.json             # Decoupled seed data (can be deleted safely)
│   │   └── seedRunner.ts               # Standalone database population runner
│   ├── services/
│   │   └── emailService.ts             # Nodemailer OTP email transmission service
│   ├── types/
│   │   └── index.ts                    # Server-side TypeScript interface declarations
│   ├── utils/
│   │   └── passwordValidator.ts        # Server-side password policy verification
│   └── routes.ts                       # Master API router aggregating all modules
├── src/                                # Frontend React application source code
│   ├── components/                     # Reusable layout & common UI components
│   │   ├── common/                     # Logo, buttons, theme toggles, badges
│   │   ├── layout/                     # Sidebar, Header, UserMenu, NotificationPopover
│   │   └── modals/                     # Privacy policy, terms, confirmation dialogs
│   ├── context/                        # React context state management
│   │   ├── AuthContext.tsx             # Authentication, session, & profile state
│   │   ├── LanguageContext.tsx         # Bilingual i18n localization (EN / VI)
│   │   ├── ThemeContext.tsx            # Dark / Light theme provider
│   │   └── ToastContext.tsx            # Global notification system
│   ├── features/                       # Feature-based view components
│   │   ├── admin/                      # Admin user management & privilege control
│   │   ├── ai/                         # Interactive Gemini AI academic assistant
│   │   ├── auth/                       # Split-screen login, register, & OTP forgot flows
│   │   ├── courses/                    # Courses grid, course detail modal, metrics
│   │   ├── dashboard/                  # Productivity dashboard, streak, study statistics
│   │   ├── errorReports/               # System error monitoring and diagnostic tools
│   │   ├── goals/                      # Long-term goals & habit tracker
│   │   ├── landing/                    # Public landing showcase page
│   │   ├── notes/                      # Markdown notes editor & tag categorizer
│   │   ├── notifications/              # Central notifications management center
│   │   ├── settings/                   # User preferences & platform settings
│   │   ├── structure/                  # Interactive visual project structure
│   │   ├── tasks/                      # Kanban tasks board & AI task decomposition
│   │   └── timetable/                  # Weekly schedule view & timetable organizer
│   ├── services/
│   │   └── api.ts                      # Client-side HTTP API client with auth tokens
│   ├── utils/
│   │   ├── courseTimetableSync.ts      # Bi-directional course-timetable sync logic
│   │   └── passwordValidator.ts        # Client-side real-time password policy checker
│   ├── types.ts                        # Shared frontend TypeScript types
│   ├── App.tsx                         # Root router & view coordinator
│   ├── index.css                       # Global styles & Tailwind CSS v4 definitions
│   └── main.tsx                        # Client browser entry point
├── .env.example                        # Environment variable template
├── metadata.json                       # AI Studio applet configuration metadata
├── package.json                        # Project dependencies and script declarations
├── server.ts                           # Express server integrating Vite middlewares
├── tsconfig.json                       # TypeScript compiler configuration
└── vite.config.ts                      # Vite build and asset pipeline setup
```

---

## ⚡ Core Features & Modules

### 1. Course Management & Timetable Synchronization
- Maintain comprehensive records for each registered subject: Course Code, Instructor, Room, Credits, Semester, and Schedule.
- Built-in `courseTimetableSync` engine automatically updates the visual weekly timetable whenever course schedule strings change (e.g. `Thứ 2 (07:30 - 09:30)`).
- Course details modal allows managing uploaded lecture slides, PDF books, lab repositories, and grading weights.

### 2. Intelligent AI Assistant (Google Gemini)
- **Task Decomposition**: Break down high-level project goals (e.g., "Build E-Commerce Backend") into realistic 30-minute milestones with priority tags.
- **Code Debugger & Algorithm Explainer**: Analyze stack traces, syntax errors, and calculate Big-O algorithmic complexity across TypeScript, Python, and C++.
- **Socratic Tutor**: Guides students through academic concepts step-by-step rather than simply providing raw answers.

### 3. Task Management & Deadlines
- Organize assignments across statuses: `Todo`, `In Progress`, and `Done`.
- Assign urgency levels (`High`, `Medium`, `Low`) with automatic countdown indicators for approaching deadlines.
- Associate tasks directly with parent courses.

### 4. Notes & Study Goal Tracking
- Full-featured Markdown notes editor with syntax styling, tags, and course affiliations.
- Set targeted study hours and track completed intervals with Pomodoro integration.
- Daily study streak counter to encourage consistent learning habits.

### 5. Administrative Control Center
- Dedicated user management dashboard accessible to users with the `admin` role.
- Real-time online status indicators, active sessions, and student registration details.
- Centralized system diagnostic log viewer with one-click resolution.

---

## 🛡️ Authentication & Security Standards

Planora v1.5.0 implements a secure authentication flow:

### Password Policy Requirements
All passwords must satisfy four verification checks:
1. **Minimum Length**: At least 8 characters.
2. **Uppercase Letter**: Contains at least one uppercase alphabetic character (`A-Z`).
3. **Number**: Contains at least one numerical digit (`0-9`).
4. **Special Character**: Contains at least one special symbol (e.g., `@`, `#`, `$`, `%`, `!`, `*`).

### Real-World Email OTP Password Reset
1. Users enter their registered email address on the password recovery screen.
2. The backend generates a cryptographically random 6-digit numeric OTP valid for 15 minutes.
3. An email is dispatched via `nodemailer`. In development, an automated Ethereal mail session is provisioned with a direct inspection link.
4. Users verify the OTP and submit a new password adhering to the security policy.

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Modern UI library with concurrent rendering |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | Strict type safety across client and server |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation CSS framework with CSS variables |
| **Icons & Motion** | [Lucide React](https://lucide.dev/) / Motion | Consistent UI icons and smooth animations |
| **Backend Framework** | [Express 5](https://expressjs.com/) | High-performance RESTful API microservice |
| **Database** | [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/) | NoSQL database with strict schemas |
| **AI SDK** | [@google/genai](https://www.npmjs.com/package/@google/genai) | Official Google Gemini API TypeScript SDK |
| **Email Service** | [Nodemailer](https://nodemailer.com/) | Real SMTP and test email dispatcher |
| **Build & Dev Tooling** | [Vite 6](https://vitejs.dev/) / [tsx](https://github.com/privatenumber/tsx) | Rapid Hot Module Replacement and execution |

---

## 🛠️ Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `yarn` / `pnpm`)
- *(Optional)* **MongoDB**: Local MongoDB instance or Docker installed

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/planora-lms.git
   cd planora-lms
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   *(Review and adjust parameters as described in the Environment Configuration section).*

4. **Launch the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Port
PORT=3000

# MongoDB Connection String (Optional: falls back to in-memory store if unset)
MONGODB_URI=mongodb://localhost:27017/planora_lms

# JWT Secret Key for Session Signatures
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API Key (Required for AI Assistant features)
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP Email Configuration (Optional: defaults to Ethereal mock inbox for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Planora Workspace <no-reply@planora.edu.vn>"
```

---

## 🗄️ Database & Seed Data Guide

Planora isolates all demo mock records in a single decoupled JSON file:
👉 `server/seed/sampleData.json`

### Populating MongoDB with Sample Data

Run the database seeder:
```bash
npm run seed
# or
npm run db:seed
```

The script connects to your configured `MONGODB_URI`, validates collection schemas, and upserts:
- Pre-configured user accounts (Admin, Students, Tester).
- Standard university courses with full syllabi.
- Tasks, Kanban items, and subtasks.
- Timetable weekly schedule slots.
- Markdown notes and categorized study goals.

> **Clean Architecture Note**: You can safely delete `server/seed/sampleData.json` once the database has been seeded without breaking any production application code.

---

## 🔑 Default Demo Accounts

For immediate testing, the following accounts are pre-configured in the platform:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `systemadmin@gmail.com` | `@Systemadmin` | Full system control, user management, error diagnostics |
| **Test Member** | `Tester123@gmail.com` | `Password123@` | Dedicated testing student account meeting strict password policy |
| **Student** | `hocvien@planora.edu.vn` | `@Hocvien123` | Standard student workspace, coursework, AI tutor |

---

## 📜 Available Scripts

In the project root, you can execute:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express backend and mounts Vite dev middlewares on port 3000 |
| `npm run build` | Compiles client assets via Vite and bundles `server.ts` into `dist/server.cjs` |
| `npm run start` | Executes the production-bundled server (`node dist/server.cjs`) |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to validate type contracts |
| `npm run seed` | Seeds MongoDB with sample courses, users, and schedules |
| `npm run preview` | Previews the compiled production build locally |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Contributions, bug reports, and feature proposals are welcome!
