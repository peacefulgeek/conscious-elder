/**
 * Lightweight database query helper for cron jobs.
 * Uses mysql2 directly for .mjs compatibility.
 */
import mysql from 'mysql2/promise';

let _pool = null;

function getPool() {
  if (!_pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');
    _pool = mysql.createPool(url);
  }
  return _pool;
}

export async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return { rows };
}

export async function close() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
