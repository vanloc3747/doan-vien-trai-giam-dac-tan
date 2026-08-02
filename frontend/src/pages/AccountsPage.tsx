import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, KeyRound } from 'lucide-react';
import {
  fetchAllUsers,
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
  resetUserPassword,
  type CreateUserAccountInput,
  type UpdateUserAccountInput,
} from '../api/auth';
import type { UserAccount } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserAccountFormModal } from '../components/UserAccountFormModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';

const ROLE_LABELS: Record<string, string> = { admin: 'Quản trị viên', can_bo_doan: 'Cán bộ đoàn' };
const STATUS_LABELS: Record<string, string> = { pending: 'Chờ duyệt', active: 'Đang hoạt động', rejected: 'Đã từ chối' };

export function AccountsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: accounts } = useQuery({ queryKey: ['all-users'], queryFn: fetchAllUsers });

  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<UserAccount | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['all-users'] });

  const createMutation = useMutation({
    mutationFn: (input: CreateUserAccountInput) => createUserAccount(input),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
    },
    onError: (err: Error) => alert(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserAccountInput }) => updateUserAccount(id, input),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setEditingAccount(null);
    },
    onError: (err: Error) => alert(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUserAccount(id),
    onSuccess: () => invalidate(),
    onError: (err: Error) => alert(err.message),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) => resetUserPassword(id, newPassword),
    onSuccess: () => {
      setPasswordTarget(null);
      alert('Đổi mật khẩu thành công');
    },
    onError: (err: Error) => alert(err.message),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="rounded-xl bg-white p-5 text-sm text-slate-500 shadow-sm">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  const handleSubmit = (values: {
    username: string;
    password: string;
    fullName: string;
    role: 'admin' | 'can_bo_doan';
    managedChapterId: number | null;
  }) => {
    if (editingAccount) {
      updateMutation.mutate({
        id: editingAccount.id,
        input: { fullName: values.fullName, role: values.role, managedChapterId: values.managedChapterId },
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (account: UserAccount) => {
    if (confirm(`Xóa tài khoản "${account.username}"?`)) {
      deleteMutation.mutate(account.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Quản lý tài khoản</h3>
        <button
          onClick={() => {
            setEditingAccount(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm tài khoản
        </button>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="py-2 pr-3 font-medium">Tên đăng nhập</th>
            <th className="py-2 pr-3 font-medium">Họ và tên</th>
            <th className="py-2 pr-3 font-medium">Vai trò</th>
            <th className="py-2 pr-3 font-medium">Trạng thái</th>
            <th className="py-2 pr-3 font-medium">Chi đoàn quản lý</th>
            <th className="py-2 pr-3 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {(accounts ?? []).map((account) => (
            <tr key={account.id} className="border-b border-slate-50">
              <td className="py-3 pr-3 font-medium text-slate-700">{account.username}</td>
              <td className="py-3 pr-3 text-slate-500">{account.fullName}</td>
              <td className="py-3 pr-3 text-slate-500">{ROLE_LABELS[account.role] ?? account.role}</td>
              <td className="py-3 pr-3 text-slate-500">{STATUS_LABELS[account.status] ?? account.status}</td>
              <td className="py-3 pr-3 text-slate-500">
                {account.role === 'admin' ? 'Toàn quyền' : account.managedChapterName ?? 'Không quản lý'}
              </td>
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <button
                    className="hover:text-blue-600"
                    title="Đổi mật khẩu"
                    onClick={() => setPasswordTarget(account)}
                  >
                    <KeyRound size={16} />
                  </button>
                  <button
                    className="hover:text-blue-600"
                    title="Sửa"
                    onClick={() => {
                      setEditingAccount(account);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Xóa"
                    disabled={account.id === user?.id}
                    onClick={() => handleDelete(account)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <UserAccountFormModal
        open={formOpen}
        account={editingAccount}
        onClose={() => {
          setFormOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <ResetPasswordModal
        open={!!passwordTarget}
        account={passwordTarget}
        onClose={() => setPasswordTarget(null)}
        onSubmit={(newPassword) => {
          if (passwordTarget) resetPasswordMutation.mutate({ id: passwordTarget.id, newPassword });
        }}
        submitting={resetPasswordMutation.isPending}
      />
    </div>
  );
}
