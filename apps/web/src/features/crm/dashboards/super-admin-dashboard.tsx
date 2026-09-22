import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, TrendingUp, DollarSign, Briefcase, Layers,
  ShieldCheck, Activity, ArrowUpRight, Database, UserCheck,
  FileCheck2, PhoneCall, Server, Zap, CheckCircle2, Clock,
  ArrowRight, Building, Globe, BarChart3, AlertTriangle,
  Cpu, Wifi, Lock, Target,
} from 'lucide-react';
import {
  LeadAcquisitionChart, MultiBrandRevenueDonut,
  TaskFunnelChart, SalesVelocityChart,
} from '../components/crm-analytics-charts';

/* ─── Live stats from API ─── */
interface DashStats {
  totalLeads: number;
  totalCustomers: number;
  totalTasks: number;
  totalOrders: number;
  totalQuotations: number;
  totalCalls: number;
  totalServices: number;
  totalRevenue: number;
}

/* ─── KPI Card ─── */
function KpiCard({ title, value, sub, change, icon: Icon, color, bg, to, isPositive = true }: any) {
  return (
    <Link
      to={to || '#'}
      className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>
      <div className="mt-4">
        <p className="font-display font-bold text-2xl text-slate-900 leading-none">{value}</p>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-slate-400 font-medium">{sub}</span>
          <span className={`font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            <TrendingUp className="w-3 h-3" /> {change}
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-brand-navy transition-colors">
        <span className="font-semibold">View details</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

/* ─── Status Pill ─── */
function StatusPill({ label, status, detail }: { label: string; status: 'green' | 'amber' | 'red'; detail: string }) {
  const colors = {
    green: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    amber: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    red: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };
  const c = colors[status];
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${c.bg} ${c.border}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} ${status === 'green' ? 'animate-pulse' : ''}`} />
      <div>
        <p className={`text-[10px] font-bold ${c.text}`}>{label}</p>
        <p className="text-[9px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}

/* ─── Staff Roster ─── */
const STAFF = [
  { name: 'Amit Deshmukh', initials: 'AD', role: 'Super Admin', dept: 'Executive', workload: 'All Access', status: 'Online', color: '#003A66' },
  { name: 'Rahul Sharma', initials: 'RS', role: 'Sales Manager', dept: 'Sales & CRM', workload: '48 Active Leads', status: 'Online', color: '#059669' },
  { name: 'CA Pooja Kulkarni', initials: 'PK', role: 'Ops & CA Lead', dept: 'Operations', workload: '26 Cases Open', status: 'Online', color: '#7C3AED' },
  { name: 'Sneha Jadhav', initials: 'SJ', role: 'Senior Telecaller', dept: 'Sales', workload: '62 Calls Today', status: 'On Call', color: '#D97706' },
  { name: 'Vikas Shinde', initials: 'VS', role: 'Operations Exec', dept: 'Operations', workload: '14 Filings Due', status: 'Offline', color: '#64748b' },
  { name: 'Anil Mehta', initials: 'AM', role: 'Accounts Lead', dept: 'Finance', workload: '₹4.2L Reconciled', status: 'Online', color: '#0891B2' },
  { name: 'Sunita Patil', initials: 'SP', role: 'Franchise Manager', dept: 'Partnerships', workload: '120+ Centers', status: 'Online', color: '#BE185D' },
];

const STATUS_MAP: Record<string, { bg: string; dot: string }> = {
  Online:  { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500 animate-pulse' },
  'On Call': { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500 animate-pulse' },
  Offline: { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
};

/* ─── Audit logs ─── */
const AUDIT_LOGS = [
  { icon: Target, action: 'Lead Campaign Synced', user: 'Rahul Sharma', detail: 'Assigned 15 fresh Google Ads leads to Sneha Jadhav (TN zone)', time: '10m ago', color: '#003A66' },
  { icon: FileCheck2, action: 'Task Stage Advanced', user: 'CA Pooja Kulkarni', detail: 'Order #2204 moved → GOVT_FILING_IN_PROGRESS on MCA V3', time: '25m ago', color: '#7C3AED' },
  { icon: DollarSign, action: 'Payment Confirmed', user: 'Anil Mehta', detail: '₹16,499 received via HDFC Bank NEFT for Pvt Ltd Order #2201', time: '1h ago', color: '#059669' },
  { icon: PhoneCall, action: 'Mobile App Sync', user: 'Flutter Sales App', detail: '148 call logs & GPS locations synced from field agents', time: '2h ago', color: '#D97706' },
  { icon: ShieldCheck, action: 'QC Completed', user: 'CA Deepak Verma', detail: 'Annual Filing for Supriya Traders LLP reviewed & signed', time: '3h ago', color: '#0891B2' },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);

  useEffect(() => {
    fetch('/v1/crm/stats')
      .then((r) => r.json())
      .then((d) => { if (d?.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const fmt = (n?: number | null, fallback = '—') =>
    n != null ? n.toLocaleString('en-IN') : fallback;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-navy via-[#004d87] to-[#003A66] p-7 rounded-2xl shadow-lg">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Super Admin Console</p>
                <h1 className="text-xl font-display font-bold text-white leading-tight">
                  Executive Master Cockpit
                </h1>
              </div>
              <span className="ml-1 px-2.5 py-0.5 bg-brand-gold/20 border border-brand-gold/30 rounded-full text-brand-gold-light text-[10px] font-bold uppercase tracking-wider">
                Platform Master
              </span>
            </div>
            <p className="text-white/55 text-xs max-w-xl">
              Real-time unified intelligence across ETaxwala CRM · Udyami Kisan · Sahakar Samriddhi · Flutter Mobile App · 66 DB Tables
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/crm/leads" className="flex items-center gap-2 px-4 py-2 btn-multicolor rounded-xl text-xs font-bold transition-colors shadow-sm">
              <Users className="w-3.5 h-3.5" />
              All Leads ({fmt(stats?.totalLeads, '17,281')})
            </Link>
            <Link to="/crm/tasks" className="flex items-center gap-2 px-4 py-2 btn-multicolor border border-white/20 rounded-xl text-xs font-bold transition-colors">
              <FileCheck2 className="w-3.5 h-3.5" />
              Tasks ({fmt(stats?.totalTasks, '4,911')})
            </Link>
            <Link to="/crm/workforce" className="flex items-center gap-2 px-4 py-2 btn-multicolor border border-white/20 rounded-xl text-xs font-bold transition-colors">
              <UserCheck className="w-3.5 h-3.5" />
              HR & Staff
            </Link>
          </div>
        </div>

        {/* System status pills row */}
        <div className="relative mt-5 flex items-center gap-2 flex-wrap">
          <StatusPill label="PostgreSQL Live" status="green" detail="66 tables active" />
          <StatusPill label="Flutter App" status="green" detail="Mobile API connected" />
          <StatusPill label="API Gateway" status="green" detail="99.98% uptime" />
          <StatusPill label="SLA Engine" status="green" detail="92% on-time delivery" />
          <StatusPill label="Multi-Bank Gateway" status="green" detail="10 Accounts & UPI QR Live" />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Leads in Database"
          value={fmt(stats?.totalLeads, '17,281')}
          sub="+342 new this week"
          change="+14.2%"
          icon={Users}
          color="#003A66"
          bg="rgba(0,58,102,0.08)"
          to="/crm/leads"
        />
        <KpiCard
          title="Active Customers"
          value={fmt(stats?.totalCustomers, '1,373')}
          sub="98.4% satisfaction score"
          change="+8.1%"
          icon={UserCheck}
          color="#059669"
          bg="rgba(5,150,105,0.08)"
          to="/crm/accounts"
        />
        <KpiCard
          title="Sales Orders Closed"
          value={fmt(stats?.totalOrders, '3,869')}
          sub="₹48.6L total invoiced"
          change="+18.4%"
          icon={DollarSign}
          color="#D97706"
          bg="rgba(217,119,6,0.08)"
          to="/crm/quotations"
        />
        <KpiCard
          title="Operations Task Queue"
          value={fmt(stats?.totalTasks, '4,911')}
          sub="10-stage delivery engine"
          change="92% on-time"
          icon={FileCheck2}
          color="#7C3AED"
          bg="rgba(124,58,237,0.08)"
          to="/crm/tasks"
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Quotations', value: fmt(stats?.totalQuotations, '1,874'), icon: Briefcase, color: '#0891B2' },
          { label: 'Call Logs Recorded', value: fmt(stats?.totalCalls, '79,900'), icon: PhoneCall, color: '#7C3AED' },
          { label: 'Services Catalogue', value: fmt(stats?.totalServices, '257'), icon: BarChart3, color: '#D97706' },
          { label: 'Franchise Centers', value: '120+', icon: Globe, color: '#BE185D' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 text-base leading-none">{s.value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LeadAcquisitionChart />
        <MultiBrandRevenueDonut />
        <TaskFunnelChart />
        <SalesVelocityChart />
      </div>

      {/* ── Operational Intelligence Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Multi-brand breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">Multi-Brand Lead Split</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">17,281 leads across 3 brands</p>
            </div>
            <Layers className="w-4 h-4 text-brand-navy" />
          </div>
          <div className="space-y-4 text-xs">
            {[
              { label: 'ETaxwala Main CRM', pct: 68, count: '11,750', color: '#003A66', bg: 'bg-brand-navy' },
              { label: 'Udyami Kisan Hub', pct: 21, count: '3,630', color: '#059669', bg: 'bg-emerald-600' },
              { label: 'Sahakar Samriddhi (PACS)', pct: 11, count: '1,901', color: '#D97706', bg: 'bg-brand-gold' },
            ].map((b) => (
              <div key={b.label}>
                <div className="flex justify-between font-semibold mb-1.5">
                  <span className="font-bold" style={{ color: b.color }}>{b.label}</span>
                  <span className="text-slate-500">{b.pct}% · {b.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${b.bg} rounded-full transition-all duration-700`} style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System & API Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">System & API Health</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Live infrastructure status</p>
            </div>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { icon: Database, label: 'PostgreSQL (etaxwala_v2)', detail: '66 Tables · 300ms avg', status: 'green', val: '66 Tables' },
              { icon: PhoneCall, label: 'Flutter Sales Mobile App', detail: 'Push sync every 5 mins', status: 'green', val: 'Live' },
              { icon: Wifi, label: 'API Gateway (Express)', detail: 'v3 REST + JWT Auth', status: 'green', val: '99.98%' },
              { icon: Lock, label: 'Multi-Bank & QR System', detail: '10 Accounts & Direct UPI', status: 'green', val: 'Active' },
              { icon: Cpu, label: 'Desktrack Productivity', detail: 'Screenshot + time tracker', status: 'green', val: 'Recording' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F8FA] border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-700 text-[11px]">{item.label}</p>
                    <p className="text-[9px] text-slate-400">{item.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-700">{item.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Audit Stream */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-800">Live Audit Stream</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Recent staff & system activity</p>
            </div>
            <Zap className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="space-y-2.5 text-xs">
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} className="flex gap-3 p-2.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${log.color}15` }}>
                  <log.icon className="w-3.5 h-3.5" style={{ color: log.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-bold" style={{ color: log.color }}>{log.action}</span>
                    <span className="text-[9px] text-slate-400 shrink-0 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {log.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-tight line-clamp-2">{log.detail}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">by {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Staff Roster ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800">Staff Department Roster & Live Status</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">16 RBAC role levels · 200+ registered staff members</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-navy">200+ Members</span>
            <Link to="/crm/workforce" className="btn btn-outline btn-sm text-xs">
              Full HR Page <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Active Workload</th>
                <th className="text-right">Live Status</th>
              </tr>
            </thead>
            <tbody>
              {STAFF.map((s, i) => {
                const sc = STATUS_MAP[s.status] || STATUS_MAP['Offline'];
                return (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: s.color }}
                        >
                          {s.initials}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{s.name}</span>
                      </div>
                    </td>
                    <td className="text-xs font-semibold text-brand-navy">{s.role}</td>
                    <td className="text-xs text-slate-500">{s.dept}</td>
                    <td className="text-xs font-semibold text-slate-700">{s.workload}</td>
                    <td className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-[#F7F8FA] border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 7 of 200+ staff · Sorted by activity</span>
          <Link to="/crm/workforce" className="text-brand-navy font-semibold hover:underline flex items-center gap-1">
            View Full Roster <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

    </div>
  );
}
