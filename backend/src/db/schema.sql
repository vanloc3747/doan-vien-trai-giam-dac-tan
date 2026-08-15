-- Schema cho hệ thống quản lý Đoàn viên Trại giam Đắc Tân

CREATE TYPE gender_enum AS ENUM ('nam', 'nu', 'khac');
CREATE TYPE member_type_enum AS ENUM ('doan_vien', 'dang_vien_sinh_hoat_doan');
CREATE TYPE user_role_enum AS ENUM ('admin', 'can_bo_doan');
CREATE TYPE account_status_enum AS ENUM ('pending', 'active', 'rejected');
CREATE TYPE member_approval_status_enum AS ENUM ('approved', 'pending');
CREATE TYPE commendation_type_enum AS ENUM ('khen_thuong', 'ky_luat');
CREATE TYPE activity_plan_status_enum AS ENUM ('chua_thuc_hien', 'dang_thuc_hien', 'da_hoan_thanh');

CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_titles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_enum NOT NULL,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  join_date DATE NOT NULL,
  member_type member_type_enum NOT NULL DEFAULT 'doan_vien',
  role_title_id INTEGER REFERENCES role_titles(id) ON DELETE SET NULL,
  phone VARCHAR(20),
  email VARCHAR(150),
  photo_url TEXT,
  notes TEXT,
  approval_status member_approval_status_enum NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_chapter ON members(chapter_id);
CREATE INDEX idx_members_type ON members(member_type);
CREATE INDEX idx_members_department ON members(department_id);
CREATE INDEX idx_members_dob_month ON members ((EXTRACT(MONTH FROM date_of_birth)));
CREATE INDEX idx_members_name_search ON members USING gin (to_tsvector('simple', full_name));

CREATE TABLE committee_positions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
  position VARCHAR(100) NOT NULL,
  assigned_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE member_commendations (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type commendation_type_enum NOT NULL,
  decision_date DATE NOT NULL,
  decision_number VARCHAR(100),
  content TEXT NOT NULL,
  issued_by VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commendations_member ON member_commendations(member_id);

CREATE TABLE member_events (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL, -- 'created' | 'type_changed' | 'transferred'
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meta JSONB
);

CREATE INDEX idx_member_events_date ON member_events(event_date);
CREATE INDEX idx_member_events_type ON member_events(event_type);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'can_bo_doan',
  status account_status_enum NOT NULL DEFAULT 'pending',
  member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
  managed_chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  logo_url TEXT,
  title VARCHAR(200) NOT NULL DEFAULT 'TRẠI GIAM ĐẮC TÂN',
  subtitle VARCHAR(200) NOT NULL DEFAULT 'ĐOÀN TNCS HỒ CHÍ MINH',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_settings (id) VALUES (1);

CREATE TABLE calendar_notes (
  id SERIAL PRIMARY KEY,
  note_date DATE NOT NULL,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_notes_date ON calendar_notes(note_date);

CREATE TABLE activity_plans (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  content TEXT,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
  status activity_plan_status_enum NOT NULL DEFAULT 'chua_thuc_hien',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_plans_start_date ON activity_plans(start_date);

CREATE TABLE activity_reports (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES activity_plans(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_report_images (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES activity_reports(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_reports_plan ON activity_reports(plan_id);
CREATE INDEX idx_activity_report_images_report ON activity_report_images(report_id);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL, -- 'pdf' | 'image'
  file_size INTEGER,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_title_search ON documents USING gin (to_tsvector('simple', title));

-- Bật Row Level Security cho mọi bảng: toàn bộ truy cập dữ liệu đi qua backend Express
-- (kết nối bằng role postgres, có BYPASSRLS nên không bị ảnh hưởng). Việc bật RLS chỉ nhằm
-- chặn API PostgREST tự sinh của Supabase (qua anon/service key) truy cập thẳng vào các bảng này.
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_commendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
