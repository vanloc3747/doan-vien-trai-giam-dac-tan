import { useQuery } from '@tanstack/react-query';
import { fetchChapters } from '../api/chapters';

export function ChaptersPage() {
  const { data } = useQuery({ queryKey: ['chapters'], queryFn: fetchChapters });

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">Danh sách chi đoàn</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="py-2 pr-3 font-medium">Tên chi đoàn</th>
            <th className="py-2 pr-3 font-medium">Số đoàn viên</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((chapter) => (
            <tr key={chapter.id} className="border-b border-slate-50">
              <td className="py-3 pr-3 font-medium text-slate-700">{chapter.name}</td>
              <td className="py-3 pr-3 text-slate-500">{chapter.memberCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
