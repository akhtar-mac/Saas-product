import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import { API_BASE_URL } from '@/lib/api-base';
import { BrandMark, useBrand } from '@/lib/branding';

const API_BASE = API_BASE_URL;

export default function CrmLoginPage() {
  const brand = useBrand();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginStaff } = useAuthStore();

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
      console.log('Login response user:', user);
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

      console.log('Mapped roles:', mappedRoles);
      console.log('Primary role:', roleMap[user.role_name]);

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

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Official email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
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
            <BrandMark className="h-9" />
          </Link>
        </div>

        {/* Dashboard illustration */}
        <div className="w-full max-w-xs mx-auto">
          <img
            src="/staff_login_illus.jpg"
            alt={`${brand.companyName} CRM`}
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
              <BrandMark className="h-9" />
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
              Enter your official email and password to access your dashboard.
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#EAE6DD] text-sm text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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

          {/* Verified SQL Staff Roster removed — credentials-only login */}
        </div>
      </div>
    </div>
  );
}
