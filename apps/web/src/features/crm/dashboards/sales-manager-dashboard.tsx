import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  UserCheck,
  Zap,
  RefreshCw,
  AlertCircle,
  FileText,
  BarChart2,
  ChevronRight,
  UserPlus,
  Tag,
  Copy,
  Plus,
  X,
  Check,
  DollarSign,
  CreditCard,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

const API_BASE = API_BASE_URL;

interface SmStats {
  totalSales: number;
  receivedFees: number;
  balanceFees: number;
  totalCustomers: number;
  totalLeads: number;
  newLeads: number;
  hotLeads: number;
  customerLeads: number;
}

interface SupportTicket {
  ticket_id: number;
  customer_id: number;
  service_id: number;
  ticket_msg: string;
  ticket_answer?: string;
  is_open: number; // 0 = open, 1 = closed
  date: string;
  customer_name?: string;
  service_name?: string;
}

interface Coupon {
  coupon_id: number;
  coupon_type: number; // 0 = Amount Wise, 1 = % Wise
  coupon_name: string;
  coupon_discount: number;
  coupon_validity: string;
  coupon_uses: number;
  coupon_remaining: number;
  is_active: number;
  date?: string;
}

interface FeesReportRow {
  emi_id: number;
  customer_name: string;
  customer_phone?: string;
  emi_total_amount: number;
  emi_paid_amount: number;
  emi_unpaid_amount: number;
  emi_comment?: string;
  date?: string;
}

interface Lead {
  id: number;
  name: string;
  contact: string;
  service: string;
  source?: string;
  city?: string;
  state?: string;
  lead_type: number;
  is_assign: number;
  created_at?: string;
  date?: string;
}

interface StaffAgent {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  last_login_at?: string;
}

const LEAD_STATUS: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'New', color: '#2563EB', bg: '#EFF6FF' },
  1: { label: 'Contacted', color: '#7C3AED', bg: '#F5F3FF' },
  2: { label: 'Interested', color: '#D97706', bg: '#FEF3C7' },
  3: { label: 'Negotiation', color: '#0891B2', bg: '#ECFEFF' },
  4: { label: 'Won', color: '#059669', bg: '#F0FDF4' },
  5: { label: 'Lost', color: '#DC2626', bg: '#FEF2F2' },
  6: { label: 'Follow Up', color: '#DB2777', bg: '#FDF2F8' },
};

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  loading,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-7 w-28 bg-slate-100 rounded animate-pulse" />
        ) : (
          <p className="font-display font-bold text-2xl text-slate-800">{value}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default function SalesManagerDashboard() {
  const { staffToken } = useAuthStore();
  const [smStats, setSmStats] = useState<SmStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<StaffAgent[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [feesReport, setFeesReport] = useState<FeesReportRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'coupons' | 'fees'>(
    'overview'
  );

  // Support Ticket Modal state
  const [ticketToClose, setTicketToClose] = useState<SupportTicket | null>(null);
  const [ticketAnswerInput, setTicketAnswerInput] = useState('');
  const [closingTicket, setClosingTicket] = useState(false);

  // Coupon Generator Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    coupon_type: 0,
    coupon_name: '',
    coupon_discount: '',
    coupon_validity: '',
    coupon_uses: '1',
  });
  const [couponError, setCouponError] = useState<string | null>(null);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState<number | null>(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, ticketsRes, couponsRes, feesRes, leadsRes, agentsRes] = await Promise.all([
        fetch(`${API_BASE}/v1/crm/sm/stats`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/crm/sm/support-tickets`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/crm/sm/coupons`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/crm/sm/fees-report`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/crm/leads?limit=10&page=1`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/admin/users`, { headers: authHeaders }),
      ]);

      const [statsData, ticketsData, couponsData, feesData, leadsData, agentsData] =
        await Promise.all([
          statsRes.json(),
          ticketsRes.json(),
          couponsRes.json(),
          feesRes.json(),
          leadsRes.json(),
          agentsRes.json(),
        ]);

      if (statsData.success) setSmStats(statsData.data);
      if (ticketsData.success) setTickets(ticketsData.data || []);
      if (couponsData.success) setCoupons(couponsData.data || []);
      if (feesData.success) setFeesReport(feesData.data || []);
      if (leadsData.success) setRecentLeads(leadsData.data || []);
      if (agentsData.success) {
        setAgents(
          (agentsData.data || []).filter((u: StaffAgent) => [4, 7, 13].includes(u.role_id))
        );
      }
      setLastRefreshed(new Date());
    } catch (e) {
      setError('Live API connection failed. Demo fallback data loaded.');
      // Fallback data
      setSmStats({
        totalSales: 12850000,
        receivedFees: 9450000,
        balanceFees: 3400000,
        totalCustomers: 1373,
        totalLeads: 17281,
        newLeads: 1240,
        hotLeads: 580,
        customerLeads: 1373,
      });
      setTickets([
        {
          ticket_id: 101,
          customer_id: 12,
          service_id: 5,
          ticket_msg: 'Need GST Certificate urgently for tender',
          is_open: 0,
          date: new Date().toISOString(),
          customer_name: 'Rajesh Kumar',
          service_name: 'GST Registration',
        },
        {
          ticket_id: 102,
          customer_id: 45,
          service_id: 18,
          ticket_msg: 'Update bank details in IEC registration',
          is_open: 1,
          ticket_answer: 'Updated and uploaded on portal',
          date: new Date().toISOString(),
          customer_name: 'Anil Sharma',
          service_name: 'IEC Registration',
        },
      ]);
      setCoupons([
        {
          coupon_id: 1,
          coupon_type: 0,
          coupon_name: 'WELCOME1000',
          coupon_discount: 1000,
          coupon_validity: '2026-12-31',
          coupon_uses: 50,
          coupon_remaining: 38,
          is_active: 0,
        },
        {
          coupon_id: 2,
          coupon_type: 1,
          coupon_name: 'FESTIVE20',
          coupon_discount: 20,
          coupon_validity: '2026-10-31',
          coupon_uses: 100,
          coupon_remaining: 82,
          is_active: 0,
        },
      ]);
      setRecentLeads([
        {
          id: 17281,
          name: 'Ravi Sharma',
          contact: '+91 98765 43210',
          service: 'GST Registration',
          city: 'Pune',
          lead_type: 0,
          is_assign: 0,
          source: 'Facebook',
          date: new Date().toISOString(),
        },
        {
          id: 17280,
          name: 'Sneha Patil',
          contact: '+91 91234 56789',
          service: 'Private Limited Company',
          city: 'Mumbai',
          lead_type: 2,
          is_assign: 1,
          source: 'Google Ads',
          date: new Date().toISOString(),
        },
      ]);
      setAgents([
        {
          id: 7,
          name: 'Priya Sharma (Sales Exec)',
          email: 'priya.sales@etaxwala.com',
          role_id: 7,
          role_name: 'Sales Employee',
          is_active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleCopyCouponCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    setTimeout(() => setCopiedCouponId(null), 2000);
  };

  const handleCheckCouponName = async (name: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE}/v1/crm/sm/coupons/check-name?coupon_name=${encodeURIComponent(name.trim())}`,
        {
          headers: authHeaders,
        }
      );
      const data = await res.json();
      if (data.exists) {
        setCouponError('Coupon code already exists');
      } else {
        setCouponError(null);
      }
    } catch {
      // Ignore
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.coupon_name || !couponForm.coupon_discount || !couponForm.coupon_validity) {
      setCouponError('Please fill in all required fields');
      return;
    }
    setCreatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch(`${API_BASE}/v1/crm/sm/coupons`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          coupon_type: couponForm.coupon_type,
          coupon_name: couponForm.coupon_name,
          coupon_discount: Number(couponForm.coupon_discount),
          coupon_validity: couponForm.coupon_validity,
          coupon_uses: Number(couponForm.coupon_uses),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCouponModalOpen(false);
        setCouponForm({
          coupon_type: 0,
          coupon_name: '',
          coupon_discount: '',
          coupon_validity: '',
          coupon_uses: '1',
        });
        fetchDashboardData();
      } else {
        setCouponError(data.error || 'Failed to create coupon');
      }
    } catch (e) {
      setCouponError('Network error while creating coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleCloseTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketToClose) return;
    setClosingTicket(true);

    try {
      const res = await fetch(
        `${API_BASE}/v1/crm/sm/support-tickets/${ticketToClose.ticket_id}/close`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ ticket_answer: ticketAnswerInput }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setTicketToClose(null);
        setTicketAnswerInput('');
        fetchDashboardData();
      }
    } catch (e) {
      alert('Failed to close ticket');
    } finally {
      setClosingTicket(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Sales Manager Command Hub
            </h1>
            <span className="badge badge-gold">Sales Manager</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live DB Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time revenues, EMI fee collections, support tickets resolution, coupon codes &
            sales pipeline.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-outline btn-sm flex items-center gap-1.5 btn-multicolor"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" /> Generate Coupon
          </button>
          <Link to="/crm/leads" className="btn btn-outline btn-sm btn-multicolor">
            <Users className="w-3.5 h-3.5" /> Manage Leads
          </Link>
        </div>
      </div>

      {/* Quick Navigation Shortcuts Bar (Matching PHP header.blade.php Case 3) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider pl-2 shrink-0">
          Quick Access:
        </span>
        <Link
          to="/crm"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Dashboard
        </Link>
        <Link
          to="/crm/call-analytics"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Call Report
        </Link>
        <Link
          to="/crm/workforce"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Manage Employee
        </Link>
        <Link
          to="/crm/accounts"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Customer
        </Link>
        <Link
          to="/crm/services"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Service Questions
        </Link>
        <Link
          to="/crm/franchise"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Manage Partners
        </Link>
        <Link
          to="/crm/leads"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Manage Leads
        </Link>
        <Link
          to="/crm/leads?source=udyamikisan"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Udyomi Leads
        </Link>
        <Link
          to="/crm/leads?source=sahakar"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Sahakar Leads
        </Link>
        <Link
          to="/crm/quotations"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Quotations
        </Link>
        <Link
          to="/crm/tasks"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          My Tasks
        </Link>
        <Link
          to="/crm/appointments"
          className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-brand-navy hover:text-white transition-all whitespace-nowrap"
        >
          Appointments
        </Link>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 Primary Financial KPI Cards (Ported from PHP SMController.php) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales Amount"
          value={smStats ? formatCurrency(smStats.totalSales) : '—'}
          sub="Total contracted client sales"
          icon={DollarSign}
          color="#DC2626"
          bg="#FEF2F2"
          loading={loading}
        />
        <StatCard
          title="Received Fees"
          value={smStats ? formatCurrency(smStats.receivedFees) : '—'}
          sub="Collected EMI paid amount"
          icon={CheckCircle2}
          color="#059669"
          bg="#F0FDF4"
          loading={loading}
        />
        <StatCard
          title="Balance Fees Pending"
          value={smStats ? formatCurrency(smStats.balanceFees) : '—'}
          sub="Outstanding client dues"
          icon={CreditCard}
          color="#0891B2"
          bg="#ECFEFF"
          loading={loading}
        />
        <StatCard
          title="Total Approved Customers"
          value={smStats ? smStats.totalCustomers.toLocaleString() : '—'}
          sub="Active client accounts"
          icon={UserCheck}
          color="#7C3AED"
          bg="#F5F3FF"
          loading={loading}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Pipeline & Roster Overview', icon: BarChart2 },
          {
            id: 'tickets',
            label: `Support Tickets (${tickets.filter((t) => t.is_open === 0).length} Open)`,
            icon: MessageSquare,
          },
          { id: 'coupons', label: `Coupon Codes (${coupons.length})`, icon: Tag },
          { id: 'fees', label: `Fees Collection Report (${feesReport.length})`, icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Latest Incoming Leads
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Most recent 8 leads in database</p>
                </div>
                <Link to="/crm/leads" className="btn btn-outline btn-sm text-xs btn-multicolor">
                  View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                  ))
                ) : recentLeads.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm">
                    No leads found in database.
                  </p>
                ) : (
                  recentLeads.slice(0, 6).map((lead) => {
                    const status = LEAD_STATUS[lead.lead_type] ?? LEAD_STATUS[0];
                    return (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: status.color }}
                          >
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{lead.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{lead.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: status.color, background: status.bg }}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sales Team Roster */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    Sales Team Roster
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Active sales employees</p>
                </div>
                <Link to="/crm/users" className="btn btn-outline btn-sm text-xs btn-multicolor">
                  Manage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                  ))
                ) : agents.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm">
                    No sales agents registered.
                  </p>
                ) : (
                  agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{agent.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{agent.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPORT TICKETS (Ported from PHP recentSupportTicket logic) */}
      {activeTab === 'tickets' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Recent Support Tickets
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Client support queries needing resolution or response.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm">No support tickets found.</p>
              </div>
            ) : (
              tickets.map((t) => {
                const isOpen = t.is_open === 0; // 0 = Open, 1 = Closed in legacy database
                return (
                  <div
                    key={t.ticket_id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {t.customer_name || `Customer #${t.customer_id}`}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {t.service_name || 'General Service'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Open
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            Closed
                          </span>
                        )}
                        {isOpen && (
                          <button
                            onClick={() => {
                              setTicketToClose(t);
                              setTicketAnswerInput('');
                            }}
                            className="btn btn-outline btn-xs text-xs btn-multicolor"
                          >
                            Close Ticket
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-800 mb-0.5">Query:</p>
                      <p>{t.ticket_msg}</p>
                    </div>

                    {t.ticket_answer && (
                      <div className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <p className="font-bold text-emerald-800 mb-0.5">Answer / Resolution:</p>
                        <p>{t.ticket_answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COUPON CODES (Ported from PHP getallCouponCodes logic) */}
      {activeTab === 'coupons' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                Active Discount Coupon Codes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Generated promotional codes for sales & marketing discounts.
              </p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400">
                <p className="text-sm">No discount coupons created yet.</p>
              </div>
            ) : (
              coupons.map((c) => (
                <div
                  key={c.coupon_id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all space-y-3 shadow-2xs relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-brand-navy tracking-wide">
                      {c.coupon_name}
                    </span>
                    <button
                      onClick={() => handleCopyCouponCode(c.coupon_name, c.coupon_id)}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                      title="Copy Code"
                    >
                      {copiedCouponId === c.coupon_id ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied!
                        </span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discount:</span>
                      <span className="font-bold text-emerald-700">
                        {c.coupon_type === 1
                          ? `${c.coupon_discount}% OFF`
                          : `₹${c.coupon_discount} OFF`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expires On:</span>
                      <span className="font-medium text-slate-700">{c.coupon_validity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uses Left:</span>
                      <span className="font-bold text-slate-800">
                        {c.coupon_remaining} / {c.coupon_uses}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: FEES COLLECTION REPORT (Ported from PHP fees_report logic) */}
      {activeTab === 'fees' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Customer Fees & Collection Report
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Detailed break-up of customer payment status, paid amounts & unpaid balances.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Unpaid Balance</th>
                  <th className="p-3">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {feesReport.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No EMI fees report records found.
                    </td>
                  </tr>
                ) : (
                  feesReport.map((row) => (
                    <tr key={row.emi_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{row.customer_name}</td>
                      <td className="p-3 text-slate-600">{row.customer_phone || '—'}</td>
                      <td className="p-3 font-semibold text-slate-800">
                        {formatCurrency(row.emi_total_amount)}
                      </td>
                      <td className="p-3 font-semibold text-emerald-700">
                        {formatCurrency(row.emi_paid_amount)}
                      </td>
                      <td className="p-3 font-semibold text-rose-700">
                        {formatCurrency(row.emi_unpaid_amount)}
                      </td>
                      <td className="p-3 text-slate-500 truncate max-w-xs">
                        {row.emi_comment || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CLOSE TICKET */}
      {ticketToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                Close Support Ticket
              </h3>
              <button
                onClick={() => setTicketToClose(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseTicketSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Customer Query:</p>
                <p className="text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {ticketToClose.ticket_msg}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Response / Resolution Answer:
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketAnswerInput}
                  onChange={(e) => setTicketAnswerInput(e.target.value)}
                  placeholder="Write support query response or action taken..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTicketToClose(null)}
                  className="btn btn-outline btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closingTicket}
                  className="btn btn-primary btn-sm text-xs"
                >
                  {closingTicket ? 'Closing...' : 'Close Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE COUPON CODE (Ported from PHP generateCoupon Modal) */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Create New Coupon Code
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {couponError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {couponError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Type</label>
                  <select
                    value={couponForm.coupon_type}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, coupon_type: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  >
                    <option value={0}>Amount Wise (₹ Flat Off)</option>
                    <option value={1}>Percentage Wise (% Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coupon Name / Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIWALI500"
                    value={couponForm.coupon_name}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCouponForm({ ...couponForm, coupon_name: val });
                      handleCheckCouponName(val);
                    }}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={
                      couponForm.coupon_type === 1
                        ? 'Discount % (e.g. 15)'
                        : 'Discount ₹ (e.g. 500)'
                    }
                    value={couponForm.coupon_discount}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, coupon_discount: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Validity Date
                  </label>
                  <input
                    type="date"
                    required
                    value={couponForm.coupon_validity}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, coupon_validity: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Uses Allowed
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.coupon_uses}
                    onChange={(e) => setCouponForm({ ...couponForm, coupon_uses: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="btn btn-outline btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCoupon || !!couponError}
                  className="btn btn-primary btn-sm text-xs"
                >
                  {creatingCoupon ? 'Creating...' : 'Create Coupon Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
