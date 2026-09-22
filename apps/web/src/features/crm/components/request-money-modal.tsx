import React, { useState, useRef } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  AlertCircle,
  Upload,
  Check,
  Sparkles,
  FileText,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface RequestMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: number | null;
  onSuccess: (newRequest: any) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CATEGORIES = [
  { value: 'CLIENT_REGISTRATION', label: 'Client Registration Fee (MCA / ROC / Govt)' },
  { value: 'GOVT_CHALLAN', label: 'Government Challan / Advance Tax' },
  { value: 'STAMP_DUTY', label: 'Stamp Duty & Legal Notary Charges' },
  { value: 'TRADEMARK_FEE', label: 'Trademark & IP Filing Govt Fee' },
  { value: 'SALARY_ADVANCE', label: 'Staff Salary / Advance / Stipend' },
  { value: 'OFFICE_NEED', label: 'Office Need & Equipment (Stationery, Hardware, Repairs)' },
  { value: 'UTILITY_BILL', label: 'Utility & Internet Bills (Wi-Fi, Phone, Electricity)' },
  { value: 'TRAVEL_CONVEYANCE', label: 'Travel & Field Conveyance (Fuel, Cab, Client Visit)' },
  { value: 'PANTRY_REFRESHMENT', label: 'Pantry, Tea & Refreshments' },
  { value: 'COURIER', label: 'Courier & Physical Document Dispatch' },
  { value: 'PETTY_CASH', label: 'Office Petty Cash / Urgent Operations' },
  { value: 'OTHER', label: 'Others (Specify custom operational need)' },
];

export const RequestMoneyModal: React.FC<RequestMoneyModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  onSuccess,
}) => {
  const { staffToken } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [clientRef, setClientRef] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'qr'>('qr');
  const [upiId, setUpiId] = useState('');
  const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedQrFile(file);
      const reader = new FileReader();
      reader.onload = () => setQrPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid positive payment amount.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter the reason or operational description.');
      return;
    }

    if (paymentMode === 'upi' && !upiId.trim()) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@icici).');
      return;
    }

    if (paymentMode === 'qr' && !selectedQrFile) {
      setErrorMsg('Please attach/upload a QR code image to scan.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('amount', parsedAmount.toString());
      formData.append('purposeCategory', category);
      formData.append('purposeDescription', description.trim());
      if (clientRef.trim()) formData.append('clientRef', clientRef.trim());
      if (conversationId) formData.append('conversationId', conversationId.toString());

      if (paymentMode === 'upi') {
        formData.append('upiId', upiId.trim());
      } else if (selectedQrFile) {
        formData.append('qrCode', selectedQrFile);
      }

      const res = await fetch(`${API_BASE}/v1/disbursements/requests`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${staffToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit payment request.');
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      console.error('Request payment error:', err);
      setErrorMsg(err.message || 'Network error occurred while submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#EAE6DD] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Signature ETaxwala Multicolor Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EAE6DD] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B365D] via-[#1B365D] to-[#0084D1] text-white flex items-center justify-center shadow-md shadow-blue-900/15 border border-blue-400/20">
              <CreditCard className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1B365D] tracking-tight">
                Request Payment from Accounts
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Submit operational, salary, or client fees for instant Accounts fulfillment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FFFDF9]/60 text-slate-800 text-xs"
        >
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1.5">
                Amount Required (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-blue-50 text-[#0084D1] font-black text-xs flex items-center justify-center border border-blue-200/60">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  required
                  className="w-full pl-11 pr-3.5 py-2.5 bg-white border border-[#EAE6DD] hover:border-[#0084D1]/40 focus:border-[#0084D1] focus:ring-4 focus:ring-[#0084D1]/10 rounded-xl font-bold text-sm text-[#1B365D] shadow-2xs transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1.5">
                Fee Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-white border border-[#EAE6DD] hover:border-[#0084D1]/40 focus:border-[#0084D1] focus:ring-4 focus:ring-[#0084D1]/10 rounded-xl font-semibold text-xs text-slate-800 shadow-2xs transition-all outline-none appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1.5">
              Reference / Case / Invoice No.{' '}
              <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={clientRef}
              onChange={(e) => setClientRef(e.target.value)}
              placeholder={
                category === 'SALARY_ADVANCE'
                  ? 'e.g. Employee Name / Staff ID / Month'
                  : category === 'OFFICE_NEED' || category === 'UTILITY_BILL'
                    ? 'e.g. Vendor Name / Bill Account No / Office Equipment'
                    : category === 'OTHER'
                      ? 'e.g. Purpose tag / Department / Bill Ref'
                      : 'e.g. Ramesh Patel - Pvt Ltd Registration (WON-1092)'
              }
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE6DD] hover:border-[#0084D1]/40 focus:border-[#0084D1] focus:ring-4 focus:ring-[#0084D1]/10 rounded-xl font-medium text-xs text-slate-800 shadow-2xs transition-all outline-none"
            />
          </div>

          {/* Payment Method Switcher */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block">
              Payment Destination <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#F5F3EC] p-1.5 rounded-2xl border border-[#EAE6DD]">
              <button
                type="button"
                onClick={() => setPaymentMode('qr')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMode === 'qr'
                    ? 'bg-white text-[#1B365D] shadow-xs border border-[#EAE6DD]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#0084D1]" />
                <span>Upload QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMode === 'upi'
                    ? 'bg-white text-[#1B365D] shadow-xs border border-[#EAE6DD]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#7C3AED]" />
                <span>Enter UPI ID</span>
              </button>
            </div>

            {paymentMode === 'upi' ? (
              <div className="pt-1">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. merchant@icici or 9876543210@paytm"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE6DD] hover:border-[#0084D1]/40 focus:border-[#0084D1] focus:ring-4 focus:ring-[#0084D1]/10 rounded-xl font-mono text-xs text-[#1B365D] shadow-2xs transition-all outline-none"
                />
              </div>
            ) : (
              <div className="pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                />

                {qrPreview ? (
                  <div className="p-3 bg-white border border-emerald-200 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={qrPreview}
                          alt="QR Preview"
                          className="w-13 h-13 object-contain rounded-xl border border-slate-200 bg-white p-1"
                        />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs truncate max-w-[200px]">
                          {selectedQrFile?.name}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> QR ready to scan
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQrFile(null);
                        setQrPreview(null);
                      }}
                      className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove QR"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-200/80 hover:border-[#0084D1] bg-gradient-to-b from-[#FAF9F5] to-white hover:bg-blue-50/20 rounded-2xl p-5 text-center cursor-pointer transition-all hover:shadow-2xs group space-y-1.5"
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-200/60 text-[#0084D1] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                      <Upload className="w-5 h-5 text-[#0084D1]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs group-hover:text-[#0084D1] transition-colors">
                        Click to upload Payment QR Code screenshot
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, or WEBP up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Operational Description */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1.5">
              Reason / Operational Purpose <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                category === 'OTHER'
                  ? 'Please clearly describe the reason/need for this money request so Accounts can verify and pay...'
                  : category === 'SALARY_ADVANCE'
                    ? 'e.g. Monthly salary advance / stipend disbursement for staff member...'
                    : category === 'OFFICE_NEED'
                      ? 'e.g. Purchase of office stationery, equipment replacement, or hardware repairs...'
                      : category === 'UTILITY_BILL'
                        ? 'e.g. Broadband internet / electricity bill payment for office premises...'
                        : category === 'TRAVEL_CONVEYANCE'
                          ? 'e.g. Travel fare / cab / fuel reimbursement for client visit...'
                          : category === 'PANTRY_REFRESHMENT'
                            ? 'e.g. Office tea, snacks, and drinking water refills...'
                            : 'e.g. Need ₹1,500 MCA fee challan payment for instant incorporation certificate generation...'
              }
              required
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE6DD] hover:border-[#0084D1]/40 focus:border-[#0084D1] focus:ring-4 focus:ring-[#0084D1]/10 rounded-xl text-xs text-slate-800 shadow-2xs transition-all outline-none resize-none"
            />
          </div>

          {/* Audit Note */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-[#FAF9F5] to-indigo-50/50 border border-blue-200/60 rounded-2xl flex items-start gap-2.5 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-[#0084D1] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              <strong className="text-[#1B365D] font-bold">Admin Audit Protocol:</strong> All money
              requests are audited by Admin. The Accounts Officer will fulfill the payment to your
              attached QR/UPI and upload the bank receipt proof.
            </p>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#EAE6DD] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1B365D] via-[#0084D1] to-[#0084D1] hover:from-[#142845] hover:to-[#0074b8] text-white font-extrabold text-xs transition-all shadow-md shadow-blue-900/15 disabled:opacity-50 flex items-center gap-2 active:scale-98 cursor-pointer"
          >
            {submitting ? 'Submitting Request...' : 'Submit Request'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
