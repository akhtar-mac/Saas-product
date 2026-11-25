/**
 * Keeps the signed-in user's options fresh. An admin can add or remove options
 * at any time; the API already enforces them, this just updates the menu.
 * Polls /v1/crm/access/me every 60 s and when the tab regains focus.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';
import { RBAC_SENTINEL } from '../permissions';

const ROLE_KEY_TO_TYPE: Record<string, string> = {
  super_admin: 'SUPER_ADMIN',
  admin: 'ADMIN',
  operations_manager: 'OPERATIONS_MANAGER',
  sales_manager: 'SALES_MANAGER',
  marketing_manager: 'MARKETING_MANAGER',
  franchise_manager: 'FRANCHISE_MANAGER',
  sales_employee: 'SALES_EMPLOYEE',
  operations_employee: 'OPERATIONS_EMPLOYEE',
  marketing_employee: 'MARKETING_EMPLOYEE',
  franchise_partner: 'FRANCHISE_EMPLOYEE',
  consultation: 'CONSULTATION',
  operations_assistant: 'OPERATIONS_ASSISTANT',
  sales_assistant: 'SALES_ASSISTANT',
  hr: 'HR',
  website_manager: 'WEBSITE_MANAGER',
  staff: 'STAFF',
};

const same = (a: unknown[] = [], b: unknown[] = []) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

export async function syncAccessOnce(): Promise<'ok' | 'deactivated' | 'skip'> {
  const { staffToken, staffUser } = useAuthStore.getState();
  if (!staffToken || staffToken === 'demo-staff-token' || !staffUser) return 'skip';
  try {
    const res = await fetch(`${API_BASE_URL}/v1/crm/access/me`);
    if (res.status === 403) {
      const d = await res.json().catch(() => ({}));
      if (d?.code === 'ACCOUNT_DEACTIVATED') return 'deactivated';
      return 'skip';
    }
    if (!res.ok) return 'skip';
    const d = await res.json();
    const p = d?.data;
    if (!p || !Array.isArray(p.permissions)) return 'skip';
    const perms: string[] = p.permissions.includes(RBAC_SENTINEL)
      ? p.permissions
      : [...p.permissions, RBAC_SENTINEL];
    const roleIds: number[] = Array.isArray(p.role_ids) ? p.role_ids : [p.role_id];
    const cur = useAuthStore.getState().staffUser;
    if (!cur) return 'skip';
    const roleType = ROLE_KEY_TO_TYPE[p.role_key];
    const roles = roleType && !(cur.roles || []).includes(roleType as any) ? [roleType] : cur.roles;
    if (
      same(cur.permissions || [], perms) &&
      same(cur.roleIds || [], roleIds) &&
      roles === cur.roles
    ) {
      return 'ok';
    }
    useAuthStore.setState({
      staffUser: { ...cur, permissions: perms, roleIds, roles: roles as any },
    });
    return 'ok';
  } catch {
    return 'skip';
  }
}

export function useAccessSync(intervalMs = 60_000) {
  const navigate = useNavigate();
  useEffect(() => {
    let stopped = false;
    const run = async () => {
      const r = await syncAccessOnce();
      if (stopped) return;
      if (r === 'deactivated') {
        useAuthStore.getState().logoutStaff();
        navigate('/crm/login', { replace: true, state: { reason: 'deactivated' } });
      }
    };
    run();
    const t = window.setInterval(run, intervalMs);
    const onFocus = () => run();
    window.addEventListener('focus', onFocus);
    return () => {
      stopped = true;
      window.clearInterval(t);
      window.removeEventListener('focus', onFocus);
    };
  }, [intervalMs, navigate]);
}
