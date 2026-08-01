# Trang quản lý Đoàn viên Trại giam Đắc Tân

Ứng dụng quản lý thông tin đoàn viên (Đoàn TNCS Hồ Chí Minh): tổng quan thống kê, danh sách đoàn viên (CRUD, tìm kiếm, lọc, phân trang), xét duyệt đoàn viên/tài khoản, chi đoàn, và đăng nhập/đăng ký cho cán bộ đoàn.

## Kiến trúc

- `frontend/` — React + Vite + TypeScript + Tailwind CSS
- `backend/` — Node.js + Express + TypeScript + PostgreSQL

## Giới hạn quan trọng

Bản build frontend deploy trên **GitHub Pages chỉ là giao diện tĩnh**. Backend (Express + PostgreSQL) chỉ chạy trên máy local (`localhost`), không được deploy công khai. Vì vậy trên GitHub Pages, các phần lấy dữ liệu thật (thống kê, danh sách đoàn viên...) sẽ không hoạt động — muốn xem đầy đủ chức năng, hãy chạy cả backend và frontend ở local theo hướng dẫn dưới đây.

## Chạy local

### 1. Chuẩn bị database

```powershell
psql -U postgres -c "CREATE DATABASE doan_tncs;"
psql -U postgres -d doan_tncs -f backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # rồi điền mật khẩu PostgreSQL thật vào DATABASE_URL và đặt JWT_SECRET ngẫu nhiên
npm install
npm run db:seed
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
