import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Plus,
  Copy,
  Check,
  X,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface Coupon {
  coupon_id: number;
  coupon_type: number; // 0 = Amount Wise, 1 = % Wise
  coupon_name: string;
  coupon_discount: number;
  coupon_validity: string;
  coupon_uses: number;
  coupon_remaining: number;
  is_active: number; // 0 = Open/Active, 1 = Expired
}

export default function OpsManagerDashboard() {
  const { staffToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'coupons'>('overview');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState<number | null>(null);
  const [searchCoupon, setSearchCoupon] = useState('');

  // Coupon modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    coupon_type: 0, // 0 = Amount Wise, 1 = % Wise
    coupon_name: '',
    coupon_discount: '',
    coupon_validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    coupon_uses: '50',
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/om/coupons`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCoupons(data.data);
      }
    } catch (e) {
      console.error('Error fetching OM coupons:', e);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopyCouponCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    setTimeout(() => setCopiedCouponId(null), 2000);
  };

  const handleCheckCouponName = async (name: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE}/v1/crm/om/coupons/check-name?coupon_name=${encodeURIComponent(name.trim().toUpperCase())}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (data.exists) {
        setCouponError('Coupon code already exists');
      } else {
        setCouponError(null);
      }
    } catch {
      // Ignore
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.coupon_name.trim()) {
      setCouponError('Coupon code is required');
      return;
    }
    if (!couponForm.coupon_discount) {
      setCouponError('Discount value is required');
      return;
    }
    setCreatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/om/coupons`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          coupon_type: Number(couponForm.coupon_type),
          coupon_name: couponForm.coupon_name.trim().toUpperCase(),
          coupon_discount: Number(couponForm.coupon_discount),
          coupon_validity: couponForm.coupon_validity,
          coupon_uses: Number(couponForm.coupon_uses) || 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCouponModalOpen(false);
        setCouponForm({
          coupon_type: 0,
          coupon_name: '',
          coupon_discount: '',
          coupon_validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          coupon_uses: '50',
        });
        fetchCoupons();
      } else {
        setCouponError(data.error || 'Failed to create coupon');
      }
    } catch {
      setCouponError('Network error creating coupon');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const stageBreakdown = [
    { stage: 'Documents Pending', count: 24, badge: 'bg-amber-50 text-amber-700' },
    { stage: 'Documents Collected', count: 18, badge: 'bg-blue-50 text-blue-700' },
    { stage: 'Verification In Progress', count: 32, badge: 'bg-indigo-50 text-indigo-700' },
    { stage: 'Govt Filing In Progress', count: 46, badge: 'bg-purple-50 text-purple-700' },
    { stage: 'QC Review Desk', count: 14, badge: 'bg-cyan-50 text-cyan-700' },
    { stage: 'Govt Approved / Done', count: 50, badge: 'bg-emerald-50 text-emerald-700' },
  ];

  const opsTeam = [
    {
      name: 'CA Pooja Kulkarni',
      role: 'Senior CA Specialist',
      activeCases: 26,
      slaScore: '98%',
      pendingAction: 2,
    },
    {
      name: 'Vikas Shinde',
      role: 'Operations Executive',
      activeCases: 34,
      slaScore: '94%',
      pendingAction: 5,
    },
    {
      name: 'Megha More',
      role: 'Verification Executive',
      activeCases: 28,
      slaScore: '96%',
      pendingAction: 1,
    },
    {
      name: 'Rohit Joshi',
      role: 'Operations Assistant',
      activeCases: 22,
      slaScore: '91%',
      pendingAction: 4,
    },
  ];

  const filteredCoupons = coupons.filter(
    (c) =>
      c.coupon_name.toLowerCase().includes(searchCoupon.toLowerCase()) ||
      (c.coupon_type === 0 ? 'amount' : 'percent').includes(searchCoupon.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Operations & Service Delivery Control Room
            </h1>
            <span className="badge badge-gold">Operations Manager</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            4,911 operations tasks, 10-stage lifecycle tracking, SLA compliance, bottleneck
            detection & promotional coupon management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
          >
            <Tag className="w-3.5 h-3.5" /> Generate Coupon
          </button>
          <Link to="/crm/tasks" className="btn btn-primary btn-sm">
            <ClipboardList className="w-3.5 h-3.5" /> 10-Stage Task Board
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-[#003A66] text-[#003A66]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Operations Overview
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'border-[#003A66] text-[#003A66]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-600" /> Coupon System ({coupons.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Total Active Filings',
                value: '184 Active',
                sub: 'Across 8 core categories',
                icon: ClipboardList,
                color: '#003A66',
                bg: 'rgba(0,58,102,0.08)',
              },
              {
                title: 'SLA Compliance Rate',
                value: '95.2%',
                sub: '175 cases on track',
                icon: CheckCircle2,
                color: '#059669',
                bg: 'rgba(5,150,105,0.08)',
              },
              {
                title: 'Govt Query / At Risk',
                value: '9 Orders',
                sub: 'Requires CA intervention',
                icon: AlertTriangle,
                color: '#DC2626',
                bg: 'rgba(220,38,38,0.08)',
              },
              {
                title: 'Active Coupons Available',
                value: `${coupons.filter((c) => c.is_active === 0).length} Open`,
                sub: 'Amount & % wise discount codes',
                icon: Tag,
                color: '#D97706',
                bg: 'rgba(217,119,6,0.08)',
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

          {/* 10-Stage Visual Pipeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Live Cases by 10-Stage Lifecycle
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time status tracking from document intake to government approval
                </p>
              </div>
              <span className="badge badge-navy">184 Live Cases</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {stageBreakdown.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#F7F8FA] border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                    <span className="text-xl font-display font-bold text-slate-800">
                      {item.count}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                    {item.stage}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Operations Team Workload */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Operations Team Workload & SLA Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Team workload balance, filing specializations, and urgent actions
                </p>
              </div>
              <span className="badge badge-navy">Operations Specialists</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-crm">
                <thead>
                  <tr>
                    <th>Operations Specialist</th>
                    <th>Specialization</th>
                    <th>Active Cases</th>
                    <th>Pending Actions</th>
                    <th className="text-right">SLA Score</th>
                  </tr>
                </thead>
                <tbody>
                  {opsTeam.map((member, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-slate-800 text-xs">{member.name}</td>
                      <td className="text-xs text-brand-navy font-semibold">{member.role}</td>
                      <td className="text-xs text-slate-700 font-bold">
                        {member.activeCases} Cases
                      </td>
                      <td className="text-xs">
                        {member.pendingAction > 0 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> {member.pendingAction} urgent
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                            All clear
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <span className="badge badge-green font-bold">{member.slaScore}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* COUPONS TAB (Ported from Old CRM OMController & dashboard.blade.php) */}
      {activeTab === 'coupons' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                Operation Manager Discount Coupons
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Create and manage Amount-wise (₹ Flat) & Percentage-wise (%) discount coupon codes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchCoupons}
                disabled={loadingCoupons}
                className="btn btn-outline btn-sm flex items-center gap-1 text-xs cursor-pointer"
                title="Refresh Coupons"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCoupons ? 'animate-spin' : ''}`} />{' '}
                Refresh
              </button>
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Coupon
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search coupon code or type..."
              value={searchCoupon}
              onChange={(e) => setSearchCoupon(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Coupon Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingCoupons && coupons.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                Loading coupon codes...
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                No discount coupons found. Click "Create New Coupon" to generate one.
              </div>
            ) : (
              filteredCoupons.map((c) => {
                const isOpen = c.is_active === 0;
                return (
                  <div
                    key={c.coupon_id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all space-y-3 shadow-2xs relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-brand-navy tracking-wide">
                          {c.coupon_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOpen
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isOpen ? 'Open' : 'Expired'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCouponCode(c.coupon_name, c.coupon_id)}
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCouponId === c.coupon_id ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied!
                          </span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Coupon Type:</span>
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          {c.coupon_type === 0 ? 'Amount Wise (Flat ₹)' : '% Wise (Percentage)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Discount:</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {c.coupon_type === 0
                            ? `₹${c.coupon_discount} OFF`
                            : `${c.coupon_discount}% OFF`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Expires On:</span>
                        <span className="font-medium text-slate-700">{c.coupon_validity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Uses Remaining:</span>
                        <span className="font-bold text-slate-800">
                          {c.coupon_remaining} / {c.coupon_uses}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW COUPON MODAL (Ported from Old CRM GenerateCoupon modal) */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Create New Coupon
                </h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {couponError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Coupon Type
                </label>
                <select
                  value={couponForm.coupon_type}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, coupon_type: Number(e.target.value) })
                  }
                  className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003A66]/20"
                >
                  <option value={0}>Amount Wise (₹ Flat Discount)</option>
                  <option value={1}>% Wise (Percentage Discount)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coupon Name / Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAVE500, DIWALI20"
                  value={couponForm.coupon_name}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setCouponForm({ ...couponForm, coupon_name: val });
                    handleCheckCouponName(val);
                  }}
                  className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-[#003A66]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Amount / Percentage
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={
                    couponForm.coupon_type === 0 ? 'Discount ₹ (e.g. 500)' : 'Discount % (e.g. 15)'
                  }
                  value={couponForm.coupon_discount}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, coupon_discount: e.target.value })
                  }
                  className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003A66]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coupon Validity
                  </label>
                  <input
                    type="date"
                    required
                    value={couponForm.coupon_validity}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, coupon_validity: e.target.value })
                    }
                    className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003A66]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No of Uses</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={couponForm.coupon_uses}
                    onChange={(e) => setCouponForm({ ...couponForm, coupon_uses: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003A66]/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="btn btn-outline btn-sm text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCoupon || !!couponError}
                  className="btn btn-primary btn-sm text-xs cursor-pointer disabled:opacity-50"
                >
                  {creatingCoupon ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
