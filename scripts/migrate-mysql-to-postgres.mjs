#!/usr/bin/env node
/**
 * ETaxwala — MySQL → PostgreSQL Migration (Streaming)
 * ─────────────────────────────────────────────────────
 * Processes 557MB SQL dump as a LINE STREAM to avoid memory limits.
 * Reads:  /Volumes/ps4/u571670246_etax_crm.sql
 * Writes: migration-output/etaxwala_pg.sql
 *
 * Run:  node scripts/migrate-mysql-to-postgres.mjs
 */

import fs   from 'fs';
import path  from 'path';
import readline from 'readline';
import { createReadStream, createWriteStream } from 'fs';

const SQL_SOURCE = '/Volumes/ps4/u571670246_etax_crm.sql';
const OUTPUT_DIR  = './migration-output';
const OUT_FILE    = path.join(OUTPUT_DIR, 'etaxwala_pg.sql');

function log(msg, type = 'info') {
  const c = { info:'\x1b[36m', ok:'\x1b[32m', warn:'\x1b[33m', err:'\x1b[31m' };
  console.log(`${c[type]||''}[${type.toUpperCase()}]\x1b[0m ${msg}`);
}

function transformLine(line) {
  // Skip MySQL-only statements entirely
  if (/^\/\*![0-9]/.test(line))                          return null;
  if (/^--\s*(Dump|Host|Server|Table|Data|MySQLdump)/i.test(line)) return null;
  if (/^SET\s+(NAMES|FOREIGN_KEY_CHECKS|SQL_MODE|TIME_ZONE|UNIQUE_CHECKS|CHARACTER_SET|COLLATION)/i.test(line)) return null;
  if (/^LOCK TABLES/i.test(line))                        return null;
  if (/^UNLOCK TABLES/i.test(line))                      return null;

  let l = line;

  // Remove backtick quoting
  l = l.replace(/`([^`]+)`/g, '"$1"');

  // ── Data Types ──
  l = l
    .replace(/\bTINYINT\(1\)/gi,                    'BOOLEAN')
    .replace(/\bTINYINT\(\d+\)\s+UNSIGNED/gi,       'SMALLINT')
    .replace(/\bTINYINT\(\d+\)/gi,                  'SMALLINT')
    .replace(/\bSMALLINT\(\d+\)\s+UNSIGNED/gi,      'INTEGER')
    .replace(/\bSMALLINT\(\d+\)/gi,                 'SMALLINT')
    .replace(/\bMEDIUMINT\(\d+\)\s+UNSIGNED/gi,     'INTEGER')
    .replace(/\bMEDIUMINT\(\d+\)/gi,                'INTEGER')
    .replace(/\bINT\(\d+\)\s+UNSIGNED/gi,           'BIGINT')
    .replace(/\bINT\(\d+\)/gi,                      'INTEGER')
    .replace(/\bBIGINT\(\d+\)\s+UNSIGNED/gi,        'NUMERIC(20)')
    .replace(/\bBIGINT\(\d+\)/gi,                   'BIGINT')
    .replace(/\bDOUBLE\b/gi,                         'DOUBLE PRECISION')
    .replace(/\bFLOAT\b/gi,                          'REAL')
    .replace(/\bLONGTEXT\b/gi,                       'TEXT')
    .replace(/\bMEDIUMTEXT\b/gi,                    'TEXT')
    .replace(/\bTINYTEXT\b/gi,                       'TEXT')
    .replace(/\bLONGBLOB\b/gi,                       'BYTEA')
    .replace(/\bMEDIUMBLOB\b/gi,                    'BYTEA')
    .replace(/\bTINYBLOB\b/gi,                       'BYTEA')
    .replace(/\bBLOB\b/gi,                           'BYTEA')
    .replace(/\bDATETIME\b/gi,                       'TIMESTAMP')
    .replace(/\bENUM\([^)]+\)/gi,                    'TEXT')
    .replace(/\bSET\s*\([^)]+\)/gi,                 'TEXT')
    .replace(/\bYEAR\b/gi,                           'INTEGER');

  // ── AUTO_INCREMENT → SERIAL ──
  l = l.replace(/\bINTEGER\s+NOT NULL\s+AUTO_INCREMENT/gi,  'SERIAL NOT NULL');
  l = l.replace(/\bBIGINT\s+NOT NULL\s+AUTO_INCREMENT/gi,   'BIGSERIAL NOT NULL');
  l = l.replace(/\bINTEGER\s+AUTO_INCREMENT/gi,             'SERIAL');
  l = l.replace(/\bBIGINT\s+AUTO_INCREMENT/gi,              'BIGSERIAL');
  l = l.replace(/\bSMALLINT\s+AUTO_INCREMENT/gi,            'SMALLSERIAL');
  l = l.replace(/\bAUTO_INCREMENT(?:=\d+)?\b/gi,            '');

  // ── Fix current_timestamp() → CURRENT_TIMESTAMP ──
  l = l.replace(/current_timestamp\(\s*\)/gi, 'CURRENT_TIMESTAMP');
  l = l.replace(/DEFAULT\s+CURRENT_TIMESTAMP\s*\(\s*\)/gi, 'DEFAULT CURRENT_TIMESTAMP');

  // ── Remove ON UPDATE CURRENT_TIMESTAMP ──
  l = l.replace(/\s+ON UPDATE CURRENT_TIMESTAMP/gi, '');

  // ── MySQL table options ──
  l = l.replace(/\)\s*ENGINE\s*=\s*\w+[^;]*/gi, ');');
  l = l.replace(/\s*ENGINE\s*=\s*\w+/gi,         '');
  l = l.replace(/\s*DEFAULT\s+CHARSET\s*=\s*[\w_]+/gi, '');
  l = l.replace(/\s*COLLATE\s*=?\s*[\w_]+/gi,    '');
  l = l.replace(/\s*ROW_FORMAT\s*=\s*\w+/gi,     '');
  l = l.replace(/\s*AUTO_INCREMENT\s*=\s*\d+/gi, '');
  l = l.replace(/\s*CHARACTER\s+SET\s+[\w_]+/gi, '');
  l = l.replace(/\s*COMMENT\s*=?\s*'[^']*'/gi,   '');

  // ── Skip KEY index lines inside CREATE TABLE ──
  if (/^\s*(UNIQUE\s+)?KEY\s+"[^"]+"/i.test(l))  return null;

  // ── IF NOT EXISTS for CREATE TABLE ──
  l = l.replace(/^(CREATE TABLE\s+)(?!IF NOT EXISTS\s+)(")/,
    'CREATE TABLE IF NOT EXISTS $2');

  // ── Fix backslash-escaped single quotes (\' → '') for standard_conforming_strings=on ──
  l = l.replace(/\\'/g, "''");

  // ── Fix double backslash ──
  l = l.replace(/\\\\/g, '\\');

  return l;
}

async function run() {
  log('ETaxwala MySQL → PostgreSQL Migration (Streaming)', 'info');
  log('━'.repeat(55), 'info');

  if (!fs.existsSync(SQL_SOURCE)) {
    log(`SQL dump not found: ${SQL_SOURCE}`, 'err');
    log('Is the PS4 drive mounted at /Volumes/ps4/?', 'err');
    process.exit(1);
  }

  const stat = fs.statSync(SQL_SOURCE);
  log(`Source : ${SQL_SOURCE}`, 'info');
  log(`Size   : ${(stat.size / 1024 / 1024).toFixed(1)} MB`, 'info');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const inStream  = createReadStream(SQL_SOURCE,  { encoding: 'utf8' });
  const outStream = createWriteStream(OUT_FILE, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: inStream, crlfDelay: Infinity });

  // PostgreSQL-safe header
  outStream.write(`-- ETaxwala PostgreSQL Migration\n`);
  outStream.write(`-- Generated: ${new Date().toISOString()}\n\n`);
  outStream.write(`\\set ON_ERROR_STOP off\n`);
  outStream.write(`BEGIN;\n\n`);
  outStream.write(`SET client_encoding = 'UTF8';\n`);
  outStream.write(`SET standard_conforming_strings = on;\n`);
  outStream.write(`SET check_function_bodies = false;\n`);
  outStream.write(`SET escape_string_warning = off;\n\n`);

  let lineCount    = 0;
  let tableCount   = 0;
  const tables     = [];
  let prevWasEmpty = false;

  log('Streaming lines...', 'info');

  for await (const line of rl) {
    lineCount++;
    if (lineCount % 100000 === 0) log(`  ${lineCount.toLocaleString()} lines processed...`, 'info');

    const tableMatch = line.match(/CREATE TABLE `([^`]+)`/i);
    if (tableMatch) { tableCount++; tables.push(tableMatch[1]); }

    const transformed = transformLine(line);
    if (transformed === null) continue;

    const isBlank = transformed.trim() === '';
    if (isBlank && prevWasEmpty) continue;
    prevWasEmpty = isBlank;

    outStream.write(transformed + '\n');
  }

  outStream.write(`\nCOMMIT;`);

  await new Promise((resolve, reject) => {
    outStream.end(err => err ? reject(err) : resolve(undefined));
  });

  const outStat = fs.statSync(OUT_FILE);

  log('', 'info');
  log(`✅ Transform complete!`, 'ok');
  log(`   Lines    : ${lineCount.toLocaleString()}`, 'ok');
  log(`   Tables   : ${tableCount}`, 'ok');
  log(`   Output   : ${OUT_FILE} (${(outStat.size/1024/1024).toFixed(1)} MB)`, 'ok');

  fs.writeFileSync(path.join(OUTPUT_DIR, 'migration-summary.json'),
    JSON.stringify({ tables, tableCount, lineCount, outFile: OUT_FILE, timestamp: new Date().toISOString() }, null, 2));

  log('', 'info');
  log('Tables:', 'info');
  tables.forEach(t => log(`  • ${t}`, 'info'));

  log('', 'info');
  log('Next — Import to PostgreSQL:', 'warn');
  log(`  psql -U etaxwala etaxwala_v2 < ${OUT_FILE}`, 'warn');
}

run().catch(err => { log(err.message, 'err'); process.exit(1); });
