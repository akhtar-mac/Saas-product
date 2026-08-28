import React from 'react';
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function ClientPaymentsPage() {
  const invoices = [
    {
      id: 'INV-2026-0891',
      date: '10 Aug 2026',
      service: 'Private Limited Company Registration',
      amount: 16499,
      tax: 2969.82,
      total: 19468.82,
      status: 'Paid',
      method: 'Razorpay UPI / NetBanking',
      receiptUrl: '#',
    },
    {
      id: 'INV-2026-0612',
      date: '15 Jul 2026',
      service: 'GST Registration & Return Package',
      amount: 999,
      tax: 179.82,
      total: 1178.82,
      status: 'Paid',
      method: 'PhonePe QR',
      receiptUrl: '#',
    },
    {
      id: 'INV-2026-0614',
      date: '16 Jul 2026',
      service: 'Udyam / MSME Registration',
      amount: 499,
      tax: 89.82,
      total: 588.82,
      status: 'Paid',
      method: 'Credit Card',
      receiptUrl: '#',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Billing, Invoices & Payment Ledger
            </h1>
            <span className="badge badge-gold">GST Invoicing</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Download GST-compliant tax invoices, view past transaction receipts & input tax credit (ITC) ledgers.
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          100% Payments Clear
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Total Lifetime Spent', value: '₹21,236.46', sub: '3 Services Completed', icon: CreditCard, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Current Outstanding Dues', value: '₹0.00', sub: 'All accounts clear', icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'GST Input Credit (ITC)', value: '₹3,239.46', sub: 'Claimable in GSTR-3B', icon: ShieldCheck, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* Invoice Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Tax Invoice History & Receipts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">GST invoices are ready for input tax credit claims</p>
          </div>
          <span className="badge badge-navy">Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Service Description</th>
                <th>Amount + GST</th>
                <th>Status</th>
                <th className="text-right">Tax Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs font-bold text-brand-navy">
                    {inv.id}
                  </td>
                  <td className="text-xs text-slate-500">{inv.date}</td>
                  <td className="text-xs font-medium text-slate-800">
                    {inv.service}
                  </td>
                  <td className="text-xs font-mono font-bold text-slate-800">
                    ₹{inv.total.toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-green text-[10px]">
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-outline btn-sm text-xs">
                      <Download className="w-3.5 h-3.5" /> Download GST PDF
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
