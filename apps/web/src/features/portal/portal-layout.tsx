import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  FolderLock,
  Receipt,
  LifeBuoy,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
  ExternalLink,
  Sparkles,
  Phone,
  Video,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, logoutCustomer } = useAuthStore();

  const navItems = [
    {
      label: 'Overview & Services',
      path: '/portal',
      icon: LayoutDashboard,
    },
    {
      label: 'My 10-Stage Timeline',
      path: '/portal/services',
      icon: FileCheck2,
      badge: 'Active Case',
    },
    {
      label: 'Document Vault',
      path: '/portal/documents',
      icon: FolderLock,
    },
    {
      label: 'Invoices & Payments',
      path: '/portal/payments',
      icon: Receipt,
    },
    {
      label: 'FPC Video Academy',
      path: '/portal/videos',
      icon: Video,
      badge: '10 Days',
    },
    {
      label: 'Helpdesk & CA Chat',
      path: '/portal/support',
      icon: LifeBuoy,
    },
    {
      label: 'My Profile & Entity',
      path: '/portal/profile',
      icon: UserCheck,
    },
  ];

  const handleLogout = () => {
    logoutCustomer();
    navigate('/portal/login');
  };

  return (
    <div className="h-screen bg-[#F7F8FA] text-slate-800 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <Link to="/portal" className="flex items-center gap-2">
          <img src="/logo_black.png" alt="ETaxwala" className="h-7 w-auto" />
          <span className="badge badge-gold text-[10px]">Client Portal</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
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
        className={`fixed md:relative inset-y-0 left-0 z-40 md:z-30 h-full bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 shadow-sm shrink-0 ${sidebarOpen
            ? 'w-64 translate-x-0 opacity-100'
            : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 overflow-hidden border-none'
          }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo_black.png" alt="ETaxwala" className="h-8 w-auto" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close Sidebar"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Client Info Card */}
          <div className="p-3 m-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                {customer?.name ? customer.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {customer?.name || 'Rajesh Sharma'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {customer?.business || 'Sharma Agri Exports Pvt Ltd'}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Client ID: #{customer?.id || '101'}</span>
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Client
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                item.path === '/portal'
                  ? location.pathname === '/portal'
                  : location.pathname.startsWith(item.path);

              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                      ? 'bg-brand-navy text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-brand-navy'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 text-emerald-700'
                        }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Quick Helpline & Logout */}
          <div className="p-4 border-t border-slate-100 space-y-3">
            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span>Dedicated CA Support</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Mon - Sat: 9:30 AM - 6:30 PM
              </p>
              <a
                href="tel:08069029999"
                className="mt-1.5 inline-block font-bold text-brand-navy hover:underline"
              >
                📞 080-6902-9999
              </a>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                to="/crm/login"
                className="text-xs text-brand-navy hover:underline flex items-center gap-1 font-semibold"
              >
                Staff CRM Login →
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F7F8FA]">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition-colors border border-slate-200 flex items-center gap-2 font-semibold text-xs cursor-pointer shadow-2xs shrink-0"
              title={sidebarOpen ? "Sidebar Band Karein" : "Sidebar Chalu Karein"}
            >
              <Menu className="w-4 h-4 text-brand-navy" />
              <span className="hidden lg:inline text-slate-700">
                {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              </span>
            </button>

            <h1 className="text-base font-display font-bold text-brand-navy">
              Client Service Portal
            </h1>
            <span className="badge badge-green text-xs">All Systems Operational</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="btn btn-outline btn-sm text-xs"
            >
              + Order New Service
            </Link>

            <Link
              to="/crm"
              className="btn btn-primary btn-sm text-xs"
            >
              Switch to Staff CRM →
            </Link>
          </div>
        </header>

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
