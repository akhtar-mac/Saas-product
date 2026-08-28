import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  PhoneCall,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Send,
  Zap,
  PhoneForwarded,
} from 'lucide-react';

export default function SalesManagerDashboard() {
  const teamMetrics = [
    { name: 'Sneha Jadhav', assigned: 45, contacted: 38, converted: 8, rev: '₹1,24,000', convRate: '17.7%', status: 'On Call' },
    { name: 'Rohan Deshmukh', assigned: 40, contacted: 35, converted: 7, rev: '₹98,500', convRate: '17.5%', status: 'Available' },
    { name: 'Priya Kadam', assigned: 50, contacted: 42, converted: 11, rev: '₹1,85,000', convRate: '22.0%', status: 'In Meeting' },
    { name: 'Sunil Pawar', assigned: 35, contacted: 30, converted: 5, rev: '₹62,000', convRate: '14.2%', status: 'Available' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Sales Pipeline & Telecaller Hub
            </h1>
            <span className="badge badge-gold">Sales Manager</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time lead assignment across 17,281 database leads, telecaller performance & conversion analytics.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/crm/leads" className="btn btn-primary btn-sm">
            <Users className="w-3.5 h-3.5" /> Auto-Assign Leads
          </Link>
          <Link to="/crm/quotations" className="btn btn-outline btn-sm">
            <Send className="w-3.5 h-3.5" /> Quotation Tracker
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Leads Assigned Today', value: '170 Leads', sub: 'Across 4 active agents', icon: Users, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Telecaller Calls Logged', value: '145 Calls', sub: 'Avg talk duration: 3m 40s', icon: PhoneCall, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Deals Closed Today', value: '31 Closed', sub: '₹4,69,500 total value', icon: Target, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Team Conversion Rate', value: '18.2%', sub: '+2.4% vs last week', icon: TrendingUp, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="mt-3">
                <p className="font-display font-bold text-2xl text-slate-800">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Telecaller Team Performance Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Sales Agents & Telecaller Performance Roster
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live conversion rates, daily revenue and caller availability</p>
          </div>
          <span className="badge badge-navy">4 Active Agents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Assigned Today</th>
                <th>Calls Contacted</th>
                <th>Deals Won</th>
                <th>Revenue Generated</th>
                <th>Status</th>
                <th className="text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {teamMetrics.map((agent, i) => (
                <tr key={i}>
                  <td className="font-bold text-slate-800 text-xs">{agent.name}</td>
                  <td className="text-xs text-slate-600 font-semibold">{agent.assigned}</td>
                  <td className="text-xs text-brand-navy font-semibold">{agent.contacted}</td>
                  <td className="text-xs text-emerald-600 font-bold">{agent.converted}</td>
                  <td className="text-xs text-slate-900 font-bold">{agent.rev}</td>
                  <td className="text-xs">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      agent.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="badge badge-green font-bold">{agent.convRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
