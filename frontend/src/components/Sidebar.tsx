import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAppSettings } from '../api/app-settings';
import { resolveUploadUrl } from '../api/members';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  Building2,
  Briefcase,
  Users2,
  UserCog,
  ClipboardList,
  Image,
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

export function Sidebar({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const { user } = useAuth();
  const closeOnMobile = () => {
    if (window.innerWidth < 768) onClose?.();
  };
  const { data: settings } = useQuery({ queryKey: ['app-settings'], queryFn: fetchAppSettings });

  const isAdmin = user?.role === 'admin';

  const navGroups: NavGroup[] = [
    { items: [{ label: 'Tổng quan', path: '/', icon: LayoutDashboard }] },
    {
      title: 'QUẢN LÝ ĐOÀN VIÊN',
      items: [
        { label: 'Danh sách đoàn viên', path: '/doan-vien', icon: Users },
        { label: 'Khen thưởng - Kỷ luật', path: '/doan-vien/khen-thuong-ky-luat', icon: Award },
        ...(isAdmin ? [{ label: 'Xét duyệt đoàn viên', path: '/doan-vien/xet-duyet', icon: UserCheck }] : []),
      ],
    },
    ...(isAdmin
      ? [
          {
            title: 'QUẢN LÝ TỔ CHỨC',
            items: [
              { label: 'Chi đoàn', path: '/to-chuc/chi-doan', icon: Building2 },
              { label: 'Bộ phận công tác', path: '/to-chuc/bo-phan-cong-tac', icon: Briefcase },
              { label: 'Quản lý chức vụ đoàn', path: '/to-chuc/chuc-vu', icon: Users2 },
              { label: 'Quản lý tài khoản', path: '/to-chuc/tai-khoan', icon: UserCog },
            ],
          },
        ]
      : []),
    {
      title: 'CÔNG TÁC ĐOÀN',
      items: [
        { label: 'Kế hoạch hoạt động', path: '/to-chuc/ke-hoach-hoat-dong', icon: ClipboardList },
        { label: 'Kết quả hoạt động', path: '/to-chuc/ket-qua-hoat-dong', icon: Image },
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

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen max-md:w-64 min-w-0 flex-shrink-0 overflow-hidden bg-[#0b2a6b] text-white transition-transform duration-300 md:relative md:inset-auto md:z-auto md:translate-x-0 md:transition-[width] md:duration-300 ${
          open ? 'translate-x-0 md:w-64' : '-translate-x-full md:w-0'
        }`}
      >
      <div className="flex h-screen w-64 flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          {settings?.logoUrl ? (
            <img
              src={resolveUploadUrl(settings.logoUrl)}
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-lg">★</div>
          )}
          <div>
            <div className="text-sm font-bold leading-tight">{settings?.title ?? 'TRẠI GIAM ĐẮC TÂN'}</div>
            <div className="text-xs text-blue-200">{settings?.subtitle ?? 'ĐOÀN TNCS HỒ CHÍ MINH'}</div>
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
                  end
                  onClick={closeOnMobile}
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

        <div className="border-t border-white/10 px-5 py-3 text-center text-[11px] text-blue-300">
          Designer by Loc Lee
        </div>
      </div>
      </aside>
    </>
  );
}
