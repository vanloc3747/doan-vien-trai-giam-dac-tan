import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, ShieldAlert } from 'lucide-react';
import { fetchReport } from '../api/dashboard';
import { fetchCommendationStats } from '../api/commendations';
import type { ReportDimension } from '../types';

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `Th ${i + 1}`);

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
  const { data: commendationStats } = useQuery({
    queryKey: ['commendation-stats'],
    queryFn: fetchCommendationStats,
  });

  const items = data ?? [];
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const currentLabel = DIMENSION_OPTIONS.find((o) => o.value === dimension)?.label ?? '';

  const totalKhenThuong = commendationStats?.totalByType.khenThuong ?? 0;
  const totalKyLuat = commendationStats?.totalByType.kyLuat ?? 0;
  const byChapter = commendationStats?.byChapter ?? [];
  const byMonth = (commendationStats?.byMonth ?? []).map((m) => ({
    ...m,
    monthLabel: MONTH_LABELS[m.month - 1],
  }));

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
        <div className="overflow-x-auto">
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

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Thống kê Khen thưởng - Kỷ luật</h3>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Award size={22} />
            </div>
            <div>
              <div className="text-sm text-slate-500">Tổng Khen thưởng</div>
              <div className="text-2xl font-semibold text-slate-800">{totalKhenThuong}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="text-sm text-slate-500">Tổng Kỷ luật</div>
              <div className="text-2xl font-semibold text-slate-800">{totalKyLuat}</div>
            </div>
          </div>
        </div>

        <h4 className="mb-2 text-sm font-medium text-slate-600">Theo chi đoàn</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byChapter}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="chapterName"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="khenThuong" name="Khen thưởng" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="kyLuat" name="Kỷ luật" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <h4 className="mb-2 mt-6 text-sm font-medium text-slate-600">
          Theo tháng trong năm {new Date().getFullYear()}
        </h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="khenThuong" name="Khen thưởng" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="kyLuat" name="Kỷ luật" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
