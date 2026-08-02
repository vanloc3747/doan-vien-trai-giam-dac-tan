import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  fetchActivityPlans,
  createActivityPlan,
  updateActivityPlan,
  deleteActivityPlan,
  type ActivityPlanFormInput,
} from '../api/activity-plans';
import type { ActivityPlan, ActivityPlanStatus } from '../types';
import { ActivityPlanFormModal } from '../components/ActivityPlanFormModal';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

const STATUS_LABELS: Record<ActivityPlanStatus, string> = {
  chua_thuc_hien: 'Chưa thực hiện',
  dang_thuc_hien: 'Đang thực hiện',
  da_hoan_thanh: 'Đã hoàn thành',
};

const STATUS_CLASSES: Record<ActivityPlanStatus, string> = {
  chua_thuc_hien: 'bg-slate-100 text-slate-600',
  dang_thuc_hien: 'bg-amber-50 text-amber-600',
  da_hoan_thanh: 'bg-emerald-50 text-emerald-700',
};

export function ActivityPlansPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin';

  const { data } = useQuery({ queryKey: ['activity-plans'], queryFn: fetchActivityPlans });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActivityPlan | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['activity-plans'] });

  const createMutation = useMutation({
    mutationFn: (input: ActivityPlanFormInput) => createActivityPlan(input),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ActivityPlanFormInput }) => updateActivityPlan(id, input),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteActivityPlan(id),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = (values: ActivityPlanFormInput) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, input: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (plan: ActivityPlan) => {
    if (confirm(`Xóa kế hoạch hoạt động "${plan.title}"?`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Kế hoạch hoạt động</h3>
        {canManage && (
          <button
            onClick={() => {
              setEditingPlan(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm kế hoạch
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-2 pr-3 font-medium">Tên kế hoạch</th>
              <th className="py-2 pr-3 font-medium">Ngày bắt đầu</th>
              <th className="py-2 pr-3 font-medium">Ngày kết thúc</th>
              <th className="py-2 pr-3 font-medium">Chi đoàn</th>
              <th className="py-2 pr-3 font-medium">Trạng thái</th>
              <th className="py-2 pr-3 font-medium">Nội dung</th>
              <th className="py-2 pr-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((plan) => (
              <tr key={plan.id} className="border-b border-slate-50">
                <td className="py-3 pr-3 font-medium text-slate-700">{plan.title}</td>
                <td className="py-3 pr-3 text-slate-500">{formatDate(plan.startDate)}</td>
                <td className="py-3 pr-3 text-slate-500">{formatDate(plan.endDate)}</td>
                <td className="py-3 pr-3 text-slate-500">{plan.chapterName ?? 'Toàn Đoàn'}</td>
                <td className="py-3 pr-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[plan.status]}`}>
                    {STATUS_LABELS[plan.status]}
                  </span>
                </td>
                <td className="py-3 pr-3 max-w-xs truncate text-slate-500" title={plan.content ?? ''}>
                  {plan.content ?? '-'}
                </td>
                <td className="py-3 pr-3">
                  {canManage && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        className="hover:text-blue-600"
                        title="Sửa"
                        onClick={() => {
                          setEditingPlan(plan);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(plan)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  Chưa có kế hoạch hoạt động nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ActivityPlanFormModal
        open={modalOpen}
        plan={editingPlan}
        onClose={() => {
          setModalOpen(false);
          setEditingPlan(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
