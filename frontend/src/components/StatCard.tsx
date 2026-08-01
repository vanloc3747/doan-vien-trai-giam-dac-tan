import type { ComponentType } from 'react';

interface StatCardProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string | number;
  deltaPct: number;
  colorClass: string;
}

export function StatCard({ icon: Icon, title, value, deltaPct, colorClass }: StatCardProps) {
  const isUp = deltaPct >= 0;
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-semibold text-slate-800">{value}</div>
        <div className={`text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {isUp ? '↑' : '↓'} {Math.abs(deltaPct)}% so với tháng trước
        </div>
      </div>
    </div>
  );
}
