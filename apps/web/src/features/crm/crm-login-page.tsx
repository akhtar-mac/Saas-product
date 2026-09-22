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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStaff, setDbStaff] = useState<DbStaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const navigate = useNavigate();
  const { loginStaff } = useAuthStore();

  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/users`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
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
    setEmail(u.email);
    setPassword('Password@123');
    doLogin(u.email, 'Password@123');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    doLogin(email, password);
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#EAE6DD] text-sm text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all bg-white"
                    required
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
