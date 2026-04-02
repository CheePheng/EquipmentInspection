import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RoleGuard from './guards/RoleGuard';
import AppShell from './AppShell';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Lazy load all feature pages
const PinLogin = lazy(() => import('../features/auth/PinLogin'));
const MachineList = lazy(() => import('../features/machines/MachineList'));
const MachineDetail = lazy(() => import('../features/machines/MachineDetail'));
const InspectionForm = lazy(() => import('../features/inspections/InspectionForm'));
const DefectList = lazy(() => import('../features/defects/DefectList'));
const DefectReport = lazy(() => import('../features/defects/DefectReport'));
const DefectDetail = lazy(() => import('../features/defects/DefectDetail'));
const DowntimeHistory = lazy(() => import('../features/downtime/DowntimeHistory'));
const DowntimeLogger = lazy(() => import('../features/downtime/DowntimeLogger'));
const MaintenanceList = lazy(() => import('../features/maintenance/MaintenanceList'));
const MaintenanceDetail = lazy(() => import('../features/maintenance/MaintenanceDetail'));
const AvailabilityBoard = lazy(() => import('../features/machines/AvailabilityBoard'));
const SupervisorDashboard = lazy(() => import('../features/dashboard/SupervisorDashboard'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const ServiceOrderList = lazy(() => import('../features/service-orders/ServiceOrderList'));
const ServiceOrderDetail = lazy(() => import('../features/service-orders/ServiceOrderDetail'));
const WorkerHistory = lazy(() => import('../features/profile/WorkerHistory'));
const FleetPage = lazy(() => import('../features/fleet/FleetPage'));
const TeamPage = lazy(() => import('../features/team/TeamPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary><Suspense fallback={<PageLoader />}>{children}</Suspense></ErrorBoundary>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <SuspenseWrapper><PinLogin /></SuspenseWrapper>,
  },
  {
    path: '/',
    element: <RoleGuard><AppShell /></RoleGuard>,
    children: [
      { index: true, element: <Navigate to="/machines" replace /> },
      { path: 'machines', element: <SuspenseWrapper><MachineList /></SuspenseWrapper> },
      { path: 'machines/:id', element: <SuspenseWrapper><MachineDetail /></SuspenseWrapper> },
      {
        path: 'machines/:id/inspect',
        element: <RoleGuard roles={['worker', 'supervisor']}><SuspenseWrapper><InspectionForm /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'defects', element: <SuspenseWrapper><DefectList /></SuspenseWrapper> },
      {
        path: 'defects/new',
        element: <RoleGuard roles={['worker', 'supervisor']}><SuspenseWrapper><DefectReport /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'defects/:id', element: <SuspenseWrapper><DefectDetail /></SuspenseWrapper> },
      { path: 'downtime', element: <SuspenseWrapper><DowntimeHistory /></SuspenseWrapper> },
      {
        path: 'downtime/log',
        element: <RoleGuard roles={['worker', 'supervisor']}><SuspenseWrapper><DowntimeLogger /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'maintenance',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><MaintenanceList /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'maintenance/:id',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><MaintenanceDetail /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'service-orders',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><ServiceOrderList /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'service-orders/:id',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><ServiceOrderDetail /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'availability', element: <SuspenseWrapper><AvailabilityBoard /></SuspenseWrapper> },
      {
        path: 'dashboard',
        element: <RoleGuard roles={['supervisor', 'boss']}><SuspenseWrapper><SupervisorDashboard /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
      { path: 'my-activity', element: <SuspenseWrapper><WorkerHistory /></SuspenseWrapper> },
      {
        path: 'settings',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><SettingsPage /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'fleet',
        element: <RoleGuard roles={['boss']}><SuspenseWrapper><FleetPage /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'team',
        element: <RoleGuard roles={['boss']}><SuspenseWrapper><TeamPage /></SuspenseWrapper></RoleGuard>,
      },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });
