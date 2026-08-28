import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import SuperAdminDashboard from './dashboards/super-admin-dashboard';
import AdminDashboard from './dashboards/admin-dashboard';
import SalesManagerDashboard from './dashboards/sales-manager-dashboard';
import SalesAgentDashboard from './dashboards/sales-agent-dashboard';
import SalesAssistantDashboard from './dashboards/sales-assistant-dashboard';
import OpsManagerDashboard from './dashboards/ops-manager-dashboard';
import OpsExecutiveDashboard from './dashboards/ops-executive-dashboard';
import QcReviewerDashboard from './dashboards/qc-reviewer-dashboard';
import CaExpertDashboard from './dashboards/ca-expert-dashboard';
import AccountsDashboard from './dashboards/accounts-dashboard';
import FranchiseDashboard from './dashboards/franchise-dashboard';
import FranchiseAgentDashboard from './dashboards/franchise-agent-dashboard';
import MarketingDashboard from './dashboards/marketing-dashboard';
import HrDashboard from './dashboards/hr-dashboard';
import SubBrandsDashboard from './dashboards/sub-brands-dashboard';
import SupportDashboard from './dashboards/support-dashboard';

export default function CrmMainDashboard() {
  const { activeRole } = useAuthStore();

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
}
