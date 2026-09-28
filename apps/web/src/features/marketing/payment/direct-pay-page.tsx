import React, { useState } from 'react';
import {
  Building2,
  QrCode,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Receipt,
  HelpCircle,
  Phone,
  ArrowRight,
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import {
  OFFICIAL_COMPANY_NAME,
  OFFICIAL_UPI_DETAILS,
  OFFICIAL_BANK_ACCOUNTS,
  BankAccount,
} from '@/lib/constants/banking';

export default function DirectPayPage() {
  const [selectedBank, setSelectedBank] = useState<BankAccount>(OFFICIAL_BANK_ACCOUNTS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states
  const [amountInput, setAmountInput] = useState('16499');
  const [serviceName, setServiceName] = useState('Private Limited Company Registration');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentAmount = parseFloat(amountInput) || 0;
  const upiIntentUrl = `upi://pay?pa=${OFFICIAL_UPI_DETAILS.primaryUpiId}&pn=${encodeURIComponent(
    OFFICIAL_COMPANY_NAME
  )}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(serviceName)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please provide the Bank UTR / Transaction Reference Number.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title={`Official Bank Accounts & UPI Payment | ${OFFICIAL_COMPANY_NAME}`}
        description={`Direct Bank Remittance (NEFT, RTGS, IMPS) and Instant UPI QR payment details for ${OFFICIAL_COMPANY_NAME}. Verified 10 corporate bank accounts.`}
        url="/pay"
      />

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="container-etaxwala relative">
          <Breadcrumbs
            items={[
              { label: 'Direct Payment & Bank Transfer', href: '/pay' },
            ]}
          />

          <div className="max-w-3xl mt-4 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">Official Beneficiary Verification</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Direct Bank Remittance &amp; Official UPI QR
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              All client payments for professional services and statutory filings are received directly in the verified corporate current accounts of <strong className="text-slate-900">{OFFICIAL_COMPANY_NAME}</strong>. Select your preferred bank or scan via any UPI app.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="container-etaxwala">
          {submitted ? (
            <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#FAF9F5] border border-[#EAE6DD] text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Payment Proof Received!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We have registered your transaction reference <strong className="font-mono text-slate-900">{utrNumber}</strong> for <strong className="text-slate-900">{serviceName}</strong> (₹{currentAmount.toLocaleString()}).
              </p>
              <p className="text-xs text-slate-500">
                Our finance team will reconcile your remittance within 15–30 minutes and deliver your official GST Tax Invoice.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href={`https://wa.me/917071070707?text=${encodeURIComponent(
                    `Hello ETaxwala Accounts, I made payment of ₹${currentAmount} for ${serviceName}. UTR: ${utrNumber}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-single-moving btn-single-moving-solid py-2.5 px-6 rounded-full text-xs font-bold text-white cursor-pointer"
                  style={
                    {
                      '--c-base': '#10B981',
                      '--c-light': '#6EE7B7',
                      '--c-dark': '#047857',
                    } as React.CSSProperties
                  }
                >
                  <span>Share UTR on WhatsApp</span>
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
                >
                  Make Another Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Instant UPI QR Card & Bank Accounts (8 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* UPI QR Banner Card */}
                <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EAE6DD] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-3">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <h3 className="font-extrabold text-base text-[#1B365D]">Instant UPI QR Code</h3>
                    </div>
                    <span className="badge badge-navy text-[10px]">Zero Convenience Fee</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Visual QR code */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0 flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          upiIntentUrl
                        )}&margin=1`}
                        alt="ETaxwala Payment QR"
                        className="w-44 h-44 object-contain rounded-lg"
                      />
                      <span className="text-[10px] font-bold text-slate-500 mt-2">
                        GPay • PhonePe • Paytm • BHIM
                      </span>
                    </div>

                    {/* Quick UPI Details */}
                    <div className="space-y-3 flex-1 w-full">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Primary Corporate UPI ID
                        </span>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 px-3">
                          <span className="font-mono text-xs font-bold text-slate-800 flex-1 truncate">
                            {OFFICIAL_UPI_DETAILS.primaryUpiId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(OFFICIAL_UPI_DETAILS.primaryUpiId, 'upi1')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="Copy UPI ID"
                          >
                            {copiedKey === 'upi1' ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Secondary HDFC UPI ID
                        </span>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 px-3">
                          <span className="font-mono text-xs font-bold text-slate-800 flex-1 truncate">
                            {OFFICIAL_UPI_DETAILS.secondaryUpiId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(OFFICIAL_UPI_DETAILS.secondaryUpiId, 'upi2')}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="Copy UPI ID"
                          >
                            {copiedKey === 'upi2' ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-snug">
                        <span className="font-bold">Beneficiary:</span> {OFFICIAL_COMPANY_NAME}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10 Verified Bank Accounts Suite */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-extrabold text-base text-slate-900">
                        10 Verified Bank Accounts (NEFT / RTGS / IMPS)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Select your bank:</span>
                  </div>

                  {/* Horizontal Scrollable Bank Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {OFFICIAL_BANK_ACCOUNTS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedBank.id === bank.id
                            ? 'bg-[#1B365D] text-white shadow-xs'
                            : 'bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {bank.bankName.replace(' Ltd', '')}
                      </button>
                    ))}
                  </div>

                  {/* Selected Bank Details Card */}
                  <div className="p-5 rounded-3xl bg-[#FAF9F5] border border-[#EAE6DD] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-3">
                      <div>
                        <h4 className="font-extrabold text-base text-[#1B365D]">{selectedBank.bankName}</h4>
                        <p className="text-[11px] text-slate-500">{selectedBank.accountType}</p>
                      </div>
                      {selectedBank.badge && (
                        <span className="badge badge-green text-[10px]">{selectedBank.badge}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Account Beneficiary Name
                        </span>
                        <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                          {selectedBank.accountName}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Current Account Number
                        </span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-extrabold text-slate-900 text-sm">
                            {selectedBank.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedBank.accountNumber, 'acct')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                            title="Copy Account Number"
                          >
                            {copiedKey === 'acct' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          IFSC Code
                        </span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {selectedBank.ifsc}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedBank.ifsc, 'ifsc')}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                            title="Copy IFSC"
                          >
                            {copiedKey === 'ifsc' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Branch &amp; City
                        </span>
                        <span className="text-slate-700 text-xs mt-0.5 block">
                          {selectedBank.branch}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Step 2 UTR & Proof Submission Form (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-3xl p-6 shadow-2xs space-y-5 sticky top-24">
                  <div className="border-b border-[#EAE6DD] pb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-blue-600" />
                      <h3 className="font-extrabold text-base text-[#1B365D]">
                        Submit Payment Reference (UTR)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Enter your bank UTR or UPI reference for immediate reconciliation and receipt.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Service or Order Name
                      </label>
                      <input
                        type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Amount Paid (₹)
                        </label>
                        <input
                          type="number"
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                          className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 9822011223"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Remitter / Client Name
                      </label>
                      <input
                        type="text"
                        placeholder="Name as per bank account"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Bank UTR / Transaction Reference <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 424819284712 (12-digit UTR)"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 font-mono font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Payment Screenshot (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setScreenshotFile(e.target.files[0]);
                        }}
                        className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-white hover:file:bg-slate-50 w-full"
                      />
                      {screenshotFile && (
                        <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                          ✓ File selected: {screenshotFile.name}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn-single-moving btn-single-moving-solid w-full py-3 rounded-full text-xs font-extrabold text-white shadow-xs cursor-pointer mt-2"
                      style={
                        {
                          '--c-base': '#1B365D',
                          '--c-light': '#3B82F6',
                          '--c-dark': '#0F172A',
                        } as React.CSSProperties
                      }
                    >
                      <span>Submit Payment Proof</span>
                    </button>

                    <p className="text-[10px] text-slate-400 text-center">
                      🔒 Official Corporate Gateway • GST Invoice Emailed Upon Reconciliation
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
