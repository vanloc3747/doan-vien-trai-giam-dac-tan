import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { ActivityPlan } from '../types';
import { fetchChapters } from '../api/chapters';
import type { ActivityPlanFormInput } from '../api/activity-plans';

const emptyValues: ActivityPlanFormInput = {
  title: '',
  startDate: '',
  endDate: '',
  content: '',
  chapterId: null,
};

interface ActivityPlanFormModalProps {
  open: boolean;
  plan: ActivityPlan | null;
  onClose: () => void;
  onSubmit: (values: ActivityPlanFormInput) => void;
  submitting?: boolean;
}

export function ActivityPlanFormModal({ open, plan, onClose, onSubmit, submitting }: ActivityPlanFormModalProps) {
  const [values, setValues] = useState<ActivityPlanFormInput>(emptyValues);
  const { data: chapters } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });

  useEffect(() => {
    if (plan) {
      setValues({
        title: plan.title,
        startDate: plan.startDate?.slice(0, 10) ?? '',
        endDate: plan.endDate?.slice(0, 10) ?? '',
        content: plan.content ?? '',
        chapterId: plan.chapterId,
      });
    } else {
      setValues(emptyValues);
    }
  }, [plan, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {plan ? 'Sửa kế hoạch hoạt động' : 'Thêm kế hoạch hoạt động'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tên kế hoạch</label>
            <input
              required
              value={values.title}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Ngày bắt đầu</label>
              <input
                required
                type="date"
                value={values.startDate}
                onChange={(e) => setValues({ ...values, startDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Ngày kết thúc</label>
              <input
                required
                type="date"
                value={values.endDate}
                onChange={(e) => setValues({ ...values, endDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Chi đoàn phụ trách</label>
            <select
              value={values.chapterId ?? ''}
              onChange={(e) =>
                setValues({ ...values, chapterId: e.target.value ? parseInt(e.target.value, 10) : null })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">-- Toàn Đoàn --</option>
              {(chapters ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Nội dung</label>
            <textarea
              value={values.content ?? ''}
              onChange={(e) => setValues({ ...values, content: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
