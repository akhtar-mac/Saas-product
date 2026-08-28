import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, FileText, CreditCard, AlertCircle,
  CheckCircle2, Clock, RefreshCw, ArrowUpRight, Search,
  Building, User, Phone, BarChart3, Wallet, Receipt, Filter,
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  contact: string;
  service: string;
  service_price: number;
  is_payment: number;
  city: string;
  state: string;
  date: string;
}

const PAYMENT_STATUS: Record<number, { label: string; bg: string; dot: string }> = {
  0: { label: 'Pending', bg: 'bg-red-50 text-red-700',      dot: 'bg-red-500' },
  1: { label: 'Paid',    bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  2: { label: 'Partial', bg: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-500' },
};

export default function CrmAccountsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState('ALL');

  useEffect(() => {
    fetch('/v1/crm/customers?limit=50')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.data)) setCustomers(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact?.includes(search);
    const matchPay =
      payFilter === 'ALL' ||
      String(c.is_payment) === payFilter;
    return matchSearch && matchPay;
  });

  const paid    = customers.filter((c) => c.is_payment === 1).length;
  const pending = customers.filter((c) => c.is_payment === 0).length;
  const partial = customers.filter((c) => c.is_payment === 2).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.service_price || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0891B2] via-[#0e7490] to-[#0891B2] p-7 rounded-2xl shadow-lg">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Finance & Billing</p>
              <h1 className="text-xl font-display font-bold text-white mt-1">
                Accounts & Customer Billing
              </h1>
              <p className="text-white/55 text-xs mt-1">
                Manage customer accounts, payment status, and revenue tracking across all services.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-white font-display font-bold text-lg leading-none">
                  ₹{(totalRevenue / 100000).toFixed(1)}L
                </p>
                <p className="text-white/50 text-[10px] mt-0.5">Total Value</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-white font-display font-bold text-lg leading-none">{customers.length}</p>
                <p className="text-white/50 text-[10px] mt-0.5">Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length.toLocaleString(), icon: User, color: '#0891B2', bg: 'rgba(8,145,178,0.08)' },
          { label: 'Payments Received', value: paid.toLocaleString(), icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { label: 'Pending Payments', value: pending.toLocaleString(), icon: AlertCircle, color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
          { label: 'Estimated Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
        ].map((k) => (
          <div key={k.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.bg }}>
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-slate-900 leading-none">{k.value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Payment Distribution ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Paid', count: paid, pct: customers.length ? Math.round((paid / customers.length) * 100) : 0, color: '#059669', bg: 'bg-emerald-500' },
          { label: 'Pending', count: pending, pct: customers.length ? Math.round((pending / customers.length) * 100) : 0, color: '#DC2626', bg: 'bg-red-500' },
          { label: 'Partial', count: partial, pct: customers.length ? Math.round((partial / customers.length) * 100) : 0, color: '#D97706', bg: 'bg-amber-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
              <span className="text-sm font-bold text-slate-700">{s.count} ({s.pct}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.bg} rounded-full transition-all duration-700`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="input-etaxwala pl-9 w-full"
          />
        </div>
        <select
          value={payFilter}
          onChange={(e) => setPayFilter(e.target.value)}
          className="input-etaxwala sm:w-48"
        >
          <option value="ALL">All Payment Status</option>
          <option value="1">Paid</option>
          <option value="0">Pending</option>
          <option value="2">Partial</option>
        </select>
      </div>

      {/* ── Customers Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-sm text-slate-800">Customer Accounts</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {filtered.length} of {customers.length} customers · Connected to PostgreSQL `customers`
            </p>
          </div>
          <button
            onClick={() => { setIsLoading(true); window.location.reload(); }}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Service Price</th>
                <th>Location</th>
                <th>Payment</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0891B2]" />
                    Loading customer accounts from PostgreSQL...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-slate-400">
                    No customers found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const pay = PAYMENT_STATUS[c.is_payment] || PAYMENT_STATUS[0];
                  const initials = c.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'NA';
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#0891B2]/15 flex items-center justify-center text-[10px] font-bold text-[#0891B2] shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{c.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">Cust #{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-xs font-semibold text-slate-700">{c.contact}</p>
                        <p className="text-[10px] text-slate-400">{c.email}</p>
                      </td>
                      <td className="text-xs text-slate-700 font-medium max-w-[180px]" title={c.service}>
                        {c.service?.length > 30 ? c.service.slice(0, 30) + '…' : c.service}
                      </td>
                      <td className="text-xs font-bold text-brand-navy">
                        ₹{(c.service_price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="text-xs text-slate-500">
                        {c.city}, {c.state}
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${pay.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pay.dot}`} />
                          {pay.label}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">
                        {c.date ? new Date(c.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-[#F7F8FA] border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} records · Page 1 · Sorted by latest
        </div>
      </div>
    </div>
  );
}
