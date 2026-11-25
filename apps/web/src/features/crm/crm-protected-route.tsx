import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { hasUserPermission, isServerAccessList } from './permissions';

interface CrmProtectedRouteProps {
  children: React.ReactNode;
  allowedRoleIds?: number[]; // optional role-level guard (used before the access rollout)
  /** Option key(s); any one is enough. Used instead of allowedRoleIds once the
   *  server sends the user's effective options (Users & Access page). */
  requiredPermission?: string | string[];
}

export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">No access to this page</h2>
      <p className="text-slate-500 text-sm max-w-sm">
        {message || "You don't have this option. Ask a Super Admin or Admin to give it to you."}
      </p>
    </div>
  );
}

/**
 * Wraps all /crm/* routes.
 * - Redirects to /crm/login if staff is not authenticated.
 * - Optionally restricts to specific role IDs.
 */
export default function CrmProtectedRoute({
  children,
  allowedRoleIds,
  requiredPermission,
}: CrmProtectedRouteProps) {
  const { isStaffAuthenticated, staffUser, activeRole } = useAuthStore();
  const location = useLocation();

  if (!isStaffAuthenticated || !staffUser) {
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && isServerAccessList(staffUser.permissions)) {
    const keys = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const ok = keys.some((k) =>
      hasUserPermission(staffUser.permissions, activeRole, k, [
        ...((staffUser.roles as any[]) || []),
        ...(staffUser.roleIds || []),
      ])
    );
    return ok ? <>{children}</> : <AccessDenied />;
  }

  if (allowedRoleIds && allowedRoleIds.length > 0) {
    const ROLE_ID_MAP: Record<string, number> = {
      super_admin: 1,
      admin: 2,
      operations_manager: 3,
      sales_manager: 4,
      marketing_manager: 5,
      franchise_manager: 6,
      sales_employee: 7,
      operations_employee: 8,
      marketing_employee: 9,
      franchise_partner: 10,
      consultation: 11,
      operations_assistant: 12,
      sales_assistant: 13,
      hr: 14,
      website_manager: 15,
      staff: 16,
    };

    // Extract all role IDs the user holds
    const userRoleIds: number[] = [];
    if (staffUser.roleIds && Array.isArray(staffUser.roleIds)) {
      userRoleIds.push(...staffUser.roleIds);
    }
    if (staffUser.role) {
      const primaryId =
        typeof staffUser.role === 'number'
          ? staffUser.role
          : (ROLE_ID_MAP[String(staffUser.role).toLowerCase()] ?? 0);
      if (primaryId && !userRoleIds.includes(primaryId)) userRoleIds.push(primaryId);
    }
    if (staffUser.roles && Array.isArray(staffUser.roles)) {
      for (const r of staffUser.roles) {
        const rId = typeof r === 'number' ? r : (ROLE_ID_MAP[String(r).toLowerCase()] ?? 0);
        if (rId && !userRoleIds.includes(rId)) userRoleIds.push(rId);
      }
    }

    // Super Admin bypass
    const isSuperAdmin = userRoleIds.includes(1);
    const hasAccess = isSuperAdmin || userRoleIds.some((id) => allowedRoleIds.includes(id));

    if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm max-w-sm">
            Your assigned role doesn't have permission to view this department workspace.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
