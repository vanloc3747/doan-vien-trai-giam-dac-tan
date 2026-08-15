import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Upload } from 'lucide-react';
import type { DocumentFile } from '../types';
import { fetchDocumentCategories } from '../api/documents';
import type { DocumentFormInput } from '../api/documents';

interface DocumentFormModalProps {
  open: boolean;
  document: DocumentFile | null;
  onClose: () => void;
  onSubmit: (values: DocumentFormInput) => void;
  submitting?: boolean;
}

export function DocumentFormModal({ open, document, onClose, onSubmit, submitting }: DocumentFormModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useQuery({ queryKey: ['document-categories'], queryFn: fetchDocumentCategories });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setCategory(document.category ?? '');
    } else {
      setTitle('');
      setCategory('');
    }
    setFile(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [document, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!document && !file) return;
    onSubmit({ title, category: category.trim() || null, file });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {document ? 'Sửa tài liệu' : 'Thêm tài liệu'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tên tài liệu</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Loại tài liệu</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="document-category-options"
              placeholder="VD: Văn bản Đoàn, Biểu mẫu..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            <datalist id="document-category-options">
              {(categories ?? []).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              File {document ? '(để trống nếu giữ file hiện tại)' : '(PDF hoặc ảnh)'}
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-blue-400">
              <Upload size={16} />
              {file ? file.name : document ? `Hiện tại: ${document.fileName}` : 'Chọn file...'}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </label>
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
