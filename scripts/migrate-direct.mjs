#!/usr/bin/env node
/**
 * ETaxwala — Direct MySQL to PostgreSQL Streaming Importer
 * ──────────────────────────────────────────────────────────
 * Streams /Volumes/ps4/u571670246_etax_crm.sql directly into PostgreSQL (etaxwala_v2)
 * using the `pg` client library.
 */

import fs from 'fs';
import readline from 'readline';
import pg from 'pg';

const { Client } = pg;

const SQL_SOURCE = '/Volumes/ps4/u571670246_etax_crm.sql';
const PG_CONFIG = {
  user: 'etaxwala',
  host: 'localhost',
  database: 'etaxwala_v2',
  port: 5432,
};

function log(msg, type = 'info') {
  const c = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', err: '\x1b[31m' };
  console.log(`${c[type] || ''}[${type.toUpperCase()}]\x1b[0m ${msg}`);
}

function cleanCreateStatement(sql) {
  let s = sql;
  s = s.replace(/`([^`]+)`/g, '"$1"');

  // Convert types
  s = s
    .replace(/\bTINYINT\(\d+\)\s+UNSIGNED/gi, 'SMALLINT')
    .replace(/\bTINYINT\(\d+\)/gi, 'SMALLINT')
    .replace(/\bTINYINT\b/gi, 'SMALLINT')
    .replace(/\bSMALLINT\(\d+\)\s+UNSIGNED/gi, 'INTEGER')
    .replace(/\bSMALLINT\(\d+\)/gi, 'SMALLINT')
    .replace(/\bMEDIUMINT\(\d+\)\s+UNSIGNED/gi, 'INTEGER')
    .replace(/\bMEDIUMINT\(\d+\)/gi, 'INTEGER')
    .replace(/\bINT\(\d+\)\s+UNSIGNED/gi, 'BIGINT')
    .replace(/\bINT\(\d+\)/gi, 'INTEGER')
    .replace(/\bINT\b/gi, 'INTEGER')
    .replace(/\bBIGINT\(\d+\)\s+UNSIGNED/gi, 'NUMERIC(20)')
    .replace(/\bBIGINT\(\d+\)/gi, 'BIGINT')
    .replace(/\bDOUBLE\b/gi, 'DOUBLE PRECISION')
    .replace(/\bFLOAT\b/gi, 'REAL')
    .replace(/\bLONGTEXT\b/gi, 'TEXT')
    .replace(/\bMEDIUMTEXT\b/gi, 'TEXT')
    .replace(/\bTINYTEXT\b/gi, 'TEXT')
    .replace(/\bLONGBLOB\b/gi, 'BYTEA')
    .replace(/\bMEDIUMBLOB\b/gi, 'BYTEA')
    .replace(/\bTINYBLOB\b/gi, 'BYTEA')
    .replace(/\bBLOB\b/gi, 'BYTEA')
    .replace(/\bDATETIME\b/gi, 'TIMESTAMP')
    .replace(/\bENUM\([^)]+\)/gi, 'TEXT')
    .replace(/\bSET\s*\([^)]+\)/gi, 'TEXT')
    .replace(/\bYEAR\b/gi, 'INTEGER');

  // AUTO_INCREMENT
  s = s.replace(/\bINTEGER\s+NOT NULL\s+AUTO_INCREMENT/gi, 'SERIAL NOT NULL');
  s = s.replace(/\bBIGINT\s+NOT NULL\s+AUTO_INCREMENT/gi, 'BIGSERIAL NOT NULL');
  s = s.replace(/\bINTEGER\s+AUTO_INCREMENT/gi, 'SERIAL');
  s = s.replace(/\bBIGINT\s+AUTO_INCREMENT/gi, 'BIGSERIAL');
  s = s.replace(/\bAUTO_INCREMENT(?:=\d+)?\b/gi, '');

  // Timestamps
  s = s.replace(/current_timestamp\(\s*\)\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP');
  s = s.replace(/current_timestamp\(\s*\)/gi, 'CURRENT_TIMESTAMP');
  s = s.replace(/DEFAULT\s+CURRENT_TIMESTAMP\s*\([^)]*\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
  s = s.replace(/DEFAULT\s+CURRENT_TIMESTAMP\s*\(\s*\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
  s = s.replace(/\s+ON UPDATE\s+CURRENT_TIMESTAMP(?:\(\s*\))?/gi, '');

  // Strip column comments: col_name type COMMENT '...'
  s = s.replace(/\s+COMMENT\s+'(?:[^'\\]|\\.)*'/gi, '');
  s = s.replace(/\s+COMMENT\s+"(?:[^"\\]|\\.)*"/gi, '');

  // Strip table options after closing paren
  s = s.replace(/\)\s*ENGINE\s*=\s*[^;]*/gi, ')');
  s = s.replace(/\)\s*DEFAULT\s+CHARSET\s*=\s*[^;]*/gi, ')');

  // Remove standalone KEY lines
  const lines = s.split('\n');
  const filtered = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*(UNIQUE\s+)?KEY\s+"[^"]+"/i.test(l) || /^\s*KEY\s+/i.test(l)) {
      continue;
    }
    filtered.push(l);
  }

  s = filtered.join('\n');

  // Fix trailing commas before closing paren
  s = s.replace(/,(\s*\n\s*\))/g, '$1');

  if (!/CREATE TABLE IF NOT EXISTS/i.test(s)) {
    s = s.replace(/CREATE TABLE\s+/i, 'CREATE TABLE IF NOT EXISTS ');
  }

  return s;
}

function cleanInsertStatement(sql) {
  let s = sql;
  // Replace table name and column names enclosed in backticks
  s = s.replace(/INSERT INTO `([^`]+)`/i, 'INSERT INTO "$1"');
  s = s.replace(/`([^`]+)`/g, '"$1"');

  // Fix escaped single quotes \' to ''
  s = s.replace(/\\'/g, "''");
  // Fix double backslash
  s = s.replace(/\\\\/g, '\\');

  return s;
}

function cleanAlterStatement(sql) {
  let s = sql;
  s = s.replace(/`([^`]+)`/g, '"$1"');
  // If it's ADD PRIMARY KEY
  if (/ADD PRIMARY KEY/i.test(s)) {
    return s;
  }
  // If it's ADD UNIQUE KEY or ADD KEY
  if (/ADD UNIQUE KEY\s+"([^"]+)"\s*\(([^)]+)\)/i.test(s)) {
    const m = s.match(/ALTER TABLE\s+"([^"]+)"\s+ADD UNIQUE KEY\s+"([^"]+)"\s*\(([^)]+)\)/i);
    if (m) {
      return `CREATE UNIQUE INDEX IF NOT EXISTS "${m[2]}" ON "${m[1]}" (${m[3]})`;
    }
  }
  if (/ADD KEY\s+"([^"]+)"\s*\(([^)]+)\)/i.test(s)) {
    const m = s.match(/ALTER TABLE\s+"([^"]+)"\s+ADD KEY\s+"([^"]+)"\s*\(([^)]+)\)/i);
    if (m) {
      return `CREATE INDEX IF NOT EXISTS "${m[2]}" ON "${m[1]}" (${m[3]})`;
    }
  }
  return null;
}

async function run() {
  log('Starting Direct PostgreSQL Migration Stream', 'info');
  log(`Source file: ${SQL_SOURCE}`, 'info');

  if (!fs.existsSync(SQL_SOURCE)) {
    log(`Source not found at ${SQL_SOURCE}`, 'err');
    process.exit(1);
  }

  const client = new Client(PG_CONFIG);
  await client.connect();
  log('Connected to PostgreSQL database: etaxwala_v2', 'ok');

  await client.query("SET client_encoding = 'UTF8'");
  await client.query("SET standard_conforming_strings = on");

  const fileStream = fs.createReadStream(SQL_SOURCE, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let statementBuffer = '';
  let inStatement = false;
  let statementType = '';
  let statementCount = 0;
  let tableCount = 0;
  let insertCount = 0;
  let errorCount = 0;
  let currentTableName = '';

  for await (const line of rl) {
    const trimmed = line.trim();

    // Skip comment lines and empty lines when not in statement
    if (!inStatement) {
      if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) {
        continue;
      }
      if (/^SET\s+/i.test(trimmed) || /^START TRANSACTION/i.test(trimmed) || /^COMMIT/i.test(trimmed) || /^LOCK TABLES/i.test(trimmed) || /^UNLOCK TABLES/i.test(trimmed)) {
        continue;
      }
    }

    if (!inStatement) {
      if (/^CREATE TABLE/i.test(trimmed)) {
        inStatement = true;
        statementType = 'CREATE';
        statementBuffer = line + '\n';
        const match = trimmed.match(/CREATE TABLE `?([^`\s(]+)`?/i);
        currentTableName = match ? match[1] : 'unknown';
      } else if (/^INSERT INTO/i.test(trimmed)) {
        inStatement = true;
        statementType = 'INSERT';
        statementBuffer = line + '\n';
        const match = trimmed.match(/INSERT INTO `?([^`\s(]+)`?/i);
        currentTableName = match ? match[1] : 'unknown';
      } else if (/^ALTER TABLE/i.test(trimmed)) {
        inStatement = true;
        statementType = 'ALTER';
        statementBuffer = line + '\n';
      }
    } else {
      statementBuffer += line + '\n';
    }

    // Check if statement ends with semicolon
    if (inStatement && trimmed.endsWith(';')) {
      const fullSql = statementBuffer.trim();
      statementBuffer = '';
      inStatement = false;
      statementCount++;

      try {
        if (statementType === 'CREATE') {
          const cleaned = cleanCreateStatement(fullSql);
          await client.query(cleaned);
          tableCount++;
          log(`Created table: ${currentTableName}`, 'ok');
        } else if (statementType === 'INSERT') {
          const cleaned = cleanInsertStatement(fullSql);
          await client.query(cleaned);
          insertCount++;
          if (insertCount % 50 === 0) {
            log(`Inserted batches into ${currentTableName} (Total insert batches: ${insertCount})`, 'info');
          }
        } else if (statementType === 'ALTER') {
          const cleaned = cleanAlterStatement(fullSql);
          if (cleaned) {
            try {
              await client.query(cleaned);
            } catch (err) {
              // Ignore duplicate keys/indexes
            }
          }
        }
      } catch (err) {
        errorCount++;
        if (statementType === 'CREATE') {
          log(`Error creating table ${currentTableName}: ${err.message}`, 'err');
        } else if (errorCount <= 10) {
          log(`Insert notice for ${currentTableName}: ${err.message.slice(0, 120)}`, 'warn');
        }
      }
    }
  }

  log('', 'info');
  log('🎉 DIRECT MIGRATION SUMMARY 🎉', 'ok');
  log(`Total Tables Created: ${tableCount}`, 'ok');
  log(`Total Insert Batches Executed: ${insertCount}`, 'ok');
  log(`Total Statements: ${statementCount}`, 'ok');
  log(`Notices/Errors Handled: ${errorCount}`, 'info');

  await client.end();
}

run().catch(err => {
  log(`Migration error: ${err.message}`, 'err');
  process.exit(1);
});
