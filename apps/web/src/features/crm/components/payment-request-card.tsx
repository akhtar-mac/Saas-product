import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  Eye,
} from 'lucide-react';
import { DisbursementRequest } from '@etaxwala/types';

interface PaymentRequestCardProps {
  request: DisbursementRequest;
  isSelf: boolean;
  _isSelf?: boolean;
  canFulfill: boolean;
  onFulfillClick: (req: DisbursementRequest) => void;
  onRejectClick: (req: DisbursementRequest) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  CLIENT_REGISTRATION: {
    label: 'Client Registration / MCA Fee',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  GOVT_CHALLAN: {
    label: 'Govt Challan / Advance Tax',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  STAMP_DUTY: {
    label: 'Stamp Duty & Notary',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  TRADEMARK_FEE: {
    label: 'Trademark / IP Filing Fee',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  SALARY_ADVANCE: {
    label: 'Staff Salary / Advance / Stipend',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  OFFICE_NEED: {
    label: 'Office Need & Equipment',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  UTILITY_BILL: {
    label: 'Utility & Internet Bills',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  TRAVEL_CONVEYANCE: {
    label: 'Travel & Field Conveyance',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  PANTRY_REFRESHMENT: {
    label: 'Pantry & Refreshments',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  COURIER: {
    label: 'Courier & Physical Dispatch',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  PETTY_CASH: {
    label: 'Office Petty Cash / Emergency',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  OTHER: {
    label: 'Others (Custom Need)',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
  },
};

export const PaymentRequestCard: React.FC<PaymentRequestCardProps> = ({
  request,
  _isSelf,
  canFulfill,
  onFulfillClick,
  onRejectClick,
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  const catMeta = CATEGORY_LABELS[request.purposeCategory] || {
    label: request.purposeCategory,
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const isPending = request.status === 'PENDING';
  const isPaid = request.status === 'PAID';
  const isRejected = request.status === 'REJECTED';

  const qrImageUrl = request.qrCodeUrl?.startsWith('http')
    ? request.qrCodeUrl
    : `${API_BASE}${request.qrCodeUrl}`;

  const proofImageUrl = request.paymentProofUrl?.startsWith('http')
    ? request.paymentProofUrl
    : `${API_BASE}${request.paymentProofUrl}`;

  return (
    <div className="w-full max-w-md my-2 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm overflow-hidden text-slate-800">
      {/* Signature ETaxwala Multicolor Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] shrink-0" />

      {/* Top Header Strip */}
      <div
        className={`px-4 py-2.5 flex items-center justify-between border-b ${
          isPaid
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800'
            : isRejected
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${
              isPaid
                ? 'bg-emerald-600 text-white'
                : isRejected
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-600 text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span>Disbursement Request</span>
              <span className="text-[10px] font-mono opacity-70">#{request.requestCode}</span>
            </div>
            <p className="text-[10px] opacity-75">
              Requested by {request.requesterName || 'Staff'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            isPaid
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : isRejected
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
          }`}
        >
          {isPaid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
          {request.status}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3.5 bg-gradient-to-b from-white to-[#FAF9F5]">
        {/* Amount & Purpose */}
        <div className="flex items-baseline justify-between border-b border-[#EAE6DD]/60 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Requested Amount
            </span>
            <div className="text-2xl font-black text-[#1B365D] flex items-center">
              <span className="text-base font-bold mr-1 text-slate-500">₹</span>
              {Number(request.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${catMeta.color}`}
            >
              {catMeta.label}
            </span>
            {request.clientRef && (
              <p className="text-[11px] font-medium text-slate-500 mt-1 truncate max-w-[180px]">
                Ref: {request.clientRef}
              </p>
            )}
          </div>
        </div>

        {/* Purpose Description */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-700">
          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
            Operational Purpose:
          </span>
          <p className="leading-relaxed">{request.purposeDescription}</p>
        </div>

        {/* Payment Destination (UPI ID or QR Code) */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Payment Destination
          </span>

          <div className="flex items-center justify-between gap-2">
            {request.upiId ? (
              <div className="flex-1 flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-xs text-[#1B365D] select-all">
                  {request.upiId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(request.upiId!)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-[11px] font-medium"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            ) : request.qrCodeUrl ? (
              <div className="flex-1 flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-bold text-slate-700">Attached QR Code</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="px-2 py-1 rounded bg-[#1B365D] hover:bg-[#152a48] text-white text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View / Scan QR
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No direct UPI/QR specified</span>
            )}
          </div>
        </div>

        {/* Paid Outcome Display */}
        {isPaid && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Fulfilled
              </span>
              <span className="text-[10px] font-normal text-emerald-700">
                {request.paidAt
                  ? new Date(request.paidAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Paid'}
              </span>
            </div>

            {request.utrNumber && (
              <div className="text-[11px] text-emerald-800 flex items-center gap-1">
                <span className="font-semibold">Bank UTR / Txn:</span>
                <span className="font-mono select-all bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold">
                  {request.utrNumber}
                </span>
              </div>
            )}

            {request.paymentProofUrl && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-emerald-800 font-medium">
                  Payment Screenshot Proof:
                </span>
                <button
                  type="button"
                  onClick={() => setShowProofModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Eye className="w-3 h-3" /> View Proof
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rejected Reason Display */}
        {isRejected && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
            <div className="flex items-center gap-1.5 font-bold">
              <XCircle className="w-4 h-4 text-rose-600" /> Declined by Accounts
            </div>
            {request.rejectionReason && (
              <p className="text-[11px] text-rose-700 italic">"{request.rejectionReason}"</p>
            )}
          </div>
        )}

        {/* Action Controls for Accounts Officer / Admin when Pending */}
        {isPending && canFulfill && (
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFulfillClick(request)}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay & Attach Proof
            </button>
            <button
              type="button"
              onClick={() => onRejectClick(request)}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs transition-all border border-slate-200"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* QR Code Lightbox Modal */}
      {showQrModal && request.qrCodeUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#7C3AED]" /> Scan to Pay
              </h4>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block mx-auto">
              <img
                src={qrImageUrl}
                alt="Payment QR Code"
                className="max-h-72 w-auto object-contain rounded-lg shadow-xs"
              />
            </div>
            <div className="text-xs text-slate-500">
              Amount to Pay:{' '}
              <span className="font-bold text-[#1B365D] text-sm">
                ₹{Number(request.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Proof Lightbox Modal */}
      {showProofModal && request.paymentProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Receipt Proof
                </h4>
                <p className="text-[11px] text-slate-400">
                  Request #{request.requestCode} • ₹{Number(request.amount).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-2 flex items-center justify-center overflow-hidden">
              <img
                src={proofImageUrl}
                alt="Payment Receipt Proof"
                className="max-h-[65vh] w-auto object-contain rounded-lg cursor-pointer"
                onClick={() => window.open(proofImageUrl, '_blank')}
                title="Click to open full size in new tab"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                UTR:{' '}
                <span className="font-mono font-bold text-slate-800">
                  {request.utrNumber || 'N/A'}
                </span>
              </span>
              <a
                href={proofImageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#0084D1] font-bold flex items-center gap-1 hover:underline"
              >
                Open Full Size <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
