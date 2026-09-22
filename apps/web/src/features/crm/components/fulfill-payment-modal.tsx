import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  QrCode,
  CreditCard,
  Upload,
  AlertCircle,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { DisbursementRequest } from '@etaxwala/types';
import { useAuthStore } from '@/store/auth-store';

interface FulfillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DisbursementRequest | null;
  onSuccess: (updated: DisbursementRequest) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const FulfillPaymentModal: React.FC<FulfillPaymentModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess,
}) => {
  const { staffToken } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && staffToken) {
      fetchWallet();
    }
  }, [isOpen, staffToken]);

  const fetchWallet = async () => {
    setLoadingWallet(true);
    try {
      const res = await fetch(`${API_BASE}/v1/disbursements/wallet`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setWalletBalance(Number(data.data.balance));
      }
    } catch (err) {
      console.error('Fetch wallet error:', err);
    } finally {
      setLoadingWallet(false);
    }
  };

  if (!isOpen || !request) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedProofFile(file);
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const qrImageUrl = request.qrCodeUrl?.startsWith('http')
    ? request.qrCodeUrl
    : `${API_BASE}${request.qrCodeUrl}`;

  const reqAmount = Number(request.amount);
  const isInsufficientFloat = walletBalance !== null && walletBalance < reqAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedProofFile) {
      setErrorMsg('Mandatory payment screenshot receipt is required as proof.');
      return;
    }

    if (isInsufficientFloat) {
      setErrorMsg(
        `Insufficient Float Balance! Current balance is ₹${walletBalance?.toLocaleString('en-IN')}, required is ₹${reqAmount.toLocaleString('en-IN')}. Please request Admin to Top Up.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('paymentProof', selectedProofFile);
      if (utrNumber.trim()) formData.append('utrNumber', utrNumber.trim());

      const res = await fetch(`${API_BASE}/v1/disbursements/requests/${request.id}/fulfill`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${staffToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record payment fulfillment.');
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      console.error('Fulfill error:', err);
      setErrorMsg(err.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#EAE6DD] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Signature ETaxwala Multicolor Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] shrink-0" />

        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EAE6DD] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/15 border border-emerald-400/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1B365D] tracking-tight">
                Fulfill Disbursement Payment
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pay to attached QR/UPI & attach receipt proof for Admin audit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs"
        >
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Amount & Float Balance Indicator */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Amount to Pay
              </span>
              <div className="text-xl font-black text-[#1B365D]">
                ₹{reqAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                For {request.purposeCategory}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Available Float Balance
              </span>
              <div
                className={`text-xl font-black ${isInsufficientFloat ? 'text-rose-600' : 'text-emerald-700'}`}
              >
                {loadingWallet
                  ? '...'
                  : walletBalance !== null
                    ? `₹${walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : 'N/A'}
              </div>
              {isInsufficientFloat ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.2 rounded-full mt-0.5">
                  <AlertTriangle className="w-3 h-3" /> Insufficient Float
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                  Sufficient company funds
                </span>
              )}
            </div>
          </div>

          {/* Insufficient balance warning alert */}
          {isInsufficientFloat && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Insufficient Expense Float
              </p>
              <p>
                Your accounts balance is lower than ₹{reqAmount.toLocaleString('en-IN')}. Please ask
                Admin to top up your float before fulfilling this payment.
              </p>
            </div>
          )}

          {/* Payment Destination (UPI or QR) */}
          <div className="p-4 bg-white border border-[#EAE6DD] rounded-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Staff Recipient Details
            </span>

            {request.upiId ? (
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-600 font-medium block">
                  Scan / Pay to UPI ID:
                </label>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold text-sm text-[#1B365D] select-all">
                    {request.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(request.upiId!)}
                    className="px-2.5 py-1 rounded-lg bg-[#1B365D] hover:bg-[#152a48] text-white text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy UPI
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : request.qrCodeUrl ? (
              <div className="space-y-2 text-center">
                <label className="text-[11px] text-slate-600 font-medium block text-left">
                  Scan QR Code with Phone / Banking App:
                </label>
                <div className="inline-block p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={qrImageUrl}
                    alt="Staff QR Code"
                    className="max-h-56 w-auto object-contain rounded-xl mx-auto shadow-xs cursor-pointer"
                    onClick={() => window.open(qrImageUrl, '_blank')}
                    title="Click to expand QR in new tab"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Click image to view in new tab or scan directly from screen
                </p>
              </div>
            ) : null}
          </div>

          {/* Mandatory Payment Proof Attachment */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>
                Upload Payment Screenshot Receipt <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Compulsory proof for audit
              </span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
            />

            {proofPreview ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={proofPreview}
                    alt="Proof Preview"
                    className="w-16 h-16 object-cover rounded-xl border border-emerald-300 bg-white"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-xs truncate max-w-[220px]">
                      {selectedProofFile?.name}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Payment Proof attached
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProofFile(null);
                    setProofPreview(null);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-white rounded-2xl p-5 text-center cursor-pointer transition-all space-y-1.5"
              >
                <Upload className="w-6 h-6 mx-auto text-slate-400" />
                <p className="font-bold text-slate-700 text-xs">
                  Attach screenshot from GPay / PhonePe / NetBanking
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP or PDF receipt</p>
              </div>
            )}
          </div>

          {/* UTR Number */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              UTR / Transaction Reference Number (Optional)
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 429182910248 or UPI Ref ID"
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE6DD] rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
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
            disabled={submitting || !selectedProofFile || isInsufficientFloat}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-900/15 disabled:opacity-50 flex items-center gap-2 active:scale-98 cursor-pointer"
          >
            {submitting ? 'Recording Fulfillment...' : 'Confirm & Disburse Payment'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
