interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-1 py-4 text-sm">
      <div className="text-slate-500">
        Hiển thị {from} đến {to} của {total} đoàn viên
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 disabled:opacity-40"
        >
          ‹
        </button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-md px-3 py-1 ${
              p === page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
        {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 disabled:opacity-40"
        >
          ›
        </button>
      </div>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        className="rounded-md border border-slate-200 px-2 py-1 text-slate-600"
      >
        <option value={10}>10 / trang</option>
        <option value={20}>20 / trang</option>
        <option value={50}>50 / trang</option>
      </select>
    </div>
  );
}
