import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function FranchiseAgentDashboard() {
  const partnerOrders = [
    {
      orderId: 'ORD-8812',
      partner: 'Shree Ganesh CSC Center (Nagpur)',
      client: 'Kisan Bio Fertilizers',
      service: 'Private Limited Incorporation',
      commission: '₹3,500',
      status: 'In Progress',
    },
    {
      orderId: 'ORD-8813',
      partner: 'Apex Taxation Hub (Surat)',
      client: 'Surat Diamond Traders',
      service: 'GST Annual Return (GSTR-9)',
      commission: '₹1,800',
      status: 'Completed',
    },
    {
      orderId: 'ORD-8814',
      partner: 'Krishi Vikas Seva (Nashik)',
      client: 'Godavari FPC Ltd',
      service: 'FPC Annual Compliance & ROC Filing',
      commission: '₹4,200',
      status: 'Govt Filing',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Franchise Partner Desk
            </h1>
            <span className="badge badge-gold">Field Partner Executive</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Partner relationship management, local center orders onboarding & commission
            disbursements.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/crm/franchise" className="btn btn-primary btn-sm">
            <Briefcase className="w-3.5 h-3.5" /> 120+ Partner Network
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'My Partner Centers',
            value: '38 Centers',
            sub: 'Western Region Hubs',
            color: '#003A66',
          },
          {
            title: 'Orders Booked (MTD)',
            value: '142 Orders',
            sub: 'Revenue ₹18.4 Lakhs',
            color: '#059669',
          },
          {
            title: 'Earned Commissions',
            value: '₹1,84,500',
            sub: 'Paid via instant IMPS',
            color: '#D97706',
          },
          {
            title: 'Avg Onboarding TAT',
            value: '24 Hours',
            sub: 'KYC & Portal live',
            color: '#7C3AED',
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

      {/* Partner Orders Queue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Recent Partner Bookings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Orders submitted by offline CSC & franchise centers
            </p>
          </div>
          <span className="badge badge-navy">Live Network</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Partner Center</th>
                <th>Client Name</th>
                <th>Service</th>
                <th>Commission</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {partnerOrders.map((ord) => (
                <tr key={ord.orderId}>
                  <td className="font-bold text-brand-navy font-mono text-xs">{ord.orderId}</td>
                  <td className="text-xs font-bold text-slate-800">{ord.partner}</td>
                  <td className="text-xs text-slate-600">{ord.client}</td>
                  <td className="text-xs text-slate-700 font-medium">{ord.service}</td>
                  <td className="text-xs font-bold text-emerald-700">{ord.commission}</td>
                  <td className="text-right">
                    <span className="badge badge-green text-xs font-semibold">{ord.status}</span>
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
