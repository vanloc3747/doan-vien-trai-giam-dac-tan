import { pool } from '../db/pool';

function mapRow(row: any) {
  return { logoUrl: row.logo_url, title: row.title, subtitle: row.subtitle };
}

export async function getAppSettings() {
  const result = await pool.query('SELECT logo_url, title, subtitle FROM app_settings WHERE id = 1');
  return mapRow(result.rows[0]);
}

export async function updateAppSettings(input: { title: string; subtitle: string }) {
  const result = await pool.query(
    'UPDATE app_settings SET title = $1, subtitle = $2, updated_at = now() WHERE id = 1 RETURNING logo_url, title, subtitle',
    [input.title, input.subtitle]
  );
  return mapRow(result.rows[0]);
}

export async function updateAppSettingsLogo(logoUrl: string) {
  const result = await pool.query(
    'UPDATE app_settings SET logo_url = $1, updated_at = now() WHERE id = 1 RETURNING logo_url, title, subtitle',
    [logoUrl]
  );
  return mapRow(result.rows[0]);
}
