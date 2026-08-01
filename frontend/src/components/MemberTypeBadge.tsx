import type { MemberType } from '../types';

const labels: Record<MemberType, string> = {
  doan_vien: 'Đoàn viên',
  dang_vien_sinh_hoat_doan: 'Đảng viên sinh hoạt đoàn',
};

const colors: Record<MemberType, string> = {
  doan_vien: 'bg-blue-50 text-blue-700',
  dang_vien_sinh_hoat_doan: 'bg-emerald-50 text-emerald-700',
};

export function MemberTypeBadge({ memberType }: { memberType: MemberType }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[memberType]}`}>
      {labels[memberType]}
    </span>
  );
}
