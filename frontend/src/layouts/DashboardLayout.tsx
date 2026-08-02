import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

const pageMeta: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: 'Tổng quan', breadcrumb: ['Trang chủ', 'Tổng quan'] },
  '/doan-vien': { title: 'Danh sách đoàn viên', breadcrumb: ['Trang chủ', 'Danh sách đoàn viên'] },
  '/doan-vien/khen-thuong-ky-luat': {
    title: 'Khen thưởng - Kỷ luật',
    breadcrumb: ['Trang chủ', 'Khen thưởng - Kỷ luật'],
  },
  '/doan-vien/xet-duyet': { title: 'Xét duyệt đoàn viên', breadcrumb: ['Trang chủ', 'Xét duyệt đoàn viên'] },
  '/to-chuc/chi-doan': { title: 'Chi đoàn', breadcrumb: ['Trang chủ', 'Chi đoàn'] },
  '/to-chuc/bo-phan-cong-tac': { title: 'Bộ phận công tác', breadcrumb: ['Trang chủ', 'Bộ phận công tác'] },
  '/to-chuc/chuc-vu': { title: 'Quản lý chức vụ đoàn', breadcrumb: ['Trang chủ', 'Quản lý chức vụ đoàn'] },
  '/to-chuc/tai-khoan': { title: 'Quản lý tài khoản', breadcrumb: ['Trang chủ', 'Quản lý tài khoản'] },
  '/to-chuc/ke-hoach-hoat-dong': { title: 'Kế hoạch hoạt động', breadcrumb: ['Trang chủ', 'Kế hoạch hoạt động'] },
  '/to-chuc/ket-qua-hoat-dong': {
    title: 'Kết quả hoạt động',
    breadcrumb: ['Trang chủ', 'Kết quả hoạt động'],
  },
  '/tien-ich/bao-cao': { title: 'Báo cáo – Thống kê', breadcrumb: ['Trang chủ', 'Báo cáo – Thống kê'] },
  '/tien-ich/thong-bao': { title: 'Thông báo', breadcrumb: ['Trang chủ', 'Thông báo'] },
  '/tien-ich/lich-cong-tac': { title: 'Lịch công tác', breadcrumb: ['Trang chủ', 'Lịch công tác'] },
  '/tien-ich/tai-lieu': { title: 'Tài liệu', breadcrumb: ['Trang chủ', 'Tài liệu'] },
  '/cai-dat': { title: 'Cài đặt', breadcrumb: ['Trang chủ', 'Cài đặt'] },
};

export function DashboardLayout() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? { title: 'Trang quản lý', breadcrumb: ['Trang chủ'] };
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
