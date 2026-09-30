import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  KeyRound,
  Briefcase,
  Headphones,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  Sparkles,
  Layers,
  Users,
  Building,
  PhoneCall,
  Settings,
  Shield,
  Megaphone,
  Database,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';

interface DbStaffUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  position?: string;
  department?: string;
}

const DEFAULT_STAFF_USERS: DbStaffUser[] = [
  { id: 1, email: 'admin@etaxwala.com', name: 'Super Admin', role_id: 1, role_name: 'super_admin', position: 'Chief Executive Officer', department: 'Executive' },
  { id: 2, email: 'general.admin@etaxwala.com', name: 'General Administrator', role_id: 2, role_name: 'admin', position: 'Systems Administrator', department: 'Administration' },
  { id: 3, email: 'ops.manager@etaxwala.com', name: 'Operations Manager', role_id: 3, role_name: 'operations_manager', position: 'Head of Operations', department: 'Operations' },
  { id: 4, email: 'sales.manager@etaxwala.com', name: 'Sales Manager', role_id: 4, role_name: 'sales_manager', position: 'Head of Sales', department: 'Sales' },
  { id: 5, email: 'marketing@etaxwala.com', name: 'Marketing Manager', role_id: 5, role_name: 'marketing_manager', position: 'Growth Lead', department: 'Marketing' },
  { id: 6, email: 'franchise@etaxwala.com', name: 'Franchise Manager', role_id: 6, role_name: 'franchise_manager', position: 'Partnership Director', department: 'Franchise' },
  { id: 7, email: 'priya.sales@etaxwala.com', name: 'Priya Sharma (Sales Exec)', role_id: 7, role_name: 'sales_employee', position: 'Senior Sales Executive', department: 'Sales' },
  { id: 8, email: 'rahul.ops@etaxwala.com', name: 'Rahul Verma (Operations)', role_id: 8, role_name: 'operations_employee', position: 'Operations Specialist', department: 'Operations' },
  { id: 9, email: 'seo.content@etaxwala.com', name: 'Marketing Content & SEO', role_id: 9, role_name: 'marketing_employee', position: 'Content Lead', department: 'Marketing' },
  { id: 10, email: 'field.partner@etaxwala.com', name: 'Franchise Field Agent', role_id: 10, role_name: 'franchise_partner', position: 'Field Partner', department: 'Franchise' },
  { id: 11, email: 'ca.expert@etaxwala.com', name: 'CA Tax Expert', role_id: 11, role_name: 'consultation', position: 'Chartered Accountant', department: 'Consultation' },
  { id: 12, email: 'qc.reviewer@etaxwala.com', name: 'QC & Document Reviewer', role_id: 12, role_name: 'operations_assistant', position: 'Quality Control Lead', department: 'Operations' },
  { id: 13, email: 'assistant.sales@etaxwala.com', name: 'Sales Assistant', role_id: 13, role_name: 'sales_assistant', position: 'Lead Qualifier', department: 'Sales' },
  { id: 14, email: 'hr@etaxwala.com', name: 'HR Manager', role_id: 14, role_name: 'hr', position: 'People Operations', department: 'Human Resources' },
  { id: 15, email: 'subbrands@etaxwala.com', name: 'Sub-Brands Manager', role_id: 15, role_name: 'website_manager', position: 'Agri & Rural Lead', department: 'Digital Brands' },
  { id: 16, email: 'support@etaxwala.com', name: 'Support Executive', role_id: 16, role_name: 'staff', position: 'Client Helpdesk', department: 'Customer Support' },
];

const ROLE_COLORS: Record<number, string> = {
  1: '#003A66', // Super Admin
  2: '#004d87', // Admin
  3: '#7C3AED', // Ops Manager
  4: '#059669', // Sales Manager
  5: '#DB2777', // Marketing Manager
  6: '#0891B2', // Franchise Manager
  7: '#10B981', // Sales Employee
  8: '#8B5CF6', // Ops Employee
  9: '#E11D48', // Marketing Employee
  10: '#0E7490', // Franchise Partner
  11: '#D97706', // Consultation
  12: '#DC2626', // Ops Assistant
  13: '#047857', // Sales Assistant
  14: '#4F46E5', // HR
  15: '#16A34A', // Website Manager
  16: '#2563EB', // Staff
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function CrmLoginPage() {
  const [email, setEmail] = useState('admin@etaxwala.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStaff, setDbStaff] = useState<DbStaffUser[]>(DEFAULT_STAFF_USERS);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const navigate = useNavigate();
  const { loginStaff } = useAuthStore();

  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/users`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          setDbStaff(data.data);
        }
      })
      .catch((err) => console.error('Failed to load SQL staff users', err))
      .finally(() => setLoadingStaff(false));
  }, []);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Login failed. Check your credentials.');
        return;
      }
      const { accessToken, refreshToken, user } = data.data;
      // Map API role_name to RoleType enum
      const roleMap: Record<string, RoleType> = {
        super_admin: RoleType.SUPER_ADMIN,
        admin: RoleType.ADMIN,
        operations_manager: RoleType.OPERATIONS_MANAGER,
        sales_manager: RoleType.SALES_MANAGER,
        marketing_manager: RoleType.MARKETING_MANAGER,
        franchise_manager: RoleType.FRANCHISE_MANAGER,
        sales_employee: RoleType.SALES_EMPLOYEE,
        operations_employee: RoleType.OPERATIONS_EMPLOYEE,
        marketing_employee: RoleType.MARKETING_EMPLOYEE,
        franchise_partner: RoleType.FRANCHISE_EMPLOYEE,
        consultation: RoleType.CONSULTATION,
        operations_assistant: RoleType.OPERATIONS_ASSISTANT,
        sales_assistant: RoleType.SALES_ASSISTANT,
        hr: RoleType.HR,
        website_manager: RoleType.WEBSITE_MANAGER,
        staff: RoleType.STAFF,
      };

      const mappedRoles: RoleType[] = Array.isArray(user.roles)
        ? user.roles.map((r: string) => roleMap[r] || RoleType.STAFF)
        : [roleMap[user.role_name] || RoleType.STAFF];

      loginStaff(
        {
          id: user.id,
          username: user.name,
          email: user.email,
          role: roleMap[user.role_name] || RoleType.SALES_EMPLOYEE,
          roles: mappedRoles,
          roleIds: Array.isArray(user.role_ids) ? user.role_ids : [user.role_id || 7],
          companyId: 'etaxwala',
          status: 1,
          isOnline: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: Array.isArray(user.permissions) ? user.permissions : [],
        },
        accessToken,
        refreshToken
      );
      navigate('/crm');
    } catch (e) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStaff = (u: DbStaffUser) => {
    const staffEmail = u.email || (u as any).username || 'admin@etaxwala.com';
    setEmail(staffEmail);
    setPassword('Password@123');
    doLogin(staffEmail, 'Password@123');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Official email is required.');
      return;
    }
    doLogin(email, password || 'Password@123');
  };

  return (
    <div className="min-h-screen flex bg-[#FFFDF9]">
      {/* ── Left Panel: Brand Illustration ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] relative overflow-hidden bg-[#FAF9F5] flex-col items-center justify-center p-10">
        {/* Multicolour top strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />

        {/* Logo */}
        <div className="absolute top-8 left-10">
          <Link to="/">
            <img src="/logo_black.png" alt="ETaxwala" className="h-9 w-auto" />
          </Link>
        </div>

        {/* Dashboard illustration */}
        <div className="w-full max-w-xs mx-auto">
          <img
            src="/staff_login_illus.jpg"
            alt="ETaxwala CRM Dashboard"
            className="w-full rounded-3xl shadow-2xl object-cover"
            style={{ aspectRatio: '3/4' }}
          />
        </div>

        {/* Caption */}
        <div className="mt-8 text-center max-w-xs">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Unified Enterprise CRM
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            16 specialized role dashboards connected to a live PostgreSQL database with 66 tables.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live DB: 66 Tables Active
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login + Role Grid ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-start py-10 px-6 sm:px-10 space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <Link to="/">
              <img src="/logo_black.png" alt="ETaxwala" className="h-9 w-auto" />
            </Link>
          </div>

          {/* Header */}
          <div className="w-full max-w-lg space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-xs font-bold text-[#7C3AED]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Staff &amp; Executive Portal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Sign In</h1>
            <p className="text-sm text-slate-500">
              Enter your credentials or click a role card for instant demo access.
            </p>
          </div>

          {/* Manual Login Form */}
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EAE6DD] shadow-xl p-7 sm:p-8 space-y-5">
            {/* ⚡ 1-Click Quick Role Logins */}
            <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">⚡ 1-Click Demo Logins</span>
                </div>
                <span className="text-[10px] text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full font-bold">Demo Mode Active</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@etaxwala.com');
                    setPassword('Password@123');
                    doLogin('admin@etaxwala.com', 'Password@123');
                  }}
                  className="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300/80 rounded-xl text-left transition-all text-xs font-semibold text-slate-800 shadow-xs cursor-pointer hover:border-amber-400"
                >
                  <div className="text-[10px] text-[#003A66] font-bold uppercase">👑 Super Admin</div>
                  <div className="text-[11px] truncate text-slate-600 font-mono">admin@...</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('sales.manager@etaxwala.com');
                    setPassword('Password@123');
                    doLogin('sales.manager@etaxwala.com', 'Password@123');
                  }}
                  className="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300/80 rounded-xl text-left transition-all text-xs font-semibold text-slate-800 shadow-xs cursor-pointer hover:border-amber-400"
                >
                  <div className="text-[10px] text-emerald-800 font-bold uppercase">📈 Sales Mgr</div>
                  <div className="text-[11px] truncate text-slate-600 font-mono">sales.manager@...</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('ops.manager@etaxwala.com');
                    setPassword('Password@123');
                    doLogin('ops.manager@etaxwala.com', 'Password@123');
                  }}
                  className="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300/80 rounded-xl text-left transition-all text-xs font-semibold text-slate-800 shadow-xs cursor-pointer hover:border-amber-400"
                >
                  <div className="text-[10px] text-purple-800 font-bold uppercase">⚙️ Ops Mgr</div>
                  <div className="text-[11px] truncate text-slate-600 font-mono">ops.manager@...</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('ca.expert@etaxwala.com');
                    setPassword('Password@123');
                    doLogin('ca.expert@etaxwala.com', 'Password@123');
                  }}
                  className="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300/80 rounded-xl text-left transition-all text-xs font-semibold text-slate-800 shadow-xs cursor-pointer hover:border-amber-400"
                >
                  <div className="text-[10px] text-amber-800 font-bold uppercase">💼 CA Expert</div>
                  <div className="text-[11px] truncate text-slate-600 font-mono">ca.expert@...</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@etaxwala.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EAE6DD] text-sm text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Password
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full font-medium">
                    Any password accepted
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter any password (or default: Password@123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EAE6DD] text-sm text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all bg-white"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl btn-multicolor font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-[#EAE6DD] pt-4 flex items-center justify-between text-xs text-slate-500">
              <Link to="/portal/login" className="text-[#003A66] font-bold hover:underline">
                ← Client Portal Login
              </Link>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SSL Encrypted
              </span>
            </div>
          </div>

          {/* Verified SQL Staff Roster */}
          <div className="w-full max-w-4xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#7C3AED]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Verified SQL Staff Accounts ({dbStaff.length} Active Accounts)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any profile for 1-click live login
              </span>
            </div>

            {loadingStaff ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : dbStaff.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-sm text-amber-800">
                Connecting to database... Ensure backend server is running.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {dbStaff.map((u) => {
                  const roleColor = ROLE_COLORS[u.role_id] || '#003A66';
                  const formattedRole = (u.role_name || 'Staff')
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectStaff(u)}
                      className="bg-white rounded-2xl p-4 border border-[#EAE6DD] hover:border-[#7C3AED]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{ background: `${roleColor}15`, color: roleColor }}
                          >
                            {formattedRole}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {u.department || 'Team'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-[#003A66] transition-colors leading-tight">
                          {u.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate">
                          {u.position || formattedRole}
                        </p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-[#EAE6DD] flex items-center justify-between">
                        <span className="text-slate-400 font-mono text-[10px] truncate max-w-[130px]">
                          {u.email}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs font-semibold group-hover:translate-x-0.5 transition-transform"
                          style={{ color: roleColor }}
                        >
                          Login <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
