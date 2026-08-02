import { pool } from '../db/pool';

async function countMembers(memberType?: string) {
  const result = memberType
    ? await pool.query('SELECT COUNT(*) FROM members WHERE member_type = $1', [memberType])
    : await pool.query('SELECT COUNT(*) FROM members');
  return parseInt(result.rows[0].count, 10);
}

async function countEventsThisMonth(eventType: string) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM member_events
     WHERE event_type = $1
       AND date_trunc('month', event_date) = date_trunc('month', CURRENT_DATE)`,
    [eventType]
  );
  return parseInt(result.rows[0].count, 10);
}

async function countEventsLastMonth(eventType: string) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM member_events
     WHERE event_type = $1
       AND date_trunc('month', event_date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')`,
    [eventType]
  );
  return parseInt(result.rows[0].count, 10);
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardStats() {
  const totalMembers = await countMembers();
  const doanVienCount = await countMembers('doan_vien');
  const dangVienCount = await countMembers('dang_vien_sinh_hoat_doan');

  const createdThisMonth = await countEventsThisMonth('created');
  const createdLastMonth = await countEventsLastMonth('created');
  const transfersThisMonth = await countEventsThisMonth('transferred');
  const transfersLastMonth = await countEventsLastMonth('transferred');
  const typeChangesThisMonth = await countEventsThisMonth('type_changed');
  const typeChangesLastMonth = await countEventsLastMonth('type_changed');

  return {
    totalMembers,
    totalMembersDeltaPct: pctChange(createdThisMonth, createdLastMonth),
    doanVienCount,
    doanVienDeltaPct: pctChange(typeChangesThisMonth, typeChangesLastMonth),
    dangVienCount,
    dangVienDeltaPct: pctChange(typeChangesThisMonth, typeChangesLastMonth),
    transfers: transfersThisMonth,
    transfersDeltaPct: pctChange(transfersThisMonth, transfersLastMonth),
  };
}

export async function getGenderDistribution() {
  const result = await pool.query('SELECT gender, COUNT(*) AS count FROM members GROUP BY gender');
  const total = result.rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
  return result.rows.map((r) => ({
    gender: r.gender,
    count: parseInt(r.count, 10),
    percentage: total > 0 ? Math.round((parseInt(r.count, 10) / total) * 1000) / 10 : 0,
  }));
}

export async function getDepartmentDistribution() {
  const result = await pool.query(
    `SELECT d.name AS department, COUNT(m.id) AS count
     FROM members m
     JOIN departments d ON d.id = m.department_id
     GROUP BY d.name ORDER BY count DESC`
  );
  return result.rows.map((r) => ({ department: r.department, count: parseInt(r.count, 10) }));
}

export type ReportDimension = 'gender' | 'chapter' | 'department' | 'memberType' | 'roleTitle' | 'ageGroup';

const GENDER_LABELS: Record<string, string> = { nam: 'Nam', nu: 'Nữ', khac: 'Khác' };
const MEMBER_TYPE_LABELS: Record<string, string> = {
  doan_vien: 'Đoàn viên',
  dang_vien_sinh_hoat_doan: 'Đảng viên sinh hoạt đoàn',
};

export async function getReportByDimension(dimension: ReportDimension) {
  switch (dimension) {
    case 'gender': {
      const result = await pool.query('SELECT gender, COUNT(*) AS count FROM members GROUP BY gender');
      return result.rows.map((r) => ({ label: GENDER_LABELS[r.gender] ?? r.gender, count: parseInt(r.count, 10) }));
    }
    case 'chapter': {
      const result = await pool.query(
        `SELECT COALESCE(c.name, 'Chưa có chi đoàn') AS label, COUNT(m.id) AS count
         FROM members m LEFT JOIN chapters c ON c.id = m.chapter_id
         GROUP BY label ORDER BY count DESC`
      );
      return result.rows.map((r) => ({ label: r.label, count: parseInt(r.count, 10) }));
    }
    case 'department': {
      const result = await pool.query(
        `SELECT COALESCE(d.name, 'Chưa có bộ phận công tác') AS label, COUNT(m.id) AS count
         FROM members m LEFT JOIN departments d ON d.id = m.department_id
         GROUP BY label ORDER BY count DESC`
      );
      return result.rows.map((r) => ({ label: r.label, count: parseInt(r.count, 10) }));
    }
    case 'memberType': {
      const result = await pool.query('SELECT member_type, COUNT(*) AS count FROM members GROUP BY member_type');
      return result.rows.map((r) => ({
        label: MEMBER_TYPE_LABELS[r.member_type] ?? r.member_type,
        count: parseInt(r.count, 10),
      }));
    }
    case 'roleTitle': {
      const result = await pool.query(
        `SELECT COALESCE(rt.name, 'Không có chức vụ') AS label, COUNT(m.id) AS count
         FROM members m LEFT JOIN role_titles rt ON rt.id = m.role_title_id
         GROUP BY label ORDER BY count DESC`
      );
      return result.rows.map((r) => ({ label: r.label, count: parseInt(r.count, 10) }));
    }
    case 'ageGroup': {
      const result = await pool.query(
        `SELECT label, sort_order, COUNT(*) AS count FROM (
           SELECT
             CASE
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 25 THEN 'Dưới 25 tuổi'
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 35 THEN '25 - 34 tuổi'
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 45 THEN '35 - 44 tuổi'
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 55 THEN '45 - 54 tuổi'
               ELSE 'Từ 55 tuổi trở lên'
             END AS label,
             CASE
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 25 THEN 1
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 35 THEN 2
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 45 THEN 3
               WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 55 THEN 4
               ELSE 5
             END AS sort_order
           FROM members
         ) t
         GROUP BY label, sort_order
         ORDER BY sort_order`
      );
      return result.rows.map((r) => ({ label: r.label, count: parseInt(r.count, 10) }));
    }
  }
}

export async function getBirthdaysThisMonth() {
  const result = await pool.query(
    `SELECT m.id, m.full_name, m.date_of_birth, d.name AS department
     FROM members m
     LEFT JOIN departments d ON d.id = m.department_id
     WHERE EXTRACT(MONTH FROM m.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
     ORDER BY EXTRACT(DAY FROM m.date_of_birth)`
  );
  return result.rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    dateOfBirth: r.date_of_birth,
    department: r.department,
  }));
}
