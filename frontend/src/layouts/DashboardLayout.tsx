import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

const pageMeta: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: 'Tổng quan', breadcrumb: ['Trang chủ', 'Tổng quan'] },
  '/doan-vien': { title: 'Danh sách đoàn viên', breadcrumb: ['Trang chủ', 'Danh sách đoàn viên'] },
  '/doan-vien/them': { title: 'Thêm đoàn viên', breadcrumb: ['Trang chủ', 'Thêm đoàn viên'] },
  '/doan-vien/xet-duyet': { title: 'Xét duyệt đoàn viên', breadcrumb: ['Trang chủ', 'Xét duyệt đoàn viên'] },
  '/doan-vien/chuyen-sinh-hoat': { title: 'Chuyển sinh hoạt', breadcrumb: ['Trang chủ', 'Chuyển sinh hoạt'] },
  '/doan-vien/cap-nhat': { title: 'Cập nhật thông tin', breadcrumb: ['Trang chủ', 'Cập nhật thông tin'] },
  '/to-chuc/chi-doan': { title: 'Chi đoàn', breadcrumb: ['Trang chủ', 'Chi đoàn'] },
  '/to-chuc/bch': { title: 'BCH Chi đoàn', breadcrumb: ['Trang chủ', 'BCH Chi đoàn'] },
  '/to-chuc/phan-cong': { title: 'Phân công nhiệm vụ', breadcrumb: ['Trang chủ', 'Phân công nhiệm vụ'] },
  '/tien-ich/bao-cao': { title: 'Báo cáo – Thống kê', breadcrumb: ['Trang chủ', 'Báo cáo – Thống kê'] },
  '/tien-ich/thong-bao': { title: 'Thông báo', breadcrumb: ['Trang chủ', 'Thông báo'] },
  '/tien-ich/lich-cong-tac': { title: 'Lịch công tác', breadcrumb: ['Trang chủ', 'Lịch công tác'] },
  '/tien-ich/tai-lieu': { title: 'Tài liệu', breadcrumb: ['Trang chủ', 'Tài liệu'] },
  '/cai-dat': { title: 'Cài đặt', breadcrumb: ['Trang chủ', 'Cài đặt'] },
};

export function DashboardLayout() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? { title: 'Trang quản lý', breadcrumb: ['Trang chủ'] };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={meta.title} breadcrumb={meta.breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
