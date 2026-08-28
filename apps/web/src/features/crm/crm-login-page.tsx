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
    <div className="min-h-screen bg-[#F7F8FA] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo_black.png" alt="ETaxwala" className="h-10 w-auto" />
          </Link>
          <div>
            <span className="badge badge-gold mb-2 font-bold">Staff & Executive Portal</span>
            <h1 className="text-3xl font-display font-bold text-[#0D1B2A]">
              Unified Enterprise CRM Dashboards
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl mx-auto mt-1">
              Select any of the 16 specialized roles below for instant 1-click access connected to the live PostgreSQL database.
            </p>
          </div>
        </div>

        {/* Quick 1-Click Role Login Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1-Click Direct Role Access (All 16 Dashboards Live)
              </h2>
            </div>
            <span className="badge badge-green text-xs font-semibold">Live PostgreSQL: 66 Tables</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {roleCards.map((card) => (
              <div
                key={card.role}
                onClick={() => handleQuickLogin(card)}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-brand-navy hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full"
                      style={{ background: `${card.color}12`, color: card.color }}
                    >
                      {card.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{card.category}</span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800 group-hover:text-brand-navy transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-navy">
                  <span className="text-slate-400 font-mono text-[11px]">{card.email}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: card.color }}>
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Manual Login Card */}
        <div className="max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="text-center space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-800">
              Staff Account Sign In
            </h3>
            <p className="text-xs text-slate-500">
              Enter credentials to sign in to your assigned department
            </p>
          </div>

          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="admin@etaxwala.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-xs font-bold py-3 mt-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/portal/login" className="text-brand-navy font-bold hover:underline">
              Client Portal Login →
            </Link>
            <span className="text-slate-400">PostgreSQL DB: 66 Tables Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
