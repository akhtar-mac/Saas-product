import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileSpreadsheet } from 'lucide-react';

export default function SalesAssistantDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/v1/crm/leads?limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.data) {
          setLeads(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Lead Sourcing & Inquiry Desk
            </h1>
            <span className="badge badge-gold">Sales Assistant</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Incoming omnichannel leads verification, deduplication & telecaller quota allocation.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/crm/leads" className="btn btn-primary btn-sm">
            <Users className="w-3.5 h-3.5" /> Full Leads Pipeline (17k+)
          </Link>
          <Link to="/crm/quotations" className="btn btn-gold btn-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Quotations
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'New Unassigned Leads',
            value: '42 Leads',
            sub: 'Awaiting allocation',
            color: '#003A66',
            bg: 'rgba(0,58,102,0.08)',
          },
          {
            title: 'Processed Today',
            value: '118 Leads',
            sub: 'Assigned to telecallers',
            color: '#059669',
            bg: 'rgba(5,150,105,0.08)',
          },
          {
            title: 'Deduplicated / Junk',
            value: '6 Leads',
            sub: 'Spam filtered out',
            color: '#D97706',
            bg: 'rgba(217,119,6,0.08)',
          },
          {
            title: 'Avg Allocation Time',
            value: '4.2 Mins',
            sub: 'Fast-track SLA',
            color: '#7C3AED',
            bg: 'rgba(124,58,237,0.08)',
          },
        ].map((kpi) => (
          <div
            key={kpi.title}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
            <div className="mt-3">
              <p className="font-display font-bold text-2xl text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fresh Leads Inflow Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Fresh Inbound Inquiries
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live records streaming from PostgreSQL `leads` table
            </p>
          </div>
          <span className="badge badge-navy">Live Inflow</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Lead / Contact</th>
                <th>Inquired Service</th>
                <th>City / State</th>
                <th>Source</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-xs text-slate-400">
                    Loading live leads from database...
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <p className="font-bold text-slate-800 text-xs">{lead.name}</p>
                      <p className="text-[10px] text-brand-navy font-mono font-semibold">
                        {lead.contact}
                      </p>
                    </td>
                    <td className="text-xs text-slate-700 font-medium">{lead.service}</td>
                    <td className="text-xs text-slate-500">{lead.city || 'India'}</td>
                    <td>
                      <span className="badge badge-navy text-[10px]">
                        {lead.source || 'Website'}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link to="/crm/leads" className="btn btn-primary btn-sm">
                        Assign Telecaller
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
