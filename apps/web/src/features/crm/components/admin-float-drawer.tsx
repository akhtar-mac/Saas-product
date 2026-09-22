import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Wallet,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Users,
  RefreshCw,
  Eye,
  Search,
  Filter,
  CreditCard,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { DisbursementWallet, DisbursementRequest, ChatUser } from '@etaxwala/types';
import { useAuthStore } from '@/store/auth-store';

interface AdminFloatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  staffDirectory: ChatUser[];
  isAdminUser: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AdminFloatDrawer: React.FC<AdminFloatDrawerProps> = ({
  isOpen,
  onClose,
  staffDirectory,
  isAdminUser,
}) => {
  const { staffToken } = useAuthStore();
  const [wallet, setWallet] = useState<DisbursementWallet | null>(null);
  const [requests, setRequests] = useState<DisbursementRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'topups'>('requests');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Top Up Modal State
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupMode, setTopupMode] = useState('BANK_TRANSFER');
  const [topupRef, setTopupRef] = useState('');
  const [topupNotes, setTopupNotes] = useState('');
  const [topupSubmitting, setTopupSubmitting] = useState(false);

  // Assign Officer Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState<number | ''>('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Proof lightbox
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE}/v1/disbursements/wallet`, { headers: authHeaders }),
        fetch(`${API_BASE}/v1/disbursements/requests?limit=100`, { headers: authHeaders }),
      ]);

      const [walletJson, requestsJson] = await Promise.all([walletRes.json(), requestsRes.json()]);

      if (walletJson.success) setWallet(walletJson.data);
      if (requestsJson.success && Array.isArray(requestsJson.data)) {
        setRequests(requestsJson.data);
      }
    } catch (err) {
      console.error('Failed to load float data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && staffToken) {
      loadData();
    }
  }, [isOpen, staffToken]);

  if (!isOpen) return null;

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(topupAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    setTopupSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/v1/disbursements/topup`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          amount: parsed,
          paymentMode: topupMode,
          referenceNo: topupRef,
          notes: topupNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowTopupModal(false);
        setTopupAmount('');
        setTopupRef('');
        setTopupNotes('');
        await loadData();
      } else {
        alert(data.error || 'Failed to top up float.');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing top up.');
    } finally {
      setTopupSubmitting(false);
    }
  };

  const handleAssignOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficerId) return;

    setAssignSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/v1/disbursements/assign-officer`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          officerId: selectedOfficerId,
          initialBalance: parseFloat(initialBalance) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAssignModal(false);
        await loadData();
      } else {
        alert(data.error || 'Failed to assign officer.');
      }
    } catch (err: any) {
      alert(err.message || 'Error assigning officer.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.requestCode.toLowerCase().includes(q) ||
      (r.requesterName && r.requesterName.toLowerCase().includes(q)) ||
      (r.clientRef && r.clientRef.toLowerCase().includes(q)) ||
      r.purposeCategory.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FFFDF9] w-full max-w-2xl h-full border-l border-[#EAE6DD] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-slate-800 text-xs">
        {/* Signature ETaxwala Multicolor Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] shrink-0" />

        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1B365D] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Wallet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Accounts Float & Disbursement Tracker
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Admin Only
                </span>
              </h2>
              <p className="text-xs text-white/75">
                Real-time operational float balance, top-up logs & payment audit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Float Balance Banner */}
        <div className="p-6 bg-gradient-to-b from-[#1B365D]/5 via-white to-white border-b border-[#EAE6DD] space-y-4 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Balance Card */}
            <div className="p-4 bg-white border border-[#EAE6DD] rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Float Balance
              </span>
              <div
                className={`text-2xl font-black ${wallet?.isLowBalance ? 'text-rose-600' : 'text-[#1B365D]'}`}
              >
                ₹
                {wallet
                  ? Number(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                  : '0.00'}
              </div>
              {wallet?.isLowBalance ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Low Balance Alert (&lt; ₹5k)
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-bold block">
                  Float Balance Active
                </span>
              )}
            </div>

            {/* Total Funded */}
            <div className="p-4 bg-white border border-[#EAE6DD] rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Company Funded
              </span>
              <div className="text-xl font-black text-slate-700">
                ₹
                {wallet
                  ? Number(wallet.totalFunded).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                  : '0.00'}
              </div>
              <p className="text-[10px] text-slate-400">All top-ups recorded</p>
            </div>

            {/* Total Disbursed */}
            <div className="p-4 bg-white border border-[#EAE6DD] rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Paid to Staff
              </span>
              <div className="text-xl font-black text-emerald-700">
                ₹
                {wallet
                  ? Number(wallet.totalDisbursed).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })
                  : '0.00'}
              </div>
              <p className="text-[10px] text-slate-400">Verified with receipt proofs</p>
            </div>
          </div>

          {/* Officer Profile & Admin Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1B365D] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {wallet?.officerName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Designated Accounts Officer
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {wallet?.officerName || 'No Accounts Officer Assigned'}
                </p>
                <p className="text-[10px] text-slate-500">{wallet?.officerEmail || ''}</p>
              </div>
            </div>

            {/* Admin Controls */}
            {isAdminUser && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-[11px] transition-all flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  Change Officer
                </button>
                <button
                  type="button"
                  onClick={() => setShowTopupModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Top Up Float
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-white border-b border-[#EAE6DD] flex items-center justify-between shrink-0">
          <div className="flex bg-[#FAF9F5] p-0.5 rounded-xl border border-[#EAE6DD]">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'requests'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Money Requests ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('topups')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'topups'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top-up History ({wallet?.recentTopups?.length || 0})
            </button>
          </div>

          {activeTab === 'requests' && (
            <div className="flex items-center gap-1.5">
              {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                    filterStatus === s
                      ? 'bg-[#1B365D] text-white border-[#1B365D]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeTab === 'requests' ? (
            <>
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by code, staff name, client reference..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#EAE6DD] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              {filteredRequests.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">No payment requests found</p>
                  <p className="text-slate-400 text-xs">
                    Staff requests submitted from chat will appear here for audit and fulfillment.
                  </p>
                </div>
              ) : (
                filteredRequests.map((r) => {
                  const isPaid = r.status === 'PAID';
                  const isRejected = r.status === 'REJECTED';

                  return (
                    <div
                      key={r.id}
                      className="p-4 bg-white border border-[#EAE6DD] rounded-2xl shadow-xs space-y-2.5 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#1B365D]">
                            #{r.requestCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isRejected
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-base font-black text-[#1B365D]">
                            ₹
                            {Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="ml-2 text-[11px] text-slate-500 font-medium">
                            • {r.purposeCategory}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          By {r.requesterName}
                        </span>
                      </div>

                      {r.clientRef && (
                        <p className="text-[11px] text-slate-500 truncate">
                          Client Ref:{' '}
                          <span className="font-semibold text-slate-700">{r.clientRef}</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                        {r.purposeDescription}
                      </p>

                      {/* Payment Destination / Proof */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center gap-2">
                          {r.upiId && (
                            <span className="font-mono text-slate-600">
                              UPI: <b>{r.upiId}</b>
                            </span>
                          )}
                          {r.qrCodeUrl && (
                            <a
                              href={`${API_BASE}${r.qrCodeUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0084D1] font-bold hover:underline"
                            >
                              [View Requested QR]
                            </a>
                          )}
                        </div>

                        {isPaid && r.paymentProofUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewProofUrl(`${API_BASE}${r.paymentProofUrl}`)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold flex items-center gap-1 border border-emerald-200"
                          >
                            <Eye className="w-3 h-3" /> View Paid Proof Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            /* Top-ups History Tab */
            <div className="space-y-3">
              {wallet?.recentTopups && wallet.recentTopups.length > 0 ? (
                wallet.recentTopups.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-white border border-[#EAE6DD] rounded-2xl shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-emerald-700">
                          +₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Deposited by {t.adminName} via {t.paymentMode}
                          {t.referenceNo ? ` (${t.referenceNo})` : ''}
                        </p>
                        {t.notes && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">{t.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(t.createdAt).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-400">No top-ups recorded yet.</div>
              )}
            </div>
          )}
        </div>

        {/* Top Up Modal */}
        {showTopupModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EAE6DD] overflow-hidden animate-in fade-in zoom-in-95 flex flex-col">
              {/* Signature ETaxwala Multicolor Top Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] shrink-0" />

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#1B365D]">
                        Top Up Accounts Float
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Deposit funds into the Accounts Officer's balance
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTopupModal(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleTopupSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1">
                      Deposit Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="e.g. 20000"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE6DD] hover:border-[#0084D1]/40 focus:border-[#0084D1] focus:ring-4 focus:ring-[#0084D1]/10 rounded-xl font-black text-lg text-[#1B365D] shadow-2xs transition-all outline-none"
                    />
                    {/* Preset quick buttons */}
                    <div className="flex gap-2 mt-2">
                      {[5000, 10000, 25000, 50000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTopupAmount(val.toString())}
                          className="flex-1 py-1.5 text-[11px] font-bold rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0084D1] text-slate-700 border border-slate-200/60 transition-all cursor-pointer"
                        >
                          +₹{(val / 1000).toFixed(0)}k
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1">
                      Transfer Mode
                    </label>
                    <select
                      value={topupMode}
                      onChange={(e) => setTopupMode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EAE6DD] rounded-xl text-xs font-semibold text-slate-800 focus:border-[#0084D1] focus:ring-2 focus:ring-[#0084D1]/10 outline-none"
                    >
                      <option value="BANK_TRANSFER">Bank IMPS / NEFT Transfer</option>
                      <option value="UPI">Direct UPI Transfer</option>
                      <option value="CASH">Cash Deposit</option>
                      <option value="COMPANY_CARD">Company Credit/Debit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1">
                      Bank Reference / UTR #
                    </label>
                    <input
                      type="text"
                      value={topupRef}
                      onChange={(e) => setTopupRef(e.target.value)}
                      placeholder="e.g. UTR-91823901"
                      className="w-full px-3.5 py-2 bg-white border border-[#EAE6DD] rounded-xl font-mono text-xs text-[#1B365D] focus:border-[#0084D1] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1">
                      Notes / Remarks
                    </label>
                    <input
                      type="text"
                      value={topupNotes}
                      onChange={(e) => setTopupNotes(e.target.value)}
                      placeholder="e.g. Weekly operational replenishment"
                      className="w-full px-3.5 py-2 bg-white border border-[#EAE6DD] rounded-xl text-xs text-slate-800 focus:border-[#0084D1] outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-[#EAE6DD]">
                    <button
                      type="button"
                      onClick={() => setShowTopupModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={topupSubmitting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-md shadow-emerald-900/15 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {topupSubmitting ? 'Depositing...' : 'Confirm Deposit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Officer Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#EAE6DD] overflow-hidden animate-in fade-in zoom-in-95 flex flex-col">
              {/* Signature ETaxwala Multicolor Top Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] shrink-0" />

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#1B365D]">
                        Assign Accounts Officer
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Designate which staff member holds the disbursement float
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAssignOfficerSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1">
                      Select Staff Member <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedOfficerId}
                      onChange={(e) => setSelectedOfficerId(Number(e.target.value) || '')}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-[#EAE6DD] rounded-xl font-medium text-xs text-slate-800 focus:border-[#0084D1] outline-none cursor-pointer"
                    >
                      <option value="">-- Choose active staff member --</option>
                      {staffDirectory.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.roleName} - {u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#1B365D] block mb-1">
                      Initial Float Balance (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE6DD] rounded-xl font-bold text-sm text-[#1B365D] focus:border-[#0084D1] outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-[#EAE6DD]">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={assignSubmitting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1B365D] to-[#0084D1] hover:from-[#142845] hover:to-[#0074b8] text-white font-extrabold text-xs shadow-md shadow-blue-900/15 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {assignSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Proof Lightbox */}
        {previewProofUrl && (
          <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 shadow-2xl border">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-sm">Payment Receipt Proof</span>
                <button
                  type="button"
                  onClick={() => setPreviewProofUrl(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <div className="bg-slate-900 rounded-xl p-2 flex items-center justify-center">
                <img
                  src={previewProofUrl}
                  alt="Proof Full Size"
                  className="max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => window.open(previewProofUrl, '_blank')}
                  className="px-3 py-1.5 rounded-lg bg-[#1B365D] text-white font-bold text-xs"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
