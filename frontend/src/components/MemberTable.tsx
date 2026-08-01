import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
  type MemberFormInput,
} from '../api/members';
import type { Member } from '../types';
import { MemberFilters } from './MemberFilters';
import { MemberTypeBadge } from './MemberTypeBadge';
import { Pagination } from './Pagination';
import { MemberFormModal, type MemberFormValues } from './MemberFormModal';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function MemberTable({ embedded = false }: { embedded?: boolean }) {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [chapterId, setChapterId] = useState('');
  const [memberType, setMemberType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['members', { search, chapterId, memberType, page, pageSize }],
    queryFn: () =>
      fetchMembers({
        search: search || undefined,
        chapterId: chapterId ? parseInt(chapterId, 10) : undefined,
        memberType: memberType || undefined,
        page,
        pageSize,
      }),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['members'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['gender-distribution'] });
    queryClient.invalidateQueries({ queryKey: ['department-distribution'] });
    queryClient.invalidateQueries({ queryKey: ['birthdays'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: MemberFormInput) => createMember(input),
    onSuccess: () => {
      invalidateAll();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: MemberFormInput }) => updateMember(id, input),
    onSuccess: () => {
      invalidateAll();
      setModalOpen(false);
      setEditingMember(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMember(id),
    onSuccess: () => invalidateAll(),
  });

  const handleSubmit = (values: MemberFormValues) => {
    const input: MemberFormInput = {
      fullName: values.fullName,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      chapterId: values.chapterId,
      departmentId: values.departmentId,
      joinDate: values.joinDate,
      memberType: values.memberType,
      roleTitle: values.roleTitle || null,
      phone: values.phone || null,
      email: values.email || null,
      notes: values.notes || null,
    };
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, input });
    } else {
      createMutation.mutate(input);
    }
  };

  const handleDelete = (member: Member) => {
    if (confirm(`Xóa đoàn viên "${member.fullName}"?`)) {
      deleteMutation.mutate(member.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-800">Danh sách đoàn viên</h3>
        {!embedded && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingMember(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Thêm đoàn viên
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Download size={16} /> Xuất Excel
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <MemberFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          chapterId={chapterId}
          onChapterChange={(v) => {
            setChapterId(v);
            setPage(1);
          }}
          memberType={memberType}
          onMemberTypeChange={(v) => {
            setMemberType(v);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-2 pr-3 font-medium">STT</th>
              <th className="py-2 pr-3 font-medium">Họ và tên</th>
              <th className="py-2 pr-3 font-medium">Ngày sinh</th>
              <th className="py-2 pr-3 font-medium">Giới tính</th>
              <th className="py-2 pr-3 font-medium">Chi đoàn</th>
              <th className="py-2 pr-3 font-medium">Ngày vào Đoàn</th>
              <th className="py-2 pr-3 font-medium">Phân loại</th>
              <th className="py-2 pr-3 font-medium">Chức vụ</th>
              <th className="py-2 pr-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data ?? []).map((member, idx) => (
              <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-3 pr-3 text-slate-500">{(page - 1) * pageSize + idx + 1}</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                      {member.fullName.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700">{member.fullName}</span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-slate-500">{formatDate(member.dateOfBirth)}</td>
                <td className="py-3 pr-3 text-slate-500">
                  {member.gender === 'nam' ? 'Nam' : member.gender === 'nu' ? 'Nữ' : 'Khác'}
                </td>
                <td className="py-3 pr-3 text-slate-500">{member.chapterName ?? '-'}</td>
                <td className="py-3 pr-3 text-slate-500">{formatDate(member.joinDate)}</td>
                <td className="py-3 pr-3">
                  <MemberTypeBadge memberType={member.memberType} />
                </td>
                <td className="py-3 pr-3 text-slate-500">{member.roleTitle ?? '-'}</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button className="hover:text-blue-600" title="Xem">
                      <Eye size={16} />
                    </button>
                    <button
                      className="hover:text-blue-600"
                      title="Sửa"
                      onClick={() => {
                        setEditingMember(member);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(member)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <MemberFormModal
        open={modalOpen}
        member={editingMember}
        onClose={() => {
          setModalOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
