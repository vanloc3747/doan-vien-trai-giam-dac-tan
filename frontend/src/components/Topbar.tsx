import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';

export function Topbar({ title, breadcrumb }: { title: string; breadcrumb: string[] }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

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
        <button className="text-slate-500 hover:text-slate-700" aria-label="Menu">
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

        <button className="relative text-slate-500 hover:text-slate-700" aria-label="Thông báo">
          <Bell size={20} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {(user?.fullName ?? '?').charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium text-slate-800">{user?.fullName}</div>
            <div className="text-xs text-slate-400">{user?.role === 'admin' ? 'Bí thư Đoàn trưởng' : 'Cán bộ đoàn'}</div>
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
