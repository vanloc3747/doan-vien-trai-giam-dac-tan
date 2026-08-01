import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { fetchChapters } from '../api/chapters';

interface MemberFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  chapterId: string;
  onChapterChange: (value: string) => void;
  memberType: string;
  onMemberTypeChange: (value: string) => void;
}

export function MemberFilters({
  search,
  onSearchChange,
  chapterId,
  onChapterChange,
  memberType,
  onMemberTypeChange,
}: MemberFiltersProps) {
  const { data: chapters } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tên, SĐT, email..."
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
        />
      </div>
      <select
        value={chapterId}
        onChange={(e) => onChapterChange(e.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
      >
        <option value="">-- Chi đoàn --</option>
        {(chapters ?? []).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={memberType}
        onChange={(e) => onMemberTypeChange(e.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
      >
        <option value="">-- Phân loại --</option>
        <option value="doan_vien">Đoàn viên</option>
        <option value="dang_vien_sinh_hoat_doan">Đảng viên sinh hoạt đoàn</option>
      </select>
    </div>
  );
}
