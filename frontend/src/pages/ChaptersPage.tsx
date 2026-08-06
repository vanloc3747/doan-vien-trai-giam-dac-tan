import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchChapters, createChapter, updateChapter, deleteChapter } from '../api/chapters';
import type { Chapter } from '../types';
import { ChapterFormModal } from '../components/ChapterFormModal';
import { useAuth } from '../context/AuthContext';

export function ChaptersPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin';
  const { data } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['chapters'] });

  const createMutation = useMutation({
    mutationFn: (name: string) => createChapter(name),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateChapter(id, name),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingChapter(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteChapter(id),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = (name: string) => {
    if (editingChapter) {
      updateMutation.mutate({ id: editingChapter.id, name });
    } else {
      createMutation.mutate(name);
    }
  };

  const handleDelete = (chapter: Chapter) => {
    if (confirm(`Xóa chi đoàn "${chapter.name}"? Các đoàn viên thuộc chi đoàn này sẽ mất liên kết chi đoàn.`)) {
      deleteMutation.mutate(chapter.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Danh sách chi đoàn</h3>
        {canManage && (
          <button
            onClick={() => {
              setEditingChapter(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm chi đoàn
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-2 pr-3 font-medium">Tên chi đoàn</th>
              <th className="py-2 pr-3 font-medium">Số đoàn viên</th>
              <th className="py-2 pr-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((chapter) => (
              <tr key={chapter.id} className="border-b border-slate-50">
                <td className="py-3 pr-3 font-medium text-slate-700">{chapter.name}</td>
                <td className="py-3 pr-3 text-slate-500">{chapter.memberCount}</td>
                <td className="py-3 pr-3">
                  {canManage && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        className="hover:text-blue-600"
                        title="Sửa"
                        onClick={() => {
                          setEditingChapter(chapter);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(chapter)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ChapterFormModal
        open={modalOpen}
        chapter={editingChapter}
        onClose={() => {
          setModalOpen(false);
          setEditingChapter(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
