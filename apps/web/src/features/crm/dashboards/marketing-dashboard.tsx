import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Globe,
  Share2,
  DollarSign,
  Search,
  Zap,
} from 'lucide-react';

export default function MarketingDashboard() {
  const channelPerformance = [
    { channel: 'Google Search Ads', spend: '₹85,000', leads: 420, cpl: '₹202', conversion: '19.2%', revenue: '₹9,80,000', roas: '11.5x' },
    { channel: 'Meta / Facebook Ads', spend: '₹60,000', leads: 650, cpl: '₹92', conversion: '12.4%', revenue: '₹6,40,000', roas: '10.6x' },
    { channel: 'Organic SEO & Knowledge Hub', spend: '₹25,000', leads: 380, cpl: '₹65', conversion: '24.1%', revenue: '₹8,20,000', roas: '32.8x' },
    { channel: 'Direct WhatsApp Funnels', spend: '₹15,000', leads: 290, cpl: '₹51', conversion: '22.0%', revenue: '₹4,90,000', roas: '32.6x' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Marketing & Growth Intelligence Hub
            </h1>
            <span className="badge badge-gold">Growth Analytics</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Omni-channel campaign attribution across Google, Meta, SEO & direct WhatsApp funnels.
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          Avg ROAS: 18.4x
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Leads Generated', value: '1,740 Leads', sub: 'This month', icon: Target, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Blended Cost Per Lead', value: '₹106 / lead', sub: '-14% vs last month', icon: DollarSign, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Total Ad Spend', value: '₹1,85,000', sub: 'Google + Meta + Content', icon: TrendingUp, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Attributed Revenue', value: '₹29,30,000', sub: '15.8x blended ROAS', icon: Zap, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* Channel Attribution Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Channel Attribution, CPL & ROAS Performance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live tracking from ad click to signed invoice</p>
          </div>
          <span className="badge badge-navy">Channels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Channel Source</th>
                <th>Ad Spend</th>
                <th>Leads Generated</th>
                <th>Cost Per Lead (CPL)</th>
                <th>Conversion %</th>
                <th>Revenue Generated</th>
                <th className="text-right">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((ch, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-slate-800 text-xs">{ch.channel}</td>
                  <td className="text-xs text-slate-500">{ch.spend}</td>
                  <td className="text-xs text-brand-navy font-bold">{ch.leads}</td>
                  <td className="text-xs text-slate-700 font-mono font-semibold">{ch.cpl}</td>
                  <td className="text-xs text-slate-600 font-medium">{ch.conversion}</td>
                  <td className="text-xs font-bold text-emerald-700">{ch.revenue}</td>
                  <td className="text-right">
                    <span className="badge badge-green font-bold">{ch.roas}</span>
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
