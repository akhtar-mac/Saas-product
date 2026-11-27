import { prisma } from '../config/db.js';
import { decryptSecret, encryptSecret } from './crypto.service.js';

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  accountType: string;
  upiId?: string;
  badge?: string;
}

export interface PublicBrand {
  companyName: string;
  legalName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  pan: string;
  websiteUrl: string;
  appUrl: string;
  customDomain: string;
  corsOrigins: string;
  quotePrefix: string;
  workingHours: string;
  upiPrimary: string;
  upiSecondary: string;
  bankAccounts: BankAccount[];
  persisted: boolean;
}

export interface SecretStatus {
  configured: boolean;
  masked: string | null;
}

export interface AdminSettings extends PublicBrand {
  razorpayKeyId: SecretStatus;
  razorpayKeySecret: SecretStatus;
  razorpayWebhookSecret: SecretStatus;
  whatsappToken: SecretStatus;
  whatsappPhoneNumberId: string;
  smsApiKey: SecretStatus;
  smsSenderId: string;
  smsDltEntityId: string;
  smtpHost: string;
  smtpPort: number | null;
  smtpUser: string;
  smtpPass: SecretStatus;
  smtpFromEmail: string;
  smtpFromName: string;
}

const SECRET_FIELDS = [
  'razorpay_key_id',
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'whatsapp_token',
  'sms_api_key',
  'smtp_pass',
] as const;

type SecretField = (typeof SECRET_FIELDS)[number];

export function neutralBrand(): PublicBrand {
  return {
    companyName: process.env.COMPANY_NAME || 'Your Company',
    legalName: process.env.COMPANY_LEGAL_NAME || process.env.COMPANY_NAME || 'Your Company',
    tagline: process.env.COMPANY_TAGLINE || 'Client relationship workspace',
    logoUrl: process.env.COMPANY_LOGO_URL || '',
    faviconUrl: process.env.COMPANY_FAVICON_URL || '',
    primaryColor: process.env.COMPANY_PRIMARY_COLOR || '#1E3A8A',
    accentColor: process.env.COMPANY_ACCENT_COLOR || '#06B6D4',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    supportPhone: process.env.SUPPORT_PHONE || '',
    address: process.env.COMPANY_ADDRESS || '',
    city: process.env.COMPANY_CITY || '',
    state: process.env.COMPANY_STATE || '',
    gstin: process.env.COMPANY_GSTIN || '',
    pan: process.env.COMPANY_PAN || '',
    websiteUrl: process.env.COMPANY_WEBSITE_URL || '',
    appUrl: process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173',
    customDomain: process.env.CUSTOM_DOMAIN || '',
    corsOrigins: process.env.CORS_ORIGINS || '',
    quotePrefix: process.env.QUOTE_PREFIX || 'QT',
    workingHours: process.env.WORKING_HOURS || '9:30 AM – 6:30 PM IST, Monday to Saturday',
    upiPrimary: '',
    upiSecondary: '',
    bankAccounts: [],
    persisted: false,
  };
}

export function companyCode(): string {
  return process.env.COMPANY_CODE || 'TENANT';
}

export function leadEmail(local: string): string {
  const domain = process.env.LEAD_EMAIL_DOMAIN || 'example.com';
  const safe = String(local || 'lead').replace(/[^a-zA-Z0-9._-]/g, '') || 'lead';
  return `${safe}@${domain}`;
}

export function maskSecret(value: string | null | undefined): SecretStatus {
  if (!value) return { configured: false, masked: null };
  const last = value.slice(-4);
  return { configured: true, masked: `••••${last}` };
}

export function isMaskedInput(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return v.startsWith('••••') || v.startsWith('****') || v.includes('•');
}

function seal(plain: string): string {
  const payload = encryptSecret(plain);
  return `enc:v1:${payload.iv}:${payload.authTag}:${payload.encryptedData}`;
}

function openSecret(stored: unknown): string {
  if (typeof stored !== 'string' || !stored.startsWith('enc:v1:')) return '';
  const parts = stored.split(':');
  if (parts.length !== 5) return '';
  try {
    return decryptSecret(parts[4], parts[2], parts[3]);
  } catch {
    return '';
  }
}

function parseBanks(raw: unknown): BankAccount[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row) => row && typeof row === 'object')
      .map((row, index) => ({
        id: String(row.id || `bank-${index + 1}`),
        bankName: String(row.bankName || row.name || ''),
        accountName: String(row.accountName || ''),
        accountNumber: String(row.accountNumber || row.acct || ''),
        ifsc: String(row.ifsc || ''),
        branch: String(row.branch || ''),
        accountType: String(row.accountType || 'Current Account'),
        upiId: row.upiId ? String(row.upiId) : undefined,
        badge: row.badge ? String(row.badge) : undefined,
      }))
      .filter((row) => row.bankName || row.accountNumber);
  } catch {
    return [];
  }
}

let memory: Record<string, any> | null = null;

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS tenant_settings (
  id INT NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  legal_name VARCHAR(200) NOT NULL,
  tagline VARCHAR(300) NULL,
  logo_url VARCHAR(500) NULL,
  favicon_url VARCHAR(500) NULL,
  primary_color VARCHAR(20) NOT NULL DEFAULT '#1E3A8A',
  accent_color VARCHAR(20) NOT NULL DEFAULT '#06B6D4',
  support_email VARCHAR(200) NULL,
  support_phone VARCHAR(40) NULL,
  address VARCHAR(500) NULL,
  city VARCHAR(100) NULL,
  state_name VARCHAR(100) NULL,
  gstin VARCHAR(20) NULL,
  pan VARCHAR(15) NULL,
  website_url VARCHAR(300) NULL,
  app_url VARCHAR(300) NULL,
  custom_domain VARCHAR(200) NULL,
  cors_origins TEXT NULL,
  quote_prefix VARCHAR(20) NOT NULL DEFAULT 'QT',
  working_hours VARCHAR(160) NULL,
  upi_primary VARCHAR(120) NULL,
  upi_secondary VARCHAR(120) NULL,
  bank_accounts_json MEDIUMTEXT NULL,
  razorpay_key_id TEXT NULL,
  razorpay_key_secret TEXT NULL,
  razorpay_webhook_secret TEXT NULL,
  whatsapp_token TEXT NULL,
  whatsapp_phone_number_id VARCHAR(80) NULL,
  sms_api_key TEXT NULL,
  sms_sender_id VARCHAR(20) NULL,
  sms_dlt_entity_id VARCHAR(40) NULL,
  smtp_host VARCHAR(200) NULL,
  smtp_port INT NULL,
  smtp_user VARCHAR(200) NULL,
  smtp_pass TEXT NULL,
  smtp_from_email VARCHAR(200) NULL,
  smtp_from_name VARCHAR(200) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

async function ensureTable(): Promise<void> {
  await prisma.$executeRawUnsafe(CREATE_SQL);
  const existing = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id FROM tenant_settings WHERE id = 1`
  );
  if (existing.length) return;
  const base = neutralBrand();
  await prisma.$executeRawUnsafe(
    `INSERT INTO tenant_settings
      (id, company_name, legal_name, tagline, primary_color, accent_color, support_email,
       support_phone, app_url, quote_prefix, working_hours)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    base.companyName,
    base.legalName,
    base.tagline,
    base.primaryColor,
    base.accentColor,
    base.supportEmail,
    base.supportPhone,
    base.appUrl,
    base.quotePrefix,
    base.workingHours
  );
}

function rowToBrand(row: Record<string, any>, persisted: boolean): PublicBrand {
  const base = neutralBrand();
  return {
    companyName: row.company_name || base.companyName,
    legalName: row.legal_name || row.company_name || base.legalName,
    tagline: row.tagline || base.tagline,
    logoUrl: row.logo_url || '',
    faviconUrl: row.favicon_url || '',
    primaryColor: row.primary_color || base.primaryColor,
    accentColor: row.accent_color || base.accentColor,
    supportEmail: row.support_email || base.supportEmail,
    supportPhone: row.support_phone || '',
    address: row.address || '',
    city: row.city || '',
    state: row.state_name || '',
    gstin: row.gstin || '',
    pan: row.pan || '',
    websiteUrl: row.website_url || '',
    appUrl: row.app_url || base.appUrl,
    customDomain: row.custom_domain || '',
    corsOrigins: row.cors_origins || '',
    quotePrefix: row.quote_prefix || base.quotePrefix,
    workingHours: row.working_hours || base.workingHours,
    upiPrimary: row.upi_primary || '',
    upiSecondary: row.upi_secondary || '',
    bankAccounts: parseBanks(row.bank_accounts_json),
    persisted,
  };
}

async function readRow(): Promise<Record<string, any> | null> {
  if (memory) return memory;
  await ensureTable();
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM tenant_settings WHERE id = 1`);
  return rows[0] || null;
}

export async function getPublicBrand(): Promise<PublicBrand> {
  try {
    const row = await readRow();
    if (!row) return neutralBrand();
    return rowToBrand(row, !memory);
  } catch {
    return memory ? rowToBrand(memory, false) : neutralBrand();
  }
}

function secretOf(row: Record<string, any>, field: SecretField): SecretStatus {
  return maskSecret(openSecret(row[field]));
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const row = (await readRow().catch(() => memory)) || {};
  const brand = row.company_name ? rowToBrand(row, !memory) : await getPublicBrand();
  return {
    ...brand,
    razorpayKeyId: secretOf(row, 'razorpay_key_id'),
    razorpayKeySecret: secretOf(row, 'razorpay_key_secret'),
    razorpayWebhookSecret: secretOf(row, 'razorpay_webhook_secret'),
    whatsappToken: secretOf(row, 'whatsapp_token'),
    whatsappPhoneNumberId: row.whatsapp_phone_number_id || '',
    smsApiKey: secretOf(row, 'sms_api_key'),
    smsSenderId: row.sms_sender_id || '',
    smsDltEntityId: row.sms_dlt_entity_id || '',
    smtpHost: row.smtp_host || '',
    smtpPort: row.smtp_port == null ? null : Number(row.smtp_port),
    smtpUser: row.smtp_user || '',
    smtpPass: secretOf(row, 'smtp_pass'),
    smtpFromEmail: row.smtp_from_email || '',
    smtpFromName: row.smtp_from_name || '',
  };
}

const PUBLIC_COLUMNS: Record<string, string> = {
  companyName: 'company_name',
  legalName: 'legal_name',
  tagline: 'tagline',
  logoUrl: 'logo_url',
  faviconUrl: 'favicon_url',
  primaryColor: 'primary_color',
  accentColor: 'accent_color',
  supportEmail: 'support_email',
  supportPhone: 'support_phone',
  address: 'address',
  city: 'city',
  state: 'state_name',
  gstin: 'gstin',
  pan: 'pan',
  websiteUrl: 'website_url',
  appUrl: 'app_url',
  customDomain: 'custom_domain',
  corsOrigins: 'cors_origins',
  quotePrefix: 'quote_prefix',
  workingHours: 'working_hours',
  upiPrimary: 'upi_primary',
  upiSecondary: 'upi_secondary',
};

const SECRET_INPUTS: Record<string, SecretField> = {
  razorpayKeyId: 'razorpay_key_id',
  razorpayKeySecret: 'razorpay_key_secret',
  razorpayWebhookSecret: 'razorpay_webhook_secret',
  whatsappToken: 'whatsapp_token',
  smsApiKey: 'sms_api_key',
  smtpPass: 'smtp_pass',
};

const PLAIN_EXTRAS: Record<string, string> = {
  whatsappPhoneNumberId: 'whatsapp_phone_number_id',
  smsSenderId: 'sms_sender_id',
  smsDltEntityId: 'sms_dlt_entity_id',
  smtpHost: 'smtp_host',
  smtpPort: 'smtp_port',
  smtpUser: 'smtp_user',
  smtpFromEmail: 'smtp_from_email',
  smtpFromName: 'smtp_from_name',
};

export async function updateSettings(input: Record<string, unknown>): Promise<AdminSettings> {
  const sets: string[] = [];
  const vals: any[] = [];

  for (const [key, column] of Object.entries(PUBLIC_COLUMNS)) {
    if (input[key] === undefined) continue;
    sets.push(`${column} = ?`);
    vals.push(
      input[key] == null ? null : String(input[key]).slice(0, column === 'tagline' ? 300 : 500)
    );
  }
  if (input.bankAccounts !== undefined) {
    const banks = parseBanks(input.bankAccounts);
    sets.push('bank_accounts_json = ?');
    vals.push(JSON.stringify(banks));
  }
  for (const [key, column] of Object.entries(SECRET_INPUTS)) {
    if (input[key] === undefined) continue;
    const raw = String(input[key] ?? '');
    if (!raw.trim() || isMaskedInput(raw)) continue;
    sets.push(`${column} = ?`);
    vals.push(seal(raw.trim()));
  }
  for (const [key, column] of Object.entries(PLAIN_EXTRAS)) {
    if (input[key] === undefined) continue;
    if (column === 'smtp_port') {
      const port = Number(input[key]);
      sets.push(`${column} = ?`);
      vals.push(Number.isFinite(port) && port > 0 ? port : null);
      continue;
    }
    sets.push(`${column} = ?`);
    vals.push(input[key] == null ? null : String(input[key]).slice(0, 200));
  }

  try {
    await ensureTable();
    if (sets.length) {
      await prisma.$executeRawUnsafe(
        `UPDATE tenant_settings SET ${sets.join(', ')} WHERE id = 1`,
        ...vals
      );
    }
    memory = null;
  } catch (err) {
    const current = memory || {};
    const next = { ...current };
    for (let i = 0; i < sets.length; i++) {
      const column = sets[i].split(' ')[0];
      next[column] = vals[i];
    }
    if (!next.company_name) next.company_name = neutralBrand().companyName;
    memory = next;
    if (process.env.NODE_ENV !== 'test') {
      console.warn('tenant settings saved in memory only:', (err as Error).message);
    }
  }
  return getAdminSettings();
}

export async function integrationStatus(channel: string): Promise<Record<string, unknown>> {
  const row = (await readRow().catch(() => memory)) || {};
  const base = {
    channel,
    executionMode: 'dry_run' as const,
    externalCall: false,
  };
  if (channel === 'smtp') {
    const host = String(row.smtp_host || '');
    const pass = openSecret(row.smtp_pass);
    return {
      ...base,
      configured: Boolean(host && row.smtp_user && pass),
      host: host || null,
      port: row.smtp_port || null,
      note: 'Credentials are checked for presence only. No SMTP login is attempted.',
    };
  }
  if (channel === 'razorpay') {
    return {
      ...base,
      configured: Boolean(openSecret(row.razorpay_key_id) && openSecret(row.razorpay_key_secret)),
      webhookConfigured: Boolean(openSecret(row.razorpay_webhook_secret)),
      note: 'Razorpay is not contacted. Payments stay in dry-run.',
    };
  }
  if (channel === 'whatsapp') {
    return {
      ...base,
      configured: Boolean(openSecret(row.whatsapp_token) && row.whatsapp_phone_number_id),
      note: 'WhatsApp Cloud API is not contacted.',
    };
  }
  if (channel === 'sms') {
    return {
      ...base,
      configured: Boolean(openSecret(row.sms_api_key) && row.sms_sender_id),
      dltEntityConfigured: Boolean(row.sms_dlt_entity_id),
      note: 'No SMS is sent. DLT template ids are stored only.',
    };
  }
  return { ...base, configured: false, note: 'Unknown channel.' };
}
