import { useAuth } from '../auth/useAuth';
import { DeanDashboardPage } from './dean/Dashboard/DeanDashboardPage';
import { FacultyDashboardPage } from './faculty/Dashboard/DashboardPage';

export function DashboardRouter() {
  const { isDean } = useAuth();
  return isDean ? <DeanDashboardPage /> : <FacultyDashboardPage />;
}
