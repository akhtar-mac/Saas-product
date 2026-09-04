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
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import CommandPalette from './components/command-palette';
import NotificationCenter, { NotificationBadge } from './components/notification-center';

export default function CrmLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('sales');
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { staffUser, activeRole, setStaffRole, logoutStaff } = useAuthStore();
  const UNREAD_COUNT = 4; // Demo count — wire to real data

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
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

  const roleOptions: { role: RoleType; label: string; group: string }[] = [
    { role: RoleType.SUPER_ADMIN, label: 'Super Admin (All Access)', group: 'Executive' },
    { role: RoleType.ADMIN, label: 'General Administrator', group: 'Executive' },
    { role: RoleType.SALES_MANAGER, label: 'Sales Manager', group: 'Sales Team' },
    { role: RoleType.SALES_EMPLOYEE, label: 'Sales Agent / Telecaller', group: 'Sales Team' },
    { role: RoleType.OPERATIONS_MANAGER, label: 'Operations Manager', group: 'Operations' },
    { role: RoleType.OPERATIONS_EMPLOYEE, label: 'Operations Specialist', group: 'Operations' },
    { role: RoleType.OPERATIONS_ASSISTANT, label: 'QC & Reviewer', group: 'Operations' },
    { role: RoleType.CONSULTATION, label: 'CA / Tax Expert', group: 'Experts' },
    { role: RoleType.MARKETING_MANAGER, label: 'Marketing Manager', group: 'Marketing' },
    { role: RoleType.FRANCHISE_MANAGER, label: 'Franchise & Partners', group: 'Partners' },
    { role: RoleType.HR, label: 'Human Resources (HR)', group: 'Administration' },
    { role: RoleType.WEBSITE_MANAGER, label: 'Sub-Brands (Sahakar & Udyami)', group: 'Administration' },
    { role: RoleType.STAFF, label: 'Support & Helpdesk', group: 'Support' },
  ];

  const handleLogout = () => {
    logoutStaff();
    navigate('/crm/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-800 flex flex-col md:flex-row font-sans">
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

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#FFFDF9] border-r border-[#EAE6DD] flex flex-col justify-between transition-transform duration-300 shadow-xs ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0084D1] via-[#7C3AED] to-[#F97316] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {staffUser?.username ? staffUser.username.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {staffUser?.username || 'Super Admin'}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  {staffUser?.email || 'admin@etaxwala.com'}
                </p>
              </div>
            </div>

            {/* Quick Role Switcher */}
            <div className="mt-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-bold">
                <span>Active Dashboard Role:</span>
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <select
                value={activeRole}
                onChange={(e) => setStaffRole(e.target.value as RoleType)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-purple"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Accordion Menus */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {/* 1. Main Role Dashboard */}
            <Link
              to="/crm"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/crm'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-slate-800 bg-slate-50/80 hover:bg-slate-100 hover:text-brand-navy border border-slate-100'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${location.pathname === '/crm' ? 'text-white' : 'text-brand-navy'}`} />
              <span>Role Dashboard</span>
            </Link>

            {/* 2. Sales & Leads Accordion */}
            <div className="space-y-0.5">
              <button
                onClick={() => toggleSection('sales')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-brand-navy shrink-0" />
                  <span>Sales & Leads</span>
                </div>
                {openSection === 'sales' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openSection === 'sales' && (
                <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-4 animate-fade-in">
                  <Link
                    to="/crm/leads"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Manage Leads</span>
                    <span className="badge badge-navy text-[9px] px-1 py-0.2">17k</span>
                  </Link>
                  <Link
                    to="/crm"
                    onClick={() => setStaffRole(RoleType.SALES_EMPLOYEE)}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Call Dashboard & Dialer</span>
                  </Link>
                  <Link
                    to="/crm/call-analytics"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Call Analytics</span>
                    <span className="badge badge-navy text-[9px] px-1 py-0.2">Live</span>
                  </Link>
                  <Link
                    to="/crm/quotations"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Quotations Maker</span>
                    <span className="badge badge-gold text-[9px] px-1 py-0.2">3.7k</span>
                  </Link>
                  <Link
                    to="/crm/sub-brands"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Udyami & Sahakar Leads</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Operations & Task Engine Accordion */}
            <div className="space-y-0.5">
              <button
                onClick={() => toggleSection('operations')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Operations Engine</span>
                </div>
                {openSection === 'operations' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openSection === 'operations' && (
                <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-4 animate-fade-in">
                  <Link
                    to="/crm/tasks"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>10-Stage Task Engine</span>
                    <span className="badge badge-green text-[9px] px-1 py-0.2">4.9k</span>
                  </Link>
                  <Link
                    to="/crm"
                    onClick={() => setStaffRole(RoleType.OPERATIONS_EMPLOYEE)}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Govt Portals (MCA/GST/IP)</span>
                  </Link>
                  <Link
                    to="/crm"
                    onClick={() => setStaffRole(RoleType.OPERATIONS_ASSISTANT)}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>QC Inspection Desk</span>
                  </Link>
                  <Link
                    to="/crm"
                    onClick={() => setStaffRole(RoleType.CONSULTATION)}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>CA Audit & UDIN Queue</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Franchise & Partner Hub Accordion */}
            <div className="space-y-0.5">
              <button
                onClick={() => toggleSection('franchise')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-brand-gold-dark shrink-0" />
                  <span>Franchise & Partners</span>
                </div>
                {openSection === 'franchise' ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openSection === 'franchise' && (
                <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-4 animate-fade-in">
                  <Link
                    to="/crm/franchise"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>120+ Partner Centers</span>
                  </Link>
                  <Link
                    to="/crm/franchise"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Commissions Ledger</span>
                  </Link>
                  <Link
                    to="/crm/franchise"
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-50 font-medium"
                  >
                    <span>Partner Training Videos</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 5. Finance & Accounts */}
            <Link
              to="/crm/accounts"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname.startsWith('/crm/accounts')
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-brand-navy'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Accounts & Billing</span>
              </div>
              <span className="badge badge-green text-[9px] px-1 py-0.2">GST</span>
            </Link>

            {/* 6. HR Workforce */}
            <Link
              to="/crm/workforce"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname.startsWith('/crm/workforce')
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-brand-navy'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCog className="w-4 h-4 text-blue-600 shrink-0" />
                <span>HR & Workforce</span>
              </div>
              <span className="badge badge-navy text-[9px] px-1 py-0.2">200+</span>
            </Link>

            {/* 7. User Management (Admin & Super Admin only) */}
            {(activeRole === RoleType.SUPER_ADMIN || activeRole === RoleType.ADMIN) && (
              <Link
                to="/crm/users"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  location.pathname.startsWith('/crm/users')
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-brand-navy'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-brand-navy shrink-0" />
                  <span>User Management</span>
                </div>
                <span className="badge badge-gold text-[9px] px-1 py-0.2">Admin</span>
              </Link>
            )}

            {/* 6. Desktrack & Employee Productivity */}
            <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-brand-navy">
                <span className="flex items-center gap-1.5">
                  <MonitorCheck className="w-3.5 h-3.5 text-emerald-600" /> Desktrack Status
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">Active</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Session time, call tracker & productivity logged.
              </p>
            </div>
          </nav>

          {/* Footer controls */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              to="/portal"
              className="text-xs text-brand-navy hover:text-brand-gold-dark flex items-center justify-between font-semibold p-2 bg-[#F7F8FA] rounded-lg border border-slate-200"
            >
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Client Portal View
              </span>
              <span>→</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-xs text-red-600 hover:text-red-700 font-semibold flex items-center justify-center gap-1.5 p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9F5]">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-3 bg-[#FFFDF9] border-b border-[#EAE6DD] sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            {/* Search bar → opens Command Palette */}
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="relative w-full flex items-center gap-2 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3.5 py-2 text-xs text-slate-400 hover:border-[#7C3AED]/40 hover:text-slate-600 transition-colors text-left cursor-pointer"
              id="cmd-palette-trigger"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="flex-1">Search leads, tasks, staff... (Cmd+K)</span>
              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-navy font-mono text-xs">
                Role: {activeRole}
              </span>
              <span className="badge badge-green text-xs">
                66 DB Tables Live
              </span>
            </div>

            <Link
              to="/portal/login"
              className="btn btn-outline btn-sm text-xs"
            >
              Client Login Form
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                ref={bellRef}
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
          </div>
        </header>

        {/* Dashboard View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
    </div>
  );
}
