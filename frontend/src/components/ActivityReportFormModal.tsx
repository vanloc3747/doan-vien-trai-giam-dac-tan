import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { ActivityReport, ActivityReportImage } from '../types';
import { fetchActivityPlans } from '../api/activity-plans';
import { useAuth } from '../context/AuthContext';

interface ActivityReportFormModalProps {
  open: boolean;
  report: ActivityReport | null;
  onClose: () => void;
  onSubmit: (planId: number, content: string, images: File[]) => void;
  onDeleteImage: (imageId: number) => void;
  submitting?: boolean;
}

export function ActivityReportFormModal({
  open,
  report,
  onClose,
  onSubmit,
  onDeleteImage,
  submitting,
}: ActivityReportFormModalProps) {
  const { user } = useAuth();
  const { data: plans } = useQuery({ queryKey: ['activity-plans'], queryFn: fetchActivityPlans });
  const selectablePlans = (plans ?? []).filter(
    (p) =>
      user?.role === 'admin' ||
      p.chapterId == null ||
      p.chapterId === user?.managedChapterId ||
      p.id === report?.planId
  );
  const [planId, setPlanId] = useState('');
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState<ActivityReportImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (report) {
      setPlanId(String(report.planId));
      setContent(report.content);
      setExistingImages(report.images);
    } else {
      setPlanId('');
      setContent('');
      setExistingImages([]);
    }
    setNewFiles([]);
  }, [report, open]);

  if (!open) return null;

  const handleDeleteExistingImage = (imageId: number) => {
    onDeleteImage(imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {report ? 'Sửa kết quả hoạt động' : 'Thêm kết quả hoạt động'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!planId) return;
            onSubmit(parseInt(planId, 10), content, newFiles);
          }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Kế hoạch hoạt động</label>
            <select
              required
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            >
              <option value="">-- Chọn kế hoạch hoạt động --</option>
              {selectablePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Nội dung báo cáo</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          {existingImages.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Hình ảnh hiện có</label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      title="Xóa ảnh"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Thêm hình ảnh</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-600 hover:file:bg-slate-200"
            />
            {newFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {newFiles.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
            )}
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
