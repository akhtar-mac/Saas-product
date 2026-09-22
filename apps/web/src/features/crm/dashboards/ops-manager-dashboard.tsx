import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Building,
  TrendingUp,
  FileCheck2,
  Users,
  ShieldAlert,
} from 'lucide-react';

export default function OpsManagerDashboard() {
  const stageBreakdown = [
    { stage: 'Documents Pending', count: 24, badge: 'bg-amber-50 text-amber-700' },
    { stage: 'Documents Collected', count: 18, badge: 'bg-blue-50 text-blue-700' },
    { stage: 'Verification In Progress', count: 32, badge: 'bg-indigo-50 text-indigo-700' },
    { stage: 'Govt Filing In Progress', count: 46, badge: 'bg-purple-50 text-purple-700' },
    { stage: 'QC Review Desk', count: 14, badge: 'bg-cyan-50 text-cyan-700' },
    { stage: 'Govt Approved / Done', count: 50, badge: 'bg-emerald-50 text-emerald-700' },
  ];

  const opsTeam = [
    { name: 'CA Pooja Kulkarni', role: 'Senior CA Specialist', activeCases: 26, slaScore: '98%', pendingAction: 2 },
    { name: 'Vikas Shinde', role: 'Operations Executive', activeCases: 34, slaScore: '94%', pendingAction: 5 },
    { name: 'Megha More', role: 'Verification Executive', activeCases: 28, slaScore: '96%', pendingAction: 1 },
    { name: 'Rohit Joshi', role: 'Operations Assistant', activeCases: 22, slaScore: '91%', pendingAction: 4 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Operations & Service Delivery Control Room
            </h1>
            <span className="badge badge-gold">Operations Manager</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            4,911 operations tasks, 10-stage lifecycle tracking, SLA compliance, bottleneck detection & workload distribution.
          </p>
        </div>

        <Link to="/crm/tasks" className="btn btn-primary btn-sm">
          <ClipboardList className="w-3.5 h-3.5" /> 10-Stage Task Board
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Active Filings', value: '184 Active', sub: 'Across 8 core categories', icon: ClipboardList, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'SLA Compliance Rate', value: '95.2%', sub: '175 cases on track', icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Govt Query / At Risk', value: '9 Orders', sub: 'Requires CA intervention', icon: AlertTriangle, color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
          { title: 'Completed This Month', value: '142 Deliveries', sub: 'Certificates dispatched', icon: FileCheck2, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* 10-Stage Visual Pipeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Live Cases by 10-Stage Lifecycle
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status tracking from document intake to government approval</p>
          </div>
          <span className="badge badge-navy">184 Live Cases</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stageBreakdown.map((item, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                <span className="text-xl font-display font-bold text-slate-800">{item.count}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                {item.stage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Operations Team Workload */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Operations Team Workload & SLA Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Team workload balance, filing specializations, and urgent actions</p>
          </div>
          <span className="badge badge-navy">Operations Specialists</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Operations Specialist</th>
                <th>Specialization</th>
                <th>Active Cases</th>
                <th>Pending Actions</th>
                <th className="text-right">SLA Score</th>
              </tr>
            </thead>
            <tbody>
              {opsTeam.map((member, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-slate-800 text-xs">{member.name}</td>
                  <td className="text-xs text-brand-navy font-semibold">{member.role}</td>
                  <td className="text-xs text-slate-700 font-bold">{member.activeCases} Cases</td>
                  <td className="text-xs">
                    {member.pendingAction > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> {member.pendingAction} urgent
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        All clear
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <span className="badge badge-green font-bold">{member.slaScore}</span>
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
