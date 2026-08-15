import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, FileText, Eye } from 'lucide-react';
import {
  fetchDocuments,
  fetchDocumentCategories,
  createDocument,
  updateDocument,
  deleteDocument,
  type DocumentFormInput,
} from '../api/documents';
import type { DocumentFile } from '../types';
import { DocumentFormModal } from '../components/DocumentFormModal';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function formatFileSize(bytes: number | null) {
  if (bytes == null) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [fileType, setFileType] = useState('');

  const { data } = useQuery({
    queryKey: ['documents', { search, category, fileType }],
    queryFn: () => fetchDocuments({ search: search || undefined, category: category || undefined, fileType: fileType || undefined }),
  });
  const { data: categories } = useQuery({ queryKey: ['document-categories'], queryFn: fetchDocumentCategories });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentFile | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['document-categories'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: DocumentFormInput) => createDocument(input),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: DocumentFormInput }) => updateDocument(id, input),
    onSuccess: () => {
      invalidate();
      setModalOpen(false);
      setEditingDocument(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => invalidate(),
  });

  const handleSubmit = (values: DocumentFormInput) => {
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, input: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = (doc: DocumentFile) => {
    if (confirm(`Xóa tài liệu "${doc.title}"?`)) {
      deleteMutation.mutate(doc.id);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Tài liệu</h3>
        {canManage && (
          <button
            onClick={() => {
              setEditingDocument(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Thêm tài liệu
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên tài liệu..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
        >
          <option value="">-- Loại tài liệu --</option>
          {(categories ?? []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
        >
          <option value="">-- Định dạng --</option>
          <option value="pdf">PDF</option>
          <option value="image">Ảnh</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="py-2 pr-3 font-medium"></th>
              <th className="py-2 pr-3 font-medium">Tên tài liệu</th>
              <th className="py-2 pr-3 font-medium">Loại</th>
              <th className="py-2 pr-3 font-medium">Kích thước</th>
              <th className="py-2 pr-3 font-medium">Người tải lên</th>
              <th className="py-2 pr-3 font-medium">Ngày tải lên</th>
              <th className="py-2 pr-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((doc) => (
              <tr key={doc.id} className="border-b border-slate-50">
                <td className="py-3 pr-3">
                  {doc.fileType === 'image' && doc.fileUrl ? (
                    <img
                      src={doc.fileUrl}
                      alt={doc.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                      <FileText size={20} />
                    </div>
                  )}
                </td>
                <td className="py-3 pr-3 font-medium text-slate-700">{doc.title}</td>
                <td className="py-3 pr-3 text-slate-500">{doc.category ?? '-'}</td>
                <td className="py-3 pr-3 text-slate-500">{formatFileSize(doc.fileSize)}</td>
                <td className="py-3 pr-3 text-slate-500">{doc.uploadedByName ?? '-'}</td>
                <td className="py-3 pr-3 text-slate-500">{formatDate(doc.createdAt)}</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-600"
                        title="Xem"
                      >
                        <Eye size={16} />
                      </a>
                    )}
                    {canManage && (
                      <>
                        <button
                          className="hover:text-blue-600"
                          title="Sửa"
                          onClick={() => {
                            setEditingDocument(doc);
                            setModalOpen(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button className="hover:text-red-500" title="Xóa" onClick={() => handleDelete(doc)}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  Chưa có tài liệu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DocumentFormModal
        open={modalOpen}
        document={editingDocument}
        onClose={() => {
          setModalOpen(false);
          setEditingDocument(null);
        }}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
