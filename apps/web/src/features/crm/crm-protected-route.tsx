import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

interface CrmProtectedRouteProps {
  children: React.ReactNode;
  allowedRoleIds?: number[]; // optional role-level guard
}

/**
 * Wraps all /crm/* routes.
 * - Redirects to /crm/login if staff is not authenticated.
 * - Optionally restricts to specific role IDs.
 */
export default function CrmProtectedRoute({ children, allowedRoleIds }: CrmProtectedRouteProps) {
  const { isStaffAuthenticated, staffUser } = useAuthStore();
  const location = useLocation();

  if (!isStaffAuthenticated || !staffUser) {
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  if (allowedRoleIds && allowedRoleIds.length > 0) {
    const ROLE_ID_MAP: Record<string, number> = {
      super_admin: 1, admin: 2, operations_manager: 3, sales_manager: 4,
      marketing_manager: 5, franchise_manager: 6, sales_employee: 7,
      operations_employee: 8, marketing_employee: 9, franchise_partner: 10,
      consultation: 11, operations_assistant: 12, sales_assistant: 13,
      hr: 14, website_manager: 15,
    };
    const userRoleId = ROLE_ID_MAP[staffUser.role] ?? 0;
    if (!allowedRoleIds.includes(userRoleId)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm max-w-sm">
            Your role (<strong>{staffUser.role}</strong>) doesn't have permission to view this page.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
