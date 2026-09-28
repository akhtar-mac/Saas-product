import React, { lazy, Suspense } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';

// Lazy-load all role dashboards for optimal chunking & performance
const SuperAdminDashboard = lazy(() => import('./dashboards/super-admin-dashboard'));
const AdminDashboard = lazy(() => import('./dashboards/admin-dashboard'));
const SalesManagerDashboard = lazy(() => import('./dashboards/sales-manager-dashboard'));
const SalesAgentDashboard = lazy(() => import('./dashboards/sales-agent-dashboard'));
const SalesAssistantDashboard = lazy(() => import('./dashboards/sales-assistant-dashboard'));
const OpsManagerDashboard = lazy(() => import('./dashboards/ops-manager-dashboard'));
const OpsExecutiveDashboard = lazy(() => import('./dashboards/ops-executive-dashboard'));
const QcReviewerDashboard = lazy(() => import('./dashboards/qc-reviewer-dashboard'));
const CaExpertDashboard = lazy(() => import('./dashboards/ca-expert-dashboard'));
const AccountsDashboard = lazy(() => import('./dashboards/accounts-dashboard'));
const FranchiseDashboard = lazy(() => import('./dashboards/franchise-dashboard'));
const FranchiseAgentDashboard = lazy(() => import('./dashboards/franchise-agent-dashboard'));
const MarketingDashboard = lazy(() => import('./dashboards/marketing-dashboard'));
const HrDashboard = lazy(() => import('./dashboards/hr-dashboard'));
const SubBrandsDashboard = lazy(() => import('./dashboards/sub-brands-dashboard'));
const SupportDashboard = lazy(() => import('./dashboards/support-dashboard'));

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl lg:col-span-2" />
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}

export default function CrmMainDashboard() {
  const { activeRole } = useAuthStore();

  const renderDashboard = () => {
    switch (activeRole) {
      case RoleType.SUPER_ADMIN:
        return <SuperAdminDashboard />;

      case RoleType.ADMIN:
        return <AdminDashboard />;

      case RoleType.SALES_MANAGER:
        return <SalesManagerDashboard />;

      case RoleType.SALES_EMPLOYEE:
        return <SalesAgentDashboard />;

      case RoleType.SALES_ASSISTANT:
        return <SalesAssistantDashboard />;

      case RoleType.OPERATIONS_MANAGER:
        return <OpsManagerDashboard />;

      case RoleType.OPERATIONS_EMPLOYEE:
        return <OpsExecutiveDashboard />;

      case RoleType.OPERATIONS_ASSISTANT:
        return <QcReviewerDashboard />;

      case RoleType.CONSULTATION:
        return <CaExpertDashboard />;

      case RoleType.FRANCHISE_MANAGER:
        return <FranchiseDashboard />;

      case RoleType.FRANCHISE_EMPLOYEE:
        return <FranchiseAgentDashboard />;

      case RoleType.HR:
        return <HrDashboard />;

      case RoleType.MARKETING_MANAGER:
      case RoleType.MARKETING_EMPLOYEE:
        return <MarketingDashboard />;

      case RoleType.WEBSITE_MANAGER:
        return <SubBrandsDashboard />;

      case RoleType.STAFF:
      default:
        return <SupportDashboard />;
    }
  };

  return <Suspense fallback={<DashboardLoadingSkeleton />}>{renderDashboard()}</Suspense>;
}
