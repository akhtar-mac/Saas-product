import React, { useState } from 'react';
import { X, Copy, Check, Building2, QrCode, CreditCard, Receipt, CheckCircle2 } from 'lucide-react';
import {
  OFFICIAL_COMPANY_NAME,
  OFFICIAL_UPI_DETAILS,
  OFFICIAL_BANK_ACCOUNTS,
  BankAccount,
} from '@/lib/constants/banking';

interface DirectBankPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle?: string;
  amount?: number;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
}

export default function DirectBankPaymentModal({
  isOpen,
  onClose,
  serviceTitle = 'Professional Statutory Filing',
  amount = 16499,
  orderId = 'ETW-ORD-' + Math.floor(1000 + Math.random() * 9000),
  customerName = '',
  customerPhone: _customerPhone = '',
}: DirectBankPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'upi' | 'banks'>('upi');
  const [selectedBank, setSelectedBank] = useState<BankAccount>(OFFICIAL_BANK_ACCOUNTS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // UTR Form state
  const [utrNumber, setUtrNumber] = useState('');
  const [depositorName, setDepositorName] = useState(customerName || '');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const upiIntentUrl = `upi://pay?pa=${OFFICIAL_UPI_DETAILS.primaryUpiId}&pn=${encodeURIComponent(
    OFFICIAL_COMPANY_NAME
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderId)}`;

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter your Bank UTR or Transaction Reference number.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#EAE6DD] animate-scale-in my-auto">
        {/* Signature Top Multicolor Strip */}
        <div className="h-1 bg-multicolor" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#EAE6DD] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1B365D] flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#1B365D] tracking-tight">
                Official Payment Gateway — Direct Bank & UPI
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">{OFFICIAL_COMPANY_NAME}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900">
                Payment Submitted for Instant Recon!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Thank you! We received your UTR reference{' '}
                <span className="font-mono font-bold text-slate-800">{utrNumber}</span> for{' '}
                <span className="font-semibold text-slate-800">{serviceTitle}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] text-xs text-slate-700 max-w-sm mx-auto text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-[#1B365D]">
                  ₹{amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-semibold">{OFFICIAL_COMPANY_NAME}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={`https://wa.me/917071070707?text=${encodeURIComponent(
                  `Hello ETaxwala Accounts, I have made payment of ₹${amount} for Order ${orderId}. UTR: ${utrNumber}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-single-moving btn-single-moving-solid py-2 px-5 rounded-full text-xs font-bold text-white cursor-pointer"
                style={
                  {
                    '--c-base': '#10B981',
                    '--c-light': '#6EE7B7',
                    '--c-dark': '#047857',
                  } as React.CSSProperties
                }
              >
                <span>Notify Accounts on WhatsApp</span>
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Payment Interface */
          <div className="p-4 sm:p-6 space-y-5">
            {/* Amount Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD]">
              <div>
                <span className="text-[11px] text-slate-500 block">Payable For</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">{serviceTitle}</span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Total Net Amount</span>
                <span className="text-lg sm:text-xl font-mono font-extrabold text-[#1B365D]">
                  ₹{amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'upi'
                    ? 'bg-white text-[#1B365D] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant UPI & QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('banks')}
                className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'banks'
                    ? 'bg-white text-[#1B365D] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>10 Official Bank Accounts</span>
              </button>
            </div>

            {/* Tab 1: UPI & QR Code */}
            {activeTab === 'upi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE6DD]">
                {/* Visual QR Code Card */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
                  <div className="relative p-2 rounded-xl bg-white border border-slate-300">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        upiIntentUrl
                      )}&margin=1`}
                      alt="ETaxwala Official Payment QR"
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center">
                        <span className="text-[9px] font-extrabold text-[#1B365D]">ETW</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-2">
                    Scan with GPay, PhonePe, Paytm, BHIM, Cred
                  </p>
                </div>

                {/* UPI Details & Copy */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Primary UPI ID
                    </label>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-2 px-3">
                      <span className="font-mono text-xs font-bold text-slate-800 flex-1">
                        {OFFICIAL_UPI_DETAILS.primaryUpiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(OFFICIAL_UPI_DETAILS.primaryUpiId, 'upi1')}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedKey === 'upi1' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Secondary HDFC UPI ID
                    </label>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-2 px-3">
                      <span className="font-mono text-xs font-bold text-slate-800 flex-1">
                        {OFFICIAL_UPI_DETAILS.secondaryUpiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(OFFICIAL_UPI_DETAILS.secondaryUpiId, 'upi2')}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedKey === 'upi2' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900">
                    <span className="font-bold">Verified Corporate Name:</span>{' '}
                    <span>{OFFICIAL_COMPANY_NAME}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: 10 Official Bank Accounts */}
            {activeTab === 'banks' && (
              <div className="space-y-3">
                {/* Horizontal Bank Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {OFFICIAL_BANK_ACCOUNTS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedBank.id === b.id
                          ? 'bg-[#1B365D] text-white shadow-xs'
                          : 'bg-[#FAF9F5] border border-[#EAE6DD] text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      {b.bankName.replace(' Ltd', '')}
                    </button>
                  ))}
                </div>

                {/* Selected Bank Details Card */}
                <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-2">
                    <span className="font-extrabold text-[#1B365D] text-sm flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      {selectedBank.bankName}
                    </span>
                    <span className="badge badge-navy text-[10px]">{selectedBank.accountType}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Beneficiary Name
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {selectedBank.accountName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Current Account Number
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {selectedBank.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedBank.accountNumber, 'acct')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
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

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        IFSC Code
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {selectedBank.ifsc}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedBank.ifsc, 'ifsc')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
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

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Branch & Location
                      </span>
                      <span className="text-slate-600 text-[11px]">{selectedBank.branch}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Proof Submission */}
            <form onSubmit={handleSubmitProof} className="space-y-3 pt-2 border-t border-[#EAE6DD]">
              <div className="flex items-center justify-between">
                <h5 className="font-extrabold text-xs text-[#1B365D] uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-600" />
                  <span>Step 2: Enter UTR &amp; Payment Proof</span>
                </h5>
                <span className="text-[10px] text-slate-400">Instant Automated Match</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bank UTR / Transaction Reference No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 424819284712 or UPI Ref"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full text-xs font-mono bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sender / Remitter Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name as per bank account"
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                  />
                </div>
              </div>

              {/* Upload Screenshot */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Upload Payment Screenshot / Receipt (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setScreenshotFile(e.target.files[0]);
                    }}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-white hover:file:bg-slate-50"
                  />
                  {screenshotFile && (
                    <span className="text-[11px] text-emerald-600 font-semibold truncate">
                      ✓ {screenshotFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-single-moving btn-single-moving-solid py-2 px-6 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#1B365D',
                      '--c-light': '#3B82F6',
                      '--c-dark': '#0F172A',
                    } as React.CSSProperties
                  }
                >
                  <span>Verify &amp; Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
