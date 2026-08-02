import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Search, Bell, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout, fetchPendingAccounts } from '../api/auth';
import { fetchPendingApprovalMembers } from '../api/members';

interface TopbarProps {
  title: string;
  breadcrumb: string[];
  onToggleSidebar: () => void;
}

export function Topbar({ title, breadcrumb, onToggleSidebar }: TopbarProps) {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const isAdmin = user?.role === 'admin';
  const { data: pendingMembers } = useQuery({
    queryKey: ['pending-members'],
    queryFn: fetchPendingApprovalMembers,
    enabled: isAdmin,
  });
  const { data: pendingAccounts } = useQuery({
    queryKey: ['pending-accounts'],
    queryFn: fetchPendingAccounts,
    enabled: isAdmin,
  });
  const pendingMembersCount = pendingMembers?.length ?? 0;
  const pendingAccountsCount = pendingAccounts?.length ?? 0;
  const totalPending = pendingMembersCount + pendingAccountsCount;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/doan-vien?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/dang-nhap');
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="text-slate-500 hover:text-slate-700" aria-label="Menu">
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-400">{breadcrumb.join(' > ')}</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm đoàn viên..."
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </form>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-slate-500 hover:text-slate-700"
            aria-label="Thông báo"
          >
            <Bell size={20} />
            {isAdmin && totalPending > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                {totalPending > 9 ? '9+' : totalPending}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-slate-100 bg-white p-4 shadow-lg">
              <h4 className="mb-3 text-sm font-semibold text-slate-800">Thông báo</h4>
              {isAdmin && totalPending > 0 ? (
                <div className="space-y-2">
                  {pendingMembersCount > 0 && (
                    <Link
                      to="/doan-vien/xet-duyet"
                      onClick={() => setNotifOpen(false)}
                      className="block rounded-lg border border-slate-100 p-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{pendingMembersCount}</span> đoàn viên chờ duyệt
                    </Link>
                  )}
                  {pendingAccountsCount > 0 && (
                    <Link
                      to="/doan-vien/xet-duyet"
                      onClick={() => setNotifOpen(false)}
                      className="block rounded-lg border border-slate-100 p-2.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{pendingAccountsCount}</span> tài khoản chờ duyệt
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-400">Không có thông báo mới</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {(user?.fullName ?? '?').charAt(0)}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium text-slate-800">{user?.fullName}</div>
                <div className="text-xs text-slate-400">
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Cán bộ đoàn'}
                </div>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-slate-100 bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
                    {(user?.fullName ?? '?').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800">{user?.fullName}</div>
                    <div className="text-xs text-slate-400">
                      {user?.role === 'admin' ? 'Quản trị viên' : 'Cán bộ đoàn'}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 py-3 text-sm text-slate-600">
                  <div>
                    Tên đăng nhập: <span className="font-medium text-slate-800">{user?.username}</span>
                  </div>
                </div>
                <Link
                  to="/cai-dat"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg border-t border-slate-100 pt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Settings size={16} /> Xem cài đặt tài khoản
                </Link>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 text-slate-400 hover:text-red-500"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
