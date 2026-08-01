import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Department } from '../types';

interface DepartmentFormModalProps {
  open: boolean;
  department: Department | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
  submitting?: boolean;
}

export function DepartmentFormModal({ open, department, onClose, onSubmit, submitting }: DepartmentFormModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(department?.name ?? '');
  }, [department, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {department ? 'Sửa bộ phận công tác' : 'Thêm bộ phận công tác'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(name);
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tên bộ phận công tác</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
