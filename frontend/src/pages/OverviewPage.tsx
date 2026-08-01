import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, ShieldCheck, Repeat2 } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { GenderDonutPanel } from '../components/GenderDonutPanel';
import { DepartmentBarPanel } from '../components/DepartmentBarPanel';
import { BirthdayListPanel } from '../components/BirthdayListPanel';
import { MemberTable } from '../components/MemberTable';
import { fetchDashboardStats } from '../api/dashboard';

export function OverviewPage() {
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchDashboardStats });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Tổng số đoàn viên"
          value={(stats?.totalMembers ?? 0).toLocaleString('vi-VN')}
          deltaPct={stats?.totalMembersDeltaPct ?? 0}
          colorClass="bg-blue-500"
        />
        <StatCard
          icon={UserPlus}
          title="Đoàn viên"
          value={(stats?.doanVienCount ?? 0).toLocaleString('vi-VN')}
          deltaPct={stats?.doanVienDeltaPct ?? 0}
          colorClass="bg-emerald-500"
        />
        <StatCard
          icon={ShieldCheck}
          title="Đảng viên sinh hoạt đoàn"
          value={(stats?.dangVienCount ?? 0).toLocaleString('vi-VN')}
          deltaPct={stats?.dangVienDeltaPct ?? 0}
          colorClass="bg-amber-500"
        />
        <StatCard
          icon={Repeat2}
          title="Chuyển sinh hoạt"
          value={(stats?.transfers ?? 0).toLocaleString('vi-VN')}
          deltaPct={stats?.transfersDeltaPct ?? 0}
          colorClass="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GenderDonutPanel />
        <DepartmentBarPanel />
        <BirthdayListPanel />
      </div>

      <MemberTable embedded />
    </div>
  );
}
