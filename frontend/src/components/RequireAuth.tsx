import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Đang tải...</div>;
  }
  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }
  return <>{children}</>;
}
