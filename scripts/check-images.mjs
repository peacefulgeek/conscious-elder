import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, 'conscious-elder/.env') });

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SELECT id, heroImageUrl FROM articles WHERE status='queued'");
await conn.end();

console.log('Total to check:', rows.length);
let ok = 0, fail = 0, failUrls = [];
const batchSize = 30;

for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const results = await Promise.all(batch.map(async row => {
    try {
      const res = await fetch(row.heroImageUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      return { ok: res.ok, url: row.heroImageUrl, status: res.status };
    } catch(e) {
      return { ok: false, url: row.heroImageUrl, status: 'ERR:' + e.message.substring(0, 20) };
    }
  }));
  results.forEach(r => {
    if (r.ok) ok++;
    else { fail++; failUrls.push(r.url.split('/').pop() + ' -> ' + r.status); }
  });
  process.stdout.write('.');
}

console.log('\nOK:', ok, '| FAIL:', fail);
if (failUrls.length) {
  console.log('Failed URLs:');
  failUrls.forEach(u => console.log('  FAIL:', u));
}
