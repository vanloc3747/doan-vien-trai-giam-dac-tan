export type Gender = 'nam' | 'nu' | 'khac';
export type MemberType = 'doan_vien' | 'dang_vien_sinh_hoat_doan';

export interface Member {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  chapterId: number | null;
  chapterName?: string;
  departmentId: number | null;
  departmentName?: string;
  joinDate: string;
  memberType: MemberType;
  roleTitle: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  notes: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Chapter {
  id: number;
  name: string;
  memberCount?: number;
}

export interface Department {
  id: number;
  name: string;
  memberCount?: number;
}

export interface DashboardStats {
  totalMembers: number;
  totalMembersDeltaPct: number;
  doanVienCount: number;
  doanVienDeltaPct: number;
  dangVienCount: number;
  dangVienDeltaPct: number;
  transfers: number;
  transfersDeltaPct: number;
}

export interface GenderDistributionItem {
  gender: Gender;
  count: number;
  percentage: number;
}

export interface DepartmentDistributionItem {
  department: string;
  count: number;
}

export interface Birthday {
  id: number;
  fullName: string;
  dateOfBirth: string;
  department: string | null;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: 'admin' | 'can_bo_doan';
}

export interface PendingAccount {
  id: number;
  username: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
}
