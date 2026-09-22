import React from 'react';
import {
  Briefcase,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Handshake,
  MapPin,
} from 'lucide-react';

export default function FranchiseDashboard() {
  const topFranchises = [
    { name: 'Kisan Seva Kendra - Sangli', city: 'Sangli, MH', leadsSent: 142, converted: 48, commissionEarned: '₹1,24,000', tier: 'Gold Partner' },
    { name: 'Shree Samarth Tax Consultancy', city: 'Satara, MH', leadsSent: 98, converted: 34, commissionEarned: '₹88,500', tier: 'Silver Partner' },
    { name: 'Sahakar Krishi Suvidha', city: 'Kolhapur, MH', leadsSent: 180, converted: 62, commissionEarned: '₹1,95,000', tier: 'Platinum Partner' },
    { name: 'Deccan Agro Services Center', city: 'Pune, MH', leadsSent: 115, converted: 41, commissionEarned: '₹1,12,000', tier: 'Gold Partner' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Franchise & Partner Ecosystem Portal
            </h1>
            <span className="badge badge-gold">120+ Pan-India Centers</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track 124 regional franchise centers across 28 states, referral revenue commissions & regional lead pipelines.
          </p>
        </div>

        <button className="btn btn-primary btn-sm">
          <Plus className="w-3.5 h-3.5" /> + Onboard Franchise Partner
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Franchise Centers', value: '124 Centers', sub: 'Across 18 districts', icon: Handshake, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Partner Leads This Month', value: '1,420 Leads', sub: '32.4% conversion rate', icon: Users, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Partner Commissions Paid', value: '₹6,45,000', sub: 'Shared this month', icon: DollarSign, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Top Partner Tier', value: 'Platinum Club', sub: '20% standard rev share', icon: Award, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* Top Franchise Partners Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Top Regional Franchise Partners
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly lead sourcing volume and earned commissions</p>
          </div>
          <span className="badge badge-navy">Top Performers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Center Name / Location</th>
                <th>Partner Tier</th>
                <th>Leads Sourced</th>
                <th>Deals Converted</th>
                <th className="text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {topFranchises.map((f, idx) => (
                <tr key={idx}>
                  <td>
                    <p className="font-bold text-slate-800 text-xs">{f.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {f.city}
                    </p>
                  </td>
                  <td>
                    <span className="badge badge-navy text-[10px]">{f.tier}</span>
                  </td>
                  <td className="text-xs text-slate-700 font-semibold">{f.leadsSent}</td>
                  <td className="text-xs text-emerald-700 font-bold">{f.converted}</td>
                  <td className="text-right text-xs font-mono font-bold text-brand-navy">
                    {f.commissionEarned}
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
