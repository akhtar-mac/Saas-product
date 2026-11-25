/**
 * Small client for the access, activity-log and recycle-bin APIs.
 * The staff token is added by lib/staff-auth-fetch (all /v1/crm calls).
 */
import { API_BASE_URL } from '@/lib/api-base';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T = any>(
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, unknown> } = {}
): Promise<T> {
  const qs = init.query
    ? '?' +
      Object.entries(init.query)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  const res = await fetch(`${API_BASE_URL}${path}${qs === '?' ? '' : qs}`, {
    method: init.method || 'GET',
    headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok || (data && data.success === false)) {
    throw new ApiError(
      (data && (data.error?.message || data.error || data.message)) ||
        `Request failed (${res.status})`,
      res.status,
      data?.code
    );
  }
  return data as T;
}

/** Download a file from the API (CSV export) keeping the auth header. */
export async function download(path: string, query: Record<string, unknown>, filename: string) {
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  const res = await fetch(`${API_BASE_URL}${path}${qs ? '?' + qs : ''}`);
  if (!res.ok) {
    let msg = `Download failed (${res.status})`;
    try {
      const d = await res.json();
      msg = d.error || d.message || msg;
    } catch {
      /* not json */
    }
    throw new ApiError(msg, res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ─── India time display ──────────────────────────────────────────────────────
const IST_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

/** API dates are UTC ("2026-11-25T07:04:17.000Z"); show them as DD-MM-YYYY, hh:mm am IST. */
export function fmtIST(v: string | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return IST_FMT.format(d).replace(/\//g, '-').replace(',', '') + ' IST';
}

export function todayIST(offsetDays = 0): string {
  const d = new Date(Date.now() + 330 * 60000 + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CatalogRole {
  id: number;
  key: string;
  name: string;
  legacyUserType: number | null;
  category: string;
  defaults: string[];
}
export interface CatalogPermission {
  key: string;
  label: string;
  category: string;
  manager?: boolean;
  superAdminOnly?: boolean;
  description?: string;
}
export interface AccessUserRow {
  source: 'users' | 'staff_users';
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role_id: number;
  role_name: string;
  legacy_user_type?: number | null;
  active: boolean;
  last_login_at?: string | null;
  created_at?: string | null;
  grants: number;
  revokes: number;
}
export interface AccessProfile {
  source: 'users' | 'staff_users';
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  active: boolean;
  role_id: number;
  role_ids: number[];
  role_key: string;
  role_name: string;
  defaults: string[];
  grants: string[];
  revokes: string[];
  effective: string[];
  is_super_admin: boolean;
  is_admin: boolean;
}
