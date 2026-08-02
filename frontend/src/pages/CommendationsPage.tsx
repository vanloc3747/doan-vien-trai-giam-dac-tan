import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  fetchCommendations,
  createCommendation,
  updateCommendation,
  deleteCommendation,
  type CommendationFormInput,
} from '../api/commendations';
import { fetchChapters } from '../api/chapters';
import type { Commendation, CommendationType } from '../types';
import { CommendationFormModal } from '../components/CommendationFormModal';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function CommendationsPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.managedChapterId != null;

  const [search, setSearch] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [type, setType] = useState('');

  const { data } = useQuery({
    queryKey: ['commendations', { search, chapterId, type }],
    queryFn: () =>
      fetchCommendations({
        search: search || undefined,
        chapterId: chapterId ? parseInt(chapterId, 10) : undefined,
        type: (type || undefined) as CommendationType | undefined,
      }),
  });
  const { data: chapters } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommendation, setEditingCommendation] = useState<Commendation | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['commendations'] });

  const createMutation = useMutation({
    mutationFn: (input: CommendationFormInput) => createCommendation(input),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CommendationFormInput }) => updateCommendation(id, input),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingCommendation(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCommendation(id),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = (values: CommendationFormInput) => {
    if (editingCommendation) {
      updateMutation.mutate({ id: editingCommendation.id, input: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (commendation: Commendation) => {
    if (confirm(`Xóa bản ghi của "${commendation.memberName}"?`)) {
      deleteMutation.mutate(commendation.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Khen thưởng - Kỷ luật</h3>
        {canManage && (
          <button
            onClick={() => {
              setEditingCommendation(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên đoàn viên, nội dung, số QĐ..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <select
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
        >
          <option value="">-- Chi đoàn --</option>
          {(chapters ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
        >
          <option value="">-- Loại --</option>
          <option value="khen_thuong">Khen thưởng</option>
          <option value="ky_luat">Kỷ luật</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-2 pr-3 font-medium">Đoàn viên</th>
              <th className="py-2 pr-3 font-medium">Chi đoàn</th>
              <th className="py-2 pr-3 font-medium">Loại</th>
              <th className="py-2 pr-3 font-medium">Ngày QĐ</th>
              <th className="py-2 pr-3 font-medium">Số QĐ</th>
              <th className="py-2 pr-3 font-medium">Nội dung</th>
              <th className="py-2 pr-3 font-medium">Đơn vị ra QĐ</th>
              <th className="py-2 pr-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-b border-slate-50">
                <td className="py-3 pr-3 font-medium text-slate-700">{c.memberName}</td>
                <td className="py-3 pr-3 text-slate-500">{c.chapterName ?? '-'}</td>
                <td className="py-3 pr-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      c.type === 'khen_thuong' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {c.type === 'khen_thuong' ? 'Khen thưởng' : 'Kỷ luật'}
                  </span>
                </td>
                <td className="py-3 pr-3 text-slate-500">{formatDate(c.decisionDate)}</td>
                <td className="py-3 pr-3 text-slate-500">{c.decisionNumber ?? '-'}</td>
                <td className="py-3 pr-3 max-w-xs truncate text-slate-500" title={c.content}>
                  {c.content}
                </td>
                <td className="py-3 pr-3 text-slate-500">{c.issuedBy ?? '-'}</td>
                <td className="py-3 pr-3">
                  {canManage && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        className="hover:text-blue-600"
                        title="Sửa"
                        onClick={() => {
                          setEditingCommendation(c);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(c)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400">
                  Chưa có bản ghi khen thưởng/kỷ luật nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CommendationFormModal
        open={modalOpen}
        commendation={editingCommendation}
        onClose={() => {
          setModalOpen(false);
          setEditingCommendation(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
