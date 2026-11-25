import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  IndianRupee,
  Loader2,
  Plus,
  Upload,
  X,
} from 'lucide-react';

export interface EmiScheduleItem {
  id: number | null;
  installment_no: number;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string | null;
  due_date_iso: string | null;
  status: 'pending' | 'partial' | 'paid';
  note: string | null;
  source: 'table' | 'legacy';
}

export interface EmiPaymentItem {
  cd_id: number;
  emi_id: number;
  customer_id: number;
  paid_amount: number;
  unpaid_amount: number;
  payment_screenshot: string;
  proof_url: string | null;
  proof_type: 'image' | 'pdf' | null;
  added_by: number | null;
  added_by_name: string;
  is_approve: number;
  payment_date: string | null;
  recorded_at: string | null;
  payment_mode: string | null;
  payment_reference: string | null;
  comment: string | null;
  installment_no: number | null;
}

export interface ServicePricePayload {
  schema_ready?: boolean;
  can_collect?: boolean;
  summary: any;
  emis: any[];
  schedule?: EmiScheduleItem[];
  payments?: EmiPaymentItem[];
}

interface EmiServicePricePanelProps {
  customer: {
    id: number;
    orderId?: number | null;
    name: string;
    service: string;
    category: string;
    cp_type: number;
    total: number;
    paid: number;
    unpaid: number;
    dueDate: string;
  };
  detailsPrice: ServicePricePayload | null;
  apiBase: string;
  canManageEmi: boolean;
  formatDisplayDate: (value: unknown) => string;
  onRefresh: () => Promise<void>;
  onToast: (type: 'success' | 'error', text: string) => void;
}

const PAYMENT_MODES = ['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'Card', 'Razorpay', 'Other'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/pjpeg', 'image/png', 'application/pdf']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

function getTodayIso(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getDefaultDueIso(daysAhead = 30): string {
  const dt = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dt);
}

function isPastDue(dueIso: string | null): boolean {
  if (!dueIso) return false;
  return dueIso < getTodayIso();
}

function AuthProofViewer({
  apiBase,
  proofUrl,
  proofType,
  filename,
  onPreviewImage,
}: {
  apiBase: string;
  proofUrl: string;
  proofType: 'image' | 'pdf' | null;
  filename: string;
  onPreviewImage: (blobUrl: string, title: string) => void;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let localUrl: string | null = null;
    setLoading(true);
    setFailed(false);

    fetch(`${apiBase}${proofUrl}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        localUrl = URL.createObjectURL(blob);
        setBlobUrl(localUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [apiBase, proofUrl]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading proof...
      </span>
    );
  }

  if (failed || !blobUrl) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
        title={filename}
      >
        <FileText className="w-3 h-3 text-slate-400" />
        <span className="max-w-[140px] truncate">{filename}</span>
      </span>
    );
  }

  if (proofType === 'pdf') {
    return (
      <a
        href={blobUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-[11px] font-semibold transition-colors whitespace-nowrap"
      >
        <FileText className="w-3.5 h-3.5" />
        View PDF
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPreviewImage(blobUrl, filename)}
      className="group inline-flex items-center gap-2 p-1 pr-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-colors text-left"
      title="Click to view full payment proof"
    >
      <img
        src={blobUrl}
        alt="Payment proof"
        className="w-9 h-9 rounded object-cover border border-slate-200 bg-white"
      />
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 group-hover:text-sky-700 whitespace-nowrap">
        <Eye className="w-3 h-3" />
        View Proof
      </span>
    </button>
  );
}

export default function EmiServicePricePanel({
  customer,
  detailsPrice,
  apiBase,
  canManageEmi,
  formatDisplayDate,
  onRefresh,
  onToast,
}: EmiServicePricePanelProps) {
  const s = detailsPrice?.summary;
  const totalAmt = Number(s?.total_amount ?? customer.total ?? 0);
  const paidAmt = Number(s?.paid_amount ?? customer.paid ?? 0);
  const unpaidAmt = Math.max(
    s?.unpaid_amount != null ? Number(s.unpaid_amount) : totalAmt - paidAmt,
    0
  );
  const emiId = s?.primary_emi_id ? Number(s.primary_emi_id) : null;
  const orderId = s?.order_id ? Number(s.order_id) : customer.orderId || null;
  const schedule: EmiScheduleItem[] = detailsPrice?.schedule || [];
  const payments: EmiPaymentItem[] = detailsPrice?.payments || [];
  const scheduledUnpaidTotal =
    s?.scheduled_unpaid_total != null
      ? Number(s.scheduled_unpaid_total)
      : schedule.reduce((acc, item) => acc + Number(item.remaining_amount || 0), 0);
  const unscheduledAmt =
    s?.unscheduled_amount != null
      ? Number(s.unscheduled_amount)
      : Math.max(unpaidAmt - scheduledUnpaidTotal, 0);
  const nextInstallmentNo = Number(s?.next_installment_no || Math.max(schedule.length + 2, 2));
  const nextDue = s?.next_due_installment || null;
  const allowCollect = canManageEmi && (detailsPrice?.can_collect ?? true);
  const schemaReady = detailsPrice?.schema_ready !== false;

  const [activeForm, setActiveForm] = useState<'none' | 'collect' | 'schedule'>('none');

  // Collect EMI form state
  const [collectAmount, setCollectAmount] = useState('');
  const [collectDate, setCollectDate] = useState(getTodayIso());
  const [collectMode, setCollectMode] = useState('UPI');
  const [collectRef, setCollectRef] = useState('');
  const [collectComment, setCollectComment] = useState('');
  const [collectFile, setCollectFile] = useState<File | null>(null);
  const [collectFilePreview, setCollectFilePreview] = useState<string | null>(null);
  const [collectError, setCollectError] = useState<string | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  // Schedule EMI form state
  const [editInstallmentNo, setEditInstallmentNo] = useState<number | null>(null);
  const [scheduleAmount, setScheduleAmount] = useState('');
  const [scheduleDueDate, setScheduleDueDate] = useState(getDefaultDueIso(30));
  const [scheduleNote, setScheduleNote] = useState('');
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Lightbox preview for payment proof images
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    return () => {
      if (collectFilePreview) URL.revokeObjectURL(collectFilePreview);
    };
  }, [collectFilePreview]);

  const openCollectForm = (defaultAmount?: number) => {
    const suggested =
      defaultAmount && defaultAmount > 0
        ? Math.min(defaultAmount, unpaidAmt)
        : nextDue?.remaining_amount && nextDue.remaining_amount > 0
          ? Math.min(Number(nextDue.remaining_amount), unpaidAmt)
          : unpaidAmt;
    setCollectAmount(suggested > 0 ? String(suggested) : '');
    setCollectDate(getTodayIso());
    setCollectMode('UPI');
    setCollectRef('');
    setCollectComment('');
    if (collectFilePreview) URL.revokeObjectURL(collectFilePreview);
    setCollectFile(null);
    setCollectFilePreview(null);
    setCollectError(null);
    setActiveForm('collect');
  };

  const openScheduleForm = (editItem?: EmiScheduleItem) => {
    if (editItem) {
      setEditInstallmentNo(editItem.installment_no);
      setScheduleAmount(String(editItem.amount));
      setScheduleDueDate(editItem.due_date_iso || getDefaultDueIso(30));
      setScheduleNote(editItem.note || '');
    } else {
      setEditInstallmentNo(null);
      setScheduleAmount(unscheduledAmt > 0 ? String(unscheduledAmt) : '');
      const lastDueIso = schedule[schedule.length - 1]?.due_date_iso;
      if (lastDueIso) {
        const dt = new Date(`${lastDueIso}T00:00:00Z`);
        dt.setUTCDate(dt.getUTCDate() + 30);
        setScheduleDueDate(dt.toISOString().slice(0, 10));
      } else {
        setScheduleDueDate(getDefaultDueIso(30));
      }
      setScheduleNote('');
    }
    setScheduleError(null);
    setActiveForm('schedule');
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (collectFilePreview) {
      URL.revokeObjectURL(collectFilePreview);
      setCollectFilePreview(null);
    }
    if (!file) {
      setCollectFile(null);
      setCollectError(null);
      return;
    }
    const ext = file.name.includes('.') ? `.${file.name.split('.').pop()!.toLowerCase()}` : '';
    if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.type.toLowerCase())) {
      setCollectFile(null);
      setCollectError('Invalid proof file. Only JPG, PNG, or PDF files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setCollectFile(null);
      setCollectError('Proof file exceeds the 5 MB limit.');
      return;
    }
    setCollectError(null);
    setCollectFile(file);
    if (file.type.startsWith('image/')) {
      setCollectFilePreview(URL.createObjectURL(file));
    }
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(collectAmount);
    if (!Number.isFinite(amt) || amt <= 0 || !Number.isInteger(amt)) {
      setCollectError('Please enter a valid whole rupee amount greater than 0.');
      return;
    }
    if (amt > unpaidAmt) {
      setCollectError(
        `Amount (₹${amt.toLocaleString('en-IN')}) cannot exceed unpaid balance (₹${unpaidAmt.toLocaleString('en-IN')}).`
      );
      return;
    }
    if (!collectDate) {
      setCollectError('Please select the payment date.');
      return;
    }

    setIsCollecting(true);
    setCollectError(null);
    try {
      const formData = new FormData();
      formData.append('amount', String(amt));
      formData.append('payment_date', collectDate);
      formData.append('payment_mode', collectMode);
      if (collectRef.trim()) formData.append('payment_reference', collectRef.trim());
      if (collectComment.trim()) formData.append('comment', collectComment.trim());
      if (emiId) formData.append('emi_id', String(emiId));
      if (orderId) formData.append('order_id', String(orderId));
      if (collectFile) formData.append('proof', collectFile);

      const res = await fetch(`${apiBase}/v1/crm/customers/${customer.id}/emi/collect`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setCollectError(data?.error || 'Failed to record EMI payment.');
        return;
      }

      setActiveForm('none');
      if (collectFilePreview) URL.revokeObjectURL(collectFilePreview);
      setCollectFile(null);
      setCollectFilePreview(null);
      onToast('success', data.message || 'EMI payment recorded successfully.');
      await onRefresh();
    } catch {
      setCollectError('Network error while recording payment.');
    } finally {
      setIsCollecting(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(scheduleAmount);
    if (!Number.isFinite(amt) || amt <= 0 || !Number.isInteger(amt)) {
      setScheduleError('Please enter a valid whole rupee amount greater than 0.');
      return;
    }
    if (editInstallmentNo === null && amt > unscheduledAmt) {
      setScheduleError(
        `Amount (₹${amt.toLocaleString('en-IN')}) cannot exceed unscheduled balance (₹${unscheduledAmt.toLocaleString('en-IN')}).`
      );
      return;
    }
    if (editInstallmentNo !== null) {
      const target = schedule.find((i) => i.installment_no === editInstallmentNo);
      const alreadyPaid = Number(target?.paid_amount || 0);
      const otherRem = schedule
        .filter((i) => i.installment_no !== editInstallmentNo)
        .reduce((sum, i) => sum + Number(i.remaining_amount || 0), 0);
      const maxAllowed = Math.max(unpaidAmt - otherRem + alreadyPaid, 0);
      if (amt < alreadyPaid) {
        setScheduleError(
          `Cannot set EMI ${editInstallmentNo} below already paid ₹${alreadyPaid.toLocaleString('en-IN')}.`
        );
        return;
      }
      if (amt > maxAllowed) {
        setScheduleError(
          `Max allowed for EMI ${editInstallmentNo} is ₹${maxAllowed.toLocaleString('en-IN')} so total scheduled stays within unpaid balance.`
        );
        return;
      }
    }
    if (!scheduleDueDate) {
      setScheduleError('Please choose a due date.');
      return;
    }

    setIsScheduling(true);
    setScheduleError(null);
    try {
      const res = await fetch(`${apiBase}/v1/crm/customers/${customer.id}/emi/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emi_id: emiId || undefined,
          order_id: orderId || undefined,
          installment_no: editInstallmentNo ?? undefined,
          amount: amt,
          due_date: scheduleDueDate,
          note: scheduleNote.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setScheduleError(data?.error || 'Failed to save EMI installment.');
        return;
      }

      setActiveForm('none');
      setEditInstallmentNo(null);
      onToast('success', data.message || 'EMI installment scheduled.');
      await onRefresh();
    } catch {
      setScheduleError('Network error while saving EMI schedule.');
    } finally {
      setIsScheduling(false);
    }
  };

  const planNames: Record<number, string> = {
    1: 'Basic',
    2: 'Standard',
    3: 'Premium',
    4: 'Diamond',
    5: 'Custom',
  };

  const collectAmountNum = Number(collectAmount || 0);
  const projectedRemaining = Math.max(
    unpaidAmt - (Number.isFinite(collectAmountNum) ? collectAmountNum : 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* 1. Top KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Amount</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            ₹{Number(totalAmt).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase">Paid Amount</p>
          <p className="text-lg font-bold text-emerald-800 mt-0.5">
            ₹{Number(paidAmt).toLocaleString('en-IN')}
          </p>
        </div>
        <div
          className={`p-3.5 rounded-xl border ${
            Number(unpaidAmt) > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase ${
              Number(unpaidAmt) > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}
          >
            Unpaid Amount
          </p>
          <p
            className={`text-lg font-bold mt-0.5 ${
              Number(unpaidAmt) > 0 ? 'text-rose-700' : 'text-slate-700'
            }`}
          >
            {Number(unpaidAmt) > 0
              ? `₹${Number(unpaidAmt).toLocaleString('en-IN')}`
              : 'No Pending Payment'}
          </p>
        </div>
      </div>

      {/* 2. Action Bar for Collect EMI & Add Next EMI */}
      {allowCollect && unpaidAmt > 0 && emiId && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <div className="text-xs text-slate-600">
            {nextDue ? (
              <span>
                Next due: <strong className="text-slate-900">EMI {nextDue.installment_no}</strong>{' '}
                (₹{Number(nextDue.remaining_amount).toLocaleString('en-IN')}
                {nextDue.due_date ? ` • ${nextDue.due_date}` : ''})
              </span>
            ) : (
              <span>
                Remaining unpaid:{' '}
                <strong className="text-slate-900">₹{unpaidAmt.toLocaleString('en-IN')}</strong>
              </span>
            )}
            {unscheduledAmt > 0 && (
              <span className="ml-2 inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                Unscheduled: ₹{unscheduledAmt.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openCollectForm()}
              className="btn-multicolor px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Collect EMI
            </button>
            <button
              type="button"
              onClick={() => openScheduleForm()}
              disabled={unscheduledAmt <= 0 || !schemaReady}
              title={
                !schemaReady
                  ? 'Add-only EMI schedule table pending DB migration'
                  : unscheduledAmt <= 0
                    ? 'All unpaid balance is already scheduled (click Edit on a pending EMI to split it)'
                    : `Schedule EMI ${nextInstallmentNo}`
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors ${
                unscheduledAmt > 0 && schemaReady
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Next EMI (EMI {nextInstallmentNo})
            </button>
          </div>
        </div>
      )}

      {allowCollect && unpaidAmt > 0 && !schemaReady && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <span>
            EMI 4+ schedule table is not installed in this database yet. Basic EMI collection works,
            and scheduling EMI 4+ will unlock once the add-only SQL migration is applied.
          </span>
        </div>
      )}

      {/* 3. Inline Collect EMI Form */}
      {activeForm === 'collect' && (
        <form
          onSubmit={handleCollectSubmit}
          className="bg-white border border-sky-200 rounded-xl p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-sky-700" />
              <h4 className="text-xs font-bold text-slate-900">
                Collect EMI Payment — {customer.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveForm('none')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {collectError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 font-medium">
              {collectError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Collected Amount (₹) *
              </label>
              <input
                type="number"
                min={1}
                max={unpaidAmt}
                step={1}
                required
                value={collectAmount}
                onChange={(e) => {
                  setCollectAmount(e.target.value);
                  setCollectError(null);
                }}
                className="input text-xs py-1.5 w-full"
                placeholder={`Max ₹${unpaidAmt}`}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Balance after payment:{' '}
                <strong className="text-slate-800">
                  ₹{projectedRemaining.toLocaleString('en-IN')}
                </strong>
              </p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={collectDate}
                onChange={(e) => setCollectDate(e.target.value)}
                className="input text-xs py-1.5 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
              <select
                value={collectMode}
                onChange={(e) => setCollectMode(e.target.value)}
                className="input text-xs py-1.5 w-full"
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                UTR / Transaction Reference
              </label>
              <input
                type="text"
                maxLength={120}
                value={collectRef}
                onChange={(e) => setCollectRef(e.target.value)}
                className="input text-xs py-1.5 w-full"
                placeholder="e.g. UTR4321987654"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Comment / Notes</label>
              <input
                type="text"
                maxLength={1000}
                value={collectComment}
                onChange={(e) => setCollectComment(e.target.value)}
                className="input text-xs py-1.5 w-full"
                placeholder="Optional note about this EMI collection"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Proof Screenshot (JPG, PNG, PDF • max 5 MB)
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  {collectFile ? 'Change File' : 'Upload Proof'}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={handleProofFileChange}
                    className="hidden"
                  />
                </label>
                {collectFile && (
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    {collectFilePreview ? (
                      <img
                        src={collectFilePreview}
                        alt="Preview"
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <FileText className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="max-w-[200px] truncate font-medium">{collectFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (collectFilePreview) URL.revokeObjectURL(collectFilePreview);
                        setCollectFile(null);
                        setCollectFilePreview(null);
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={() => setActiveForm('none')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCollecting || collectAmountNum <= 0 || collectAmountNum > unpaidAmt}
                className="btn-multicolor px-4 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isCollecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 4. Inline Add / Edit Scheduled EMI Form */}
      {activeForm === 'schedule' && (
        <form
          onSubmit={handleScheduleSubmit}
          className="bg-white border border-slate-300 rounded-xl p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-900">
                {editInstallmentNo !== null
                  ? `Edit EMI ${editInstallmentNo} Schedule`
                  : `Schedule Next Installment (EMI ${nextInstallmentNo})`}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveForm('none')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {scheduleError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 font-medium">
              {scheduleError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Installment Amount (₹) *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                required
                value={scheduleAmount}
                onChange={(e) => {
                  setScheduleAmount(e.target.value);
                  setScheduleError(null);
                }}
                className="input text-xs py-1.5 w-full"
              />
              {editInstallmentNo === null && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Unscheduled unpaid: ₹{unscheduledAmt.toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={scheduleDueDate}
                onChange={(e) => setScheduleDueDate(e.target.value)}
                className="input text-xs py-1.5 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Note (Optional)</label>
              <input
                type="text"
                maxLength={500}
                value={scheduleNote}
                onChange={(e) => setScheduleNote(e.target.value)}
                className="input text-xs py-1.5 w-full"
                placeholder="e.g. Before filing"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveForm('none')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScheduling}
              className="btn-multicolor px-4 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : editInstallmentNo !== null ? (
                'Update Installment'
              ) : (
                `Save EMI ${nextInstallmentNo}`
              )}
            </button>
          </div>
        </form>
      )}

      {/* 5. Service & Package Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
        <div>
          <span className="text-slate-500 block">Service & Category</span>
          <span className="font-bold text-slate-900">{s?.service_name || customer.service}</span>
          {(s?.category_name || customer.category) && (
            <span className="text-slate-500 ml-1">({s?.category_name || customer.category})</span>
          )}
        </div>
        <div>
          <span className="text-slate-500 block">Package Tier & Catalog Price</span>
          <span className="font-bold text-slate-900">
            {s?.cp_type
              ? planNames[s.cp_type] || 'Standard'
              : planNames[customer.cp_type] || 'Standard'}
            {s?.service_price !== null && s?.service_price !== undefined
              ? ` • ₹${Number(s.service_price).toLocaleString('en-IN')}`
              : ''}
          </span>
          {s?.cp_discount > 0 && (
            <span className="text-emerald-700 ml-1.5 font-semibold">
              (-₹{Number(s.cp_discount).toLocaleString('en-IN')} pkg discount)
            </span>
          )}
        </div>
        <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-slate-500 block">Order / EMI Comment</span>
            <span className="text-slate-800 font-medium">
              {s?.emi_comment || 'No comment recorded.'}
            </span>
          </div>
          {s?.initial_proof_url && (
            <div>
              <span className="text-slate-500 block mb-1">Initial Booking Proof</span>
              <AuthProofViewer
                apiBase={apiBase}
                proofUrl={s.initial_proof_url}
                proofType={s.initial_proof_type || 'image'}
                filename={s.initial_payment_screenshot || 'proof'}
                onPreviewImage={(url, title) => setLightboxImage({ url, title })}
              />
            </div>
          )}
        </div>
      </div>

      {/* 6. EMI Schedule (EMI 2, 3, 4, ...) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">EMI Schedule ({schedule.length})</span>
          {unpaidAmt > 0 && schedule.length > 0 && (
            <span className="text-[11px] text-slate-500">
              Scheduled remaining: ₹{scheduledUnpaidTotal.toLocaleString('en-IN')}
              {unscheduledAmt > 0
                ? ` • Unscheduled: ₹${unscheduledAmt.toLocaleString('en-IN')}`
                : ' • Fully scheduled'}
            </span>
          )}
        </div>
        {schedule.length === 0 ? (
          <div className="p-4 text-xs text-slate-500">
            {unpaidAmt > 0
              ? 'No future EMI installments scheduled yet. Click "Add Next EMI" above to schedule EMI 2, 3, 4...'
              : 'All payments are settled; no pending EMI installments.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-left border-b border-slate-100">
                  <th className="px-3 py-2">Installment</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Paid</th>
                  <th className="px-3 py-2">Remaining</th>
                  <th className="px-3 py-2">Due Date</th>
                  <th className="px-3 py-2">Status</th>
                  {allowCollect && <th className="px-3 py-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedule.map((inst) => {
                  const overdue = inst.remaining_amount > 0 && isPastDue(inst.due_date_iso);
                  const badgeCls =
                    inst.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : overdue
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : inst.status === 'partial'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200';
                  const badgeLabel =
                    inst.status === 'paid'
                      ? 'Paid'
                      : overdue
                        ? 'Overdue'
                        : inst.status === 'partial'
                          ? 'Partial'
                          : 'Scheduled';
                  return (
                    <tr key={`inst-${inst.installment_no}`} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap">
                        EMI {inst.installment_no}
                        {inst.note && (
                          <span className="block text-[10px] font-normal text-slate-500">
                            {inst.note}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        ₹{Number(inst.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-emerald-700 font-semibold">
                        ₹{Number(inst.paid_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-rose-600 font-semibold">
                        ₹{Number(inst.remaining_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                        {inst.due_date || '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badgeCls}`}
                        >
                          {badgeLabel}
                        </span>
                      </td>
                      {allowCollect && (
                        <td className="px-3 py-2 text-right whitespace-nowrap space-x-1.5">
                          {inst.remaining_amount > 0 && unpaidAmt > 0 && (
                            <button
                              type="button"
                              onClick={() => openCollectForm(inst.remaining_amount)}
                              className="px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold"
                            >
                              Collect
                            </button>
                          )}
                          {inst.remaining_amount > 0 && schemaReady && (
                            <button
                              type="button"
                              onClick={() => openScheduleForm(inst)}
                              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] font-semibold inline-flex items-center gap-1"
                              title="Edit or split this EMI amount & due date"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Payment History & Proof Screenshots (customer_dues) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            EMI Payment History ({payments.length})
          </span>
          <span className="text-[11px] text-slate-500">Synced with customer_dues</span>
        </div>
        {payments.length === 0 ? (
          <div className="p-4 text-xs text-slate-500">No follow-up EMI payments recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div
                key={p.cd_id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-emerald-700 text-sm">
                      +₹{Number(p.paid_amount).toLocaleString('en-IN')}
                    </span>
                    {p.installment_no && (
                      <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                        EMI {p.installment_no}
                      </span>
                    )}
                    {p.payment_mode && (
                      <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-semibold">
                        {p.payment_mode}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {p.payment_date || p.recorded_at || '—'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600">
                    <span>
                      Balance after:{' '}
                      <strong className="text-slate-800">
                        ₹{Number(p.unpaid_amount).toLocaleString('en-IN')}
                      </strong>
                    </span>
                    <span>• By: {p.added_by_name}</span>
                    {p.payment_reference && (
                      <span className="font-mono text-slate-700">• Ref: {p.payment_reference}</span>
                    )}
                  </div>
                  {p.comment && <p className="text-[11px] text-slate-600 italic">“{p.comment}”</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.proof_url ? (
                    <AuthProofViewer
                      apiBase={apiBase}
                      proofUrl={p.proof_url}
                      proofType={p.proof_type}
                      filename={p.payment_screenshot}
                      onPreviewImage={(url, title) => setLightboxImage({ url, title })}
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400">No proof uploaded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. All EMI Records Table (when customer has multiple orders/EMIs) */}
      {(detailsPrice?.emis?.length || 0) > 1 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            All EMI Records ({detailsPrice?.emis.length})
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-left">
                <th className="px-3 py-2">Order #</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Unpaid</th>
                <th className="px-3 py-2">Due Date</th>
                <th className="px-3 py-2">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detailsPrice!.emis.map((e) => (
                <tr key={e.emi_id}>
                  <td className="px-3 py-2 font-mono">{e.order_id}</td>
                  <td className="px-3 py-2 font-semibold">
                    ₹{e.emi_total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-emerald-700 font-semibold">
                    ₹{e.emi_paid_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-rose-600 font-semibold">
                    ₹
                    {Math.max(
                      Number(e.emi_total_amount || 0) - Number(e.emi_paid_amount || 0),
                      0
                    ).toLocaleString('en-IN')}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDisplayDate(e.emi_due_date)}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{e.emi_comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 9. Proof Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[70] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-800 truncate pr-4">
                Payment Proof — {lightboxImage.title}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[68vh] rounded-lg shadow-sm object-contain bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
