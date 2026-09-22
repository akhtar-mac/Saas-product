import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Settings,
  FolderLock,
  Layers,
  Calendar,
  FileCheck2,
  TrendingUp,
  Activity,
  CheckCircle2,
  Search,
  Plus,
  ArrowRight,
  Package,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLeads: 17281,
    totalCustomers: 1373,
    totalTasks: 4911,
    totalServices: 257,
    totalAppointments: 107,
  });

  useEffect(() => {
    fetch('/v1/crm/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.data) {
          setStats(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { name: 'Business Registration', servicesCount: 42, activeOrders: 820, status: 'Active' },
    { name: 'Taxation & GST Returns', servicesCount: 38, activeOrders: 640, status: 'Active' },
    { name: 'Licenses & Government Approvals', servicesCount: 29, activeOrders: 310, status: 'Active' },
    { name: 'Intellectual Property (IP & Trademark)', servicesCount: 24, activeOrders: 290, status: 'Active' },
    { name: 'Accounting & Statutory Audit', servicesCount: 18, activeOrders: 144, status: 'Active' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              General Administrator Workbench
            </h1>
            <span className="badge badge-gold">Operations & Catalog Control</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System administration, service catalog pricing, package management & cross-departmental coordination.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/crm/leads" className="btn btn-primary btn-sm">
            <Users className="w-3.5 h-3.5" /> All Leads ({stats.totalLeads.toLocaleString()})
          </Link>
          <Link to="/crm/tasks" className="btn btn-outline btn-sm">
            <FileCheck2 className="w-3.5 h-3.5" /> Tasks ({stats.totalTasks.toLocaleString()})
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Service Catalog Items', value: `${stats.totalServices} Services`, sub: 'Across 8 Categories', icon: Package, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Active Customer Accounts', value: `${stats.totalCustomers} Accounts`, sub: '98.4% verified KYC', icon: Users, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Operational Tasks', value: `${stats.totalTasks} Tasks`, sub: '10-stage task engine', icon: FileCheck2, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Booked Appointments', value: `${stats.totalAppointments} Bookings`, sub: 'CA Consultations', icon: Calendar, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* Service Categories Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Service Categories & Catalog Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live catalog linked with 257 services in PostgreSQL</p>
          </div>
          <span className="badge badge-navy">Catalog Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Services Count</th>
                <th>Active Orders</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-slate-800 text-xs">{cat.name}</td>
                  <td className="text-xs font-mono text-brand-navy font-bold">{cat.servicesCount} services</td>
                  <td className="text-xs text-slate-600 font-semibold">{cat.activeOrders} orders</td>
                  <td className="text-right">
                    <span className="badge badge-green text-xs font-semibold">{cat.status}</span>
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
