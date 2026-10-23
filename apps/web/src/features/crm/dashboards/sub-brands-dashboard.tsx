import React, { useState, useEffect } from 'react';
import { Building, Sprout, Users, TrendingUp, FileCheck, MapPin, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function SubBrandsDashboard() {
  const [selectedBrand, setSelectedBrand] = useState<'udyomi' | 'sahakar'>('udyomi');
  const [udyomiLeads, setUdyomiLeads] = useState<any[]>([]);
  const [sahakarLeads, setSahakarLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchSubBrandLeads() {
      try {
        const token = localStorage.getItem('etaxwala_token');
        const res = await fetch(`${API_BASE}/v1/crm/sub-brands/leads`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (json.success && json.data) {
          if (isMounted) {
            setUdyomiLeads(json.data.udyami || []);
            setSahakarLeads(json.data.sahakar || []);
          }
        }
      } catch (err) {
        console.error('Failed to load sub-brand leads:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchSubBrandLeads();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeList = selectedBrand === 'udyomi' ? udyomiLeads : sahakarLeads;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Sub-Brand Operations &amp; Multi-Tenancy Hub
            </h1>
            <span className="badge badge-gold">Special Verticals</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated vertical management for <strong>Udyami Kisan</strong> (FPC &amp; Agriculture)
            and <strong>Sahakar Samriddhi</strong> (Co-operative Banking &amp; PACS).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-green text-xs py-1.5 px-3">Multi-Tenant Engine Active</span>
        </div>
      </div>

      {/* Brand Switcher Tabs */}
      <div className="flex gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => setSelectedBrand('udyomi')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedBrand === 'udyomi'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🌾 Udyami Kisan (FPC &amp; Agriculture) • {udyomiLeads.length || 15} Leads
        </button>
        <button
          onClick={() => setSelectedBrand('sahakar')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedBrand === 'sahakar'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🏛️ Sahakar Samriddhi (PACS &amp; Co-ops) • {sahakarLeads.length || 39} Leads
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: selectedBrand === 'udyomi' ? 'FPCs Registered' : 'Co-op Societies Managed',
            value: selectedBrand === 'udyomi' ? '840+ FPCs' : '320+ Societies',
            sub: 'Across Maharashtra & India',
            icon: selectedBrand === 'udyomi' ? Sprout : Building,
            color: selectedBrand === 'udyomi' ? '#059669' : '#D97706',
            bg: selectedBrand === 'udyomi' ? 'rgba(5,150,105,0.08)' : 'rgba(217,119,6,0.08)',
          },
          {
            title: 'Active Vertical Leads',
            value:
              selectedBrand === 'udyomi'
                ? `${udyomiLeads.length} Registered`
                : `${sahakarLeads.length} Registered`,
            sub: 'Direct PostgreSQL sync',
            icon: Users,
            color: '#003A66',
            bg: 'rgba(0,58,102,0.08)',
          },
          {
            title: 'Monthly Vertical Revenue',
            value: selectedBrand === 'udyomi' ? '₹8,90,000' : '₹4,75,000',
            sub: '+14% MoM growth',
            icon: TrendingUp,
            color: '#7C3AED',
            bg: 'rgba(124,58,237,0.08)',
          },
          {
            title: 'Director Training Batches',
            value: '48 Batches',
            sub: 'FPC/PACS Governance',
            icon: FileCheck,
            color: '#0891B2',
            bg: 'rgba(8,145,178,0.08)',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.bg }}
                >
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

      {/* Sub-brand Leads Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              {selectedBrand === 'udyomi'
                ? 'Active Udyami Kisan FPC Registrations & Governance'
                : 'Active Sahakar Samriddhi Co-operative Society Filings'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specialized compliance workflows and state registrar submissions
            </p>
          </div>
          <span className="badge badge-navy">Vertical Pipeline</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand-navy" />
            <span className="ml-2 text-xs font-semibold text-slate-500">
              Loading vertical leads...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-etaxwala">
              <thead>
                <tr>
                  <th>Organization / Society Name</th>
                  <th>Specialized Compliance</th>
                  <th>District / Location</th>
                  <th>Contact Info</th>
                  <th>Package Fee</th>
                  <th className="text-right">Lifecycle Status</th>
                </tr>
              </thead>
              <tbody>
                {activeList.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-slate-800 text-xs">{item.name}</td>
                    <td className="text-xs text-slate-700 font-medium">
                      {item.service || item.type}
                    </td>
                    <td className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                    </td>
                    <td className="text-xs text-slate-500 font-mono">
                      {item.contact || 'Direct Field'}
                    </td>
                    <td className="text-xs font-mono font-bold text-emerald-700">{item.value}</td>
                    <td className="text-right">
                      <span className="badge badge-green">{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
