import { X, User } from 'lucide-react';
import type { Member } from '../types';
import { resolveUploadUrl } from '../api/members';
import { MemberTypeBadge } from './MemberTypeBadge';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-700">{value}</div>
    </div>
  );
}

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
}

export function MemberDetailModal({ member, onClose }: MemberDetailModalProps) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Thông tin đoàn viên</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
            {member.photoUrl ? (
              <img
                src={resolveUploadUrl(member.photoUrl)}
                alt={member.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={32} />
            )}
          </div>
          <div>
            <div className="text-base font-semibold text-slate-800">{member.fullName}</div>
            <MemberTypeBadge memberType={member.memberType} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ngày sinh" value={formatDate(member.dateOfBirth)} />
          <Field label="Giới tính" value={member.gender === 'nam' ? 'Nam' : member.gender === 'nu' ? 'Nữ' : 'Khác'} />
          <Field label="Chi đoàn" value={member.chapterName ?? '-'} />
          <Field label="Bộ phận công tác" value={member.departmentName ?? '-'} />
          <Field label="Ngày vào Đoàn" value={formatDate(member.joinDate)} />
          <Field label="Chức vụ" value={member.roleTitleName ?? '-'} />
          <Field label="Trạng thái" value={member.approvalStatus === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'} />
          <Field label="Số điện thoại" value={member.phone ?? '-'} />
          <Field label="Email" value={member.email ?? '-'} />
        </div>

        <div className="mt-4">
          <div className="text-xs text-slate-400">Ghi chú</div>
          <div className="text-sm text-slate-700">{member.notes || '-'}</div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
