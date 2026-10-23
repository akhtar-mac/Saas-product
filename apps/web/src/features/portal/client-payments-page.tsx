import React, { useState } from 'react';
import { CreditCard, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import DirectBankPaymentModal from '@/components/payment/direct-bank-payment-modal';
import { OFFICIAL_COMPANY_NAME } from '@/lib/constants/banking';

export default function ClientPaymentsPage() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/v1/customer/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.data)) setOrders(d.data);
      })
      .catch(() => {});
  }, []);

  const invoices =
    orders.length > 0
      ? orders.map((o) => ({
          id: o.id,
          date: o.date || '10 Aug 2026',
          service: o.service || 'Tax & Corporate Compliance Package',
          amount: Math.round(Number(o.total || 16499) / 1.18),
          tax: Math.round((Number(o.total || 16499) / 1.18) * 0.18),
          total: Number(o.total || 19468.82),
          status: o.status || 'Paid',
          method: 'Direct Bank Remittance / UPI QR',
          receiptUrl: '#',
        }))
      : [
          {
            id: 'INV-2026-0891',
            date: '10 Aug 2026',
            service: 'Private Limited Company Registration',
            amount: 16499,
            tax: 2969.82,
            total: 19468.82,
            status: 'Paid',
            method: 'HDFC Bank NEFT / Direct Remittance',
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
            method: 'Official UPI QR Code',
            receiptUrl: '#',
          },
        ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE6DD] shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Billing, Invoices & Payment Ledger
            </h1>
            <span className="badge badge-gold">GST Invoicing</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Beneficiary:{' '}
            <strong className="text-slate-800">{OFFICIAL_COMPANY_NAME}</strong> • 10 Verified Bank
            Accounts &amp; Instant UPI QR
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="btn-single-moving btn-single-moving-solid py-2 px-4 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
            style={
              {
                '--c-base': '#1B365D',
                '--c-light': '#3B82F6',
                '--c-dark': '#0F172A',
              } as React.CSSProperties
            }
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pay via Bank / UPI QR</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Total Lifetime Spent',
            value: '₹21,236.46',
            sub: '3 Services Completed',
            icon: CreditCard,
            color: '#003A66',
            bg: 'rgba(0,58,102,0.08)',
          },
          {
            title: 'Current Outstanding Dues',
            value: '₹0.00',
            sub: 'All accounts clear',
            icon: CheckCircle2,
            color: '#059669',
            bg: 'rgba(5,150,105,0.08)',
          },
          {
            title: 'GST Input Credit (ITC)',
            value: '₹3,239.46',
            sub: 'Claimable in GSTR-3B',
            icon: ShieldCheck,
            color: '#7C3AED',
            bg: 'rgba(124,58,237,0.08)',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EAE6DD] shadow-xs flex flex-col justify-between"
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
                <p className="font-bold text-2xl text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Table */}
      <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#EAE6DD] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Tax Invoice History &amp; Receipts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              GST invoices are ready for input tax credit claims
            </p>
          </div>
          <span className="badge badge-navy">Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
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
                  <td className="font-mono text-xs font-bold text-[#0084D1]">{inv.id}</td>
                  <td className="text-xs text-slate-500">{inv.date}</td>
                  <td className="text-xs font-medium text-slate-800">{inv.service}</td>
                  <td className="text-xs font-mono font-bold text-slate-900">
                    ₹{inv.total.toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-green text-[10px]">{inv.status}</span>
                  </td>
                  <td className="text-right">
                    <button className="btn-outline-multicolor btn-sm text-xs cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-[#0084D1]" /> Download GST PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DirectBankPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceTitle="Outstanding Invoice / Statutory Filing"
        amount={16499}
      />
    </div>
  );
}
