import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OverviewPage } from './pages/OverviewPage';
import { MemberListPage } from './pages/MemberListPage';
import { ApproveMembersPage } from './pages/ApproveMembersPage';
import { CommendationsPage } from './pages/CommendationsPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { RoleTitlesPage } from './pages/RoleTitlesPage';
import { AccountsPage } from './pages/AccountsPage';
import { ActivityPlansPage } from './pages/ActivityPlansPage';
import { ActivityReportsPage } from './pages/ActivityReportsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { CalendarPage } from './pages/CalendarPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter(
  [
    { path: '/dang-nhap', element: <LoginPage /> },
    { path: '/dang-ky', element: <RegisterPage /> },
    {
      path: '/',
      element: (
        <RequireAuth>
          <DashboardLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <OverviewPage /> },
        { path: 'doan-vien', element: <MemberListPage /> },
        { path: 'doan-vien/khen-thuong-ky-luat', element: <CommendationsPage /> },
        { path: 'doan-vien/xet-duyet', element: <ApproveMembersPage /> },
        { path: 'to-chuc/chi-doan', element: <ChaptersPage /> },
        { path: 'to-chuc/bo-phan-cong-tac', element: <DepartmentsPage /> },
        { path: 'to-chuc/chuc-vu', element: <RoleTitlesPage /> },
        { path: 'to-chuc/tai-khoan', element: <AccountsPage /> },
        { path: 'to-chuc/ke-hoach-hoat-dong', element: <ActivityPlansPage /> },
        { path: 'to-chuc/bao-cao-ket-qua', element: <ActivityReportsPage /> },
        { path: 'tien-ich/bao-cao', element: <ReportsPage /> },
        { path: 'tien-ich/thong-bao', element: <NotificationsPage /> },
        { path: 'tien-ich/lich-cong-tac', element: <CalendarPage /> },
        { path: 'tien-ich/tai-lieu', element: <DocumentsPage /> },
        { path: 'cai-dat', element: <SettingsPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);
