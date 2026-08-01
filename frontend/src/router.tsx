import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OverviewPage } from './pages/OverviewPage';
import { MemberListPage } from './pages/MemberListPage';
import { AddMemberPage } from './pages/AddMemberPage';
import { ApproveMembersPage } from './pages/ApproveMembersPage';
import { TransferActivityPage } from './pages/TransferActivityPage';
import { UpdateInfoPage } from './pages/UpdateInfoPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { ExecutiveCommitteePage } from './pages/ExecutiveCommitteePage';
import { TaskAssignmentPage } from './pages/TaskAssignmentPage';
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
        { path: 'doan-vien/them', element: <AddMemberPage /> },
        { path: 'doan-vien/xet-duyet', element: <ApproveMembersPage /> },
        { path: 'doan-vien/chuyen-sinh-hoat', element: <TransferActivityPage /> },
        { path: 'doan-vien/cap-nhat', element: <UpdateInfoPage /> },
        { path: 'to-chuc/chi-doan', element: <ChaptersPage /> },
        { path: 'to-chuc/bch', element: <ExecutiveCommitteePage /> },
        { path: 'to-chuc/phan-cong', element: <TaskAssignmentPage /> },
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
