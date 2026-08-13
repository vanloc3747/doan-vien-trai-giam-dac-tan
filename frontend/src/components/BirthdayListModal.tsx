import { X, Gift } from 'lucide-react';
import type { Birthday } from '../types';

function formatDob(dob: string) {
  return new Date(dob).toLocaleDateString('vi-VN');
}

interface BirthdayListModalProps {
  open: boolean;
  birthdays: Birthday[];
  onClose: () => void;
}

export function BirthdayListModal({ open, birthdays, onClose }: BirthdayListModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg max-h-[85vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Sinh nhật đoàn viên trong tháng {new Date().getMonth() + 1}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {birthdays.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                {item.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-700">{item.fullName}</div>
                <div className="text-xs text-slate-400">
                  {formatDob(item.dateOfBirth)}
                  {item.department ? ` · ${item.department}` : ''}
                </div>
              </div>
              <Gift size={16} className="shrink-0 text-pink-400" />
            </div>
          ))}
          {birthdays.length === 0 && (
            <div className="text-sm text-slate-400">Không có sinh nhật nào trong tháng này.</div>
          )}
        </div>
      </div>
    </div>
  );
}
