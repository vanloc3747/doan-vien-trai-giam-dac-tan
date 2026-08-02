import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { fetchPendingApprovalMembers, approveMember, deleteMember } from '../api/members';
import { fetchPendingAccounts, updateAccountStatus } from '../api/auth';
import { useAuth } from '../context/AuthContext';

function PendingMemberApprovalTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['pending-members'], queryFn: fetchPendingApprovalMembers });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-members'] });
    queryClient.invalidateQueries({ queryKey: ['members'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveMember(id),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => deleteMember(id),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-2">
      {(data ?? []).map((member) => (
        <div key={member.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
          <div>
            <div className="text-sm font-medium text-slate-700">{member.fullName}</div>
            <div className="text-xs text-slate-400">{member.chapterName ?? 'Chưa có chi đoàn'}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => approveMutation.mutate(member.id)}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <Check size={14} /> Duyệt
            </button>
            <button
              onClick={() => {
                if (confirm(`Từ chối đoàn viên "${member.fullName}"? Bản ghi này sẽ bị xóa hẳn.`)) {
                  rejectMutation.mutate(member.id);
                }
              }}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              <X size={14} /> Từ chối
            </button>
          </div>
        </div>
      ))}
      {(data ?? []).length === 0 && (
        <div className="text-sm text-slate-400">Không có đoàn viên nào chờ duyệt.</div>
      )}
    </div>
  );
}

function PendingAccountsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['pending-accounts'], queryFn: fetchPendingAccounts });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'rejected' }) => updateAccountStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-accounts'] }),
  });

  return (
    <div className="space-y-2">
      {(data ?? []).map((account) => (
        <div key={account.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
          <div>
            <div className="text-sm font-medium text-slate-700">{account.full_name}</div>
            <div className="text-xs text-slate-400">Tên đăng nhập: {account.username}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => mutation.mutate({ id: account.id, status: 'active' })}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <Check size={14} /> Duyệt
            </button>
            <button
              onClick={() => mutation.mutate({ id: account.id, status: 'rejected' })}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              <X size={14} /> Từ chối
            </button>
          </div>
        </div>
      ))}
      {(data ?? []).length === 0 && <div className="text-sm text-slate-400">Không có tài khoản nào chờ duyệt.</div>}
    </div>
  );
}

export function ApproveMembersPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'members' | 'accounts'>('members');

  if (user?.role !== 'admin') {
    return (
      <div className="rounded-xl bg-white p-5 text-sm text-slate-500 shadow-sm">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex gap-2 border-b border-slate-100">
        <button
          onClick={() => setTab('members')}
          className={`px-3 pb-3 text-sm font-medium ${
            tab === 'members' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'
          }`}
        >
          Duyệt đoàn viên mới
        </button>
        <button
          onClick={() => setTab('accounts')}
          className={`px-3 pb-3 text-sm font-medium ${
            tab === 'accounts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'
          }`}
        >
          Duyệt tài khoản cán bộ
        </button>
      </div>
      {tab === 'members' ? <PendingMemberApprovalTab /> : <PendingAccountsTab />}
    </div>
  );
}
