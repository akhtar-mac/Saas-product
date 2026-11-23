/**
 * Staff login token on every staff API call.
 *
 * The API now requires a staff JWT on /v1/crm, /v1/staff and the other staff
 * routes, but many CRM screens call fetch() without an Authorization header.
 * This wraps window.fetch once: requests to the API that carry no
 * Authorization header get "Bearer <staffToken>". On a 401 it tries the
 * refresh token once and retries; if that fails the staff session is cleared
 * and the browser goes to /crm/login. Customer-portal and auth calls are left
 * alone (they use their own token or none).
 */
import { API_BASE_URL } from './api-base';
import { useAuthStore } from '@/store/auth-store';

const STAFF_PREFIXES = [
  '/v1/crm',
  '/v1/staff',
  '/v1/call-logs',
  '/v1/chat',
  '/v1/admin',
  '/v1/hr',
  '/v1/it',
  '/v1/marketing',
  '/v1/disbursements',
  '/v1/ai',
  '/v1/infrastructure',
  '/v1/mobile',
];
const DEMO_TOKENS = new Set(['demo-staff-token']);

function apiPath(url: string): string | null {
  try {
    const u = new URL(url, window.location.origin);
    const base = new URL(API_BASE_URL, window.location.origin);
    if (u.origin !== base.origin) return null;
    return u.pathname;
  } catch {
    return null;
  }
}

function isStaffCall(path: string | null): boolean {
  return !!path && STAFF_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

function currentToken(): string | null {
  const t = useAuthStore.getState().staffToken;
  return t && !DEMO_TOKENS.has(t) ? t : null;
}

let refreshing: Promise<string | null> | null = null;

async function refreshToken(nativeFetch: typeof fetch): Promise<string | null> {
  const { staffRefreshToken, setStaffToken } = useAuthStore.getState();
  if (!staffRefreshToken || staffRefreshToken === 'demo-refresh-token') return null;
  try {
    const res = await nativeFetch(`${API_BASE_URL}/v1/auth/staff/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: staffRefreshToken }),
    });
    const data = await res.json().catch(() => null);
    const token: string | undefined = data?.data?.accessToken;
    if (!res.ok || !token) return null;
    setStaffToken(token);
    if (data?.data?.refreshToken) {
      useAuthStore.setState({ staffRefreshToken: data.data.refreshToken });
    }
    return token;
  } catch {
    return null;
  }
}

function sendToLogin() {
  useAuthStore.getState().logoutStaff();
  const path = window.location.pathname;
  if (path.startsWith('/crm') && !path.startsWith('/crm/login')) {
    window.location.assign('/crm/login');
  }
}

export function installStaffAuthFetch(): void {
  if (typeof window === 'undefined' || (window as any).__staffAuthFetch) return;
  (window as any).__staffAuthFetch = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    const path = apiPath(url);
    if (!isStaffCall(path)) return nativeFetch(input, init);

    const baseHeaders = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined)
    );
    if (
      baseHeaders.has('Authorization') &&
      !DEMO_TOKENS.has((baseHeaders.get('Authorization') || '').replace(/^Bearer\s+/i, ''))
    ) {
      return nativeFetch(input, init);
    }

    const withToken = (token: string | null): RequestInit => {
      const headers = new Headers(baseHeaders);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      else headers.delete('Authorization');
      return { ...init, headers };
    };

    const token = currentToken();
    const res = await nativeFetch(
      input instanceof Request ? input.clone() : input,
      withToken(token)
    );
    if (res.status !== 401) return res;

    refreshing =
      refreshing ??
      refreshToken(nativeFetch).finally(() => {
        refreshing = null;
      });
    const fresh = await refreshing;
    if (!fresh) {
      sendToLogin();
      return res;
    }
    return nativeFetch(input, withToken(fresh));
  };
}
