export type Gender = 'nam' | 'nu' | 'khac';
export type MemberType = 'doan_vien' | 'dang_vien_sinh_hoat_doan';
export type ApprovalStatus = 'approved' | 'pending';

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
  roleTitleId: number | null;
  roleTitleName?: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  notes: string | null;
  approvalStatus: ApprovalStatus;
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

export interface RoleTitle {
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

export type ReportDimension = 'gender' | 'chapter' | 'department' | 'memberType' | 'roleTitle' | 'ageGroup';

export interface ReportItem {
  label: string;
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
  managedChapterId: number | null;
}

export interface UserAccount {
  id: number;
  username: string;
  fullName: string;
  role: string;
  status: string;
  managedChapterId: number | null;
  managedChapterName?: string;
}

export interface PendingAccount {
  id: number;
  username: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface AppSettings {
  logoUrl: string | null;
  title: string;
  subtitle: string;
}

export type CommendationType = 'khen_thuong' | 'ky_luat';

export interface Commendation {
  id: number;
  memberId: number;
  memberName: string;
  chapterName?: string;
  type: CommendationType;
  decisionDate: string;
  decisionNumber: string | null;
  content: string;
  issuedBy: string | null;
}

export interface CalendarNote {
  id: number;
  noteDate: string;
  content: string;
}

export interface CommendationStats {
  totalByType: { khenThuong: number; kyLuat: number };
  byChapter: { chapterName: string; khenThuong: number; kyLuat: number }[];
  byMonth: { month: number; khenThuong: number; kyLuat: number }[];
}

export type ActivityPlanStatus = 'chua_thuc_hien' | 'dang_thuc_hien' | 'da_hoan_thanh';

export interface ActivityPlan {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  content: string | null;
  chapterId: number | null;
  chapterName?: string;
  status: ActivityPlanStatus;
}

export interface ActivityReportImage {
  id: number;
  url: string;
}

export interface ActivityReport {
  id: number;
  planId: number;
  planTitle: string;
  content: string;
  reportedById: number | null;
  reportedByManagedChapterId: number | null;
  reportedByManagedChapterName: string | null;
  images: ActivityReportImage[];
}
