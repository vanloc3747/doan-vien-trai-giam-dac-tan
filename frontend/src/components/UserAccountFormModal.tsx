import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { UserAccount } from '../types';
import { fetchChapters } from '../api/chapters';

interface UserAccountFormValues {
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'can_bo_doan';
  managedChapterId: number | null;
}

interface UserAccountFormModalProps {
  open: boolean;
  account: UserAccount | null;
  onClose: () => void;
  onSubmit: (values: UserAccountFormValues) => void;
  submitting?: boolean;
}

const emptyValues: UserAccountFormValues = {
  username: '',
  password: '',
  fullName: '',
  role: 'can_bo_doan',
  managedChapterId: null,
};

export function UserAccountFormModal({ open, account, onClose, onSubmit, submitting }: UserAccountFormModalProps) {
  const [values, setValues] = useState<UserAccountFormValues>(emptyValues);
  const { data: chapters } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });

  useEffect(() => {
    if (account) {
      setValues({
        username: account.username,
        password: '',
        fullName: account.fullName,
        role: account.role as 'admin' | 'can_bo_doan',
        managedChapterId: account.managedChapterId,
      });
    } else {
      setValues(emptyValues);
    }
  }, [account, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {account ? 'Sửa tài khoản' : 'Thêm tài khoản'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tên đăng nhập</label>
            <input
              required
              disabled={!!account}
              value={values.username}
              onChange={(e) => setValues({ ...values, username: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {!account && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Mật khẩu</label>
              <input
                required
                minLength={6}
                type="password"
                value={values.password}
                onChange={(e) => setValues({ ...values, password: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Họ và tên</label>
            <input
              required
              value={values.fullName}
              onChange={(e) => setValues({ ...values, fullName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Vai trò</label>
            <select
              value={values.role}
              onChange={(e) => setValues({ ...values, role: e.target.value as 'admin' | 'can_bo_doan' })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="can_bo_doan">Cán bộ đoàn</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          {values.role !== 'admin' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Chi đoàn quản lý</label>
              <select
                value={values.managedChapterId ?? ''}
                onChange={(e) =>
                  setValues({
                    ...values,
                    managedChapterId: e.target.value ? parseInt(e.target.value, 10) : null,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="">-- Không quản lý --</option>
                {(chapters ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
