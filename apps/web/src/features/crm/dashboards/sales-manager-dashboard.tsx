import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, PhoneCall, Target, TrendingUp, Award, CheckCircle2,
  Clock, ArrowRight, UserCheck, Send, Zap, PhoneForwarded,
  RefreshCw, AlertCircle, FileText, Star, BarChart2,
  ChevronRight, UserPlus, Calendar, Percent,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface CrmStats {
  totalLeads: number;
  totalCustomers: number;
  totalQuotations: number;
  totalCalls: number;
  monthlyRevenue: number;
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
  title, value, sub, icon: Icon, color, bg, loading,
}: {
  title: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string; loading: boolean;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="h-7 w-24 bg-slate-100 rounded animate-pulse" />
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
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<StaffAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, leadsRes, agentsRes] = await Promise.all([
        fetch(`${API_BASE}/v1/crm/stats`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/crm/leads?limit=10&page=1`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/admin/users`, { headers: authHeaders }),
      ]);

      const [statsData, leadsData, agentsData] = await Promise.all([
        statsRes.json(),
        leadsRes.json(),
        agentsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (leadsData.success) setRecentLeads(leadsData.data || []);
      if (agentsData.success) {
        // Filter to only sales agents (role_id 4,7,13)
        setAgents(
          (agentsData.data || []).filter((u: StaffAgent) =>
            [4, 7, 13].includes(u.role_id)
          )
        );
      }
      setLastRefreshed(new Date());
    } catch (e) {
      setError('Could not connect to the API server. Showing fallback demo data.');
      // Fallback demo data
      setStats({
        totalLeads: 17281, totalCustomers: 1373,
        totalQuotations: 1874, totalCalls: 79900, monthlyRevenue: 4850000,
      });
      setRecentLeads([
        { id: 17281, name: 'Ravi Sharma', contact: '+91 98765 43210', service: 'GST Registration', city: 'Pune', lead_type: 0, is_assign: 0, source: 'Facebook', date: new Date().toISOString() },
        { id: 17280, name: 'Sneha Patil', contact: '+91 91234 56789', service: 'Private Limited Company', city: 'Mumbai', lead_type: 2, is_assign: 1, source: 'Google Ads', date: new Date().toISOString() },
        { id: 17279, name: 'Deepak Verma', contact: '+91 99887 65432', service: 'Income Tax Filing', city: 'Nagpur', lead_type: 4, is_assign: 1, source: 'Referral', date: new Date().toISOString() },
        { id: 17278, name: 'Anjali Singh', contact: '+91 88001 23456', service: 'FSSAI License', city: 'Nashik', lead_type: 1, is_assign: 0, source: 'Website', date: new Date().toISOString() },
      ]);
      setAgents([
        { id: 7, name: 'Priya Sharma (Sales Exec)', email: 'priya.sales@etaxwala.com', role_id: 7, role_name: 'Sales Employee', is_active: true },
        { id: 13, name: 'Sales Assistant', email: 'assistant.sales@etaxwala.com', role_id: 13, role_name: 'Sales Assistant', is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const convRate = stats
    ? ((stats.totalCustomers / Math.max(stats.totalLeads, 1)) * 100).toFixed(1)
    : '0.0';

  const formatRevenue = (amt: number) => {
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
    if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
    return `₹${amt}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Sales Pipeline & Telecaller Hub
            </h1>
            <span className="badge badge-gold">Sales Manager</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time PostgreSQL data — {stats?.totalLeads?.toLocaleString() ?? '...'} total leads, telecaller performance & conversion analytics.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-outline btn-sm flex items-center gap-1.5 btn-multicolor"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/crm/leads" className="btn btn-primary btn-sm">
            <Users className="w-3.5 h-3.5" /> Manage Leads
          </Link>
          <Link to="/crm/quotations" className="btn btn-outline btn-sm btn-multicolor">
            <Send className="w-3.5 h-3.5" /> Quotations
          </Link>
        </div>
      </div>

      {/* API Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads in DB"
          value={stats ? stats.totalLeads.toLocaleString() : '—'}
          sub="Across all sources & campaigns"
          icon={Users}
          color="#003A66"
          bg="rgba(0,58,102,0.08)"
          loading={loading}
        />
        <StatCard
          title="Converted Customers"
          value={stats ? stats.totalCustomers.toLocaleString() : '—'}
          sub="Paying registered clients"
          icon={UserCheck}
          color="#059669"
          bg="rgba(5,150,105,0.08)"
          loading={loading}
        />
        <StatCard
          title="Total Quotations"
          value={stats ? stats.totalQuotations.toLocaleString() : '—'}
          sub="Proposals sent to leads"
          icon={FileText}
          color="#D97706"
          bg="rgba(217,119,6,0.08)"
          loading={loading}
        />
        <StatCard
          title="Team Conversion Rate"
          value={`${convRate}%`}
          sub="Leads → Customers ratio"
          icon={TrendingUp}
          color="#7C3AED"
          bg="rgba(124,58,237,0.08)"
          loading={loading}
        />
      </div>

      {/* Revenue + Call Stats secondary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Revenue (Sample 100 Sales)"
          value={stats ? formatRevenue(stats.monthlyRevenue) : '—'}
          sub="Calculated from quotations DB"
          icon={BarChart2}
          color="#0891B2"
          bg="rgba(8,145,178,0.08)"
          loading={loading}
        />
        <StatCard
          title="Call History Records"
          value={stats ? stats.totalCalls.toLocaleString() : '—'}
          sub="All call_history entries"
          icon={PhoneCall}
          color="#DB2777"
          bg="rgba(219,39,119,0.08)"
          loading={loading}
        />
        <StatCard
          title="Sales Team Members"
          value={loading ? '—' : agents.length}
          sub="Active sales agents"
          icon={Award}
          color="#16A34A"
          bg="rgba(22,163,74,0.08)"
          loading={loading}
        />
      </div>

      {/* Two-column: Recent Leads + Sales Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Leads from DB */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-purple" />
                Latest Incoming Leads
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Most recent 10 leads from the database
              </p>
            </div>
            <Link to="/crm/leads" className="btn btn-outline btn-sm text-xs btn-multicolor">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))
            ) : recentLeads.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">No leads found in database.</p>
            ) : (
              recentLeads.slice(0, 8).map((lead) => {
                const status = LEAD_STATUS[lead.lead_type] ?? LEAD_STATUS[0];
                return (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/40 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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
                      <span className="text-[10px] text-slate-400">{lead.city || '—'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-1 text-center">
            <p className="text-[10px] text-slate-400">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Sales Agents Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Sales Team Roster
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active sales agents from the DB
              </p>
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
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No sales agents found.</p>
                <Link to="/crm/users" className="btn btn-primary btn-sm mt-3">
                  <UserPlus className="w-3.5 h-3.5" /> Add Sales Agent
                </Link>
              </div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#059669] to-[#10B981] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{agent.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{agent.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      agent.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[9px] text-slate-400">{agent.role_name}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Link to="/crm/leads" className="btn btn-sm border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs">
              <PhoneCall className="w-3.5 h-3.5" /> Leads Pipeline
            </Link>
            <Link to="/crm/quotations" className="btn btn-sm border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> Quotations
            </Link>
          </div>
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Lead Status Pipeline Overview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual breakdown of {recentLeads.length} most recent leads
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
          {Object.entries(LEAD_STATUS).map(([statusId, info]) => {
            const count = recentLeads.filter((l) => l.lead_type === Number(statusId)).length;
            const pct = recentLeads.length > 0
              ? Math.round((count / recentLeads.length) * 100)
              : 0;
            return (
              <div
                key={statusId}
                className="flex flex-col items-center p-3 rounded-xl border text-center"
                style={{ background: info.bg, borderColor: `${info.color}30` }}
              >
                <p className="text-lg font-display font-bold" style={{ color: info.color }}>
                  {count}
                </p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: info.color }}>
                  {info.label}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manage All Leads', desc: 'View, assign, and filter leads', icon: Users, to: '/crm/leads', color: '#003A66' },
          { label: 'Quotation Maker', desc: 'Create & send professional quotations', icon: FileText, to: '/crm/quotations', color: '#D97706' },
          { label: 'My Tasks', desc: 'Follow-up calls & meeting tasks', icon: CheckCircle2, to: '/crm/tasks', color: '#7C3AED' },
          { label: 'User Management', desc: 'Add or manage sales team members', icon: UserPlus, to: '/crm/users', color: '#059669' },
        ].map(({ label, desc, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}18` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 group-hover:text-brand-navy">{label}</p>
              <p className="text-[10px] text-slate-400 truncate">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-navy ml-auto shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
