import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { Commendation, CommendationType } from '../types';
import { fetchMembers } from '../api/members';
import type { CommendationFormInput } from '../api/commendations';

const emptyValues: CommendationFormInput = {
  memberId: 0,
  type: 'khen_thuong',
  decisionDate: '',
  decisionNumber: '',
  content: '',
  issuedBy: '',
};

interface CommendationFormModalProps {
  open: boolean;
  commendation: Commendation | null;
  onClose: () => void;
  onSubmit: (values: CommendationFormInput) => void;
  submitting?: boolean;
}

export function CommendationFormModal({
  open,
  commendation,
  onClose,
  onSubmit,
  submitting,
}: CommendationFormModalProps) {
  const [values, setValues] = useState<CommendationFormInput>(emptyValues);
  const { data: membersData } = useQuery({
    queryKey: ['members-for-select'],
    queryFn: () => fetchMembers({ pageSize: 1000 }),
  });

  useEffect(() => {
    if (commendation) {
      setValues({
        memberId: commendation.memberId,
        type: commendation.type,
        decisionDate: commendation.decisionDate?.slice(0, 10) ?? '',
        decisionNumber: commendation.decisionNumber ?? '',
        content: commendation.content,
        issuedBy: commendation.issuedBy ?? '',
      });
    } else {
      setValues(emptyValues);
    }
  }, [commendation, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {commendation ? 'Sửa bản ghi khen thưởng/kỷ luật' : 'Thêm khen thưởng/kỷ luật'}
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
            <label className="mb-1 block text-sm font-medium text-slate-600">Đoàn viên</label>
            <select
              required
              value={values.memberId || ''}
              onChange={(e) => setValues({ ...values, memberId: parseInt(e.target.value, 10) })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">-- Chọn đoàn viên --</option>
              {(membersData?.data ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Loại</label>
              <select
                value={values.type}
                onChange={(e) => setValues({ ...values, type: e.target.value as CommendationType })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="khen_thuong">Khen thưởng</option>
                <option value="ky_luat">Kỷ luật</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Ngày quyết định</label>
              <input
                required
                type="date"
                value={values.decisionDate}
                onChange={(e) => setValues({ ...values, decisionDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Số quyết định</label>
              <input
                value={values.decisionNumber ?? ''}
                onChange={(e) => setValues({ ...values, decisionNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Đơn vị ra quyết định</label>
              <input
                value={values.issuedBy ?? ''}
                onChange={(e) => setValues({ ...values, issuedBy: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Nội dung</label>
            <textarea
              required
              value={values.content}
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
