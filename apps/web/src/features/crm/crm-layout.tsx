import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  ClipboardList,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  BarChart3,
  UserCog,
  Briefcase,
  HelpCircle,
  FileCheck2,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Shield,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Phone,
  Calendar,
  Settings,
  FolderLock,
  Headphones,
  Video,
  MonitorCheck,
  Command,
  Monitor,
  FolderKanban,
  FileText,
  Clock,
  Radio,
  Share2,
  Award,
  Globe,
  DollarSign,
  UserCheck,
  MessageSquare,
  Target,
  Terminal,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import CommandPalette from './components/command-palette';
import NotificationCenter, { NotificationBadge } from './components/notification-center';
import { hasUserPermission } from './permissions';

export default function CrmLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: true,
    operations: true,
    franchise: false,
    admin: false,
    desktop: false,
    leadsSub: true,
  });
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { staffUser, activeRole, setStaffRole, logoutStaff } = useAuthStore();
  const UNREAD_COUNT = 4;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const ALL_ROLE_OPTIONS: { role: RoleType; label: string; staffName: string }[] = [
    { role: RoleType.SUPER_ADMIN, label: 'Super Admin (All Access)', staffName: 'ETaxwala HQ Admin' },
    { role: RoleType.ADMIN, label: 'General Administrator', staffName: 'System Manager' },
    { role: RoleType.OPERATIONS_MANAGER, label: 'Operations Manager', staffName: 'Vaijnath Sir' },
    { role: RoleType.SALES_MANAGER, label: 'Sales Manager', staffName: 'Netra Divekar' },
    { role: RoleType.MARKETING_MANAGER, label: 'Marketing Manager', staffName: 'Growth Lead' },
    { role: RoleType.FRANCHISE_MANAGER, label: 'Franchise Manager', staffName: 'Kunal Patil' },
    { role: RoleType.SALES_EMPLOYEE, label: 'Sales Employee (Telecaller)', staffName: 'Priya Sharma' },
    { role: RoleType.OPERATIONS_EMPLOYEE, label: 'Operations Specialist', staffName: 'Sachin Mohan Vyavahare' },
    { role: RoleType.MARKETING_EMPLOYEE, label: 'Marketing Content & SEO', staffName: 'Content Specialist' },
    { role: RoleType.FRANCHISE_EMPLOYEE, label: 'Franchise Partner Desk', staffName: 'Field Partner' },
    { role: RoleType.CONSULTATION, label: 'CA / Tax Expert Workbench', staffName: 'CA Tax Expert' },
    { role: RoleType.OPERATIONS_ASSISTANT, label: 'QC & Document Reviewer', staffName: 'QC Lead' },
    { role: RoleType.SALES_ASSISTANT, label: 'Sales Assistant / Qualifier', staffName: 'Shreya Joshi' },
    { role: RoleType.HR, label: 'HR Manager (Workforce & Tracking)', staffName: 'HR Manager' },
    { role: RoleType.WEBSITE_MANAGER, label: 'Website & Sub-Brands Manager', staffName: 'Sub-Brands Lead' },
    { role: RoleType.STAFF, label: 'Staff / Client Support Desk', staffName: 'Support Executive' },
  ];

  const isSuperAdmin =
    staffUser?.role === RoleType.SUPER_ADMIN ||
    (Array.isArray(staffUser?.roles) && staffUser.roles.includes(RoleType.SUPER_ADMIN));

  const roleOptions =
    isSuperAdmin || !staffUser?.roles || staffUser.roles.length === 0
      ? ALL_ROLE_OPTIONS
      : ALL_ROLE_OPTIONS.filter((opt) => staffUser.roles!.includes(opt.role));

  const currentRoleInfo = ALL_ROLE_OPTIONS.find((r) => r.role === activeRole) || ALL_ROLE_OPTIONS[0];

  const handleLogout = () => {
    logoutStaff();
    navigate('/crm/login');
  };

  const ROLE_ID_TO_ROLE_TYPE: Record<number, RoleType> = {
    1: RoleType.SUPER_ADMIN,
    2: RoleType.ADMIN,
    3: RoleType.OPERATIONS_MANAGER,
    4: RoleType.SALES_MANAGER,
    5: RoleType.MARKETING_MANAGER,
    6: RoleType.FRANCHISE_MANAGER,
    7: RoleType.SALES_EMPLOYEE,
    8: RoleType.OPERATIONS_EMPLOYEE,
    9: RoleType.MARKETING_EMPLOYEE,
    10: RoleType.FRANCHISE_EMPLOYEE,
    11: RoleType.CONSULTATION,
    12: RoleType.OPERATIONS_ASSISTANT,
    13: RoleType.SALES_ASSISTANT,
    14: RoleType.HR,
    15: RoleType.WEBSITE_MANAGER,
  };

  // Lock activeRole to actual assigned role for non-SuperAdmin staff
  useEffect(() => {
    if (staffUser && staffUser.roleIds && staffUser.roleIds.length > 0) {
      const primaryRoleId = staffUser.roleIds[0];
      const mappedRole = ROLE_ID_TO_ROLE_TYPE[primaryRoleId];
      if (mappedRole && !isSuperAdmin && activeRole !== mappedRole) {
        setStaffRole(mappedRole);
      }
    }
  }, [staffUser, isSuperAdmin, activeRole]);

  const can = (permKey: string) => {
    return hasUserPermission(staffUser?.permissions, activeRole, permKey, staffUser?.roles);
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const showOpsSection =
    can('operations:view') ||
    can('desktop_tracking:view') ||
    can('operations:employees') ||
    can('operations:customers') ||
    can('operations:tasks') ||
    can('accounts:view');

  const showFranchiseSection =
    can('franchise:view') ||
    can('franchise:partners') ||
    can('franchise:inquiries') ||
    can('franchise:training');

  const showSalesSection =
    can('sales:view') ||
    can('leads:view') ||
    can('leads:subbrands') ||
    can('quotations:view') ||
    can('tasks:view') ||
    can('workforce:view') ||
    can('accounts:view');

  const showAdminSection =
    can('admin:view') || can('users:manage') || can('call_analytics:view');

  return (
    <div className="h-screen bg-[#FAF9F5] text-slate-800 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#FFFDF9] border-b border-[#EAE6DD] sticky top-0 z-30 shadow-xs">
        <Link to="/crm" className="flex items-center gap-2">
          <img src="/logo_black.png" alt="ETaxwala" className="h-7 w-auto" />
          <span className="badge badge-gold text-[10px]">{activeRole}</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-[#FAF9F5]"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation matching the exact hierarchy from staff screenshots */}
      <aside
        className={`fixed md:sticky inset-y-0 left-0 z-40 bg-[#FFFDF9] border-r border-[#EAE6DD] flex flex-col justify-between transition-all duration-300 shadow-xs h-screen shrink-0 ${
          sidebarOpen ? 'w-64 translate-x-0 opacity-100' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 overflow-hidden border-none'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & Logo */}
          <div className="p-4 border-b border-[#EAE6DD] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo_black.png" alt="ETaxwala" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Current Staff User Card with Quick Switcher */}
          <div className="p-3 m-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1B365D] via-[#0084D1] to-[#00A896] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {(staffUser?.username || currentRoleInfo.staffName).charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {staffUser?.username || currentRoleInfo.staffName}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  {staffUser?.email || currentRoleInfo.label}
                </p>
              </div>
            </div>

            {/* Role Indicator / Quick Switcher */}
            <div className="mt-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-bold">
                <span>{isSuperAdmin ? 'Staff View (Super Admin Preview):' : 'Assigned Role:'}</span>
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              </div>
              {isSuperAdmin ? (
                <select
                  value={activeRole}
                  onChange={(e) => setStaffRole(e.target.value as RoleType)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[#1B365D] focus:outline-none focus:ring-1 focus:ring-brand-purple"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.role} value={opt.role}>
                      {opt.label} ({opt.staffName})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full text-xs font-bold text-[#1B365D] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between shadow-xs">
                  <span className="truncate">{staffUser?.profile?.position || currentRoleInfo.label}</span>
                  <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Navigation Accordion Menus */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto text-xs">
            {/* 1. Main Dashboard */}
            {can('dashboard:view') && (
              <Link
                to="/crm"
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl font-bold transition-all ${
                  location.pathname === '/crm'
                    ? 'bg-[#1B365D] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${location.pathname === '/crm' ? 'text-white' : 'text-[#1B365D]'}`} />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Staff Internal Chat */}
            {can('chat:view') && (
              <Link
                to="/crm/chat"
                onClick={handleNavClick}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                  location.pathname === '/crm/chat'
                    ? 'bg-[#1B365D] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/chat' ? 'text-white' : 'text-[#7C3AED]'}`} />
                  <span>Staff Chat</span>
                </div>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E11D48] text-white">Live</span>
                </span>
              </Link>
            )}

            {/* Department Hubs: HR Desk, Marketing Suite, IT Command Center */}
            <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Department Hubs
            </div>

            <Link
              to="/crm/hr"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                location.pathname === '/crm/hr'
                  ? 'bg-[#1B365D] text-white shadow-sm'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/hr' ? 'text-white' : 'text-[#D97706]'}`} />
                <span>HR & Accounts</span>
              </div>
              <span className="badge badge-gold text-[9px] px-1.5 py-0.2">Careers ATS</span>
            </Link>

            <Link
              to="/crm/marketing"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                location.pathname === '/crm/marketing'
                  ? 'bg-[#1B365D] text-white shadow-sm'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Target className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/marketing' ? 'text-white' : 'text-pink-600'}`} />
                <span>Marketing Hub</span>
              </div>
              <span className="badge badge-navy text-[9px] px-1.5 py-0.2">Social & Ads</span>
            </Link>

            <Link
              to="/crm/it-command"
              onClick={handleNavClick}
              className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                location.pathname === '/crm/it-command'
                  ? 'bg-[#1B365D] text-white shadow-sm'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Terminal className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/it-command' ? 'text-white' : 'text-[#0084D1]'}`} />
                <span>IT Command Center</span>
              </div>
              <span className="badge badge-green text-[9px] px-1.5 py-0.2">Super Tech</span>
            </Link>

            {/* 2. OPERATION MANAGER ACCORDION */}
            {showOpsSection && (
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleSection('operations')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4 text-[#00A896] shrink-0" />
                    <span>Operation Manager</span>
                  </div>
                  {openSections.operations ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.operations && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-4">
                    {/* Manage Desktop Sub-menu */}
                    {can('desktop_tracking:view') && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => toggleSection('desktop')}
                          className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <div className="flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                            <span>Manage Desktop</span>
                          </div>
                          {openSections.desktop ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>

                        {openSections.desktop && (
                          <div className="pl-5 space-y-1 py-1 text-[11px]">
                            <Link
                              to="/crm/desktop-report"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/desktop-report'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Tracking Report
                            </Link>
                            <Link
                              to="/crm/desktop-report-idle"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/desktop-report-idle'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Session Report
                            </Link>
                            <span className="block py-1 px-2 text-slate-400 cursor-not-allowed">
                              Block Website
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {can('operations:employees') && (
                      <Link
                        to="/crm/operation-manage-employee"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>Manage Employee</span>
                      </Link>
                    )}

                    {can('operations:customers') && (
                      <Link
                        to="/crm/operation-manage-customer"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/operation-manage-customer' || location.pathname === '/crm/accounts'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Customer</span>
                      </Link>
                    )}

                    {can('operations:tasks') && (
                      <Link
                        to="/crm/operation-manage-tasks"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/operation-manage-tasks' || location.pathname === '/crm/tasks'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Tasks</span>
                        <span className="badge badge-green text-[9px] px-1 py-0.2">Live</span>
                      </Link>
                    )}

                    {can('accounts:view') && (
                      <Link
                        to="/crm/accounts"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>Customers Details</span>
                      </Link>
                    )}
                    <span className="block py-1.5 px-2 text-slate-400 cursor-not-allowed">
                      Locations
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 3. FRANCHISE MANAGER ACCORDION */}
            {showFranchiseSection && (
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleSection('franchise')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Franchise Manager</span>
                  </div>
                  {openSections.franchise ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.franchise && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-4">
                    {can('franchise:partners') && (
                      <>
                        <Link
                          to="/crm/franchise"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Manage Partners</span>
                          <span className="badge badge-gold text-[9px] px-1 py-0.2">120+</span>
                        </Link>
                        <Link
                          to="/crm/franchise"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Manage Partners Orders</span>
                        </Link>
                      </>
                    )}

                    {can('franchise:inquiries') && (
                      <>
                        <Link
                          to="/crm/leads"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Manage Inquiries</span>
                        </Link>
                        <Link
                          to="/crm/leads"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Partners Leads</span>
                        </Link>
                      </>
                    )}

                    {can('franchise:training') && (
                      <>
                        <Link
                          to="/portal/videos"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Training Videos</span>
                        </Link>
                        <Link
                          to="/portal/documents"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Service Documents</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. SALES MANAGER ACCORDION */}
            {showSalesSection && (
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleSection('sales')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-[#1B365D] shrink-0" />
                    <span>Sales Manager</span>
                  </div>
                  {openSections.sales ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.sales && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-4">
                    {/* Manage Leads sub-group */}
                    {can('leads:view') && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => toggleSection('leadsSub')}
                          className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Manage Leads</span>
                          </div>
                          {openSections.leadsSub ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>

                        {openSections.leadsSub && (
                          <div className="pl-5 space-y-1 py-1 text-[11px]">
                            <Link
                              to="/crm/sales-manage-leads"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/sales-manage-leads' || location.pathname === '/crm/leads'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Lead List
                            </Link>
                            <Link
                              to="/crm/sales-manage-leads-details"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/sales-manage-leads-details'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Leads Details
                            </Link>
                            <Link
                              to="/crm/leads"
                              onClick={handleNavClick}
                              className="block py-1 px-2 text-slate-600 hover:text-[#1B365D]"
                            >
                              Customer Inquiries
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {can('leads:subbrands') && (
                      <>
                        <Link
                          to="/crm/sub-brands"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Udyomi Leads</span>
                        </Link>
                        <Link
                          to="/crm/sub-brands"
                          onClick={handleNavClick}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <span>Sahakar Leads</span>
                        </Link>
                      </>
                    )}

                    {can('quotations:view') && (
                      <Link
                        to="/crm/quotations"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname.startsWith('/crm/quotation')
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Quotations</span>
                        <span className="badge badge-gold text-[9px] px-1 py-0.2">Letterhead</span>
                      </Link>
                    )}

                    {can('tasks:view') && (
                      <Link
                        to="/crm/tasks"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>My Tasks</span>
                      </Link>
                    )}

                    {can('workforce:view') && (
                      <Link
                        to="/crm/workforce"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>Manage Employee</span>
                      </Link>
                    )}

                    {can('accounts:view') && (
                      <Link
                        to="/crm/accounts"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>Manage Customers</span>
                      </Link>
                    )}

                    {can('leads:view') && (
                      <Link
                        to="/crm/leads"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>My Leads</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. ADMIN / SUPPORT ACCORDION */}
            {showAdminSection && (
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleSection('admin')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Admin / Support</span>
                  </div>
                  {openSections.admin ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.admin && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-4">
                    {can('users:manage') && (
                      <Link
                        to="/crm/users"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>Manage Manager</span>
                      </Link>
                    )}

                    {can('categories:manage') && (
                      <Link
                        to="/crm/manage-categories"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/manage-categories'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Category</span>
                      </Link>
                    )}

                    {can('services:manage') && (
                      <Link
                        to="/crm/manage-services"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/manage-services'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Services</span>
                      </Link>
                    )}

                    {can('packages:manage') && (
                      <Link
                        to="/crm/manage-packages"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/manage-packages'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Packages</span>
                      </Link>
                    )}

                    {can('blogs:manage') && (
                      <Link
                        to="/crm/manage-blogs"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/manage-blogs'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Blogs</span>
                      </Link>
                    )}

                    <span className="block py-1.5 px-2 text-slate-400 cursor-not-allowed">
                      Blog Comments
                    </span>
                    <span className="block py-1.5 px-2 text-slate-400 cursor-not-allowed">
                      All Blogs
                    </span>
                    <span className="block py-1.5 px-2 text-slate-400 cursor-not-allowed">
                      Manage Ads
                    </span>

                    {can('call_analytics:view') && (
                      <Link
                        to="/crm/call-analytics"
                        onClick={handleNavClick}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <span>User Activities</span>
                      </Link>
                    )}

                    {can('appointments:manage') && (
                      <Link
                        to="/crm/appointments"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/appointments'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Appointments</span>
                      </Link>
                    )}

                    <span className="block py-1.5 px-2 text-slate-400 cursor-not-allowed">
                      Webinar
                    </span>
                    <span className="block py-1.5 px-2 text-slate-400 cursor-not-allowed">
                      Reports
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Desktrack Live Indicator */}
            <div className="p-2.5 mt-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#1B365D]">
                <span className="flex items-center gap-1.5">
                  <MonitorCheck className="w-3.5 h-3.5 text-emerald-600" /> Desktrack Status
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Active (Live)</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Staff session, idle & call logging active.
              </p>
            </div>
          </nav>

          {/* Footer controls */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              to="/portal"
              className="text-xs text-[#1B365D] hover:text-[#00A896] flex items-center justify-between font-semibold p-2 bg-[#F7F8FA] rounded-lg border border-slate-200"
            >
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Client Portal View
              </span>
              <span>→</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center justify-center gap-1.5 p-2 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9F5]">
        {/* Top Header matching exact screenshot banner ("ETaxwala Business Solution Pvt Ltd" / Employee Name) */}
        <header className="hidden md:flex items-center justify-between px-4 py-3 bg-[#FFFDF9] border-b border-[#EAE6DD] sticky top-0 z-20 shadow-xs">
          {/* Sidebar toggle + Company / Brand Banner */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-[#1B365D] hover:bg-slate-100 transition-colors shrink-0"
              title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
              id="sidebar-toggle-btn"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#1B365D]">
                ETaxwala Business Solution Pvt Ltd
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-600">
                {currentRoleInfo.staffName} ({currentRoleInfo.label})
              </span>
            </div>
          </div>

          {/* Center search / Cmd+K */}
          <div className="flex items-center gap-4 flex-1 max-w-sm mx-6">
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="relative w-full flex items-center gap-2 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3.5 py-1.5 text-xs text-slate-400 hover:border-[#1B365D]/40 hover:text-slate-600 transition-colors text-left cursor-pointer"
              id="cmd-palette-trigger"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">Search leads, tasks, staff... (Cmd+K)</span>
              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>
          </div>

          {/* Right quick stats, role switcher & notification */}
          <div className="flex items-center gap-3">
            {/* Header Role Switcher for Multi-Role Users */}
            <div className="flex items-center gap-2 bg-[#FAF9F5] border border-[#EAE6DD] px-2.5 py-1 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:inline">Active Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setStaffRole(e.target.value as RoleType)}
                className="text-xs font-bold bg-transparent text-[#1B365D] focus:outline-none cursor-pointer"
                id="header-role-switcher"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Chat Shortcut */}
            <Link
              to="/crm/chat"
              className={`p-2 rounded-xl transition-colors relative flex items-center gap-1.5 text-xs font-bold ${
                location.pathname === '/crm/chat'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 hover:text-[#1B365D]'
              }`}
              title="Staff Internal Chat"
              id="header-chat-btn"
            >
              <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
              <span className="hidden sm:inline">Staff Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                ref={bellRef}
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                id="notification-bell"
              >
                <Bell className="w-4 h-4" />
                <NotificationBadge count={UNREAD_COUNT} />
              </button>
              <NotificationCenter
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                anchorRef={bellRef}
              />
            </div>

            {/* Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentRoleInfo.staffName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-full">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
    </div>
  );
}
