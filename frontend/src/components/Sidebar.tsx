import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  Repeat,
  UserCog,
  Building2,
  Users2,
  ClipboardList,
  BarChart3,
  Bell,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ size?: number }>;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  { items: [{ label: 'Tổng quan', path: '/', icon: LayoutDashboard }] },
  {
    title: 'QUẢN LÝ ĐOÀN VIÊN',
    items: [
      { label: 'Danh sách đoàn viên', path: '/doan-vien', icon: Users },
      { label: 'Thêm đoàn viên', path: '/doan-vien/them', icon: UserPlus },
      { label: 'Xét duyệt đoàn viên', path: '/doan-vien/xet-duyet', icon: UserCheck },
      { label: 'Chuyển sinh hoạt', path: '/doan-vien/chuyen-sinh-hoat', icon: Repeat },
      { label: 'Cập nhật thông tin', path: '/doan-vien/cap-nhat', icon: UserCog },
    ],
  },
  {
    title: 'QUẢN LÝ TỔ CHỨC',
    items: [
      { label: 'Chi đoàn', path: '/to-chuc/chi-doan', icon: Building2 },
      { label: 'BCH Chi đoàn', path: '/to-chuc/bch', icon: Users2 },
      { label: 'Phân công nhiệm vụ', path: '/to-chuc/phan-cong', icon: ClipboardList },
    ],
  },
  {
    title: 'TIỆN ÍCH',
    items: [
      { label: 'Báo cáo – Thống kê', path: '/tien-ich/bao-cao', icon: BarChart3 },
      { label: 'Thông báo', path: '/tien-ich/thong-bao', icon: Bell },
      { label: 'Lịch công tác', path: '/tien-ich/lich-cong-tac', icon: Calendar },
      { label: 'Tài liệu', path: '/tien-ich/tai-lieu', icon: FileText },
      { label: 'Cài đặt', path: '/cai-dat', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#0b2a6b] text-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-lg">★</div>
        <div>
          <div className="text-sm font-bold leading-tight">TRẠI GIAM ĐẮC TÂN</div>
          <div className="text-xs text-blue-200">ĐOÀN TNCS HỒ CHÍ MINH</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-4">
            {group.title && (
              <div className="px-3 pb-1 pt-3 text-[11px] font-semibold tracking-wide text-blue-300">
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-white text-[#0b2a6b] font-medium' : 'text-blue-100 hover:bg-white/10'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-300 text-sm font-semibold text-[#0b2a6b]">
          {(user?.fullName ?? '?').charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{user?.fullName ?? 'Đang tải...'}</div>
          <div className="truncate text-xs text-blue-200">
            {user?.role === 'admin' ? 'Bí thư Đoàn trại' : 'Cán bộ đoàn'}
          </div>
        </div>
      </div>
    </aside>
  );
}
