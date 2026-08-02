import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { UserAccount } from '../types';

interface ResetPasswordModalProps {
  open: boolean;
  account: UserAccount | null;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  submitting?: boolean;
}

export function ResetPasswordModal({ open, account, onClose, onSubmit, submitting }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setNewPassword('');
  }, [account, open]);

  if (!open || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Đổi mật khẩu</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(newPassword);
          }}
          className="space-y-3"
        >
          <p className="text-sm text-slate-500">
            Đặt mật khẩu mới cho tài khoản <span className="font-medium text-slate-700">{account.username}</span>.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Mật khẩu mới</label>
            <input
              required
              minLength={6}
              type="password"
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
