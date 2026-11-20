import { Navigate } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { RequireDean } from './auth/RequireDean';
import { RequireAvp } from './auth/RequireAvp';
import { AppShell } from './layout/AppShell';

import { LoginPage } from './pages/Login/LoginPage';
import { NotFoundPage } from './pages/NotFound/NotFoundPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { ChangePasswordPage } from './pages/ChangePassword/ChangePasswordPage';
import { SubjectsPage } from './pages/faculty/Subjects/SubjectsPage';
import { StudentsPage } from './pages/faculty/Students/StudentsPage';
import { GradesPage } from './pages/faculty/Grades/GradesPage';
import { SchedulePage } from './pages/faculty/Schedule/SchedulePage';
import { SalaryPage } from './pages/faculty/Salary/SalaryPage';
import { AnnouncementsPage } from './pages/faculty/Announcements/AnnouncementsPage';
import { AnnouncementDetailPage } from './pages/faculty/Announcements/AnnouncementDetailPage';

import { ManageFacultyPage } from './pages/dean/ManageFaculty/ManageFacultyPage';
import { AssignSubjectPage } from './pages/dean/AssignSubject/AssignSubjectPage';
import { ManageCoursePage } from './pages/dean/ManageCourse/ManageCoursePage';
import { ManageSectionsPage } from './pages/dean/ManageSections/ManageSectionsPage';
import { ManageSubjectsPage } from './pages/dean/ManageSubjects/ManageSubjectsPage';
import { ManageSchedulePage } from './pages/dean/ManageSchedule/ManageSchedulePage';
import { ManageAnnouncementsPage } from './pages/dean/ManageAnnouncements/ManageAnnouncementsPage';
import { ManageDeansPage } from './pages/avp/Deans/ManageDeansPage';

export const routes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardRouter />,
      },
            {
        path: 'change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: 'subjects',
        element: <SubjectsPage />,
      },
      {
        path: 'students',
        element: <StudentsPage />,
      },
      {
        path: 'grades',
        element: <GradesPage />,
      },
      {
        path: 'schedule',
        element: <SchedulePage />,
      },
      {
        path: 'salary',
        element: <SalaryPage />,
      },
      {
        path: 'announcements',
        element: <AnnouncementsPage />,
      },
      {
        path: 'announcements/:announcementId',
        element: <AnnouncementDetailPage />,
      },
      // AVP Protected Routes
      {
        path: 'avp/deans',
        element: (
          <RequireAvp>
            <ManageDeansPage />
          </RequireAvp>
        ),
      },
      // Dean Protected Routes
      {
        path: 'dean/faculty',
        element: (
          <RequireDean>
            <ManageFacultyPage />
          </RequireDean>
        ),
      },
      {
        path: 'dean/faculty/:facultyId/assign',
        element: (
          <RequireDean>
            <AssignSubjectPage />
          </RequireDean>
        ),
      },
      // Academic Programs & Sections (accessible to Faculty and Dean)
      // Dean Protected Routes
      {
        path: 'dean/courses',
        element: (
          <RequireDean>
            <ManageCoursePage />
          </RequireDean>
        ),
      },
      {
        path: 'dean/sections',
        element: (
          <RequireDean>
            <ManageSectionsPage />
          </RequireDean>
        ),
      },
      {
        path: 'dean/subjects',
        element: (
          <RequireDean>
            <ManageSubjectsPage />
          </RequireDean>
        ),
      },
      {
        path: 'dean/schedule',
        element: (
          <RequireDean>
            <ManageSchedulePage />
          </RequireDean>
        ),
      },
      {
        path: 'dean/announcements',
        element: (
          <RequireDean>
            <ManageAnnouncementsPage />
          </RequireDean>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
