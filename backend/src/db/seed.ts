import bcrypt from 'bcryptjs';
import { pool } from './pool';

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô', 'Dương', 'Lý'];
const DEM_NAM = ['Văn', 'Hữu', 'Đức', 'Thành', 'Công', 'Quang', 'Minh', 'Xuân'];
const DEM_NU = ['Thị', 'Ngọc', 'Thu', 'Kim', 'Hồng', 'Thanh', 'Mỹ'];
const TEN_NAM = ['An', 'Bình', 'Cường', 'Dũng', 'Duy', 'Đạt', 'Hải', 'Hùng', 'Khang', 'Long', 'Minh', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tài', 'Thắng', 'Trung', 'Tuấn', 'Việt'];
const TEN_NU = ['Anh', 'Chi', 'Diệp', 'Giang', 'Hà', 'Hoa', 'Huyền', 'Lan', 'Linh', 'Mai', 'My', 'Nga', 'Nhung', 'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Trinh', 'Vy', 'Yến'];

const DEPARTMENTS = ['Văn phòng', 'Trinh sát', 'Quản giáo', 'Hậu cần', 'Kỹ thuật', 'Y tế', 'Bảo vệ - Cơ động', 'Tổ chức - Cán bộ', 'Tham mưu', 'Hồ sơ'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear: number, endYear: number): Date {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function generateName(gender: 'nam' | 'nu'): string {
  const ho = randomItem(HO);
  const dem = gender === 'nam' ? randomItem(DEM_NAM) : randomItem(DEM_NU);
  const ten = gender === 'nam' ? randomItem(TEN_NAM) : randomItem(TEN_NU);
  return `${ho} ${dem} ${ten}`;
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Đang xoá dữ liệu cũ...');
    await client.query(
      'TRUNCATE member_events, committee_positions, users, members, chapters, departments RESTART IDENTITY CASCADE'
    );

    console.log('Đang tạo chi đoàn...');
    const chapterNames = ['Chi đoàn Văn phòng', 'Chi đoàn Trinh sát', 'Chi đoàn Quản giáo 1', 'Chi đoàn Quản giáo 2', 'Chi đoàn Hậu cần', 'Chi đoàn Kỹ thuật', 'Chi đoàn Y tế', 'Chi đoàn Bảo vệ - Cơ động', 'Chi đoàn Tham mưu', 'Chi đoàn Tổ chức - Cán bộ'];
    const chapterIds: number[] = [];
    for (const name of chapterNames) {
      const res = await client.query('INSERT INTO chapters (name) VALUES ($1) RETURNING id', [name]);
      chapterIds.push(res.rows[0].id);
    }
    console.log(`Đã tạo ${chapterIds.length} chi đoàn.`);

    console.log('Đang tạo bộ phận công tác...');
    const departmentIds: number[] = [];
    for (const name of DEPARTMENTS) {
      const res = await client.query('INSERT INTO departments (name) VALUES ($1) RETURNING id', [name]);
      departmentIds.push(res.rows[0].id);
    }
    console.log(`Đã tạo ${departmentIds.length} bộ phận công tác.`);

    console.log('Đang tạo đoàn viên...');
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();

    const memberIds: number[] = [];
    const TOTAL = 120;
    for (let i = 0; i < TOTAL; i++) {
      const genderRoll = Math.random();
      const gender = genderRoll < 0.48 ? 'nam' : genderRoll < 0.96 ? 'nu' : 'khac';
      const fullName = generateName(gender === 'khac' ? 'nam' : gender);

      let dob: Date;
      // Đảm bảo vài người sinh trong tháng hiện tại để panel sinh nhật có dữ liệu
      if (i < 5) {
        const day = 1 + Math.floor(Math.random() * 28);
        dob = new Date(1985 + Math.floor(Math.random() * 15), currentMonth, day);
      } else {
        dob = randomDate(1980, 2004);
      }

      const chapterId = randomItem(chapterIds);
      const departmentId = randomItem(departmentIds);
      const joinDate = randomDate(2015, 2026);
      const memberType = Math.random() < 0.9 ? 'doan_vien' : 'dang_vien_sinh_hoat_doan';
      const roleTitle = i === 0 ? 'Bí thư' : i === 1 ? 'Phó bí thư' : i < 6 ? 'Ủy viên BCH' : null;

      const res = await client.query(
        `INSERT INTO members (full_name, date_of_birth, gender, chapter_id, department_id, join_date, member_type, role_title, phone, email)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [
          fullName,
          toDateString(dob),
          gender,
          chapterId,
          departmentId,
          toDateString(joinDate),
          memberType,
          roleTitle,
          `09${Math.floor(10000000 + Math.random() * 89999999)}`,
          null,
        ]
      );
      const memberId = res.rows[0].id;
      memberIds.push(memberId);

      await client.query(
        `INSERT INTO member_events (member_id, event_type, event_date) VALUES ($1, 'created', $2)`,
        [memberId, toDateString(joinDate)]
      );
    }
    console.log(`Đã tạo ${memberIds.length} đoàn viên.`);

    console.log('Đang tạo sự kiện chuyển sinh hoạt/thay đổi tháng này...');
    const eventSampleSize = 15;
    for (let i = 0; i < eventSampleSize; i++) {
      const memberId = randomItem(memberIds);
      const eventType = Math.random() < 0.5 ? 'transferred' : 'type_changed';
      const day = 1 + Math.floor(Math.random() * 28);
      const eventDate = new Date(currentYear, currentMonth, day);
      await client.query(
        `INSERT INTO member_events (member_id, event_type, event_date) VALUES ($1, $2, $3)`,
        [memberId, eventType, toDateString(eventDate)]
      );
    }

    console.log('Đang tạo tài khoản admin mặc định...');
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await client.query(
      `INSERT INTO users (username, password_hash, full_name, role, status) VALUES ($1,$2,$3,$4,$5)`,
      ['admin', passwordHash, 'Nguyễn Văn A', 'admin', 'active']
    );

    console.log('Hoàn tất seed dữ liệu.');
    console.log('Tài khoản đăng nhập mặc định: username="admin", password="Admin@123" (hãy đổi mật khẩu sau khi đăng nhập lần đầu).');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
