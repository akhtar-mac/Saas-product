import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react';

/* ─── Static mock data ─── */
const leadTrendData = [
  { week: 'Wk 1 Aug', 'Google Ads': 312, 'Website': 148, 'Referral': 64, 'Sub-brands': 42 },
  { week: 'Wk 2 Aug', 'Google Ads': 389, 'Website': 172, 'Referral': 71, 'Sub-brands': 58 },
  { week: 'Wk 3 Aug', 'Google Ads': 341, 'Website': 159, 'Referral': 88, 'Sub-brands': 51 },
  { week: 'Wk 4 Aug', 'Google Ads': 428, 'Website': 193, 'Referral': 102, 'Sub-brands': 74 },
  { week: 'Wk 1 Sep', 'Google Ads': 467, 'Website': 214, 'Referral': 89, 'Sub-brands': 93 },
  { week: 'Wk 2 Sep', 'Google Ads': 512, 'Website': 231, 'Referral': 118, 'Sub-brands': 104 },
];

const revenuePieData = [
  { name: 'ETaxwala Main CRM', value: 11750, color: '#003A66' },
  { name: 'Udyami Kisan Hub', value: 3630, color: '#059669' },
  { name: 'Sahakar Samriddhi', value: 1901, color: '#D97706' },
];

const taskFunnelData = [
  { stage: '1. Doc Collection', tasks: 1024, fill: '#94a3b8' },
  { stage: '2. Verification', tasks: 834, fill: '#60a5fa' },
  { stage: '3. Govt Filing Prep', tasks: 763, fill: '#f59e0b' },
  { stage: '4. Submitted on Portal', tasks: 612, fill: '#a78bfa' },
  { stage: '5. Govt Approved', tasks: 498, fill: '#34d399' },
  { stage: '6. QC & CA Sign-off', tasks: 384, fill: '#10b981' },
  { stage: '7. Delivered', tasks: 312, fill: '#059669' },
  { stage: '8–10. Archived', tasks: 484, fill: '#d1fae5' },
];

const salesVelocityData = [
  { day: 'Mon', 'Calls Logged': 142, 'Quotations Sent': 38, 'Payments': 9 },
  { day: 'Tue', 'Calls Logged': 168, 'Quotations Sent': 44, 'Payments': 14 },
  { day: 'Wed', 'Calls Logged': 195, 'Quotations Sent': 51, 'Payments': 18 },
  { day: 'Thu', 'Calls Logged': 183, 'Quotations Sent': 47, 'Payments': 12 },
  { day: 'Fri', 'Calls Logged': 221, 'Quotations Sent': 58, 'Payments': 21 },
  { day: 'Sat', 'Calls Logged': 134, 'Quotations Sent': 31, 'Payments': 8 },
];

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[150px]">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold text-slate-800">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Lead Acquisition Area Chart ─── */
export function LeadAcquisitionChart() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-800">Lead Acquisition Trends</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Weekly inflow by source channel</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-brand-navy" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={leadTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGoogleAds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#003A66" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#003A66" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="colorWebsite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="colorReferral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="colorSubBrands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="Google Ads" stroke="#003A66" strokeWidth={2} fill="url(#colorGoogleAds)" />
          <Area type="monotone" dataKey="Website" stroke="#059669" strokeWidth={2} fill="url(#colorWebsite)" />
          <Area type="monotone" dataKey="Referral" stroke="#D97706" strokeWidth={2} fill="url(#colorReferral)" />
          <Area type="monotone" dataKey="Sub-brands" stroke="#7C3AED" strokeWidth={2} fill="url(#colorSubBrands)" />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Multi-Brand Revenue Donut ─── */
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function MultiBrandRevenueDonut() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-800">Multi-Brand Lead Distribution</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">17,281 total leads across 3 brands</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
          <PieIcon className="w-4 h-4 text-brand-gold-dark" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="55%" height={170}>
          <PieChart>
            <Pie
              data={revenuePieData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {revenuePieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [value.toLocaleString() + ' leads', '']}
              contentStyle={{ fontSize: '11px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2.5 text-xs">
          {revenuePieData.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
              <div>
                <p className="font-semibold text-slate-700 leading-tight">{d.name}</p>
                <p className="text-slate-400 text-[10px]">{d.value.toLocaleString()} leads</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 10-Stage Task Funnel ─── */
export function TaskFunnelChart() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-800">10-Stage Operations Funnel</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Task distribution across pipeline stages</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-purple-600" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={taskFunnelData} layout="vertical" margin={{ top: 0, right: 20, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="stage"
            type="category"
            tick={{ fontSize: 9, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            formatter={(value: any) => [value.toLocaleString() + ' tasks', 'Active Tasks']}
            contentStyle={{ fontSize: '11px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="tasks" radius={[0, 6, 6, 0]}>
            {taskFunnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Sales Conversion Velocity ─── */
export function SalesVelocityChart() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-800">Sales Team Conversion Velocity</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Calls → Quotations → Payments this week</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Activity className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={salesVelocityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="Calls Logged" stroke="#003A66" strokeWidth={2.5} dot={{ r: 3, fill: '#003A66' }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Quotations Sent" stroke="#D97706" strokeWidth={2.5} dot={{ r: 3, fill: '#D97706' }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
          <Line type="monotone" dataKey="Payments" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: '#059669' }} activeDot={{ r: 5 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
