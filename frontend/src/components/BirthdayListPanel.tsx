import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import { fetchBirthdays } from '../api/dashboard';
import { BirthdayListModal } from './BirthdayListModal';

function formatDob(dob: string) {
  const d = new Date(dob);
  return d.toLocaleDateString('vi-VN');
}

export function BirthdayListPanel() {
  const { data } = useQuery({ queryKey: ['birthdays'], queryFn: fetchBirthdays });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Sinh nhật đoàn viên trong tháng</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Xem tất cả
        </button>
      </div>
      <div className="space-y-3">
        {(data ?? []).slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
              {item.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-700">{item.fullName}</div>
              <div className="text-xs text-slate-400">{formatDob(item.dateOfBirth)}</div>
            </div>
            <Gift size={16} className="text-pink-400" />
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <div className="text-sm text-slate-400">Không có sinh nhật nào trong tháng này.</div>
        )}
      </div>

      <BirthdayListModal open={modalOpen} birthdays={data ?? []} onClose={() => setModalOpen(false)} />
    </div>
  );
}
