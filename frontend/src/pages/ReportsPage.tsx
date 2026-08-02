import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchReport } from '../api/dashboard';
import type { ReportDimension } from '../types';

const DIMENSION_OPTIONS: { value: ReportDimension; label: string }[] = [
  { value: 'gender', label: 'Giới tính' },
  { value: 'chapter', label: 'Chi đoàn' },
  { value: 'department', label: 'Bộ phận công tác' },
  { value: 'memberType', label: 'Phân loại (Đoàn viên/Đảng viên)' },
  { value: 'roleTitle', label: 'Chức vụ' },
  { value: 'ageGroup', label: 'Nhóm độ tuổi' },
];

export function ReportsPage() {
  const [dimension, setDimension] = useState<ReportDimension>('gender');
  const { data } = useQuery({ queryKey: ['report', dimension], queryFn: () => fetchReport(dimension) });

  const items = data ?? [];
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const currentLabel = DIMENSION_OPTIONS.find((o) => o.value === dimension)?.label ?? '';

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-800">Báo cáo – Thống kê đoàn viên</h3>
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value as ReportDimension)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
          >
            {DIMENSION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Thống kê theo {opt.label}
              </option>
            ))}
          </select>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Chi tiết theo {currentLabel}</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-2 pr-3 font-medium">{currentLabel}</th>
              <th className="py-2 pr-3 font-medium">Số lượng</th>
              <th className="py-2 pr-3 font-medium">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.label} className="border-b border-slate-50">
                <td className="py-3 pr-3 font-medium text-slate-700">{item.label}</td>
                <td className="py-3 pr-3 text-slate-500">{item.count}</td>
                <td className="py-3 pr-3 text-slate-500">
                  {total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="py-3 pr-3 font-semibold text-slate-700">Tổng cộng</td>
              <td className="py-3 pr-3 font-semibold text-slate-700">{total}</td>
              <td className="py-3 pr-3 font-semibold text-slate-700">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
