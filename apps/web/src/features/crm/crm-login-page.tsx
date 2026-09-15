import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';

interface RoleCard {
  role: RoleType;
  title: string;
  category: string;
  email: string;
  desc: string;
  badge: string;
  color: string;
}

const roleCards: RoleCard[] = [
  {
    role: RoleType.SUPER_ADMIN,
    title: 'Super Admin',
    category: 'Executive Control',
    email: 'admin@etaxwala.com',
    desc: 'Full platform control, 66 DB tables, revenue, staff RBAC & audit logs',
    badge: 'Full Access',
    color: '#003A66',
  },
  {
    role: RoleType.ADMIN,
    title: 'General Administrator',
    category: 'Operations Oversight',
    email: 'general.admin@etaxwala.com',
    desc: 'System administration, service catalog pricing, packages & staff management',
    badge: 'Catalog & Users',
    color: '#004d87',
  },
  {
    role: RoleType.SALES_MANAGER,
    title: 'Sales Manager',
    category: 'Sales Leadership',
    email: 'sales.manager@etaxwala.com',
    desc: 'Lead distribution, telecaller targets, conversion rate & team analytics',
    badge: '17k+ Leads',
    color: '#059669',
  },
  {
    role: RoleType.SALES_EMPLOYEE,
    title: 'Sales Executive / Telecaller',
    category: 'Sales Floor',
    email: 'priya.sales@etaxwala.com',
    desc: 'Dialer, lead pipeline, follow-up logs, quotation maker & conversion',
    badge: 'Active Calling',
    color: '#10B981',
  },
  {
    role: RoleType.SALES_ASSISTANT,
    title: 'Sales Assistant / Sourcing',
    category: 'Lead Inflow',
    email: 'assistant.sales@etaxwala.com',
    desc: 'Incoming omnichannel leads verification, deduplication & quota allocation',
    badge: 'Lead Sourcing',
    color: '#047857',
  },
  {
    role: RoleType.OPERATIONS_MANAGER,
    title: 'Operations Manager',
    category: 'Operations',
    email: 'ops.manager@etaxwala.com',
    desc: '10-stage task assignment, SLA tracking, CA allocations & bottleneck monitor',
    badge: '4.9k Tasks',
    color: '#7C3AED',
  },
  {
    role: RoleType.OPERATIONS_EMPLOYEE,
    title: 'Operations Specialist',
    category: 'Filing & Processing',
    email: 'rahul.ops@etaxwala.com',
    desc: 'Government filing, MCA/GST execution, document upload & client status updates',
    badge: 'Workflow Exec',
    color: '#8B5CF6',
  },
  {
    role: RoleType.OPERATIONS_ASSISTANT,
    title: 'QC & Document Reviewer',
    category: 'Quality Control',
    email: 'qc.reviewer@etaxwala.com',
    desc: 'Document verification, rejection reasons, client corrections & approval gates',
    badge: 'Zero Errors',
    color: '#DC2626',
  },
  {
    role: RoleType.CONSULTATION,
    title: 'CA / Tax Expert Workbench',
    category: 'Advisory & Review',
    email: 'ca.expert@etaxwala.com',
    desc: 'ITR/GST audit review, client appointment consultations & expert sign-off',
    badge: 'CA Expert',
    color: '#D97706',
  },
  {
    role: RoleType.FRANCHISE_MANAGER,
    title: 'Franchise & Partner Desk',
    category: 'Partnerships',
    email: 'franchise@etaxwala.com',
    desc: '120+ partner centers, revenue commissions, territory onboarding & payouts',
    badge: '120+ Centers',
    color: '#0891B2',
  },
  {
    role: RoleType.FRANCHISE_EMPLOYEE,
    title: 'Franchise Field Agent',
    category: 'Field Operations',
    email: 'field.partner@etaxwala.com',
    desc: 'Local center onboarding, offline CSC orders management & field support',
    badge: 'Field Ops',
    color: '#0E7490',
  },
  {
    role: RoleType.HR,
    title: 'Human Resources (HR)',
    category: 'People Ops',
    email: 'hr@etaxwala.com',
    desc: 'Employee directory, Desktrack productivity, attendance & department roster',
    badge: '200+ Team',
    color: '#4F46E5',
  },
  {
    role: RoleType.MARKETING_MANAGER,
    title: 'Marketing & Campaigns',
    category: 'Growth',
    email: 'marketing@etaxwala.com',
    desc: 'Campaign ROI, ad spend tracking, webinar leads & content analytics',
    badge: 'Growth Metrics',
    color: '#DB2777',
  },
  {
    role: RoleType.MARKETING_EMPLOYEE,
    title: 'Marketing Content & SEO',
    category: 'Organic Growth',
    email: 'seo.content@etaxwala.com',
    desc: 'Blog publisher, Google Ads creative optimization & social reach',
    badge: 'SEO & Ads',
    color: '#E11D48',
  },
  {
    role: RoleType.WEBSITE_MANAGER,
    title: 'Sub-Brands (Sahakar & Udyami)',
    category: 'Special Verticals',
    email: 'subbrands@etaxwala.com',
    desc: 'FPC/PACS agriculture consulting, rural business leads & subsidy schemes',
    badge: 'Agri & PACS',
    color: '#16A34A',
  },
  {
    role: RoleType.STAFF,
    title: 'Support & Grievance Desk',
    category: 'Client Support',
    email: 'support@etaxwala.com',
    desc: 'Customer helpdesk, live chat assistance, ticket resolutions & feedback',
    badge: '24/7 Support',
    color: '#2563EB',
  },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function CrmLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Map API role_name to RoleType enum
      const roleMap: Record<string, RoleType> = {
        super_admin: RoleType.SUPER_ADMIN, admin: RoleType.ADMIN,
        operations_manager: RoleType.OPERATIONS_MANAGER, sales_manager: RoleType.SALES_MANAGER,
        marketing_manager: RoleType.MARKETING_MANAGER, franchise_manager: RoleType.FRANCHISE_MANAGER,
        sales_employee: RoleType.SALES_EMPLOYEE, operations_employee: RoleType.OPERATIONS_EMPLOYEE,
        marketing_employee: RoleType.MARKETING_EMPLOYEE, franchise_partner: RoleType.FRANCHISE_EMPLOYEE,
        consultation: RoleType.CONSULTATION, operations_assistant: RoleType.OPERATIONS_ASSISTANT,
        sales_assistant: RoleType.SALES_ASSISTANT, hr: RoleType.HR,
        website_manager: RoleType.WEBSITE_MANAGER,
      };
      loginStaff(
        {
          id: user.id,
          username: user.name,
          email: user.email,
          role: roleMap[user.role_name] || RoleType.SALES_EMPLOYEE,
          companyId: 'etaxwala',
          status: 1,
          isOnline: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Pass permissions from the API so sidebar gating works correctly
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

  // Quick-login card: fills the email field and auto-submits with demo password
  const handleQuickLogin = (card: RoleCard) => {
    setEmail(card.email);
    doLogin(card.email, 'etaxwala@2024');
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Staff Sign In
            </h1>
            <p className="text-sm text-slate-500">
              Enter your credentials or click a role card for instant demo access.
            </p>
          </div>

          {/* Manual Login Form */}
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EAE6DD] shadow-xl p-7 sm:p-8 space-y-5">
            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Official Email</label>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
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

          {/* 1-Click Role Cards */}
          <div className="w-full max-w-4xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F97316]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                1-Click Demo Role Access — All 16 Dashboards
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {roleCards.map((card) => (
                <div
                  key={card.role}
                  onClick={() => handleQuickLogin(card)}
                  className="bg-white rounded-2xl p-4 border border-[#EAE6DD] hover:border-[#7C3AED]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ background: `${card.color}15`, color: card.color }}
                      >
                        {card.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{card.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-[#003A66] transition-colors leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#EAE6DD] flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[10px] truncate">{card.email}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold group-hover:translate-x-0.5 transition-transform" style={{ color: card.color }}>
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

