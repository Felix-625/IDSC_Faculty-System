# IDSC Portal – Faculty System Frontend

A high-performance university portal built for **Faculty Members** and the **Dean** at IDSC (Infotech Development Systems Colleges).

The frontend adheres strictly to the Figma design system ("Faculty System Prototype", file key `nK4sPUGcSBm4KJddZgkpD5`) and interfaces directly with the university backend API (`http://localhost:5000/api/v1`).

---

## 1. Tech Stack & Architecture

- **Framework**: React 19 + Vite 8 (Plain JavaScript JSX)
- **Routing**: `react-router-dom` (v7)
- **Data Fetching & Caching**: `@tanstack/react-query`
- **Iconography**: `lucide-react`
- **Typography**: `@fontsource/inter` (Inter font family across all components)
- **Styling**: Pure **CSS Modules** + CSS custom properties design tokens (`src/styles/tokens.css`). Zero Tailwind, zero external component libraries.
- **HTTP Client**: Lightweight custom `fetch` wrapper (`src/api/client.js`) with RFC 7807 Problem Details parsing, token management, and auto-logout on `401`.

---

## 2. Quick Start & Setup

### Prerequisites
- Node.js 18+ installed
- Backend API server running on `http://localhost:5000` (docs available at `http://localhost:5000/docs`)

### Installation & Development
```bash
# Navigate to the frontend directory
cd frontend

# Install runtime and dev dependencies
npm install

# Start the Vite development server (runs on port 5173 by default)
npm run dev

# Run ESLint validation
npm run lint

# Build for production
npm run build
```

---

## 3. Environment Variables

Configure application settings in `frontend/.env` (or copy from `.env.example`):

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | Root URL for backend REST endpoints |
| `VITE_USE_MOCKS_FOR_MISSING_API` | `true` | Enables in-memory mock store for un-backed resources (Programs & Sections) |
| `VITE_ACADEMIC_SEMESTER` | `1st Semester` | Current active academic semester |
| `VITE_ACADEMIC_YEAR` | `2026-2027` | Current active academic year |

---

## 4. Demo Accounts & Authentication

The authentication system verifies credentials against `POST /auth/login` and stores the 1-hour JWT token in `sessionStorage`. A live session countdown timer is displayed in the dashboard header; upon expiration (`401`), the session is cleared and the user is redirected to `/login` with an expiration notice.

| Role | Faculty ID | Password | Access Level |
|---|---|---|---|
| **Dean** | `FAC-2026-001` (Maria Dela Cruz) | `Password123!` | Full Dean Management + Instructor Menu |
| **Faculty** | `FAC-2026-002` (Juan Reyes) | `Password123!` | Instructor Menu only (403 on Dean routes) |

> **Note**: In development mode (`import.meta.env.DEV`), a collapsible "Demo Accounts" drawer is available on the login page for one-click credential autofill.

---

## 5. Site Map & Application Routes

### Public Routes
- `/login` — Secure portal login with error banners and dev demo credential autofill.
- `*` — 404 Not Found fallback.

### Instructor Menu (Faculty & Dean)
- `/dashboard` — Role-aware landing page (Dean overview or Faculty hero banner, session countdown, metric cards, today's schedule, announcements).
- `/subjects` — "My Subjects": 3-column card grid, units chips, schedule summaries, enrolled counts, and details drawer.
- `/students` — "My Students": Master class roster fetched across all assigned offerings, section & subject filters, search, pagination.
- `/grades` — "Grade Management": Offering selector (`?assignmentId=`), enrolled roster, stat cards (Posted/Pending), Enter Grade & Edit Grade modals with Philippine scale (`1.00`–`5.00`).
- `/schedule` — "My Schedule": Weekly timetable (Mon–Sun) with today row highlight and 12-hour AM/PM time formatting.
- `/salary` — "My Salary": Faculty employee profile and formatted salary breakdown (`₱45,000.00 / month`).
- `/announcements` — Administrative bulletins, unread counter badge, All/New/Read filters, local storage read tracker.
- `/announcements/:announcementId` — Announcement detail view with back navigation.

### Dean Management (Dean Only — Protected by `RequireDean`)
- `/dean/faculty` — Faculty directory table, status badges, assigned subject chips, Add/Edit Faculty modal, Assign Subject trigger.
- `/dean/faculty/:facultyId/assign` — 3-Step Wizard:
  - **Step 1**: Select Subjects (multi-select catalog cards with live counter).
  - **Step 2**: Set Section & Schedule (section picker, days, times, room combobox) + Current Assignments tab with Remove confirmation.
  - **Step 3**: Review & Confirm (summary table, atomic API orchestration, RFC 7807 409 conflict banner with retry & undo controls).
- `/dean/courses` — Academic Programs Management (mock-backed with visible "Demo data" indicator).
- `/dean/sections` — Class Sections & Capacity Management (mock-backed with visible "Demo data" indicator).
- `/dean/subjects` — Course Offerings Catalog (`/courses` backend): Add/Edit modal with positive integer units, delete conflict handler ("Mark as INACTIVE").
- `/dean/schedule` — University Master Timetable: Room/day/course/faculty filters, Add/Edit schedule modal with clash detection alert.
- `/dean/announcements` — Broadcast administration: Add/Edit/Delete announcement modals.

---

## 6. Gaps & Architectural Decisions (Section 6 Compliance)

Where the Figma prototype and backend API differed, the following deliberate architectural rules were implemented:

1. **Programs & Sections Mock Layer**: Academic Programs (`/dean/courses`) and Sections (`/dean/sections`) do not exist in the backend schema. They are powered by an in-memory mock store (`src/api/mock/programs.js` and `src/api/mock/sections.js`) and prominently feature a **"Demo data"** badge.
2. **Attendance Column Omission**: The Figma "My Students" table featured an attendance percentage column, but the backend provides no attendance records. The column was omitted and documented with `// TODO attendance endpoint` in `StudentsPage.jsx`.
3. **Grade Remarks Omission**: Figma Enter/Edit Grade modals showed an optional "Remarks" text field not accepted by `POST/PUT /faculty/:facultyId/courses/:courseCode/grades`. Remarks were omitted to preserve strict RFC 7807 schema compliance.
4. **Announcements Tracking**: Backend announcements lack status, audience, and attachment fields. Read vs. New status is tracked client-side in `localStorage` keyed per `facultyId` (`useAnnouncementsRead.js`).
5. **Salary History Presentation**: Backend `/salary` returns only the single active compensation object; past pay stubs are not provided. The screen displays the current effective salary cleanly formatted using `Intl.NumberFormat`.
6. **"Scheduled" Status Chip**: All valid timetable entries in "My Schedule" are rendered with a consistent "Scheduled" badge.
7. **Unified Dean Navigation**: The Dean has unrestricted access to both Dean Management tools and Instructor screens, utilizing their own `facultyId` on instructor pages.

---

## 7. Accessibility & Responsive Standards

- **Semantic Landmarks**: Standard `<header>`, `<nav>`, `<main>`, `<aside>` markup throughout.
- **Responsive Layout**: Desktop-first (1440×900) layout with automatic tablet/mobile collapse (<1024px) featuring a slide-over navigation drawer opened via TopBar hamburger button.
- **Horizontal Scroll Cards**: All data tables are wrapped in `.tableScroll` containers ensuring horizontal scrolling inside cards without page blowout.
- **Accessible Modals**: Accessible focus trap, `aria-modal="true"`, labelled titles, and `Escape` key close listeners on all modals and dialogs.
- **Color Contrast**: All typography and status chips meet or exceed WCAG AA 4.5:1 text contrast ratios.
