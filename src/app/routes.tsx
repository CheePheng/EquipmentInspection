import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RoleGuard from './guards/RoleGuard';
import AppShell from './AppShell';

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
const WorkQueue = lazy(() => import('../features/repairs/WorkQueue'));
const RepairDetail = lazy(() => import('../features/repairs/RepairDetail'));
const MaintenanceList = lazy(() => import('../features/maintenance/MaintenanceList'));
const MaintenanceDetail = lazy(() => import('../features/maintenance/MaintenanceDetail'));
const AvailabilityBoard = lazy(() => import('../features/machines/AvailabilityBoard'));
const SupervisorDashboard = lazy(() => import('../features/dashboard/SupervisorDashboard'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
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
        path: 'machines/:machineId/inspect',
        element: <RoleGuard roles={['operator', 'supervisor']}><SuspenseWrapper><InspectionForm /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'defects', element: <SuspenseWrapper><DefectList /></SuspenseWrapper> },
      {
        path: 'defects/new',
        element: <RoleGuard roles={['operator', 'supervisor']}><SuspenseWrapper><DefectReport /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'defects/:id', element: <SuspenseWrapper><DefectDetail /></SuspenseWrapper> },
      { path: 'downtime', element: <SuspenseWrapper><DowntimeHistory /></SuspenseWrapper> },
      {
        path: 'downtime/log',
        element: <RoleGuard roles={['operator', 'supervisor']}><SuspenseWrapper><DowntimeLogger /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'repairs',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><WorkQueue /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'repairs/:id',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><RepairDetail /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'maintenance',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><MaintenanceList /></SuspenseWrapper></RoleGuard>,
      },
      {
        path: 'maintenance/:id',
        element: <RoleGuard roles={['mechanic', 'supervisor']}><SuspenseWrapper><MaintenanceDetail /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'availability', element: <SuspenseWrapper><AvailabilityBoard /></SuspenseWrapper> },
      {
        path: 'dashboard',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><SupervisorDashboard /></SuspenseWrapper></RoleGuard>,
      },
      { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
      {
        path: 'settings',
        element: <RoleGuard roles={['supervisor']}><SuspenseWrapper><SettingsPage /></SuspenseWrapper></RoleGuard>,
      },
    ],
  },
]);
