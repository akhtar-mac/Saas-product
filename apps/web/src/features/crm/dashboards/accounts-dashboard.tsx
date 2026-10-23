import React from 'react';
import { CreditCard, DollarSign, TrendingUp, Download, Clock, FileSpreadsheet } from 'lucide-react';

export default function AccountsDashboard() {
  const transactions = [
    {
      id: 'TXN-901',
      client: 'Sharma Agri Exports Pvt Ltd',
      service: 'Pvt Ltd Incorporation',
      amount: '₹19,468.82',
      method: 'HDFC Direct UPI QR',
      status: 'Settled',
      date: 'Today, 11:20 AM',
    },
    {
      id: 'TXN-902',
      client: 'Green Leaf Bio Organics',
      service: 'Trademark Registration',
      amount: '₹8,258.82',
      method: 'PhonePe QR',
      status: 'Settled',
      date: 'Today, 09:45 AM',
    },
    {
      id: 'TXN-903',
      client: 'Deshmukh & Associates',
      service: 'GST Annual Audit Package',
      amount: '₹14,160.00',
      method: 'SBI NetBanking NEFT',
      status: 'Pending Recon',
      date: 'Yesterday',
    },
    {
      id: 'TXN-904',
      client: 'Kisan Samridhi Producer Co',
      service: 'FPC Annual Compliance',
      amount: '₹24,999.00',
      method: 'ICICI Bank IMPS',
      status: 'Settled',
      date: '22 Aug 2026',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Accounts, Invoicing & Billing Ledger
            </h1>
            <span className="badge badge-gold">Finance & Accounts</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-bank reconciliations (10 Verified Bank Accounts & Dynamic UPI QR), GST tax
            invoices, customer dues & partner commission payouts.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Tally / Excel
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Collections This Month',
            value: '₹42,85,900',
            sub: '98.2% collection rate',
            icon: DollarSign,
            color: '#059669',
            bg: 'rgba(5,150,105,0.08)',
          },
          {
            title: 'Outstanding Dues',
            value: '₹1,45,200',
            sub: '12 clients pending EMI',
            icon: Clock,
            color: '#D97706',
            bg: 'rgba(217,119,6,0.08)',
          },
          {
            title: 'GST Output Liability',
            value: '₹6,53,780',
            sub: 'GSTR-1 Reconciled',
            icon: CreditCard,
            color: '#003A66',
            bg: 'rgba(0,58,102,0.08)',
          },
          {
            title: 'Franchise Payouts Due',
            value: '₹3,12,000',
            sub: '48 partner commissions',
            icon: TrendingUp,
            color: '#7C3AED',
            bg: 'rgba(124,58,237,0.08)',
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

      {/* Recent Collections Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Recent Receipts & Multi-Bank Settlement Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated Multi-Bank UTR reconciliation & GST invoice generation
            </p>
          </div>
          <span className="badge badge-navy">Live Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Client Name</th>
                <th>Service / Order</th>
                <th>Gross Amount</th>
                <th>Payment Mode</th>
                <th>Settlement</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="font-mono text-xs font-bold text-brand-navy">{txn.id}</td>
                  <td className="text-xs font-bold text-slate-800">{txn.client}</td>
                  <td className="text-xs text-slate-600 font-medium">{txn.service}</td>
                  <td className="text-xs font-mono text-emerald-700 font-bold">{txn.amount}</td>
                  <td className="text-xs text-slate-500">{txn.method}</td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        txn.status === 'Settled'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-outline btn-sm text-xs btn-multicolor">
                      <Download className="w-3 h-3" /> Invoice PDF
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
