import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Trả cột DATE dạng chuỗi 'YYYY-MM-DD' thay vì Date object, tránh lệch ngày
// do pg mặc định quy đổi qua giờ UTC (OID 1082 = kiểu date của PostgreSQL).
types.setTypeParser(1082, (val) => val);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: { rejectUnauthorized: false },
});
