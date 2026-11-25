import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/loading';
import ErrorBoundary from '@/components/error-boundary';

// ─── Lazy load Marketing Website ──────────────────────────────────────────────
const MarketingLayout = lazy(() => import('@/layouts/marketing-layout'));
const HomePage = lazy(() => import('@/features/marketing/home/home-page'));
const AboutPage = lazy(() => import('@/features/marketing/about/about-page'));
const ContactPage = lazy(() => import('@/features/marketing/contact/contact-page'));
const CareersPage = lazy(() => import('@/features/marketing/careers/careers-page'));
const ServicesHubPage = lazy(() => import('@/features/marketing/services/services-hub-page'));
const ServiceDetailPage = lazy(() => import('@/features/marketing/services/service-detail-page'));
const BlogListPage = lazy(() => import('@/features/marketing/blog/blog-list-page'));
const BlogDetailPage = lazy(() => import('@/features/marketing/blog/blog-detail-page'));
const AppointmentPage = lazy(() => import('@/features/marketing/appointment/appointment-page'));
const ITRFilingPage = lazy(() => import('@/features/marketing/funnels/itr-filing-page'));
const FPCTrainingPage = lazy(() => import('@/features/marketing/funnels/fpc-training-page'));
const LegalPage = lazy(() => import('@/features/marketing/legal/legal-page'));
const SoftwareSolutionsPage = lazy(
  () => import('@/features/marketing/software/software-solutions-page')
);
const NotFoundPage = lazy(() => import('@/features/marketing/not-found/not-found-page'));
const LoadingDemoPage = lazy(() => import('@/features/marketing/loading-demo-page'));
const DirectPayPage = lazy(() => import('@/features/marketing/payment/direct-pay-page'));

// ─── Lazy load Client Portal ──────────────────────────────────────────────────
const PortalLayout = lazy(() => import('@/features/portal/portal-layout'));
const ClientDashboardPage = lazy(() => import('@/features/portal/client-dashboard-page'));
const ClientServicesPage = lazy(() => import('@/features/portal/client-services-page'));
const ClientServiceDetailPage = lazy(() => import('@/features/portal/client-service-detail-page'));
const ClientDocumentsPage = lazy(() => import('@/features/portal/client-documents-page'));
const ClientPaymentsPage = lazy(() => import('@/features/portal/client-payments-page'));
const ClientSupportPage = lazy(() => import('@/features/portal/client-support-page'));
const ClientLoginPage = lazy(() => import('@/features/portal/client-login-page'));
const ClientSignupPage = lazy(() => import('@/features/portal/client-signup-page'));
const ClientForgotPasswordPage = lazy(
  () => import('@/features/portal/client-forgot-password-page')
);
const ClientVideosPage = lazy(() => import('@/features/portal/client-videos-page'));
const ClientProfilePage = lazy(() => import('@/features/portal/client-profile-page'));
const ClientProtectedRoute = lazy(() => import('@/features/portal/client-protected-route'));

// ─── Lazy load Staff CRM ──────────────────────────────────────────────────────
const CrmLayout = lazy(() => import('@/features/crm/crm-layout'));
const CrmProtectedRoute = lazy(() => import('@/features/crm/crm-protected-route'));
const CrmLoginPage = lazy(() => import('@/features/crm/crm-login-page'));
const CrmMainDashboard = lazy(() => import('@/features/crm/crm-main-dashboard'));
const CrmLeadsPage = lazy(() => import('@/features/crm/crm-leads-page'));
const CrmTasksPage = lazy(() => import('@/features/crm/crm-tasks-page'));
const CrmQuotationsPage = lazy(() => import('@/features/crm/crm-quotations-page'));
const CrmAccountsPage = lazy(() => import('@/features/crm/crm-accounts-page'));
const HrWorkforcePage = lazy(() => import('@/features/crm/hr-workforce-page'));
const CrmUserManagementPage = lazy(() => import('@/features/crm/crm-user-management-page'));
const CrmUsersAccessPage = lazy(() => import('@/features/crm/access/users-access-page'));
const CrmActivityLogsPage = lazy(() => import('@/features/crm/access/activity-logs-page'));
const CrmRecycleBinPage = lazy(() => import('@/features/crm/access/recycle-bin-page'));
const CrmWonFormPage = lazy(() => import('@/features/crm/crm-won-form-page'));
const CrmCallAnalyticsPage = lazy(() => import('@/features/crm/crm-call-analytics-page'));
const CrmLocationsPage = lazy(() => import('@/features/crm/crm-locations-page'));
const CrmDesktopTrackingPage = lazy(() => import('@/features/crm/crm-desktop-tracking-page'));
const CrmManageCategoryPage = lazy(() => import('@/features/crm/crm-manage-category-page'));
const CrmManageServicesPage = lazy(() => import('@/features/crm/crm-manage-services-page'));
const CrmManagePackagesPage = lazy(() => import('@/features/crm/crm-manage-packages-page'));
const CrmManageBlogsPage = lazy(() => import('@/features/crm/crm-manage-blogs-page'));
const CrmAppointmentsPage = lazy(() => import('@/features/crm/crm-appointments-page'));
const CrmInternalTasksPage = lazy(() => import('@/features/crm/crm-internal-tasks-page'));
const CrmServiceQuestionsPage = lazy(() => import('@/features/crm/crm-service-questions-page'));
const CrmCustomerDetailsPage = lazy(() => import('@/features/crm/crm-customer-details-page'));
const CrmChatPage = lazy(() => import('@/features/crm/pages/crm-chat-page'));
const HrDashboard = lazy(() => import('@/features/crm/dashboards/hr-dashboard'));
const MarketingDashboard = lazy(() => import('@/features/crm/dashboards/marketing-dashboard'));
const ItCommandDashboard = lazy(() => import('@/features/crm/dashboards/it-command-dashboard'));
const FranchiseDashboard = lazy(() => import('@/features/crm/dashboards/franchise-dashboard'));
const SubBrandsDashboard = lazy(() => import('@/features/crm/dashboards/sub-brands-dashboard'));
const FranchiseManagerDashboard = lazy(
  () => import('@/features/crm/dashboards/franchise-manager-dashboard')
);
const FranchiseEmployeeDashboard = lazy(
  () => import('@/features/crm/dashboards/franchise-employee-dashboard')
);
const CrmFranchiseManagePartnersOrders = lazy(
  () => import('@/features/crm/crm-franchise-manage-partners-orders')
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── 1. Public Marketing Website ─────────────────────────── */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/services" element={<ServicesHubPage />} />
          <Route path="/services/:categorySlug" element={<ServicesHubPage />} />
          <Route path="/services/:categorySlug/:serviceSlug" element={<ServiceDetailPage />} />
          <Route path="/service/:serviceSlug" element={<ServiceDetailPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/itr-filing" element={<ITRFilingPage />} />
          <Route path="/fpc-training" element={<FPCTrainingPage />} />
          <Route path="/software-solutions" element={<SoftwareSolutionsPage />} />
          <Route path="/tech" element={<Navigate to="/software-solutions" replace />} />
          <Route path="/legal/:type" element={<LegalPage />} />
          <Route path="/pay" element={<DirectPayPage />} />
          <Route path="/payment" element={<DirectPayPage />} />
          <Route path="/loading" element={<LoadingDemoPage />} />
          <Route path="/loader" element={<LoadingDemoPage />} />
          <Route path="/demo/loading" element={<LoadingDemoPage />} />

          {/* Legacy & Shortcut 301 Redirects */}
          <Route path="/privacy" element={<Navigate to="/legal/privacy" replace />} />
          <Route path="/terms" element={<Navigate to="/legal/terms" replace />} />
          <Route path="/refund" element={<Navigate to="/legal/refund" replace />} />
          <Route path="/about-us" element={<Navigate to="/about" replace />} />
          <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
          <Route path="/services-hub" element={<Navigate to="/services" replace />} />
        </Route>

        {/* ── 2. Client Self-Service Portal ───────────────────────── */}
        <Route path="/portal/login" element={<ClientLoginPage />} />
        <Route path="/portal/signup" element={<ClientSignupPage />} />
        <Route path="/portal/forgot-password" element={<ClientForgotPasswordPage />} />
        <Route
          path="/portal"
          element={
            <ClientProtectedRoute>
              <PortalLayout />
            </ClientProtectedRoute>
          }
        >
          <Route index element={<ClientDashboardPage />} />
          <Route path="services" element={<ClientServicesPage />} />
          <Route path="services/:id" element={<ClientServiceDetailPage />} />
          <Route path="documents" element={<ClientDocumentsPage />} />
          <Route path="payments" element={<ClientPaymentsPage />} />
          <Route path="videos" element={<ClientVideosPage />} />
          <Route path="support" element={<ClientSupportPage />} />
          <Route path="profile" element={<ClientProfilePage />} />
        </Route>

        {/* ── 3. Staff CRM — JWT Protected ────────────────────────── */}
        <Route path="/login" element={<Navigate to="/crm/login" replace />} />
        <Route path="/crm/login" element={<CrmLoginPage />} />
        <Route
          path="/crm"
          element={
            <ErrorBoundary>
              <CrmProtectedRoute>
                <CrmLayout />
              </CrmProtectedRoute>
            </ErrorBoundary>
          }
        >
          {/* Role dashboard (main) */}
          <Route index element={<CrmMainDashboard />} />

          {/* Shared CRM pages */}
          <Route path="leads" element={<CrmLeadsPage />} />
          <Route path="sales-manage-leads" element={<CrmLeadsPage />} />
          <Route path="sales-manage-leads-details" element={<CrmLeadsPage />} />
          <Route path="tasks" element={<CrmTasksPage />} />
          <Route path="operation-manage-tasks" element={<CrmTasksPage />} />
          <Route path="internal-tasks" element={<CrmInternalTasksPage />} />
          <Route path="services" element={<CrmServiceQuestionsPage />} />
          <Route path="service-questions" element={<CrmServiceQuestionsPage />} />
          <Route path="customer-details" element={<CrmCustomerDetailsPage />} />
          <Route path="quotations" element={<CrmQuotationsPage />} />
          <Route path="quotation" element={<CrmQuotationsPage />} />
          <Route path="accounts" element={<CrmAccountsPage />} />
          <Route path="operation-manage-customer" element={<CrmAccountsPage />} />
          <Route path="locations" element={<CrmLocationsPage />} />
          <Route path="desktop-report" element={<CrmDesktopTrackingPage />} />
          <Route path="desktop-report-idle" element={<CrmDesktopTrackingPage />} />
          <Route path="desktrack-live" element={<CrmDesktopTrackingPage />} />
          <Route path="block-websites" element={<CrmDesktopTrackingPage />} />
          <Route path="desktop-users" element={<CrmDesktopTrackingPage />} />
          <Route path="manage-ips" element={<CrmDesktopTrackingPage />} />
          <Route path="operation-manage-employee" element={<HrWorkforcePage />} />
          <Route path="workforce" element={<HrWorkforcePage />} />

          {/* Won Conversion Form — Sales Employees */}
          <Route path="leads/:leadId/won" element={<CrmWonFormPage />} />

          {/* Call Analytics — Sales team + Admin */}
          <Route path="call-analytics" element={<CrmCallAnalyticsPage />} />

          {/* Users & Access — one screen for create/edit, role defaults and extra options */}
          <Route
            path="users"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2, 14]} requiredPermission="users:view">
                <CrmUsersAccessPage />
              </CrmProtectedRoute>
            }
          />
          {/* Previous user screen kept reachable while staff move over */}
          <Route
            path="users-legacy"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2]} requiredPermission="users:edit">
                <CrmUserManagementPage />
              </CrmProtectedRoute>
            }
          />
          {/* Activity Logs (all users) and Recycle Bin — Super Admin / Admin */}
          <Route
            path="logs"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2]} requiredPermission="logs:view">
                <CrmActivityLogsPage />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="recycle-bin"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2]} requiredPermission="recycle_bin:view">
                <CrmRecycleBinPage />
              </CrmProtectedRoute>
            }
          />

          {/* Super Admin / Admin catalog management */}
          <Route
            path="manage-categories"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2]} requiredPermission="categories:manage">
                <CrmManageCategoryPage />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="manage-services"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2]} requiredPermission="services:manage">
                <CrmManageServicesPage />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="manage-packages"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2]} requiredPermission="packages:manage">
                <CrmManagePackagesPage />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="manage-blogs"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2, 15]} requiredPermission="blogs:manage">
                <CrmManageBlogsPage />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="appointments"
            element={
              <CrmProtectedRoute
                allowedRoleIds={[1, 2, 3, 7, 8]}
                requiredPermission="appointments:view"
              >
                <CrmAppointmentsPage />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="internal-tasks"
            element={
              <CrmProtectedRoute
                allowedRoleIds={[1, 2, 3, 7, 8]}
                requiredPermission="operations:internal_tasks_view"
              >
                <CrmInternalTasksPage />
              </CrmProtectedRoute>
            }
          />

          {/* Staff Chat — Enterprise Socket.IO messaging */}
          <Route path="chat" element={<CrmChatPage />} />

          {/* Department Hubs: HR Desk, Marketing Suite & IT Command Center */}
          <Route path="hr" element={<HrDashboard />} />
          <Route path="marketing" element={<MarketingDashboard />} />
          <Route path="it-command" element={<ItCommandDashboard />} />
          <Route path="it" element={<Navigate to="/crm/it-command" replace />} />

          {/* Specialized Verticals: Franchise Network & Sub-Brands */}
          <Route path="franchise" element={<FranchiseDashboard />} />
          <Route path="sub-brands" element={<SubBrandsDashboard />} />

          {/* Franchise Dashboards */}
          <Route
            path="franchise-manager-dashboard"
            element={
              <CrmProtectedRoute
                allowedRoleIds={[1, 2, 5]}
                requiredPermission="franchise:partners_manage"
              >
                <FranchiseManagerDashboard />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="franchise-employee-dashboard"
            element={
              <CrmProtectedRoute allowedRoleIds={[1, 2, 8]} requiredPermission="franchise:view">
                <FranchiseEmployeeDashboard />
              </CrmProtectedRoute>
            }
          />
          <Route
            path="franchise-manage-partners-orders"
            element={<CrmFranchiseManagePartnersOrders />}
          />
        </Route>

        {/* ── 4. 404 ──────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
