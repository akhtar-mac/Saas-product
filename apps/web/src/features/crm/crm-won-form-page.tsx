import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  Package,
  CreditCard,
  CalendarDays,
  MessageSquare,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Percent,
  X,
  Loader2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

const API_BASE = API_BASE_URL;

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Chandigarh',
  'Dadra & Nagar Haveli',
  'Daman & Diu',
  'Lakshadweep',
  'Puducherry',
];

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'NEFT/RTGS', 'DD'];

interface Category {
  category_id: number;
  category_name: string;
}
interface Service {
  service_id: number;
  service_name: string;
  price?: number;
}
interface CouponResult {
  discount_amount: number;
  message: string;
}

interface WonFormData {
  name: string;
  company_name: string;
  email: string;
  mobile: string;
  state: string;
  city: string;
  category_id: number | '';
  service_id: number | '';
  total_amount: string;
  coupon_code: string;
  discount_amount: string;
  payment_mode: string;
  paid_amount: string;
  next_due_date: string;
  comment: string;
  payment_screenshot_url: string;
}

const INITIAL_FORM: WonFormData = {
  name: '',
  company_name: '',
  email: '',
  mobile: '',
  state: 'Maharashtra',
  city: '',
  category_id: '',
  service_id: '',
  total_amount: '',
  coupon_code: '',
  discount_amount: '0',
  payment_mode: 'UPI',
  paid_amount: '',
  next_due_date: '',
  comment: '',
  payment_screenshot_url: '',
};

export default function CrmWonFormPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { staffToken } = useAuthStore();

  const [form, setForm] = useState<WonFormData>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  // Computed unpaid amount (server-authoritative, live display)
  const total = parseFloat(form.total_amount) || 0;
  const discount = parseFloat(form.discount_amount) || 0;
  const paid = parseFloat(form.paid_amount) || 0;
  const unpaid = Math.max(0, total - discount - paid);

  // Fetch lead details to pre-fill form
  useEffect(() => {
    if (!leadId) return;
    fetch(`${API_BASE}/v1/crm/leads/${leadId}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          const l = d.data;
          setForm((f) => ({
            ...f,
            name: l.name || f.name,
            mobile: l.contact || f.mobile,
            email: l.email || f.email,
            company_name: l.company_name || f.company_name,
            state: l.state || f.state,
            city: l.city || f.city,
          }));
        }
      })
      .catch(() => {});
  }, [leadId]);

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/categories`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data);
      })
      .catch(() => {
        // Demo categories
        setCategories([
          { category_id: 1, category_name: 'Business Registration' },
          { category_id: 2, category_name: 'Taxation' },
          { category_id: 3, category_name: 'Consultancy' },
          { category_id: 4, category_name: 'Legal Documentation' },
        ]);
      });
  }, []);

  // Fetch services when category changes
  useEffect(() => {
    if (!form.category_id) {
      setServices([]);
      return;
    }
    setForm((f) => ({ ...f, service_id: '' }));
    fetch(`${API_BASE}/v1/crm/categories/${form.category_id}/services`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setServices(d.data);
      })
      .catch(() => {
        const demos: Record<number, Service[]> = {
          1: [
            { service_id: 1, service_name: 'Private Limited Company', price: 16499 },
            { service_id: 2, service_name: 'LLP Registration', price: 9999 },
            { service_id: 3, service_name: 'OPC Registration', price: 12499 },
          ],
          2: [
            { service_id: 10, service_name: 'GST Registration', price: 1499 },
            { service_id: 11, service_name: 'ITR Filing (Salary)', price: 499 },
          ],
        };
        setServices(demos[form.category_id as number] || []);
      });
  }, [form.category_id]);

  // Auto-fill price when service is selected
  useEffect(() => {
    const svc = services.find((s) => s.service_id === Number(form.service_id));
    if (svc?.price) {
      setForm((f) => ({ ...f, total_amount: String(svc.price) }));
    }
  }, [form.service_id, services]);

  const validateCoupon = async () => {
    if (!form.coupon_code.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponResult(null);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/coupons/validate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ code: form.coupon_code, total_amount: form.total_amount }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponResult(data.data);
        setForm((f) => ({ ...f, discount_amount: String(data.data.discount_amount) }));
      } else {
        setCouponError(data.error || 'Invalid coupon.');
      }
    } catch {
      setCouponError('Coupon validation failed.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result as string);
      // In production: upload to R2/S3 and store the URL
      setForm((f) => ({
        ...f,
        payment_screenshot_url: `screenshot_${Date.now()}.${file.name.split('.').pop()}`,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    if (!form.category_id || !form.service_id) {
      setSubmitError('Please select a category and service.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/v1/crm/leads/${leadId}/convert`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          total_amount: total,
          discount_amount: discount,
          paid_amount: paid,
          // unpaid_amount computed server-side — not sent from client
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'Conversion failed.');
        return;
      }
      setSubmitSuccess(true);
    } catch {
      setSubmitError('Cannot connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setCouponResult(null);
    setCouponError(null);
    setUploadPreview(null);
    setSubmitError(null);
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Lead Converted! 🎉</h2>
        <p className="text-slate-500 max-w-sm mb-2">
          The lead has been marked as <strong>Won</strong>. Customer record created and an
          Operations task has been spawned automatically.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          Unpaid balance of{' '}
          <strong className="text-slate-700">₹{unpaid.toLocaleString('en-IN')}</strong> will be
          collected by Operations before final document release.
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/crm/leads')} className="btn btn-primary text-sm">
            Back to Leads
          </button>
          <button
            onClick={() => navigate('/crm/tasks')}
            className="btn border border-slate-200 text-sm text-slate-700"
          >
            View Operations Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Won Conversion Form</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Lead #{leadId} · Mark as Won and create customer + advance payment record
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-navy" /> Client Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="Rajesh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input pl-9 text-sm w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company / Shop Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rajesh Traders Pvt Ltd"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="input pl-9 text-sm w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="rajesh@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-9 text-sm w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile No. <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  pattern="[0-9+\s-]{10,15}"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="input pl-9 text-sm w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="input pl-9 text-sm w-full"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
              <input
                type="text"
                placeholder="Mumbai"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input text-sm w-full"
              />
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-navy" /> Service Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) || '' })}
                  className="input pl-9 text-sm w-full"
                >
                  <option value="">— Select Category —</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Service <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  required
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: Number(e.target.value) || '' })}
                  disabled={!form.category_id || services.length === 0}
                  className="input pl-9 text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!form.category_id ? '— Select a category first —' : '— Select Service —'}
                  </option>
                  {services.map((s) => (
                    <option key={s.service_id} value={s.service_id}>
                      {s.service_name}
                      {s.price ? ` (₹${s.price.toLocaleString('en-IN')})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-navy" /> Payment Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Total Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  placeholder="16499"
                  value={form.total_amount}
                  onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                  className="input pl-7 text-sm w-full font-semibold"
                />
              </div>
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Apply Coupon Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="SAVE500"
                    value={form.coupon_code}
                    onChange={(e) => {
                      setForm({ ...form, coupon_code: e.target.value.toUpperCase() });
                      setCouponResult(null);
                      setCouponError(null);
                    }}
                    className="input pl-9 text-sm w-full uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={validateCoupon}
                  disabled={!form.coupon_code || couponLoading}
                  className="btn border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 px-3 shrink-0"
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              </div>
              {couponResult && (
                <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {couponResult.message}
                </p>
              )}
              {couponError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <X className="w-3 h-3" /> {couponError}
                </p>
              )}
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Discount Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.discount_amount}
                  onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                  className="input pl-7 text-sm w-full"
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  required
                  value={form.payment_mode}
                  onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                  className="input pl-9 text-sm w-full"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Paid Amount (Advance) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Advance Paid Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={form.paid_amount}
                  onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                  className="input pl-7 text-sm w-full font-semibold"
                />
              </div>
            </div>

            {/* Unpaid Amount — READ ONLY, server-computed */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Unpaid Amount (₹)
                <span className="ml-1 text-[10px] font-normal text-slate-400">Auto-calculated</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  ₹
                </span>
                <input
                  readOnly
                  value={total > 0 ? unpaid.toLocaleString('en-IN') : ''}
                  placeholder="0"
                  className="input pl-7 text-sm w-full bg-slate-50 cursor-not-allowed font-bold text-slate-700"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">= Total − Discount − Advance Paid</p>
            </div>
          </div>

          {/* Balance Summary Card */}
          {total > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total</p>
                  <p className="text-lg font-bold font-display text-slate-900">
                    ₹{total.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Advance Paid</p>
                  <p className="text-lg font-bold font-display text-emerald-600">
                    ₹{paid.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium">Balance Due</p>
                  <p className="text-lg font-bold font-display text-amber-600">
                    ₹{unpaid.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Next Due Date (Balance Payment)
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={form.next_due_date}
                  onChange={(e) => setForm({ ...form, next_due_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="input pl-9 text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comment & Screenshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-navy" /> Notes & Payment Proof
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Comment</label>
            <textarea
              rows={3}
              placeholder="Any additional notes about this client or payment..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="input text-sm w-full resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payment Screenshot / Proof
            </label>
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-brand-navy hover:bg-brand-navy/5 transition-all">
              {uploadPreview ? (
                <img
                  src={uploadPreview}
                  alt="Payment proof"
                  className="max-h-40 rounded-lg object-contain"
                />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">Click to upload</p>
                    <p className="text-xs text-slate-400">PNG, JPG, PDF up to 5MB</p>
                  </div>
                </>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {uploadPreview && (
              <button
                type="button"
                onClick={() => {
                  setUploadPreview(null);
                  setForm((f) => ({ ...f, payment_screenshot_url: '' }));
                }}
                className="mt-2 text-xs text-red-500 hover:underline"
              >
                Remove screenshot
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {submitError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="btn border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm flex items-center justify-center gap-2 sm:w-36 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" /> Reset Form
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-multicolor flex-1 text-sm flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold whitespace-nowrap shrink-0"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Mark as Won & Convert Lead
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400">
          Submitting will mark the lead as <strong>Won</strong>, create a customer record, record
          the advance payment, and automatically spawn an Operations task.
        </p>
      </form>
    </div>
  );
}
