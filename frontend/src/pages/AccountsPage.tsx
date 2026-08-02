import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsers, updateUserManagedChapter } from '../api/auth';
import { fetchChapters } from '../api/chapters';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = { admin: 'Quản trị viên', can_bo_doan: 'Cán bộ đoàn' };
const STATUS_LABELS: Record<string, string> = { pending: 'Chờ duyệt', active: 'Đang hoạt động', rejected: 'Đã từ chối' };

export function AccountsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: accounts } = useQuery({ queryKey: ['all-users'], queryFn: fetchAllUsers });
  const { data: chapters } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });

  const mutation = useMutation({
    mutationFn: ({ id, chapterId }: { id: number; chapterId: number | null }) =>
      updateUserManagedChapter(id, chapterId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-users'] }),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="rounded-xl bg-white p-5 text-sm text-slate-500 shadow-sm">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">Quản lý tài khoản</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="py-2 pr-3 font-medium">Tên đăng nhập</th>
            <th className="py-2 pr-3 font-medium">Họ và tên</th>
            <th className="py-2 pr-3 font-medium">Vai trò</th>
            <th className="py-2 pr-3 font-medium">Trạng thái</th>
            <th className="py-2 pr-3 font-medium">Chi đoàn quản lý</th>
          </tr>
        </thead>
        <tbody>
          {(accounts ?? []).map((account) => (
            <tr key={account.id} className="border-b border-slate-50">
              <td className="py-3 pr-3 font-medium text-slate-700">{account.username}</td>
              <td className="py-3 pr-3 text-slate-500">{account.fullName}</td>
              <td className="py-3 pr-3 text-slate-500">{ROLE_LABELS[account.role] ?? account.role}</td>
              <td className="py-3 pr-3 text-slate-500">{STATUS_LABELS[account.status] ?? account.status}</td>
              <td className="py-3 pr-3">
                {account.role === 'admin' ? (
                  <span className="text-slate-400">Toàn quyền</span>
                ) : (
                  <select
                    value={account.managedChapterId ?? ''}
                    onChange={(e) =>
                      mutation.mutate({
                        id: account.id,
                        chapterId: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                  >
                    <option value="">-- Không quản lý --</option>
                    {(chapters ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
