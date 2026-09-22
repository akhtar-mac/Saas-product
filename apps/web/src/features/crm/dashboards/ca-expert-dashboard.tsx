import React from 'react';
import {
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  BookOpen,
  Calendar,
  Award,
} from 'lucide-react';

export default function CaExpertDashboard() {
  const auditQueue = [
    { id: 201, client: 'Mahindra Logistics Partner Co-op', type: 'Statutory Tax Audit (Form 3CA/3CD)', turnover: '₹4.2 Cr', status: 'In Progress', date: '25 Aug 2026' },
    { id: 202, client: 'AgriTech Fresh Foods LLP', type: 'LLP Annual Filing (Form 11 & Form 8)', turnover: '₹85 Lakhs', status: 'Pending Sign', date: '28 Aug 2026' },
    { id: 203, client: 'Navkar Infra Projects Pvt Ltd', type: 'Valuation Report & Net Worth Cert', turnover: '₹12 Cr', status: 'Document Review', date: '30 Aug 2026' },
    { id: 204, client: 'Krishi Vikas Producer Company Ltd', type: 'FPC Section 8 Audit & ROC Filing', turnover: '₹1.8 Cr', status: 'In Progress', date: '05 Sep 2026' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Chartered Accountant & Tax Expert Desk
            </h1>
            <span className="badge badge-gold">ICAI / Legal Compliance</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statutory tax audits, ROC annual sign-offs, UDIN issuance & expert client consultations.
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          CA License & DSC Active
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Audits in Queue', value: '8 Audits', sub: 'Tax & Statutory', icon: FileText, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Sign-offs Pending', value: '3 Filings', sub: 'Form 3CD & Net Worth', icon: Clock, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'UDINs Generated', value: '42 UDINs', sub: 'Issued this FY', icon: ShieldCheck, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Expert Consultations', value: '12 Calls', sub: 'Scheduled this week', icon: BookOpen, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* Audit Queue Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Statutory Audit & Certification Review Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Verification of working papers, financials, and MCA/ITD submissions</p>
          </div>
          <span className="badge badge-navy">Priority Audits</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Audit ID / Client Name</th>
                <th>Audit Classification</th>
                <th>Declared Turnover</th>
                <th>Filing Deadline</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {auditQueue.map((item) => (
                <tr key={item.id}>
                  <td>
                    <p className="font-bold text-slate-800 text-xs">{item.client}</p>
                    <p className="text-[10px] text-slate-400">Case #{item.id}</p>
                  </td>
                  <td className="text-xs text-slate-700 font-medium">{item.type}</td>
                  <td className="text-xs font-mono text-emerald-700 font-bold">{item.turnover}</td>
                  <td className="text-xs text-slate-600 font-semibold">{item.date}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      item.status === 'Pending Sign' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-primary btn-sm">
                      Review Working Papers
                    </button>
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
