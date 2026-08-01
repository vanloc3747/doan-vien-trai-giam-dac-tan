import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { fetchMembers, updateMemberType } from '../api/members';
import { fetchPendingAccounts, updateAccountStatus } from '../api/auth';
import { MemberTypeBadge } from '../components/MemberTypeBadge';
import { useAuth } from '../context/AuthContext';

function PendingMemberTypeTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['members', 'all-for-approval'],
    queryFn: () => fetchMembers({ page: 1, pageSize: 100 }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, memberType }: { id: number; memberType: string }) => updateMemberType(id, memberType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return (
    <div className="space-y-2">
      {(data?.data ?? []).map((member) => (
        <div key={member.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
          <div>
            <div className="text-sm font-medium text-slate-700">{member.fullName}</div>
            <div className="text-xs text-slate-400">{member.chapterName ?? 'Chưa có chi đoàn'}</div>
          </div>
          <div className="flex items-center gap-3">
            <MemberTypeBadge memberType={member.memberType} />
            <button
              onClick={() =>
                mutation.mutate({
                  id: member.id,
                  memberType: member.memberType === 'doan_vien' ? 'dang_vien_sinh_hoat_doan' : 'doan_vien',
                })
              }
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Chuyển sang {member.memberType === 'doan_vien' ? 'Đảng viên sinh hoạt đoàn' : 'Đoàn viên'}
            </button>
          </div>
        </div>
      ))}
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
  const [tab, setTab] = useState<'member-type' | 'accounts'>('member-type');

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex gap-2 border-b border-slate-100">
        <button
          onClick={() => setTab('member-type')}
          className={`px-3 pb-3 text-sm font-medium ${
            tab === 'member-type' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'
          }`}
        >
          Duyệt phân loại đoàn viên
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setTab('accounts')}
            className={`px-3 pb-3 text-sm font-medium ${
              tab === 'accounts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'
            }`}
          >
            Duyệt tài khoản cán bộ
          </button>
        )}
      </div>
      {tab === 'member-type' ? <PendingMemberTypeTab /> : <PendingAccountsTab />}
    </div>
  );
}
