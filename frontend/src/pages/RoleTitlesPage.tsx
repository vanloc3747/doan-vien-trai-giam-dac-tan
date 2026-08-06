import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchRoleTitles, createRoleTitle, updateRoleTitle, deleteRoleTitle } from '../api/role-titles';
import type { RoleTitle } from '../types';
import { RoleTitleFormModal } from '../components/RoleTitleFormModal';
import { useAuth } from '../context/AuthContext';

export function RoleTitlesPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin';
  const { data } = useQuery({ queryKey: ['role-titles'], queryFn: fetchRoleTitles });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoleTitle, setEditingRoleTitle] = useState<RoleTitle | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['role-titles'] });

  const createMutation = useMutation({
    mutationFn: (name: string) => createRoleTitle(name),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateRoleTitle(id, name),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingRoleTitle(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRoleTitle(id),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = (name: string) => {
    if (editingRoleTitle) {
      updateMutation.mutate({ id: editingRoleTitle.id, name });
    } else {
      createMutation.mutate(name);
    }
  };

  const handleDelete = (roleTitle: RoleTitle) => {
    if (confirm(`Xóa chức vụ "${roleTitle.name}"? Các đoàn viên giữ chức vụ này sẽ mất liên kết chức vụ.`)) {
      deleteMutation.mutate(roleTitle.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Danh sách chức vụ đoàn</h3>
        {canManage && (
          <button
            onClick={() => {
              setEditingRoleTitle(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm chức vụ
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-2 pr-3 font-medium">Tên chức vụ</th>
              <th className="py-2 pr-3 font-medium">Số đoàn viên</th>
              <th className="py-2 pr-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((roleTitle) => (
              <tr key={roleTitle.id} className="border-b border-slate-50">
                <td className="py-3 pr-3 font-medium text-slate-700">{roleTitle.name}</td>
                <td className="py-3 pr-3 text-slate-500">{roleTitle.memberCount}</td>
                <td className="py-3 pr-3">
                  {canManage && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        className="hover:text-blue-600"
                        title="Sửa"
                        onClick={() => {
                          setEditingRoleTitle(roleTitle);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(roleTitle)}>
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

      <RoleTitleFormModal
        open={modalOpen}
        roleTitle={editingRoleTitle}
        onClose={() => {
          setModalOpen(false);
          setEditingRoleTitle(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
