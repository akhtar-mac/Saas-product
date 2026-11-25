import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  User,
  PhoneCall,
  ClipboardList,
  CheckCircle2,
  Building,
  BarChart3,
  Briefcase,
  FileCheck2,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Shield,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Calendar,
  MonitorCheck,
  Command,
  Monitor,
  UserCheck,
  MessageSquare,
  Target,
  Terminal,
  MapPin,
  ScrollText,
  Trash2,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import CommandPalette from './components/command-palette';
import NotificationCenter, { NotificationBadge } from './components/notification-center';
import { hasUserPermission, isServerAccessList } from './permissions';
import { useAccessSync } from './access/use-access-sync';
import { ChatNotificationProvider, useChatNotification } from './context/chat-notification-context';
import { SignOutConfirmModal } from '@/components/ui/sign-out-modal';

function CrmLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    extraAccess: true,
    sales: true,
    operations: true,
    admin: false,
    desktop: false,
    opsReports: false,
    leadsSub: true,
    salesEmployee: true,
    quotationsSub: false,
    tasksSub: false,
    opsEmployee: true,
    franchise: true,
  });
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [sidebarEditMode, setSidebarEditMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { staffUser, activeRole, setStaffRole, logoutStaff } = useAuthStore();
  const { unreadChatCount } = useChatNotification();
  const UNREAD_COUNT = 4;
  // Options added/removed on the Users & Access page reach the menu within a minute.
  useAccessSync();

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── Sidebar drag-to-reorder (Edit mode) ──────────────────────────────────
  // Stable signature: always based on the FIRST button/link inside the element
  // (accordion toggle label), so it does not change when dropdown opens/closes.
  const getSidebarSignature = (el: Element): string => {
    let target: Element = el;
    if (el.tagName !== 'A' && el.tagName !== 'BUTTON') {
      target = el.querySelector('button, a') || el;
    }
    const href = target.tagName === 'A' ? target.getAttribute('href') || '' : '';
    const txt = (target.textContent || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\d+/g, '#')
      .slice(0, 80);
    return `${href}||${txt}`;
  };

  const [initialSubOrder] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('etax-sidebar-suborder') || '{}');
    } catch {
      return {};
    }
  });
  const sidebarSubOrderRef = useRef<Record<string, string[]>>(initialSubOrder);
  const [sidebarOrderVersion, setSidebarOrderVersion] = useState(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Collect reorderable containers: nav itself + every descendant div whose
    // element children are all links/divs (menu items), never raw buttons.
    const containers: { el: Element; key: string }[] = [{ el: nav, key: '__root__' }];
    const allDivs = Array.from(nav.querySelectorAll('div'));
    allDivs.forEach((d) => {
      const ch = Array.from(d.children);
      if (ch.length >= 2 && ch.every((c) => c.tagName === 'A' || c.tagName === 'DIV')) {
        // parent key = chain of ancestor signatures (stable-ish, unique per menu)
        const parts: string[] = [];
        let cur: Element | null = d.parentElement;
        while (cur && cur !== nav) {
          parts.unshift(getSidebarSignature(cur));
          cur = cur.parentElement;
        }
        containers.push({ el: d, key: parts.join('>') || '__root2__' });
      }
    });

    const cleanups: Array<() => void> = [];

    containers.forEach(({ el: container, key }) => {
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length < 2) return;
      const savedOrder = sidebarSubOrderRef.current[key] || [];
      const orderMap = new Map<string, number>();
      savedOrder.forEach((sig, i) => {
        if (!orderMap.has(sig)) orderMap.set(sig, i);
      });

      // `order` only works in flex containers — force column flex on menu lists
      if (container !== nav) {
        (container as HTMLElement).style.display = 'flex';
        (container as HTMLElement).style.flexDirection = 'column';
      }

      const sigs = children.map(getSidebarSignature);
      children.forEach((child, i) => {
        const saved = orderMap.get(sigs[i]);
        child.style.order = saved !== undefined ? String(saved) : String(1000 + i);
        child.draggable = sidebarEditMode;
        child.style.cursor = sidebarEditMode ? 'grab' : '';
      });

      if (!sidebarEditMode) return;

      let dragIdx: number | null = null;
      const clearIndicator = () =>
        children.forEach((c) => c.classList.remove('ring-2', 'ring-[#0084D1]', 'ring-inset'));

      const onDragStart = (e: DragEvent) => {
        dragIdx = children.indexOf(e.currentTarget as HTMLElement);
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(dragIdx));
        }
      };
      const onDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        clearIndicator();
        (e.currentTarget as HTMLElement).classList.add('ring-2', 'ring-[#0084D1]', 'ring-inset');
      };
      const onDrop = (e: DragEvent) => {
        e.preventDefault();
        clearIndicator();
        if (dragIdx === null) return;
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        const currentSigs = Array.from(container.children).map(getSidebarSignature);
        const draggedSig = currentSigs[dragIdx];
        const without = currentSigs.filter((_, i) => i !== dragIdx);
        const targetPos = without.indexOf(getSidebarSignature(target));
        const insertAt = before ? Math.max(0, targetPos) : targetPos + 1;
        const newOrder = [...without.slice(0, insertAt), draggedSig, ...without.slice(insertAt)];
        sidebarSubOrderRef.current[key] = newOrder;
        try {
          localStorage.setItem('etax-sidebar-suborder', JSON.stringify(sidebarSubOrderRef.current));
        } catch {}
        setSidebarOrderVersion((v) => v + 1);
        dragIdx = null;
      };
      const onDragEnd = () => {
        dragIdx = null;
        clearIndicator();
      };

      children.forEach((child) => {
        child.addEventListener('dragstart', onDragStart);
        child.addEventListener('dragover', onDragOver);
        child.addEventListener('drop', onDrop);
        child.addEventListener('dragend', onDragEnd);
      });
      cleanups.push(() => {
        children.forEach((child) => {
          child.removeEventListener('dragstart', onDragStart);
          child.removeEventListener('dragover', onDragOver);
          child.removeEventListener('drop', onDrop);
          child.removeEventListener('dragend', onDragEnd);
        });
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [sidebarEditMode, sidebarOrderVersion, location.pathname, openSections]);

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
    {
      role: RoleType.SUPER_ADMIN,
      label: 'Super Admin (All Access)',
      staffName: staffUser?.username || 'ETaxwala HQ Admin',
    },
    {
      role: RoleType.ADMIN,
      label: 'General Administrator',
      staffName: staffUser?.username || 'System Manager',
    },
    {
      role: RoleType.OPERATIONS_MANAGER,
      label: 'Operations Manager',
      staffName: staffUser?.username || 'Vaijnath Sir',
    },
    {
      role: RoleType.SALES_MANAGER,
      label: 'Sales Manager',
      staffName: staffUser?.username || 'Netra Divekar',
    },
    {
      role: RoleType.MARKETING_MANAGER,
      label: 'Marketing Manager',
      staffName: staffUser?.username || 'Growth Lead',
    },
    {
      role: RoleType.FRANCHISE_MANAGER,
      label: 'Franchise Manager',
      staffName: staffUser?.username || 'Kunal Patil',
    },
    {
      role: RoleType.SALES_EMPLOYEE,
      label: 'Sales Employee (Telecaller)',
      staffName: staffUser?.username || 'Priya Sharma',
    },
    {
      role: RoleType.OPERATIONS_EMPLOYEE,
      label: 'Operations Employee',
      staffName: staffUser?.username || 'Operations Employee',
    },
    {
      role: RoleType.MARKETING_EMPLOYEE,
      label: 'Marketing Content & SEO',
      staffName: staffUser?.username || 'Content Specialist',
    },
    {
      role: RoleType.FRANCHISE_EMPLOYEE,
      label: 'Franchise Partner Desk',
      staffName: staffUser?.username || 'Field Partner',
    },
    {
      role: RoleType.CONSULTATION,
      label: 'CA / Tax Expert Workbench',
      staffName: staffUser?.username || 'CA Tax Expert',
    },
    {
      role: RoleType.OPERATIONS_ASSISTANT,
      label: 'QC & Document Reviewer',
      staffName: staffUser?.username || 'QC Lead',
    },
    {
      role: RoleType.SALES_ASSISTANT,
      label: 'Sales Assistant / Qualifier',
      staffName: staffUser?.username || 'Shreya Joshi',
    },
    {
      role: RoleType.HR,
      label: 'HR Manager (Workforce & Tracking)',
      staffName: staffUser?.username || 'HR Manager',
    },
    {
      role: RoleType.WEBSITE_MANAGER,
      label: 'Website & Sub-Brands Manager',
      staffName: staffUser?.username || 'Sub-Brands Lead',
    },
    {
      role: RoleType.STAFF,
      label: 'Staff / Client Support Desk',
      staffName: staffUser?.username || 'Support Executive',
    },
  ].filter((option) => {
    // Only show roles that the user actually has in their roleIds or roles (string array)
    // API ROLE_MAP: 1=super_admin, 2=admin, 3=ops_manager, 4=sales_manager, 5=marketing_manager,
    // 6=franchise_manager, 7=ops_employee, 8=franchise_partner, 9=marketing_employee,
    // 10=consultation, 11=consultation, 12=ops_assistant, 13=sales_assistant, 14=hr, 15=website_manager, 16=staff
    const roleIdCheck = staffUser?.roleIds?.includes(
      option.role === RoleType.SUPER_ADMIN
        ? 1
        : option.role === RoleType.ADMIN
          ? 2
          : option.role === RoleType.OPERATIONS_MANAGER
            ? 3
            : option.role === RoleType.SALES_MANAGER
              ? 4
              : option.role === RoleType.MARKETING_MANAGER
                ? 5
                : option.role === RoleType.FRANCHISE_MANAGER
                  ? 6
                  : option.role === RoleType.OPERATIONS_EMPLOYEE
                    ? 7 // API: 7=ops_employee
                    : option.role === RoleType.FRANCHISE_EMPLOYEE
                      ? 8 // API: 8=franchise_partner
                      : option.role === RoleType.MARKETING_EMPLOYEE
                        ? 9
                        : option.role === RoleType.CONSULTATION
                          ? 10
                          : option.role === RoleType.OPERATIONS_ASSISTANT
                            ? 12
                            : option.role === RoleType.SALES_EMPLOYEE
                              ? 6 // Sales employee handled via string role
                              : option.role === RoleType.SALES_ASSISTANT
                                ? 13
                                : option.role === RoleType.HR
                                  ? 14
                                  : option.role === RoleType.WEBSITE_MANAGER
                                    ? 15
                                    : 16
    );
    // Also check string role names for users from users table - BUT exclude FRANCHISE_EMPLOYEE
    // because operations_employee (user_type=7) and franchise_partner (user_type=8) both map to role_id 7/8
    const roleStringCheck =
      staffUser?.roles?.includes(option.role) && option.role !== RoleType.FRANCHISE_EMPLOYEE; // ✅ Fix: Don't show franchise option for ops employees
    // Or check primary role - but also exclude FRANCHISE_EMPLOYEE
    const primaryRoleCheck =
      staffUser?.role === option.role && option.role !== RoleType.FRANCHISE_EMPLOYEE; // ✅ Fix: Don't show franchise option for ops employees
    return roleIdCheck || roleStringCheck || primaryRoleCheck;
  });

  const isSuperAdmin =
    activeRole === RoleType.SUPER_ADMIN ||
    staffUser?.role === RoleType.SUPER_ADMIN ||
    (Array.isArray(staffUser?.roles) && staffUser.roles.includes(RoleType.SUPER_ADMIN));

  // Build role switcher options
  const isDefinitelyOpsEmployee =
    activeRole === RoleType.OPERATIONS_EMPLOYEE ||
    staffUser?.role === RoleType.OPERATIONS_EMPLOYEE ||
    (Array.isArray(staffUser?.roles) && staffUser.roles.includes(RoleType.OPERATIONS_EMPLOYEE));

  const isDefinitelyFranchiseEmployee =
    !isDefinitelyOpsEmployee &&
    (activeRole === RoleType.FRANCHISE_EMPLOYEE ||
      staffUser?.role === RoleType.FRANCHISE_EMPLOYEE ||
      (Array.isArray(staffUser?.roles) && staffUser.roles.includes(RoleType.FRANCHISE_EMPLOYEE)));

  let roleOptions: typeof ALL_ROLE_OPTIONS;
  if (isSuperAdmin || !staffUser?.roles || staffUser.roles.length === 0) {
    roleOptions = ALL_ROLE_OPTIONS;
  } else {
    roleOptions = ALL_ROLE_OPTIONS.filter((opt) => {
      // Block FRANCHISE_EMPLOYEE from showing for ops employees (prevents old session cache issue)
      if (isDefinitelyOpsEmployee && opt.role === RoleType.FRANCHISE_EMPLOYEE) return false;
      // Block OPERATIONS_EMPLOYEE from showing for franchise employees
      if (isDefinitelyFranchiseEmployee && opt.role === RoleType.OPERATIONS_EMPLOYEE) return false;
      return staffUser.roles!.includes(opt.role);
    });
    // Fallback: if no options after filter, show primary role only
    if (roleOptions.length === 0) {
      const primary = ALL_ROLE_OPTIONS.find((o) => o.role === (staffUser.role || activeRole));
      if (primary) roleOptions = [primary];
    }
  }

  // If ops employee has stale session showing FRANCHISE_EMPLOYEE, correct it
  const effectiveActiveRole =
    isDefinitelyOpsEmployee && activeRole === RoleType.FRANCHISE_EMPLOYEE
      ? RoleType.OPERATIONS_EMPLOYEE
      : activeRole;

  const currentRoleInfo =
    ALL_ROLE_OPTIONS.find((r) => r.role === effectiveActiveRole) || ALL_ROLE_OPTIONS[0];

  const displayStaffName =
    staffUser?.username || (staffUser as any)?.name || currentRoleInfo.staffName;

  const handleLogout = () => {
    logoutStaff();
    navigate('/crm/login');
  };

  const can = (permKey: string) => {
    return hasUserPermission(staffUser?.permissions, activeRole, permKey, [
      ...((staffUser?.roles as (string | number)[]) || []),
      ...(staffUser?.roleIds || []),
    ]);
  };
  const serverAccess = isServerAccessList(staffUser?.permissions);

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Role detection — checks activeRole (handles both Super Admin switcher and actual user login)
  const isActiveRole = (roleType: RoleType | string) =>
    activeRole === roleType || activeRole === (roleType as string);

  const isAdmin =
    isSuperAdmin ||
    isActiveRole(RoleType.ADMIN) ||
    (!isSuperAdmin && (staffUser?.roles || []).includes(RoleType.ADMIN)) ||
    (!isSuperAdmin && (staffUser?.roleIds || []).includes(2));

  const isSalesManager =
    isSuperAdmin ||
    isActiveRole(RoleType.SALES_MANAGER) ||
    (!isSuperAdmin && (staffUser?.roles || []).includes(RoleType.SALES_MANAGER)) ||
    (!isSuperAdmin && (staffUser?.roleIds || []).includes(4));

  // isSalesEmployee: Use role string as primary check. roleIds.includes(7) alone is ambiguous
  // since user_type 6 (sales) and user_type 7 (ops) both map to role_id 7
  const isSalesEmployee =
    isActiveRole(RoleType.SALES_EMPLOYEE) ||
    (!isSuperAdmin && (staffUser?.roles || []).includes(RoleType.SALES_EMPLOYEE)) ||
    (!isSuperAdmin &&
      (staffUser?.roleIds || []).includes(7) &&
      !isActiveRole(RoleType.OPERATIONS_EMPLOYEE) &&
      !(staffUser?.roles || []).includes(RoleType.OPERATIONS_EMPLOYEE));

  const isOpsManager =
    isSuperAdmin ||
    isActiveRole(RoleType.OPERATIONS_MANAGER) ||
    (!isSuperAdmin && (staffUser?.roles || []).includes(RoleType.OPERATIONS_MANAGER)) ||
    (!isSuperAdmin && (staffUser?.roleIds || []).includes(3));

  // isOpsEmployee: activeRole string check is PRIMARY (most reliable after login)
  const isOpsEmployee =
    isActiveRole(RoleType.OPERATIONS_EMPLOYEE) ||
    (!isSuperAdmin && (staffUser?.roles || []).includes(RoleType.OPERATIONS_EMPLOYEE)) ||
    (!isSuperAdmin &&
      (staffUser?.roleIds || []).includes(7) &&
      !isActiveRole(RoleType.SALES_EMPLOYEE));

  const isFranchiseManager =
    isSuperAdmin ||
    isActiveRole(RoleType.FRANCHISE_MANAGER) ||
    (!isSuperAdmin && (staffUser?.roles || []).includes(RoleType.FRANCHISE_MANAGER)) ||
    (!isSuperAdmin && (staffUser?.roleIds || []).includes(5));

  // Fix: isFranchiseEmployee must NOT include isSuperAdmin — super admins see all sections via their own logic
  const isFranchiseEmployee =
    !isSuperAdmin &&
    !isOpsEmployee &&
    (isActiveRole(RoleType.FRANCHISE_EMPLOYEE) ||
      (staffUser?.roles || []).includes(RoleType.FRANCHISE_EMPLOYEE) ||
      ((staffUser?.roleIds || []).includes(8) && !isActiveRole(RoleType.OPERATIONS_EMPLOYEE)));

  // Section visibility: Super Admin sees all main manager sections directly in sidebar
  const showOpsSection =
    (isSuperAdmin || isOpsManager) &&
    (can('operations:view') ||
      can('desktop_tracking:view') ||
      can('operations:employees') ||
      can('operations:customers') ||
      can('operations:tasks') ||
      can('accounts:view'));

  const showSalesSection =
    !isFranchiseEmployee &&
    (isSuperAdmin || (!isFranchiseManager && isSalesManager)) &&
    (isSuperAdmin ||
      can('sales:view') ||
      can('leads:view') ||
      can('quotations:view') ||
      can('tasks:view') ||
      can('workforce:view'));

  const showSalesEmployeeSection =
    !isFranchiseManager &&
    !isFranchiseEmployee &&
    isSalesEmployee &&
    (can('leads:view') || can('quotations:view') || can('tasks:view'));

  const showAdminSection =
    !isFranchiseManager &&
    !isFranchiseEmployee &&
    (isSuperAdmin || isAdmin) &&
    !isOpsEmployee &&
    !isOpsManager &&
    (can('admin:view') ||
      can('users:manage') ||
      can('logs:view') ||
      can('recycle_bin:view') ||
      can('categories:manage') ||
      can('services:manage') ||
      can('packages:manage') ||
      can('blogs:manage') ||
      can('call_analytics:view') ||
      can('appointments:manage'));

  // For ops employees from users table (user_type=7), their primary role string is OPERATIONS_EMPLOYEE
  // The can() check uses ROLE_NAME_DEFAULT_PERMISSIONS['OPERATIONS_EMPLOYEE'] which has operations:tasks
  // Only show these direct tabs when the user has no other nav section (avoids duplicate buttons)
  const showOpsEmployeeSection =
    !isFranchiseManager &&
    !isFranchiseEmployee &&
    isOpsEmployee &&
    !isOpsManager &&
    !showOpsSection &&
    !showSalesSection &&
    !showSalesEmployeeSection &&
    !showAdminSection &&
    (can('operations:tasks') ||
      can('tasks:view') ||
      can('appointments:manage') ||
      isActiveRole(RoleType.OPERATIONS_EMPLOYEE));

  // Links for options outside the user's own role menu (only with server-driven access).
  const extraLinkDefs: { perm: string; label: string; to: string; shownAlready: boolean }[] = [
    {
      perm: 'calls:view_all',
      label: 'Call Report (all staff)',
      to: '/crm/call-analytics',
      shownAlready: showOpsSection || showSalesSection,
    },
    {
      perm: 'leads:view_all',
      label: 'All Leads',
      to: '/crm/leads',
      shownAlready: showSalesSection,
    },
    {
      perm: 'operations:customers_view',
      label: 'Manage Customer',
      to: '/crm/operation-manage-customer',
      shownAlready: showOpsSection,
    },
    {
      perm: 'operations:customer_details',
      label: 'Customer Details',
      to: '/crm/customer-details',
      shownAlready: showOpsSection,
    },
    {
      perm: 'operations:tasks_view_all',
      label: 'Manage Tasks (all)',
      to: '/crm/operation-manage-tasks',
      shownAlready: showOpsSection || showSalesSection,
    },
    {
      perm: 'operations:employees',
      label: 'Manage Employee',
      to: '/crm/operation-manage-employee',
      shownAlready: showOpsSection,
    },
    {
      perm: 'operations:locations_view',
      label: 'Locations',
      to: '/crm/locations',
      shownAlready: showOpsSection,
    },
    {
      perm: 'desktop_tracking:view',
      label: 'Desktop Report',
      to: '/crm/desktop-report',
      shownAlready: showOpsSection,
    },
    {
      perm: 'workforce:view',
      label: 'Manage Employees',
      to: '/crm/workforce',
      shownAlready: showSalesSection || isAdmin,
    },
    {
      perm: 'quotations:view',
      label: 'Quotations',
      to: '/crm/quotations',
      shownAlready: showSalesSection || showSalesEmployeeSection,
    },
    {
      perm: 'appointments:view',
      label: 'Appointments',
      to: '/crm/appointments',
      shownAlready:
        showOpsSection || showSalesEmployeeSection || showOpsEmployeeSection || showAdminSection,
    },
    {
      perm: 'users:view',
      label: 'Users & Access',
      to: '/crm/users',
      shownAlready: showAdminSection,
    },
    { perm: 'logs:view', label: 'Activity Logs', to: '/crm/logs', shownAlready: showAdminSection },
    {
      perm: 'recycle_bin:view',
      label: 'Recycle Bin',
      to: '/crm/recycle-bin',
      shownAlready: showAdminSection,
    },
  ];
  const extraLinks = serverAccess
    ? extraLinkDefs
        .filter((l) => !l.shownAlready && can(l.perm))
        .filter((l, i, arr) => arr.findIndex((x) => x.to === l.to) === i)
        .map((l) => ({
          ...l,
          icon:
            l.to === '/crm/logs' ? (
              <ScrollText className="w-3.5 h-3.5 text-slate-400" />
            ) : l.to === '/crm/recycle-bin' ? (
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            ) : null,
        }))
    : [];

  return (
    <div className="crm-shell h-screen bg-[#FAF9F5] text-slate-800 flex flex-col md:flex-row font-sans overflow-hidden">
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
        className={`fixed md:sticky inset-y-0 left-0 z-40 bg-[#FFFDF9] border-r border-[#EAE6DD] flex flex-col justify-between transition-[transform,opacity] duration-200 ease-out shadow-xs h-screen shrink-0 ${
          sidebarOpen
            ? 'w-64 translate-x-0 opacity-100'
            : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 overflow-hidden border-none'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & Logo */}
          <div className="p-4 border-b border-[#EAE6DD] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo_black.png" alt="ETaxwala" className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarEditMode((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                sidebarEditMode
                  ? 'bg-[#1B365D] text-white'
                  : 'bg-[#FAF9F5] border border-[#EAE6DD] text-slate-600 hover:text-[#1B365D]'
              }`}
              title={sidebarEditMode ? 'Done reordering' : 'Drag tabs to reorder sidebar'}
            >
              {sidebarEditMode ? 'Done' : 'Edit'}
            </button>
          </div>

          {/* Current Staff User Card with Quick Switcher */}
          <div className="p-3 m-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1B365D] via-[#0084D1] to-[#00A896] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {displayStaffName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{displayStaffName}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  {currentRoleInfo.label}
                </p>
              </div>
            </div>

            {/* Quick Role Switcher */}
            <div className="mt-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-bold">
                <span>Staff View:</span>
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <select
                value={effectiveActiveRole}
                onChange={(e) => setStaffRole(e.target.value as RoleType)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[#1B365D] focus:outline-none focus:ring-1 focus:ring-brand-purple"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role}>
                    {opt.label} ({opt.staffName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Accordion Menus */}
          <nav
            ref={navRef}
            className={`p-3 space-y-1.5 flex-1 overflow-y-auto text-xs flex flex-col${
              sidebarEditMode ? ' sidebar-edit-mode' : ''
            }`}
          >
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
                <LayoutDashboard
                  className={`w-4 h-4 shrink-0 ${location.pathname === '/crm' ? 'text-white' : 'text-[#1B365D]'}`}
                />
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
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/chat' ? 'text-white' : 'text-[#7C3AED]'}`}
                  />
                  <span>Staff Chat</span>
                </div>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E11D48] text-white">
                    Live
                  </span>
                </span>
              </Link>
            )}

            {/* Department Hubs section hidden from sidebar (pages/routes remain intact) */}

            {/* Super Admin / Admin — Manage All Employees - Hide for Franchise Manager and Franchise Employee */}
            {!isFranchiseManager && !isFranchiseEmployee && isSuperAdmin && (
              <Link
                to="/crm/workforce"
                onClick={handleNavClick}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                  location.pathname === '/crm/workforce'
                    ? 'bg-[#1B365D] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/workforce' ? 'text-white' : 'text-emerald-600'}`}
                  />
                  <span>Manage Employees</span>
                </div>
                <span className="badge badge-green text-[9px] px-1.5 py-0.2">All Staff</span>
              </Link>
            )}

            {/* Franchise Manager - Manage Partners (Top Level) */}
            {isFranchiseManager && (
              <Link
                to="/crm/workforce"
                onClick={handleNavClick}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                  location.pathname === '/crm/workforce'
                    ? 'bg-[#1B365D] text-white shadow-sm'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/workforce' ? 'text-white' : 'text-emerald-600'}`}
                  />
                  <span>Manage Employees</span>
                </div>
                <span className="badge badge-gold text-[9px] px-1.5 py-0.2">120+</span>
              </Link>
            )}

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
                    {/* 1. Call Report */}
                    <Link
                      to="/crm/call-analytics"
                      onClick={handleNavClick}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                        location.pathname === '/crm/call-analytics'
                          ? 'bg-blue-50 text-[#1B365D] font-bold'
                          : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                        <span>Call Report</span>
                      </div>
                    </Link>

                    {/* 2. Manage Desktrack Sub-menu */}
                    {can('desktop_tracking:view') && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => toggleSection('desktop')}
                          className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <div className="flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                            <span>Manage Desktrack</span>
                          </div>
                          {openSections.desktop ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
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
                            <Link
                              to="/crm/desktrack-live"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/desktrack-live'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Live Now
                            </Link>
                            <Link
                              to="/crm/block-websites"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/block-websites'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Block Website
                            </Link>
                            <Link
                              to="/crm/desktop-users"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/desktop-users'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Desktop Users
                            </Link>
                            <Link
                              to="/crm/manage-ips"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/manage-ips'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Manage IPs
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Manage Employee */}
                    {can('operations:employees') && (
                      <Link
                        to="/crm/operation-manage-employee"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                          location.pathname === '/crm/operation-manage-employee'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Manage Employee</span>
                        </div>
                      </Link>
                    )}

                    {/* 4. Manage Customer */}
                    {can('operations:customers') && (
                      <Link
                        to="/crm/operation-manage-customer"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                          location.pathname === '/crm/operation-manage-customer'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Manage Customer</span>
                        </div>
                      </Link>
                    )}

                    {/* 5. Customer Details */}
                    {can('operations:customers') && (
                      <Link
                        to="/crm/customer-details"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                          location.pathname === '/crm/customer-details'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Customer Details</span>
                        </div>
                      </Link>
                    )}

                    {/* 6. Manage Tasks */}
                    {can('operations:tasks') && (
                      <Link
                        to="/crm/operation-manage-tasks"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                          location.pathname === '/crm/operation-manage-tasks'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                          <span>Manage Tasks</span>
                        </div>
                        <span className="badge badge-green text-[9px] px-1 py-0.2">Live</span>
                      </Link>
                    )}

                    {/* 6. Internal Task */}
                    <Link
                      to="/crm/tasks"
                      onClick={handleNavClick}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                        location.pathname === '/crm/tasks'
                          ? 'bg-blue-50 text-[#1B365D] font-bold'
                          : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Internal Task</span>
                      </div>
                    </Link>

                    {/* 7. Appointments */}
                    <Link
                      to="/crm/appointments"
                      onClick={handleNavClick}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                        location.pathname === '/crm/appointments'
                          ? 'bg-blue-50 text-[#1B365D] font-bold'
                          : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Appointments</span>
                      </div>
                    </Link>

                    {/* 9. Locations */}
                    <Link
                      to="/crm/locations"
                      onClick={handleNavClick}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium ${
                        location.pathname === '/crm/locations'
                          ? 'bg-blue-50 text-[#1B365D] font-bold'
                          : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Locations</span>
                      </div>
                    </Link>

                    {/* 10. Reports Sub-menu */}
                    <div className="space-y-0.5">
                      <button
                        onClick={() => toggleSection('opsReports')}
                        className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                      >
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Reports</span>
                        </div>
                        {openSections.opsReports ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>

                      {openSections.opsReports && (
                        <div className="pl-5 space-y-1 py-1 text-[11px]">
                          <Link
                            to="/crm/operation-manage-tasks"
                            onClick={handleNavClick}
                            className="block py-1 px-2 rounded-md text-slate-600 hover:text-[#1B365D]"
                          >
                            Task Comment Report
                          </Link>
                          <Link
                            to="/crm/accounts"
                            onClick={handleNavClick}
                            className="block py-1 px-2 rounded-md text-slate-600 hover:text-[#1B365D]"
                          >
                            Collection Report
                          </Link>
                          <Link
                            to="/crm/call-analytics"
                            onClick={handleNavClick}
                            className="block py-1 px-2 rounded-md text-slate-600 hover:text-[#1B365D]"
                          >
                            Total Sales
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. FRANCHISE MANAGER - Accordion */}
            {isFranchiseManager && (
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleSection('franchise')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-[#00A896] shrink-0" />
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
                    {/* Dashboard */}
                    <Link
                      to="/crm/franchise-manager-dashboard"
                      onClick={handleNavClick}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                        location.pathname === '/crm/franchise-manager-dashboard'
                          ? 'bg-[#1B365D] text-white shadow-sm'
                          : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard
                          className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-manager-dashboard' ? 'text-white' : 'text-[#1B365D]'}`}
                        />
                        <span>Dashboard</span>
                      </div>
                    </Link>

                    {/* Manage Partners Orders */}
                    {can('franchise:partners') && (
                      <Link
                        to="/crm/franchise-manage-partners-orders"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                          location.pathname === '/crm/franchise-manage-partners-orders'
                            ? 'bg-[#1B365D] text-white shadow-sm'
                            : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ClipboardList
                            className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-manage-partners-orders' ? 'text-white' : 'text-[#00A896]'}`}
                          />
                          <span>Manage Partners Orders</span>
                        </div>
                      </Link>
                    )}

                    {/* Manage Inquiries */}
                    {can('franchise:inquiries') && (
                      <Link
                        to="/crm/franchise-manage-inquiries"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                          location.pathname === '/crm/franchise-manage-inquiries'
                            ? 'bg-[#1B365D] text-white shadow-sm'
                            : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare
                            className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-manage-inquiries' ? 'text-white' : 'text-[#7C3AED]'}`}
                          />
                          <span>Manage Inquiries</span>
                        </div>
                      </Link>
                    )}

                    {/* Partners Leads */}
                    {can('franchise:partners') && (
                      <Link
                        to="/crm/franchise-partners-leads"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                          location.pathname === '/crm/franchise-partners-leads'
                            ? 'bg-[#1B365D] text-white shadow-sm'
                            : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Users
                            className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-partners-leads' ? 'text-white' : 'text-emerald-600'}`}
                          />
                          <span>Partners Leads</span>
                        </div>
                      </Link>
                    )}

                    {/* Training Videos */}
                    {can('franchise:training') && (
                      <Link
                        to="/portal/videos"
                        onClick={handleNavClick}
                        className="flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-slate-100 hover:text-[#1B365D] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Monitor className="w-4 h-4 shrink-0 text-pink-600" />
                          <span>Training Videos</span>
                        </div>
                      </Link>
                    )}

                    {/* Service Documents */}
                    {can('franchise:training') && (
                      <Link
                        to="/portal/documents"
                        onClick={handleNavClick}
                        className="flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-slate-100 hover:text-[#1B365D] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <FileCheck2 className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>Service Documents</span>
                        </div>
                      </Link>
                    )}

                    {/* All Services */}
                    {can('franchise:view') && (
                      <Link
                        to="/crm/franchise-all-services"
                        onClick={handleNavClick}
                        className="flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-slate-100 hover:text-[#1B365D] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-4 h-4 shrink-0 text-indigo-600" />
                          <span>All Services</span>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6. FRANCHISE EMPLOYEE - Direct Tabs (No Accordion) */}
            {isFranchiseEmployee && (
              <>
                {/* Dashboard */}
                <Link
                  to="/crm/franchise-employee-dashboard"
                  onClick={handleNavClick}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                    location.pathname === '/crm/franchise-employee-dashboard'
                      ? 'bg-[#1B365D] text-white shadow-sm'
                      : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard
                      className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-employee-dashboard' ? 'text-white' : 'text-[#1B365D]'}`}
                    />
                    <span>Dashboard</span>
                  </div>
                </Link>

                {/* Manage Leads */}
                {can('franchise:leads') && (
                  <Link
                    to="/crm/franchise-employee-manage-leads"
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                      location.pathname === '/crm/franchise-employee-manage-leads'
                        ? 'bg-[#1B365D] text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Target
                        className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-employee-manage-leads' ? 'text-white' : 'text-pink-600'}`}
                      />
                      <span>Manage Leads</span>
                    </div>
                  </Link>
                )}

                {/* All Services */}
                {can('franchise:view') && (
                  <Link
                    to="/crm/franchise-all-services"
                    onClick={handleNavClick}
                    className="flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-slate-100 hover:text-[#1B365D] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 shrink-0 text-indigo-600" />
                      <span>All Services</span>
                    </div>
                  </Link>
                )}

                {/* Manage Inquiries */}
                {can('franchise:inquiries') && (
                  <Link
                    to="/crm/franchise-employee-manage-inquiries"
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                      location.pathname === '/crm/franchise-employee-manage-inquiries'
                        ? 'bg-[#1B365D] text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare
                        className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-employee-manage-inquiries' ? 'text-white' : 'text-[#7C3AED]'}`}
                      />
                      <span>Manage Inquiries</span>
                    </div>
                  </Link>
                )}

                {/* Customer Orders */}
                {can('franchise:orders') && (
                  <Link
                    to="/crm/franchise-employee-customer-orders"
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                      location.pathname === '/crm/franchise-employee-customer-orders'
                        ? 'bg-[#1B365D] text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList
                        className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/franchise-employee-customer-orders' ? 'text-white' : 'text-[#00A896]'}`}
                      />
                      <span>Customer Orders</span>
                    </div>
                  </Link>
                )}

                {/* Training Videos */}
                {can('franchise:training') && (
                  <Link
                    to="/portal/videos"
                    onClick={handleNavClick}
                    className="flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-slate-100 hover:text-[#1B365D] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 shrink-0 text-pink-600" />
                      <span>Training Videos</span>
                    </div>
                  </Link>
                )}

                {/* Inquiry Form Link */}
                {can('franchise:inquiries') && (
                  <Link
                    to="/crm/franchise-inquiry-form-link"
                    onClick={handleNavClick}
                    className="flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-800 hover:bg-slate-100 hover:text-[#1B365D] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 shrink-0 text-cyan-600" />
                      <span>Inquiry Form Link</span>
                    </div>
                  </Link>
                )}
              </>
            )}

            {/* 7. SALES MANAGER ACCORDION */}
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
                    {/* Call Report */}
                    {can('call_analytics:view') && (
                      <Link
                        to="/crm/call-analytics"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/call-analytics'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Call Report</span>
                      </Link>
                    )}

                    {/* Manage Employee */}
                    {can('workforce:view') && (
                      <Link
                        to="/crm/workforce"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/workforce'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Employee</span>
                      </Link>
                    )}

                    {/* Customer */}
                    {can('accounts:view') && (
                      <Link
                        to="/crm/accounts"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/accounts'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Customer</span>
                      </Link>
                    )}

                    {/* Service Questions */}
                    <Link
                      to="/crm/services"
                      onClick={handleNavClick}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                        location.pathname === '/crm/services'
                          ? 'bg-blue-50 text-[#1B365D] font-bold'
                          : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                      }`}
                    >
                      <span>Service Questions</span>
                    </Link>

                    {/* Manage Leads Dropdown Subgroup */}
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
                          {openSections.leadsSub ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {openSections.leadsSub && (
                          <div className="pl-5 space-y-1 py-1 text-[11px]">
                            <Link
                              to="/crm/leads"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/leads' &&
                                (!location.search ||
                                  !location.search.includes('source=') ||
                                  location.search.includes('source=etaxwala'))
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              ETaxwala Leads List
                            </Link>
                            <Link
                              to="/crm/leads?source=udyamikisan"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/leads' &&
                                location.search.includes('source=udyamikisan')
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Udyomi Leads List
                            </Link>
                            <Link
                              to="/crm/leads?source=sahakar"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/leads' &&
                                location.search.includes('source=sahakar')
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Sahakar Leads List
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quotations sub-group */}
                    {can('quotations:view') && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => toggleSection('quotationsSub')}
                          className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <div className="flex items-center gap-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Quotations</span>
                          </div>
                          {openSections.quotationsSub ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {openSections.quotationsSub && (
                          <div className="pl-5 space-y-1 py-1 text-[11px]">
                            <Link
                              to="/crm/quotations"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/quotations'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Manage Quotations
                            </Link>
                            <Link
                              to="/crm/quotations"
                              onClick={handleNavClick}
                              className="block py-1 px-2 rounded-md text-slate-600 hover:text-[#1B365D]"
                            >
                              Create New Quotation
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tasks sub-group */}
                    {can('tasks:view') && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => toggleSection('tasksSub')}
                          className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <div className="flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                            <span>Tasks</span>
                          </div>
                          {openSections.tasksSub ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {openSections.tasksSub && (
                          <div className="pl-5 space-y-1 py-1 text-[11px]">
                            <Link
                              to="/crm/operation-manage-tasks"
                              onClick={handleNavClick}
                              className="block py-1 px-2 rounded-md text-slate-600 hover:text-[#1B365D]"
                            >
                              Internal Task
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4.5 SALES EMPLOYEE ACCORDION */}
            {showSalesEmployeeSection && (
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleSection('salesEmployee')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#1B365D] shrink-0" />
                    <span>Sales Employee</span>
                  </div>
                  {openSections.salesEmployee ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSections.salesEmployee && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-4">
                    {/* Manage Leads */}
                    {can('leads:view') && (
                      <Link
                        to="/crm/leads"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/leads' ||
                          location.pathname === '/crm/sales-manage-leads'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Manage Leads</span>
                      </Link>
                    )}

                    {/* Customers */}
                    {can('accounts:view') && (
                      <Link
                        to="/crm/accounts"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/accounts'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Customers</span>
                      </Link>
                    )}

                    {/* Quotations sub-group */}
                    {can('quotations:view') && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => toggleSection('quotationsSub')}
                          className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <div className="flex items-center gap-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Quotations</span>
                          </div>
                          {openSections.quotationsSub ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {openSections.quotationsSub && (
                          <div className="pl-5 space-y-1 py-1 text-[11px]">
                            <Link
                              to="/crm/quotations"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/quotations'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Manage Quotations
                            </Link>
                            <Link
                              to="/crm/quotation"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/quotation'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Create New
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tasks sub-group */}
                    {can('tasks:view') && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => toggleSection('tasksSub')}
                          className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#1B365D] hover:bg-slate-50 font-medium"
                        >
                          <div className="flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                            <span>Tasks</span>
                          </div>
                          {openSections.tasksSub ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {openSections.tasksSub && (
                          <div className="pl-5 space-y-1 py-1 text-[11px]">
                            <Link
                              to="/crm/internal-tasks"
                              onClick={handleNavClick}
                              className={`block py-1 px-2 rounded-md ${
                                location.pathname === '/crm/internal-tasks'
                                  ? 'bg-[#1B365D] text-white font-bold'
                                  : 'text-slate-600 hover:text-[#1B365D]'
                              }`}
                            >
                              Internal Task
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Appointments */}
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
                  </div>
                )}
              </div>
            )}

            {/* 6. OPERATION EMPLOYEE - Direct Tabs */}
            {showOpsEmployeeSection && (
              <>
                {/* Manage Task */}
                {can('operations:tasks') && (
                  <Link
                    to="/crm/operation-manage-tasks"
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                      location.pathname === '/crm/operation-manage-tasks'
                        ? 'bg-[#1B365D] text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList
                        className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/operation-manage-tasks' ? 'text-white' : 'text-[#00A896]'}`}
                      />
                      <span>Manage Task</span>
                    </div>
                  </Link>
                )}

                {/* Internal Task */}
                {can('tasks:view') && (
                  <Link
                    to="/crm/internal-tasks"
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                      location.pathname === '/crm/internal-tasks'
                        ? 'bg-[#1B365D] text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck2
                        className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/internal-tasks' ? 'text-white' : 'text-[#00A896]'}`}
                      />
                      <span>Internal Task</span>
                    </div>
                  </Link>
                )}

                {/* Appointments */}
                {can('appointments:manage') && (
                  <Link
                    to="/crm/appointments"
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
                      location.pathname === '/crm/appointments'
                        ? 'bg-[#1B365D] text-white shadow-sm'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-[#1B365D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MonitorCheck
                        className={`w-4 h-4 shrink-0 ${location.pathname === '/crm/appointments' ? 'text-white' : 'text-[#00A896]'}`}
                      />
                      <span>Appointments</span>
                    </div>
                  </Link>
                )}
              </>
            )}

            {/* 7. ADMIN / SUPPORT ACCORDION */}
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
                    {(isSuperAdmin || can('users:manage')) && (
                      <Link
                        to="/crm/users"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/users'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Users &amp; Access</span>
                      </Link>
                    )}

                    {can('logs:view') && (
                      <Link
                        to="/crm/logs"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/logs'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Activity Logs</span>
                      </Link>
                    )}

                    {can('recycle_bin:view') && (
                      <Link
                        to="/crm/recycle-bin"
                        onClick={handleNavClick}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === '/crm/recycle-bin'
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        <span>Recycle Bin</span>
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
                  </div>
                )}
              </div>
            )}

            {/* Extra options an admin gave this user (Users & Access page) that their
                own role's menu does not already show. */}
            {serverAccess && !isSuperAdmin && extraLinks.length > 0 && (
              <div className="space-y-0.5">
                <button
                  onClick={() => toggleSection('extraAccess')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>More options</span>
                  </div>
                  {openSections.extraAccess ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
                {openSections.extraAccess && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-amber-100 ml-4">
                    {extraLinks.map((l) => (
                      <Link
                        key={l.to + l.label}
                        to={l.to}
                        onClick={handleNavClick}
                        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg font-medium ${
                          location.pathname === l.to.split('?')[0]
                            ? 'bg-blue-50 text-[#1B365D] font-bold'
                            : 'text-slate-600 hover:text-[#1B365D] hover:bg-slate-50'
                        }`}
                      >
                        {l.icon}
                        <span>{l.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Desktrack live board shortcut (polled page, no fake status) */}
            {can('desktop_tracking:view') && (
              <Link
                to="/crm/desktrack-live"
                onClick={handleNavClick}
                className="block p-2.5 mt-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1 hover:border-[#1B365D]"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-[#1B365D]">
                  <span className="flex items-center gap-1.5">
                    <MonitorCheck className="w-3.5 h-3.5 text-emerald-600" /> Desktrack
                  </span>
                  <span className="text-[10px]">Live Now →</span>
                </div>
                <p className="text-[10px] text-slate-500">Who is logged in, idle or on lunch.</p>
              </Link>
            )}
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
              type="button"
              onClick={() => setSignOutModalOpen(true)}
              className="w-full text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center justify-center gap-1.5 p-2 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9F5]">
        {/* Top Header strictly single line banner */}
        <header className="hidden md:flex items-center justify-between px-4 h-14 min-h-[56px] max-h-[56px] bg-[#FFFDF9] border-b border-[#EAE6DD] sticky top-0 z-20 shadow-xs whitespace-nowrap gap-3">
          {/* Left: Sidebar toggle + Company / Brand Banner */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#1B365D] hover:bg-slate-100 transition-colors shrink-0"
              title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
              id="sidebar-toggle-btn"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-bold text-sm text-[#1B365D] whitespace-nowrap tracking-tight">
                ETaxwala Business Solution Pvt Ltd
              </span>
              <span className="text-slate-300 hidden lg:inline">|</span>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden lg:inline max-w-[220px] truncate">
                {displayStaffName} ({currentRoleInfo.label})
              </span>
            </div>
          </div>

          {/* Center: Search / Cmd+K strictly single line */}
          <div className="hidden lg:flex items-center flex-1 max-w-[280px] mx-2 shrink min-w-[180px]">
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="relative w-full flex items-center justify-between gap-2 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-1.5 text-xs text-slate-400 hover:border-[#1B365D]/40 hover:text-slate-600 transition-colors text-left cursor-pointer whitespace-nowrap overflow-hidden"
              id="cmd-palette-trigger"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">Search leads, tasks...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200 shrink-0">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>
          </div>

          {/* Right: Quick actions, role switcher & profile strictly single line */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap ml-auto">
            {/* Header Role Switcher */}
            <div className="flex items-center gap-1.5 bg-[#FAF9F5] border border-[#EAE6DD] px-2.5 py-1.5 rounded-xl shrink-0 whitespace-nowrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden xl:inline">
                ACTIVE ROLE:
              </span>
              <select
                value={activeRole}
                onChange={(e) => setStaffRole(e.target.value as RoleType)}
                className="text-xs font-bold bg-transparent text-[#1B365D] focus:outline-none cursor-pointer max-w-[190px] truncate"
                id="header-role-switcher"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ETaxwala Live Staff Chat Alert Pill */}
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50/90 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 whitespace-nowrap group active:scale-95"
              title="View unread staff chat alerts"
              aria-label="Staff Alerts"
              id="staff-test-notif-btn"
            >
              <div className="relative w-4 h-4 rounded-md bg-gradient-to-tr from-[#1B365D] to-[#0084D1] flex items-center justify-center text-white shadow-2xs shrink-0">
                <MessageSquare className="w-2.5 h-2.5 fill-white stroke-none" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <span className="text-[11px] font-bold text-[#1B365D] whitespace-nowrap">
                Staff Alerts
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#0084D1] text-white text-[10px] font-black group-hover:scale-110 transition-transform shrink-0">
                {unreadChatCount}
              </span>
            </button>

            {/* Quick Chat Shortcut */}
            <Link
              to="/crm/chat"
              className={`px-2.5 py-1.5 rounded-xl transition-colors relative flex items-center gap-1.5 text-xs font-bold shrink-0 whitespace-nowrap ${
                location.pathname === '/crm/chat'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 hover:text-[#1B365D]'
              }`}
              title="Staff Internal Chat"
              aria-label="Staff Chat"
              id="header-chat-btn"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
              <span className="whitespace-nowrap">Staff Chat</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </Link>

            {/* Notification Bell */}
            <div className="relative shrink-0">
              <button
                ref={bellRef}
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-1.5 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
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
            <div
              className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
              title={displayStaffName}
            >
              {displayStaffName.charAt(0).toUpperCase()}
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
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

export default function CrmLayout() {
  return (
    <ChatNotificationProvider>
      <CrmLayoutContent />
    </ChatNotificationProvider>
  );
}
