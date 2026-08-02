import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { changePassword, updateProfile } from '../api/auth';
import { ApiError } from '../api/client';
import { fetchAppSettings, updateAppSettings, uploadAppLogo } from '../api/app-settings';
import { resolveUploadUrl } from '../api/members';

function BrandingSettings() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['app-settings'], queryFn: fetchAppSettings });

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setTitle(settings.title);
      setSubtitle(settings.subtitle);
      setLogoPreview(settings.logoUrl ? resolveUploadUrl(settings.logoUrl) : null);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      await updateAppSettings({ title, subtitle });
      if (logoFile) {
        await uploadAppLogo(logoFile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      setLogoFile(null);
      setMessage('Đã lưu thay đổi thương hiệu hệ thống');
    },
  });

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    mutation.mutate();
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">Thương hiệu hệ thống</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-600 text-2xl text-white">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              '★'
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Logo</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Tiêu đề</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Phụ đề</label>
          <input
            required
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {message && <div className="text-sm text-emerald-600">{message}</div>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}

function FullNameSettings() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);
    try {
      const updated = await updateProfile(fullName);
      setUser(updated);
      setMessage('Cập nhật họ và tên thành công');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">Cập nhật họ và tên</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">Họ và tên</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        {message && <div className="text-sm text-emerald-600">{message}</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setMessage(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Thông tin tài khoản</h3>
        <div className="space-y-1 text-sm text-slate-600">
          <div>
            Tên đăng nhập: <span className="font-medium text-slate-800">{user?.username}</span>
          </div>
          <div>
            Họ và tên: <span className="font-medium text-slate-800">{user?.fullName}</span>
          </div>
          <div>
            Vai trò:{' '}
            <span className="font-medium text-slate-800">
              {user?.role === 'admin' ? 'Quản trị viên' : 'Cán bộ đoàn'}
            </span>
          </div>
        </div>
      </div>

      <FullNameSettings />

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Mật khẩu hiện tại</label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Mật khẩu mới</label>
            <input
              required
              type="password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          {message && <div className="text-sm text-emerald-600">{message}</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>

      {user?.role === 'admin' && <BrandingSettings />}
    </div>
  );
}
