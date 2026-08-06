import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, User } from 'lucide-react';
import type { Member } from '../types';
import { fetchChapters } from '../api/chapters';
import { fetchDepartments } from '../api/departments';
import { fetchRoleTitles } from '../api/role-titles';
import { resolveUploadUrl } from '../api/members';

export interface MemberFormValues {
  fullName: string;
  dateOfBirth: string;
  gender: 'nam' | 'nu' | 'khac';
  chapterId: number | null;
  departmentId: number | null;
  joinDate: string;
  memberType: 'doan_vien' | 'dang_vien_sinh_hoat_doan';
  roleTitleId: number | null;
  phone: string;
  email: string;
  notes: string;
}

const emptyValues: MemberFormValues = {
  fullName: '',
  dateOfBirth: '',
  gender: 'nam',
  chapterId: null,
  departmentId: null,
  joinDate: '',
  memberType: 'doan_vien',
  roleTitleId: null,
  phone: '',
  email: '',
  notes: '',
};

interface MemberFormModalProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSubmit: (values: MemberFormValues, photoFile: File | null) => void;
  submitting?: boolean;
  lockedChapterId?: number | null;
}

export function MemberFormModal({
  open,
  member,
  onClose,
  onSubmit,
  submitting,
  lockedChapterId,
}: MemberFormModalProps) {
  const [values, setValues] = useState<MemberFormValues>(emptyValues);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { data: chapters } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: fetchDepartments });
  const { data: roleTitles } = useQuery({ queryKey: ['role-titles'], queryFn: fetchRoleTitles });

  useEffect(() => {
    if (member) {
      setValues({
        fullName: member.fullName,
        dateOfBirth: member.dateOfBirth?.slice(0, 10) ?? '',
        gender: member.gender,
        chapterId: lockedChapterId ?? member.chapterId,
        departmentId: member.departmentId,
        joinDate: member.joinDate?.slice(0, 10) ?? '',
        memberType: member.memberType,
        roleTitleId: member.roleTitleId,
        phone: member.phone ?? '',
        email: member.email ?? '',
        notes: member.notes ?? '',
      });
      setPhotoPreview(member.photoUrl ? resolveUploadUrl(member.photoUrl) : null);
    } else {
      setValues({ ...emptyValues, chapterId: lockedChapterId ?? null });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  }, [member, open, lockedChapterId]);

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(member?.photoUrl ? resolveUploadUrl(member.photoUrl) : null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {member ? 'Sửa thông tin đoàn viên' : 'Thêm đoàn viên'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values, photoFile);
          }}
          className="space-y-3"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
              {photoPreview ? (
                <img src={photoPreview} alt="Ảnh đại diện" className="h-full w-full object-cover" />
              ) : (
                <User size={28} />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Ảnh đại diện</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Họ và tên</label>
            <input
              required
              value={values.fullName}
              onChange={(e) => setValues({ ...values, fullName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Ngày sinh</label>
              <input
                required
                type="date"
                value={values.dateOfBirth}
                onChange={(e) => setValues({ ...values, dateOfBirth: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Giới tính</label>
              <select
                value={values.gender}
                onChange={(e) => setValues({ ...values, gender: e.target.value as MemberFormValues['gender'] })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
                <option value="khac">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Chi đoàn</label>
              <select
                value={values.chapterId ?? ''}
                disabled={lockedChapterId != null}
                onChange={(e) =>
                  setValues({ ...values, chapterId: e.target.value ? parseInt(e.target.value, 10) : null })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">-- Chọn chi đoàn --</option>
                {(chapters ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Bộ phận công tác</label>
              <select
                value={values.departmentId ?? ''}
                onChange={(e) =>
                  setValues({ ...values, departmentId: e.target.value ? parseInt(e.target.value, 10) : null })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="">-- Chọn bộ phận công tác --</option>
                {(departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Ngày vào Đoàn</label>
              <input
                required
                type="date"
                value={values.joinDate}
                onChange={(e) => setValues({ ...values, joinDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Phân loại</label>
              <select
                value={values.memberType}
                onChange={(e) =>
                  setValues({ ...values, memberType: e.target.value as MemberFormValues['memberType'] })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="doan_vien">Đoàn viên</option>
                <option value="dang_vien_sinh_hoat_doan">Đảng viên sinh hoạt đoàn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Chức vụ</label>
              <select
                value={values.roleTitleId ?? ''}
                onChange={(e) =>
                  setValues({ ...values, roleTitleId: e.target.value ? parseInt(e.target.value, 10) : null })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="">-- Chọn chức vụ --</option>
                {(roleTitles ?? []).map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Số điện thoại</label>
              <input
                value={values.phone}
                onChange={(e) => setValues({ ...values, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Ghi chú</label>
            <textarea
              value={values.notes}
              onChange={(e) => setValues({ ...values, notes: e.target.value })}
              rows={2}
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
