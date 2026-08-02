import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  fetchActivityReports,
  createActivityReport,
  updateActivityReport,
  deleteActivityReport,
  deleteActivityReportImage,
} from '../api/activity-reports';
import type { ActivityReport } from '../types';
import { ActivityReportFormModal } from '../components/ActivityReportFormModal';
import { useAuth } from '../context/AuthContext';

export function ActivityReportsPage() {
  const { user } = useAuth();
  const canManageReport = (report: ActivityReport) =>
    user?.role === 'admin' || report.reportedById === user?.id;

  const { data } = useQuery({ queryKey: ['activity-reports'], queryFn: () => fetchActivityReports() });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ActivityReport | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['activity-reports'] });

  const createMutation = useMutation({
    mutationFn: ({ planId, content, images }: { planId: number; content: string; images: File[] }) =>
      createActivityReport(planId, content, images),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      planId,
      content,
      images,
    }: {
      id: number;
      planId: number;
      content: string;
      images: File[];
    }) => updateActivityReport(id, planId, content, images),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingReport(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteActivityReport(id),
    onSuccess: () => invalidate(),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => deleteActivityReportImage(imageId),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = (planId: number, content: string, images: File[]) => {
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, planId, content, images });
    } else {
      createMutation.mutate({ planId, content, images });
    }
  };

  const handleDelete = (report: ActivityReport) => {
    if (confirm(`Xóa kết quả hoạt động của "${report.planTitle}"?`)) {
      deleteMutation.mutate(report.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Kết quả hoạt động</h3>
        <button
          onClick={() => {
            setEditingReport(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm kết quả hoạt động
        </button>
      </div>

      <div className="space-y-3">
        {(data ?? []).map((report) => (
          <div key={report.id} className="rounded-lg border border-slate-100 p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-medium text-slate-700">{report.planTitle}</h4>
                <div className="text-xs text-slate-400">
                  Người báo cáo: {report.reportedByName ?? 'Không rõ'}
                </div>
              </div>
              {canManageReport(report) && (
                <div className="flex shrink-0 items-center gap-2 text-slate-400">
                  <button
                    className="hover:text-blue-600"
                    title="Sửa"
                    onClick={() => {
                      setEditingReport(report);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(report)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="mb-3 whitespace-pre-wrap text-sm text-slate-600">{report.content}</p>
            {report.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {report.images.map((img) => (
                  <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
                    <img
                      src={img.url}
                      alt=""
                      className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <div className="py-6 text-center text-sm text-slate-400">Chưa có kết quả hoạt động nào.</div>
        )}
      </div>

      <ActivityReportFormModal
        open={modalOpen}
        report={editingReport}
        onClose={() => {
          setModalOpen(false);
          setEditingReport(null);
        }}
        onSubmit={handleSubmit}
        onDeleteImage={(imageId) => deleteImageMutation.mutate(imageId)}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
