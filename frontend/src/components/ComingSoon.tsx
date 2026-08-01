export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-96 flex-col items-center justify-center rounded-xl bg-white text-center shadow-sm">
      <div className="text-lg font-semibold text-slate-700">{title}</div>
      <p className="mt-2 text-sm text-slate-400">Chức năng đang được phát triển, sẽ sớm ra mắt.</p>
    </div>
  );
}
