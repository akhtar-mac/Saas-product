const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const p = new PrismaClient();
const esc = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'bigint') return String(v);
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
  const s = String(v).replace(/\\/g, '\\\\').replace(/'/g, "''");
  return `'${s}'`;
};
(async () => {
  let out = 'SET FOREIGN_KEY_CHECKS=0;\n';
  for (const t of ['staff_users', 'staff_user_roles', 'user_presence']) {
    const rows = await p.$queryRawUnsafe('SELECT * FROM ' + t).catch((e) => {
      console.log(t, 'ERR', e.message);
      return [];
    });
    const cols =
      rows.length > 0
        ? Object.keys(rows[0])
        : (await p.$queryRawUnsafe('SHOW COLUMNS FROM ' + t)).map((c) => c.Field);
    out += `-- ${t} (${rows.length} rows)\n`;
    for (const r of rows) {
      out += `INSERT INTO \`${t}\` (${cols.map((c) => '`' + c + '`').join(',')}) VALUES (${cols
        .map((c) => esc(r[c]))
        .join(',')}) ON DUPLICATE KEY UPDATE id=id;\n`;
    }
  }
  out += 'SET FOREIGN_KEY_CHECKS=1;\n';
  fs.writeFileSync('staff-users-import.sql', out);
  console.log('written', out.length, 'bytes');
  await p.$disconnect();
})().catch((e) => console.log('ERR', e.message));
