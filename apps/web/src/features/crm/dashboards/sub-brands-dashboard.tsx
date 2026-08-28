import React, { useState } from 'react';
import {
  Layers,
  Building,
  Sprout,
  Users,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export default function SubBrandsDashboard() {
  const [selectedBrand, setSelectedBrand] = useState('udyomi');

  const udyomiLeads = [
    { name: 'Kisan FPO Sangamner Ltd', type: 'Farmer Producer Company (FPC) Registration', location: 'Ahmednagar, MH', status: 'Govt Filing In Progress', value: '₹24,999' },
    { name: 'Baliraja Organic Agro Producer', type: 'FPC Annual Compliance Package', location: 'Nashik, MH', status: 'Audit Ready', value: '₹18,000' },
    { name: 'Godavari Krishi Vikas FPC', type: 'NABARD / SFAC Project Loan Guidance', location: 'Nanded, MH', status: 'Consultation Done', value: '₹15,000' },
  ];

  const sahakarLeads = [
    { name: 'Shree Ganesh Nagari Sahakari Patsanstha', type: 'Credit Co-operative Society Audit', location: 'Pune, MH', status: 'Audit In Progress', value: '₹35,000' },
    { name: 'Jankalyan Multi-State Co-op Society', type: 'Multi-State Co-op Registration', location: 'Kolhapur, MH', status: 'By-laws Drafting', value: '₹45,000' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Sub-Brand Operations & Multi-Tenancy Hub
            </h1>
            <span className="badge badge-gold">Special Verticals</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated vertical management for <strong>Udyami Kisan</strong> (FPC & Agriculture) and <strong>Sahakar Samriddhi</strong> (Co-operative Banking & PACS).
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          Multi-Tenant Engine Active
        </span>
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
          🌾 Udyami Kisan (FPC & Agriculture) • 3,630 Leads
        </button>
        <button
          onClick={() => setSelectedBrand('sahakar')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedBrand === 'sahakar'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🏛️ Sahakar Samriddhi (PACS & Co-ops) • 1,901 Leads
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
            value: selectedBrand === 'udyomi' ? '3,630 Leads' : '1,901 Leads',
            sub: 'Rural network sourcing',
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

      {/* Sub-brand Leads Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              {selectedBrand === 'udyomi'
                ? 'Active Udyami Kisan FPC Registrations & Governance'
                : 'Active Sahakar Samriddhi Co-operative Society Filings'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Specialized compliance workflows and state registrar submissions</p>
          </div>
          <span className="badge badge-navy">Vertical Pipeline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Organization / Society Name</th>
                <th>Specialized Compliance</th>
                <th>District / Location</th>
                <th>Package Fee</th>
                <th className="text-right">Lifecycle Status</th>
              </tr>
            </thead>
            <tbody>
              {(selectedBrand === 'udyomi' ? udyomiLeads : sahakarLeads).map((item, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-slate-800 text-xs">{item.name}</td>
                  <td className="text-xs text-slate-700 font-medium">{item.type}</td>
                  <td className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {item.location}
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
      </div>
    </div>
  );
}
