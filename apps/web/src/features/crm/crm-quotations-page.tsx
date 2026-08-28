import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Send,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  Building,
  User,
  Percent,
} from 'lucide-react';

export default function CrmQuotationsPage() {
  const [clientName, setClientName] = useState('Rajesh Sharma');
  const [clientPhone, setClientPhone] = useState('+91 98765 43210');
  const [serviceName, setServiceName] = useState('Private Limited Company Registration (All-Inclusive)');
  const [basePrice, setBasePrice] = useState(16499);
  const [discount, setDiscount] = useState(1000);
  const [taxGst, setTaxGst] = useState(18);
  const [quotationSent, setQuotationSent] = useState(false);

  const subTotal = basePrice - discount;
  const gstAmount = (subTotal * taxGst) / 100;
  const totalPayable = subTotal + gstAmount;

  const pastQuotes = [
    { id: 'Q-2026-108', client: 'Rajesh Sharma', service: 'Private Limited Company Registration', total: '₹18,288.82', status: 'Accepted', date: '20 Aug 2026' },
    { id: 'Q-2026-107', client: 'Siddharth Roy', service: 'FSSAI Food License + GST Combo', total: '₹7,670.00', status: 'Sent', date: '22 Aug 2026' },
    { id: 'Q-2026-106', client: 'Kavita Sundaram', service: 'Trademark Registration (1 Class)', total: '₹8,258.82', status: 'Sent', date: '23 Aug 2026' },
  ];

  const handleSendWhatsAppQuote = () => {
    const text = `*ETAXWALA OFFICIAL QUOTATION*\n\nDear ${clientName},\nThank you for choosing ETaxwala!\n\n*Service:* ${serviceName}\n*Package Amount:* ₹${subTotal.toLocaleString()}\n*GST (18%):* ₹${gstAmount.toFixed(2)}\n*Total Payable:* ₹${totalPayable.toFixed(2)}\n\n*Inclusions:* DSC, DIN, SPICe+ MCA Government Filing, MOA & AOA, PAN & TAN, Bank Account Kit.\n\n*Payment Link:* https://etaxwala.com/pay/q-108\n\nFor queries, call 080-6902-9999.`;
    window.open(`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    setQuotationSent(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Instant Quotation & Proposal Generator
            </h1>
            <span className="badge badge-gold">3,748 DB Quotes</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create branded proposals with custom pricing, GST tax breakups & 1-click WhatsApp dispatch.
          </p>
        </div>

        <span className="badge badge-green text-xs py-1.5 px-3">
          1-Click WhatsApp Delivery
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotation Editor (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-brand-navy" />
              <span>Generate New Quotation</span>
            </h3>
            <span className="text-xs text-slate-400">Quote #Q-2026-109</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Client Full Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Client WhatsApp / Phone</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="input text-xs"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Selected Service Package</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="input text-xs font-semibold"
            >
              <option value="Private Limited Company Registration (All-Inclusive)">
                Private Limited Company Registration (All-Inclusive) — ₹16,499
              </option>
              <option value="LLP Company Registration (Limited Liability)">
                LLP Company Registration (Limited Liability) — ₹11,999
              </option>
              <option value="One Person Company (OPC) Registration">
                One Person Company (OPC) Registration — ₹12,999
              </option>
              <option value="GST Registration + 1 Year Return Filing">
                GST Registration + 1 Year Return Filing — ₹5,999
              </option>
              <option value="Trademark Registration (Class 1 to 45)">
                Trademark Registration (Class 1 to 45) — ₹6,999
              </option>
              <option value="Farmer Producer Company (FPC) Registration">
                Farmer Producer Company (FPC) Registration — ₹24,999
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Base Price (₹)</label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="input text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="input text-xs font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Applicable GST (%)</label>
              <input
                type="number"
                value={taxGst}
                onChange={(e) => setTaxGst(Number(e.target.value))}
                className="input text-xs font-mono"
              />
            </div>
          </div>

          {/* Quotation Inclusions */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-slate-200/80 space-y-2 text-xs">
            <span className="font-bold text-slate-700">Standard Package Inclusions:</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 2 Digital Signature Certificates (DSC Class 3)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 2 Director Identification Numbers (DIN)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> RUN Name Reservation & SPICe+ MCA Filing
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Company PAN, TAN & Bank Account Kit
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button className="btn btn-outline btn-sm">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={handleSendWhatsAppQuote}
              className="btn btn-sm"
              style={{ background: '#25D366', color: 'white' }}
            >
              <Send className="w-4 h-4" /> Send Quote to WhatsApp
            </button>
          </div>
        </div>

        {/* Live Proposal Summary Preview (1 Col) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand-navy to-brand-navy-dark p-6 rounded-2xl text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono text-brand-gold-light font-bold">ETAXWALA PROPOSAL</span>
                <p className="text-sm font-bold text-white mt-0.5">{clientName || 'Valued Client'}</p>
              </div>
              <span className="badge badge-gold">Official Quote</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Package Base Fee:</span>
                <span className="font-semibold text-white">₹{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-semibold">
                <span>Special Discount:</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-200 pt-2 border-t border-white/10">
                <span>Net Taxable Amount:</span>
                <span className="font-bold text-white">₹{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST ({taxGst}%):</span>
                <span className="text-white">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/20">
                <span>Total Payable:</span>
                <span className="text-brand-gold-light font-mono">₹{totalPayable.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-blue-100/70 leading-relaxed">
              ⚡ Valid for 7 days. Includes full CA consultation & government fee guarantee.
            </div>
          </div>

          {/* Past Quotes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Sent Quotations (3,748 total)
            </h4>
            <div className="space-y-2.5 text-xs">
              {pastQuotes.map((q) => (
                <div key={q.id} className="p-2.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{q.client}</p>
                    <p className="text-[10px] text-slate-400">{q.service}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700 font-bold text-xs block">{q.total}</span>
                    <span className="badge badge-green text-[10px]">{q.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
