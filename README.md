# Trang quản lý Đoàn viên Trại giam Đắc Tân

Ứng dụng quản lý thông tin đoàn viên (Đoàn TNCS Hồ Chí Minh): tổng quan thống kê, danh sách đoàn viên (CRUD, tìm kiếm, lọc, phân trang), khen thưởng - kỷ luật, xét duyệt đoàn viên/tài khoản, chi đoàn, phân quyền theo chi đoàn, và đăng nhập/đăng ký cho cán bộ đoàn.

## Kiến trúc

- `frontend/` — React + Vite + TypeScript + Tailwind CSS
- `backend/` — Node.js + Express + TypeScript
- Database + lưu trữ ảnh: [Supabase](https://supabase.com) (PostgreSQL + Storage)
- Hosting: [Vercel](https://vercel.com) — 2 project riêng (frontend và backend) cùng deploy từ repo này

## Trang web đang chạy

- Frontend: https://doan-vien-trai-giam-dac-tan-khqr.vercel.app
- Backend API: https://doan-vien-trai-giam-dac-tan.vercel.app

## Chạy local (development)

### 1. Chuẩn bị database + storage (Supabase)

Tạo project tại [supabase.com](https://supabase.com), lấy connection string ở mục Database → Connection Pooling (chọn "Transaction" mode, port 6543) và Service Role Key ở Settings → API. Chạy schema:

```bash
psql "$DATABASE_URL" -f backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # điền DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm install
npm run db:seed             # tạo dữ liệu mẫu + tài khoản admin
npm run db:setup-storage    # tạo 2 bucket Supabase Storage (member-photos, branding)
npm run dev
```

Backend chạy tại `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`.

### 4. Đăng nhập

Tài khoản admin mặc định sau khi seed: `admin` / `Admin@123` — hãy đổi mật khẩu ngay sau khi đăng nhập lần đầu (mục Cài đặt).

## Deploy lên Vercel

- **Backend**: tạo project mới, Root Directory = `backend`, Framework Preset = Express (Vercel tự nhận diện `src/index.ts`, không cần `vercel.json`). Biến môi trường: `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN` (domain frontend).
- **Frontend**: tạo project mới, Root Directory = `frontend`. Biến môi trường: `VITE_API_BASE_URL=/api`. `frontend/vercel.json` rewrite mọi request `/api/*` sang domain backend, giúp trình duyệt chỉ cần gọi cùng 1 origin (cookie đăng nhập giữ được `SameSite=Lax`, không cần cấu hình cross-site).
- Ảnh đại diện đoàn viên lưu ở bucket **private** (chỉ xem được qua signed URL có hạn 1 giờ do backend cấp sau khi xác thực); logo hệ thống lưu ở bucket **public**.
