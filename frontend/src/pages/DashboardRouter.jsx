import { useAuth } from '../auth/useAuth';
import { AvpDashboardPage } from './avp/Dashboard/AvpDashboardPage';
import { DeanDashboardPage } from './dean/Dashboard/DeanDashboardPage';
import { FacultyDashboardPage } from './faculty/Dashboard/DashboardPage';

export function DashboardRouter() {
  const { isAvp, isDean } = useAuth();
  if (isAvp) {
    return <AvpDashboardPage />;
  }
  if (isDean) {
    return <DeanDashboardPage />;
  }
  return <FacultyDashboardPage />;
}
