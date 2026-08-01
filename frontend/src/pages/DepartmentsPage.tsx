import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';
import type { Department } from '../types';
import { DepartmentFormModal } from '../components/DepartmentFormModal';

export function DepartmentsPage() {
  const { data } = useQuery({ queryKey: ['departments'], queryFn: fetchDepartments });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['departments'] });

  const createMutation = useMutation({
    mutationFn: (name: string) => createDepartment(name),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateDepartment(id, name),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingDepartment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = (name: string) => {
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, name });
    } else {
      createMutation.mutate(name);
    }
  };

  const handleDelete = (department: Department) => {
    if (
      confirm(
        `Xóa bộ phận công tác "${department.name}"? Các đoàn viên thuộc bộ phận này sẽ mất liên kết bộ phận công tác.`
      )
    ) {
      deleteMutation.mutate(department.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Danh sách bộ phận công tác</h3>
        <button
          onClick={() => {
            setEditingDepartment(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm bộ phận công tác
        </button>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="py-2 pr-3 font-medium">Tên bộ phận công tác</th>
            <th className="py-2 pr-3 font-medium">Số đoàn viên</th>
            <th className="py-2 pr-3 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((department) => (
            <tr key={department.id} className="border-b border-slate-50">
              <td className="py-3 pr-3 font-medium text-slate-700">{department.name}</td>
              <td className="py-3 pr-3 text-slate-500">{department.memberCount}</td>
              <td className="py-3 pr-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <button
                    className="hover:text-blue-600"
                    title="Sửa"
                    onClick={() => {
                      setEditingDepartment(department);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(department)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DepartmentFormModal
        open={modalOpen}
        department={editingDepartment}
        onClose={() => {
          setModalOpen(false);
          setEditingDepartment(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
