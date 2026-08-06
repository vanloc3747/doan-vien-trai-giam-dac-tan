import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  fetchCalendarNotes,
  createCalendarNote,
  updateCalendarNote,
  deleteCalendarNote,
} from '../api/calendar-notes';
import type { CalendarNote } from '../types';
import { useAuth } from '../context/AuthContext';

const WEEKDAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function buildMonthCells(year: number, month: number) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const jsDay = firstOfMonth.getDay();
  const mondayOffset = (jsDay + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function DayNoteModal({
  dateKey,
  notes,
  canManage,
  onClose,
}: {
  dateKey: string;
  notes: CalendarNote[];
  canManage: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['calendar-notes'] });

  const createMutation = useMutation({
    mutationFn: (text: string) => createCalendarNote(dateKey, text),
    onSuccess: () => {
      invalidate();
      setContent('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => updateCalendarNote(id, dateKey, text),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCalendarNote(id),
    onSuccess: invalidate,
  });

  const [d, m, y] = [
    parseInt(dateKey.slice(8, 10), 10),
    parseInt(dateKey.slice(5, 7), 10),
    parseInt(dateKey.slice(0, 4), 10),
  ];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">
            Ghi chú ngày {pad2(d)}/{pad2(m)}/{y}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
          {notes.length === 0 && <div className="text-sm text-slate-400">Chưa có ghi chú nào.</div>}
          {notes.map((note) =>
            editingId === note.id ? (
              <div key={note.id} className="space-y-2 rounded-lg border border-slate-200 p-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-blue-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg px-3 py-1 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: note.id, text: editingContent })}
                    disabled={updateMutation.isPending}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={note.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 p-2 text-sm text-slate-600"
              >
                <span className="whitespace-pre-wrap">{note.content}</span>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-2 text-slate-400">
                    <button
                      className="hover:text-blue-600"
                      title="Sửa"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditingContent(note.content);
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="hover:text-red-500"
                      title="Xóa"
                      onClick={() => {
                        if (confirm('Xóa ghi chú này?')) deleteMutation.mutate(note.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {canManage && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              placeholder="Nhập nội dung công việc..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
            <div className="flex justify-end">
              <button
                onClick={() => content.trim() && createMutation.mutate(content.trim())}
                disabled={createMutation.isPending || !content.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus size={16} /> Thêm ghi chú
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin';

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['calendar-notes', viewDate.year, viewDate.month],
    queryFn: () => fetchCalendarNotes(viewDate.year, viewDate.month),
  });

  const notesByDate = useMemo(() => {
    const map = new Map<string, CalendarNote[]>();
    for (const note of data ?? []) {
      const key = note.noteDate.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(note);
    }
    return map;
  }, [data]);

  const cells = useMemo(() => buildMonthCells(viewDate.year, viewDate.month), [viewDate]);

  const goToPrevMonth = () => {
    setViewDate(({ year, month }) => (month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }));
  };
  const goToNextMonth = () => {
    setViewDate(({ year, month }) => (month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }));
  };

  const todayKey = toDateKey(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">
          Lịch công tác — Tháng {pad2(viewDate.month)}/{viewDate.year}
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
            <ChevronLeft size={16} />
          </button>
          <button onClick={goToNextMonth} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {!canManage && (
        <div className="mb-3 text-sm text-slate-400">Bạn đang xem ghi chú công tác do quản trị viên đăng.</div>
      )}

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day == null) return <div key={idx} className="min-h-[64px] sm:min-h-[88px] rounded-lg bg-slate-50/50" />;
          const dateKey = toDateKey(viewDate.year, viewDate.month, day);
          const dayNotes = notesByDate.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;
          return (
            <button
              key={idx}
              onClick={() => setSelectedDateKey(dateKey)}
              className={`flex min-h-[64px] sm:min-h-[88px] flex-col items-start rounded-lg border p-2 text-left text-sm transition-colors hover:border-blue-300 hover:bg-blue-50/50 ${
                isToday ? 'border-blue-400 bg-blue-50/40' : 'border-slate-100'
              }`}
            >
              <span className={`mb-1 font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</span>
              {dayNotes.slice(0, 2).map((note) => (
                <span
                  key={note.id}
                  className="mb-0.5 w-full truncate rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] text-emerald-700"
                  title={note.content}
                >
                  {note.content}
                </span>
              ))}
              {dayNotes.length > 2 && (
                <span className="text-[11px] text-slate-400">+{dayNotes.length - 2} ghi chú khác</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDateKey && (
        <DayNoteModal
          dateKey={selectedDateKey}
          notes={notesByDate.get(selectedDateKey) ?? []}
          canManage={canManage}
          onClose={() => setSelectedDateKey(null)}
        />
      )}
    </div>
  );
}
