import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { fetchReport } from '../api/dashboard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export function ChapterDonutPanel() {
  const { data } = useQuery({ queryKey: ['report', 'chapter'], queryFn: () => fetchReport('chapter') });
  const items = data ?? [];
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Số lượng đoàn viên theo chi đoàn</h3>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <PieChart width={160} height={160}>
            <Pie data={items} dataKey="count" nameKey="label" innerRadius={50} outerRadius={75} paddingAngle={2}>
              {items.map((entry, idx) => (
                <Cell key={entry.label} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{total.toLocaleString('vi-VN')}</span>
            <span className="text-xs text-slate-400">Tổng số</span>
          </div>
        </div>
        <div className="max-h-[160px] space-y-2 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-700">
                {item.count} ({total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
