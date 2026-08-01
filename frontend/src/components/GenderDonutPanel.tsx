import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { fetchGenderDistribution } from '../api/dashboard';

const genderLabels: Record<string, string> = { nam: 'Nam', nu: 'Nữ', khac: 'Khác' };
const genderColors: Record<string, string> = { nam: '#3b82f6', nu: '#ec4899', khac: '#f59e0b' };

export function GenderDonutPanel() {
  const { data } = useQuery({ queryKey: ['gender-distribution'], queryFn: fetchGenderDistribution });

  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Thống kê đoàn viên</h3>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <PieChart width={160} height={160}>
            <Pie
              data={data ?? []}
              dataKey="count"
              nameKey="gender"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
            >
              {(data ?? []).map((entry) => (
                <Cell key={entry.gender} fill={genderColors[entry.gender]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{total.toLocaleString('vi-VN')}</span>
            <span className="text-xs text-slate-400">Tổng số</span>
          </div>
        </div>
        <div className="space-y-2">
          {(data ?? []).map((item) => (
            <div key={item.gender} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: genderColors[item.gender] }} />
              <span className="text-slate-500">{genderLabels[item.gender]}</span>
              <span className="font-medium text-slate-700">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
