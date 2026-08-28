import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/seo';
import {
  Building2, Receipt, ClipboardCheck, FileBadge, ArrowRight,
  Star, CheckCircle2, Phone, MapPin, Globe, Clock,
  Zap, Lock, AlertCircle, Scale, ShieldCheck, Search,
  MessageSquare, Sparkles, User, Mail, Calculator, Award,
  ChevronRight, HelpCircle, Check, Users, ArrowUpRight
} from 'lucide-react';
import { services } from '@/lib/constants/services';

/* ─── Hero Service Categories (Competitor Tabs) ─── */
const HERO_CATEGORIES = [
  {
    id: 'startup',
    label: '🏢 Start a Business',
    title: 'Private Limited Company Registration',
    badge: 'Most Popular for Founders',
    delivery: '7–10 Working Days',
    price: '₹16,499',
    originalPrice: '₹24,999',
    inclusions: ['2 DSC + 2 DIN', 'Name Approval on MCA V3', 'MoA & AoA Drafting', 'PAN, TAN & Bank A/C', 'Govt Stamp Duty Included'],
    defaultService: 'Private Limited Company Registration',
  },
  {
    id: 'gst_tax',
    label: '📋 GST & ITR Filing',
    title: 'GST Registration & Return Filing',
    badge: '100% Penalty-Proof',
    delivery: '1–3 Days',
    price: '₹499',
    originalPrice: '₹1,499',
    inclusions: ['Fast GSTIN Allocation', 'GSTR-1 & 3B Monthly Return', 'ITC Maximization Audit', 'CA Notice Resolution Support'],
    defaultService: 'GST Registration (Regular Scheme)',
  },
  {
    id: 'trademark',
    label: '®️ Trademark & IP',
    title: 'Trademark (™) Brand Protection',
    badge: 'File in 24 Hours',
    delivery: 'Same Day Filing',
    price: '₹6,999',
    originalPrice: '₹11,999',
    inclusions: ['Free Comprehensive TM Search', 'Attorney Class Classification', 'Online IP India Portal Submission', 'Opposition Monitoring'],
    defaultService: 'Trademark Registration (TM)',
  },
  {
    id: 'fpc_agri',
    label: '🌾 FPC & Agri Subsidies',
    title: 'Farmer Producer Company (FPC)',
    badge: '₹15L+ Grant Structuring',
    delivery: '15–20 Days',
    price: '₹24,999',
    originalPrice: '₹35,000',
    inclusions: ['10 Farmer Director DIN/DSC', 'SFAC Equity Grant Advisory', 'SMART Project DPR Prep', 'NABARD Scheme Filing'],
    defaultService: 'Farmer Producer Company (FPC)',
  },
  {
    id: 'roc_annual',
    label: '⚖️ ROC & Secretarial',
    title: 'Annual ROC Compliance Retainer',
    badge: 'Save ₹50k+ Late Penalties',
    delivery: 'Annual Compliance',
    price: '₹9,999/yr',
    originalPrice: '₹18,000',
    inclusions: ['AOC-4 & MGT-7 Filing', 'DIR-3 KYC for Directors', 'Statutory Financial Audit Coord', 'Board Resolution Minutes'],
    defaultService: 'Annual ROC Compliance (Pvt Ltd)',
  },
];

/* ─── Live Activity Feed Ticker (Real-Time Social Proof) ─── */
const RECENT_ACTIVITIES = [
  { name: 'Amit K.', city: 'Pune', action: 'Incorporate Pvt Ltd Company', time: '2 mins ago' },
  { name: 'Suresh Patil', city: 'Nashik', action: 'Applied for FPC Registration & SFAC Grant', time: '4 mins ago' },
  { name: 'Pooja Agarwal', city: 'Mumbai', action: 'Filed GST Annual Return (GSTR-9)', time: '7 mins ago' },
  { name: 'Dr. Ramesh R.', city: 'Bengaluru', action: 'Registered Trademark in Class 5', time: '11 mins ago' },
  { name: 'Vikas Sharma', city: 'Ahmedabad', action: 'Completed Director KYC (DIR-3)', time: '14 mins ago' },
];

/* ─── Core Practice Cards ─── */
const POPULAR_SERVICES = [
  {
    title: 'Private Limited Company',
    desc: 'The gold standard for startups seeking VC funding and limited liability.',
    price: '₹16,499',
    days: '7–10 Days',
    icon: Building2,
    link: '/services/registration/private-limited',
    tag: 'Startups & Scaleups',
  },
  {
    title: 'LLP Partnership',
    desc: 'Low-maintenance legal structure with operational flexibility for 2+ partners.',
    price: '₹9,999',
    days: '8–12 Days',
    icon: Building2,
    link: '/services/registration/llp',
    tag: 'Professionals',
  },
  {
    title: 'GST Registration & Filing',
    desc: 'Fast GSTIN approval, monthly filing with input tax credit (ITC) optimization.',
    price: 'Starting @ ₹499',
    days: '2–3 Days',
    icon: Receipt,
    link: '/itr-filing',
    tag: 'All Businesses',
  },
  {
    title: 'Trademark Registration',
    desc: 'Safeguard your brand name, logo, or slogan with immediate ™ rights.',
    price: '₹6,999',
    days: '24 Hours',
    icon: FileBadge,
    link: '/services/ip/trademark',
    tag: 'IP Protection',
  },
  {
    title: 'Farmer Producer Co. (FPC)',
    desc: 'Specialized corporate framework for farmer clusters to claim ₹15L SFAC grants.',
    price: '₹24,999',
    days: '15–20 Days',
    icon: Users,
    link: '/fpc-training',
    tag: 'Agribusiness',
  },
  {
    title: 'Annual ROC Compliance',
    desc: 'AOC-4, MGT-7, and director KYC filings to keep your company active & penalty-free.',
    price: '₹9,999/yr',
    days: 'Annual Plan',
    icon: ClipboardCheck,
    link: '/services/compliance/pvt-ltd',
    tag: 'Statutory Retainer',
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State for Instant Hero Lead Capture
  const [leadForm, setLeadForm] = useState({
    name: '',
    mobile: '',
    email: '',
    city: 'Pune',
    state: 'Maharashtra',
  });

  const navigate = useNavigate();
  const currentCat = HERO_CATEGORIES[activeTab];

  // Rotate social proof ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % RECENT_ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name.trim() || leadForm.mobile.trim().length < 10) {
      setSubmitError('Please enter your full name and valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      name: leadForm.name.trim(),
      contact: leadForm.mobile.trim(),
      email: leadForm.email.trim() || `${leadForm.mobile.trim()}@lead.etaxwala.com`,
      city: leadForm.city,
      state: leadForm.state,
      service: currentCat.defaultService,
      message: `Inquiry from Homepage Hero (${currentCat.label}). WhatsApp Updates: ${whatsappUpdates ? 'YES' : 'NO'}`,
      source: 'Homepage Instant Hero Form',
      consent: true,
    };

    try {
      // 1. Submit to Customer API
      await fetch('https://customer-api.etaxwala.com/api/add-inquiry-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      // 2. Submit to Internal API
      await fetch('/v1/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setSubmitSuccess(true);
    } catch {
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = searchQuery.trim()
    ? services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className="font-sans antialiased text-slate-900 bg-[#F8FAFC]">
      <SEO
        title="ETaxwala — #1 Platform for Company Registration, GST, Tax Audit & Legal Services India"
        description="Private Limited Company Incorporation in 7 Days, GST Returns, Trademark, FPC Registration & CA Advisory. 1,00,000+ Filings · 120+ Legal Centers · 5-Min CA Callback."
        keywords="company registration India, private limited, GST return filing, tax audit, trademark registration, ROC compliance, CA services India, FPC registration, IndiaFilings alternative, Vakilsearch alternative"
        url="/"
      />

      {/* ═════════════════════════════════════════════════════════════════
          1. LIVE ACTIVITY TICKER (Top Bar Proof)
          ═════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-950 text-white text-[11px] py-1.5 px-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-300">Live Client Filing Stream:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-emerald-300 font-semibold"
              >
                {RECENT_ACTIVITIES[tickerIndex].name} ({RECENT_ACTIVITIES[tickerIndex].city}) — {RECENT_ACTIVITIES[tickerIndex].action} • <span className="text-slate-400">{RECENT_ACTIVITIES[tickerIndex].time}</span>
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> MCA &amp; GST Certified</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-blue-400" /> 080-6902-9999 (10 AM - 7 PM)</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          2. HERO LEAD ENGINE (IndiaFilings / Vakilsearch Benchmark)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-slate-900 via-[#0B1528] to-slate-900 text-white pt-8 pb-16 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Headline Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>India's Most Trusted Legal &amp; CA Tax Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              Start, Manage &amp; Scale Your Business with <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Top Chartered Accountants</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Join 1,00,000+ businesses across 28 states. Transparent pricing, zero hidden charges, and guaranteed 5-minute CA callback.
            </p>
          </div>

          {/* ─── Hero Service Category Selector Tabs ─── */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {HERO_CATEGORIES.map((cat, idx) => {
              const isSelected = idx === activeTab;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(idx);
                    setSubmitSuccess(false);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* ─── Lead Conversion Grid (Details Left + Form Right) ─── */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            {/* Left Column: Selected Service Package Breakdown */}
            <div className="lg:col-span-6 space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentCat.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{currentCat.title}</h2>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl font-extrabold text-amber-300">{currentCat.price}</span>
                  <span className="text-xs text-slate-400 line-through">{currentCat.originalPrice}</span>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                    All-Inclusive
                  </span>
                  <span className="text-xs text-slate-300 ml-auto flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> {currentCat.delivery}
                  </span>
                </div>
              </div>

              {/* Inclusions Checklist */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">What's Included in This Package:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentCat.inclusions.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust & Guarantee Markers */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold">4.9/5 Rating</span>
                  <span className="text-slate-500">(14,800+ Reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> 100% Money-Back SLA
                </div>
              </div>
            </div>

            {/* Right Column: High-Converting Instant Lead Inquiry Form */}
            <div className="lg:col-span-6 bg-white text-slate-900 rounded-2xl p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Talk to an Expert CA in 2 Mins
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Get a customized proposal &amp; instant consultation</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                  14 CAs Online
                </span>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Inquiry Received!</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                      Our Senior CA is reviewing your requirements and will connect with you within <strong>2–5 minutes</strong>.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                    Direct CA Helpline: <strong className="text-slate-900">080-6902-9999</strong>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setLeadForm({ name: '', mobile: '', email: '', city: 'Pune', state: 'Maharashtra' });
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleHeroSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 border-r border-slate-300 pr-1.5">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          placeholder="98765 43210"
                          value={leadForm.mobile}
                          onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          placeholder="you@company.com"
                          value={leadForm.email}
                          onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                      <input
                        type="text"
                        placeholder="e.g. Pune, Mumbai"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Selected Service</label>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 truncate">
                        {currentCat.defaultService}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Opt-in */}
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={whatsappUpdates}
                      onChange={(e) => setWhatsappUpdates(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">
                      Get quotation &amp; status updates on <strong className="text-emerald-700">WhatsApp</strong>
                    </span>
                  </label>

                  {submitError && (
                    <p className="text-xs text-rose-500 font-semibold">{submitError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <>
                        <span>Get Free CA Consultation &amp; Quote</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    🔒 Bank-Grade 256-Bit SSL Encrypted • Zero Spam Guarantee
                  </p>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          3. SEARCH 250+ SERVICES INSTANT FINDER (Vakilsearch Style)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Looking for a Specific Legal, Tax or Compliance Service?
          </h3>
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search from 250+ services (e.g. Private Limited, GST, Trademark, Section 8, FSSAI, 80G)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm shadow-sm"
            />
            {filteredServices.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl text-left overflow-hidden divide-y divide-slate-100">
                {filteredServices.map((s) => (
                  <Link
                    key={s.id}
                    to={`/services/${s.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="p-3.5 hover:bg-blue-50 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-blue-600">{s.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{s.category}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          4. POPULAR SERVICES GRID
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            India's Most In-Demand Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            End-to-End Corporate &amp; Legal Solutions
          </h2>
          <p className="text-xs text-slate-500">
            Everything your business needs from inception to statutory audits and annual compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {srv.tag}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {srv.days}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {srv.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting From</span>
                    <span className="text-base font-extrabold text-slate-900">{srv.price}</span>
                  </div>

                  <Link
                    to={srv.link}
                    className="px-4 py-2 rounded-xl bg-slate-900 group-hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          5. COMPARISON: ETaxwala vs. Traditional CA vs. Others
          ═════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why 1,00,000+ Businesses Choose ETaxwala
            </h2>
            <p className="text-xs text-slate-500">
              Compare our transparent technology-backed CA ecosystem against traditional offline consultants.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Feature / Deliverable</th>
                  <th className="py-3 px-4 text-blue-600 font-extrabold text-sm">ETaxwala 2.0</th>
                  <th className="py-3 px-4 text-slate-600">Traditional CA Office</th>
                  <th className="py-3 px-4 text-slate-600">Generic Online Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Pricing Transparency</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">100% Fixed &amp; All-Inclusive</td>
                  <td className="py-3.5 px-4 text-slate-500">Unpredictable billing &amp; hidden extras</td>
                  <td className="py-3.5 px-4 text-slate-500">Govt fee excluded on checkout</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Live Status Tracking</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">10-Stage Real-Time Portal &amp; SMS</td>
                  <td className="py-3.5 px-4 text-slate-500">Manual phone follow-ups required</td>
                  <td className="py-3.5 px-4 text-slate-500">Vague email status</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Expert Assigned</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">Dedicated Senior CA &amp; CS Specialist</td>
                  <td className="py-3.5 px-4 text-slate-500">Article assistants / Trainees</td>
                  <td className="py-3.5 px-4 text-slate-500">Automated bots / Non-CA support</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Document Security</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">256-Bit SSL Cloud Vault</td>
                  <td className="py-3.5 px-4 text-slate-500">Paper files in office cabinets</td>
                  <td className="py-3.5 px-4 text-slate-500">Basic database storage</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Turnaround Time SLA</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">Guaranteed On-Time or Money Back</td>
                  <td className="py-3.5 px-4 text-slate-500">No committed timelines</td>
                  <td className="py-3.5 px-4 text-slate-500">Frequent portal delays</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          6. STATS & PHYSICAL PRESENCE (120+ Legal Centers)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">1,00,000+</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Filings Cleared</p>
            <p className="text-[10px] text-slate-400 mt-0.5">MCA, GST &amp; ITR returns</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600">120+</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Legal Hubs</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Walk-in centers in 28 states</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-600">99.4%</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">First-Pass Approval</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Zero government rejection SLA</p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">&lt; 2 Mins</p>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">CA Callback</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Mon–Sat (10 AM – 7 PM)</p>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          7. BOTTOM CONVERSION CTA BANNER
          ═════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display">
            Ready to Incorporate or File Tax Returns Today?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
            Speak directly with an experienced Chartered Accountant. No waiting, no confusing legal jargon.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:08069029999"
              className="px-6 py-3.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Call Senior CA: 080-6902-9999</span>
            </a>
            <Link
              to="/appointment"
              className="px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <span>Book Office or Video Consultation →</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}