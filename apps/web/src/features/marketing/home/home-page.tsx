import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/seo';
import {
  Building2, Receipt, ClipboardCheck, FileBadge, ArrowRight,
  Star, CheckCircle2, Phone, MapPin, Globe, Clock,
  Zap, Lock, AlertCircle, Scale, ShieldCheck, Search,
  MessageSquare, Sparkles, User, Mail, Calculator, Award,
  ChevronRight, Check, Users, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { services } from '@/lib/constants/services';

/* ─── Hero Segment Categories ─── */
const HERO_SEGMENTS = [
  {
    id: 'pvt_ltd',
    tab: 'Private Limited',
    title: 'Private Limited Company Registration',
    badge: 'MCA V3 SPICe+ Integrated',
    turnaround: '7–10 Working Days',
    price: '₹16,499',
    originalPrice: '₹24,999',
    desc: 'The complete corporate startup package: 2 Digital Signatures (DSC), 2 DIN, Name Reservation, MoA & AoA drafting, PAN, TAN, and Zero-Fee Corporate Bank Account.',
    inclusions: [
      '2 Class-3 Digital Signatures (DSC)',
      '2 Director Identification Numbers (DIN)',
      'RUN MCA Name Reservation',
      'SPICe+ Part A & B Government Filing',
      'Corporate PAN, TAN & Bank Integration',
      'Drafting of MoA & AoA Documents',
    ],
    defaultService: 'Private Limited Company Registration',
  },
  {
    id: 'gst_itr',
    tab: 'GST & Tax Returns',
    title: 'GST Registration & Monthly Return Filing',
    badge: 'Penalty-Proof Guarantee',
    turnaround: '1–3 Working Days',
    price: 'Starting @ ₹499',
    originalPrice: '₹1,499',
    desc: 'Fast GSTIN allocation and penalty-proof GSTR-1 & 3B return filing with complete input tax credit (ITC) reconciliation audited by senior CAs.',
    inclusions: [
      'Instant GSTIN Government Approval',
      'GSTR-1, 3B & Annual GSTR-9 Filing',
      'Input Tax Credit (ITC) Optimization',
      'E-Way Bill & E-Invoicing Setup',
      'CA Notice Resolution Assistance',
      'Dedicated Tax Officer Assignment',
    ],
    defaultService: 'GST Registration (Regular Scheme)',
  },
  {
    id: 'trademark',
    tab: 'Trademark (™)',
    title: 'Trademark Registration & Brand Protection',
    badge: 'Same-Day ™ Protection',
    turnaround: '24 Hours Filing',
    price: '₹6,999',
    originalPrice: '₹11,999',
    desc: 'Secure legal ownership over your brand name, logo, or slogan. Includes an exhaustive IP India search clearance and attorney representation.',
    inclusions: [
      'Comprehensive IP India Search Clearance',
      'Accurate Trademark Class Categorization',
      'Online IP India Application Filing',
      'Immediate Use of ™ Symbol',
      'Continuous Legal Opposition Tracking',
      'Attorney Examination Reply Support',
    ],
    defaultService: 'Trademark Registration (TM)',
  },
  {
    id: 'fpc_agri',
    tab: 'Farmer Producer Co.',
    title: 'Farmer Producer Company (FPC) Registration',
    badge: '₹15L SFAC Subsidy Advisory',
    turnaround: '15–20 Days',
    price: '₹24,999',
    originalPrice: '₹35,000',
    desc: 'Specialized corporate structure for farmer clusters. Comprehensive registration with NABARD scheme alignment, SFAC matching equity grants, and DPR preparation.',
    inclusions: [
      '10 Farmer Director DIN & DSCs',
      'FPC MoA & AoA Special Objects Drafting',
      'SFAC Equity Matching Grant Structuring',
      'SMART & NABARD Project DPR Guidance',
      'ROC Incorporation with Share Certificates',
      'Agribusiness CA Compliance Advisory',
    ],
    defaultService: 'Farmer Producer Company (FPC)',
  },
  {
    id: 'roc_retainer',
    tab: 'Annual Compliance',
    title: 'Annual ROC Compliance & Secretarial Retainer',
    badge: 'Save ₹50,000+ in MCA Penalties',
    turnaround: 'Annual Retainer',
    price: '₹9,999/yr',
    originalPrice: '₹18,000',
    desc: 'Complete statutory governance: AOC-4 financial statement filing, MGT-7 annual return, DIR-3 KYC for directors, and board meeting resolution maintenance.',
    inclusions: [
      'AOC-4 Financial Statements Filing',
      'MGT-7 Annual ROC Compliance Return',
      'DIR-3 KYC Verification for all Directors',
      'Annual General Meeting (AGM) Documentation',
      'Statutory Auditor Appointment (ADT-1)',
      'Direct CA Corporate Hotline Access',
    ],
    defaultService: 'Annual ROC Compliance (Pvt Ltd)',
  },
];

/* ─── Real-Time Client Activity Ticker ─── */
const LIVE_ACTIVITIES = [
  { name: 'Amit Kulkarni', city: 'Pune', action: 'Incorporate Pvt Ltd Company', time: '3 mins ago' },
  { name: 'Suresh Patil', city: 'Nashik', action: 'Applied for FPC Registration & SFAC Grant', time: '5 mins ago' },
  { name: 'Pooja Agarwal', city: 'Mumbai', action: 'Filed GST Monthly Return (GSTR-3B)', time: '8 mins ago' },
  { name: 'Dr. Ramesh Rao', city: 'Bengaluru', action: 'Registered Trademark in Class 5', time: '12 mins ago' },
  { name: 'Vikas Sharma', city: 'Ahmedabad', action: 'Completed Director KYC (DIR-3)', time: '15 mins ago' },
];

/* ─── 6 Core Bento Grid Cards ─── */
const CORE_PRACTICE_CARDS = [
  {
    title: 'Private Limited Company',
    desc: 'Limited liability and equity scalability. The standard legal structure for venture funding.',
    price: '₹16,499',
    timeline: '7–10 Days',
    icon: Building2,
    link: '/services/registration/private-limited',
    tag: 'Startups',
  },
  {
    title: 'Limited Liability Partnership',
    desc: 'Combines the flexibility of a partnership with the limited liability benefits of a company.',
    price: '₹9,999',
    timeline: '8–12 Days',
    icon: Building2,
    link: '/services/registration/llp',
    tag: 'Professionals',
  },
  {
    title: 'GST Registration & Return Filing',
    desc: 'Same-day GSTIN application and monthly ITC maximization audits by chartered accountants.',
    price: 'Starting @ ₹499',
    timeline: '1–3 Days',
    icon: Receipt,
    link: '/itr-filing',
    tag: 'Tax & Regulatory',
  },
  {
    title: 'Trademark Registration (™)',
    desc: 'Safeguard your brand name, logo, or slogan with immediate legal rights and defense.',
    price: '₹6,999',
    timeline: '24 Hours',
    icon: FileBadge,
    link: '/services/ip/trademark',
    tag: 'Intellectual Property',
  },
  {
    title: 'Farmer Producer Company (FPC)',
    desc: 'Agribusiness legal incorporation to unlock up to ₹15 Lakhs in SFAC matching equity grants.',
    price: '₹24,999',
    timeline: '15–20 Days',
    icon: Users,
    link: '/fpc-training',
    tag: 'Agri Hub',
  },
  {
    title: 'Annual ROC Compliance Retainer',
    desc: 'AOC-4, MGT-7, and DIR-3 KYC filings to keep your company active, compliant, and notice-free.',
    price: '₹9,999/yr',
    timeline: 'Annual Retainer',
    icon: ClipboardCheck,
    link: '/services/compliance/pvt-ltd',
    tag: 'Secretarial',
  },
];

export default function HomePage() {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(true);
  
  // Interactive Calculator State
  const [calcEntityType, setCalcEntityType] = useState('pvt_ltd');
  const [calcCapital, setCalcCapital] = useState('100000');
  const [calcDirectors, setCalcDirectors] = useState('2');

  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    mobile: '',
    email: '',
    city: 'Pune',
    state: 'Maharashtra',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeSegment = HERO_SEGMENTS[activeSegmentIndex];

  // Rotate social proof ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleHeroFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name.trim() || leadForm.mobile.trim().length < 10) {
      setSubmitError('Please enter your full name and a valid 10-digit mobile number.');
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
      service: activeSegment.defaultService,
      message: `Inquiry from Minimalist Hero (${activeSegment.tab}). WhatsApp Opt-in: ${whatsappConsent ? 'YES' : 'NO'}`,
      source: 'Homepage Minimalist Hero Lead Card',
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

  const searchResults = searchQuery.trim()
    ? services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className="font-sans antialiased text-slate-900 bg-white selection:bg-[#7C3AED] selection:text-white">
      <SEO
        title="ETaxwala — India's Modern Legal, Tax & Compliance Operating System"
        description="Private Limited Company Registration in 7 Days, GST Returns, Trademark Filing & Annual ROC Compliance. Advised by practicing Chartered Accountants. 1,00,000+ Filings across India."
        keywords="company registration India, private limited, GST return filing, tax audit, trademark registration, ROC compliance, CA services India, FPC registration"
        url="/"
      />

      {/* ═════════════════════════════════════════════════════════════════
          1. LIVE ACTIVITY TICKER BAR (Light Cream & Clean Social Proof)
          ═════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#FAF9F5] text-slate-800 text-xs py-2 px-4 border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse shrink-0" />
            <span className="font-bold text-slate-900 shrink-0">Live Client Filings:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-slate-700 font-medium truncate"
              >
                {LIVE_ACTIVITIES[tickerIndex].name} ({LIVE_ACTIVITIES[tickerIndex].city}) — <strong className="text-slate-900">{LIVE_ACTIVITIES[tickerIndex].action}</strong> • <span className="text-slate-500">{LIVE_ACTIVITIES[tickerIndex].time}</span>
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-600">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#0084D1]" /> MCA &amp; GST Certified Practice</span>
            <span>•</span>
            <span className="text-slate-900 font-bold">Helpline: 080-6902-9999</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          2. MINIMALIST HERO & LEAD GENERATION SECTION (Light & Cream)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-20 bg-gradient-to-b from-[#FAF9F5] via-[#FFFDF9] to-white border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Headline with Signature Multicolour Highlight */}
          <div className="max-w-3xl mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-slate-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Chartered Accountant Rigor • 100% Digital Execution</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              The modern operating system for <span className="text-multicolor">Indian legal, tax &amp; compliance</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Incorporate your company in 7 days, file penalty-proof GST/ITR returns, and manage annual secretarial compliance with dedicated senior Chartered Accountants.
            </p>
          </div>

          {/* Interactive Category Segment Switcher (Cream Tabs) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-[#EAE6DD]">
            {HERO_SEGMENTS.map((seg, idx) => {
              const isSelected = idx === activeSegmentIndex;
              return (
                <button
                  key={seg.id}
                  onClick={() => {
                    setActiveSegmentIndex(idx);
                    setSubmitSuccess(false);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'btn-multicolor shadow-xs'
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-[#EAE6DD] hover:bg-[#FAF9F5]'
                  }`}
                >
                  {seg.tab}
                </button>
              );
            })}
          </div>

          {/* Split Content Grid (Details Left, Focused Lead Card Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Selected Service Inclusions & Guarantees */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-slate-900 border border-[#EAE6DD]">
                    {activeSegment.badge}
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#E11D48]" /> {activeSegment.turnaround}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {activeSegment.title}
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeSegment.desc}
                </p>

                {/* Price — hidden, contact for quote */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="price-masked text-2xl">₹ ★ ★ ★</span>
                  <span className="text-xs font-bold text-[#7C3AED] bg-[#FAF9F5] border border-[#EAE6DD] px-2.5 py-1 rounded-md flex items-center gap-1">
                    Contact us for exact quote
                  </span>
                </div>
              </div>

              {/* What is Included Checklist */}
              <div className="pt-4 border-t border-[#EAE6DD] space-y-3">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Package Inclusions &amp; Deliverables:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSegment.inclusions.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators (Light Cream Cards) */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#EAE6DD] text-xs">
                <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EAE6DD] text-center">
                  <p className="font-extrabold text-slate-900 text-sm">1,00,000+</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Filings Cleared</p>
                </div>
                <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EAE6DD] text-center">
                  <p className="font-extrabold text-slate-900 text-sm">4.9 / 5.0</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Google Rating</p>
                </div>
                <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EAE6DD] text-center">
                  <p className="font-extrabold text-slate-900 text-sm">120+ Hubs</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Pan-India Reach</p>
                </div>
              </div>
            </div>

            {/* Right Column: High-Converting Minimalist Lead Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE6DD] shadow-card p-6 sm:p-7">
              <div className="border-b border-[#EAE6DD] pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Get Free CA Consultation &amp; Quote
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Guaranteed callback from Senior CA within 5 minutes
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] shrink-0 animate-pulse" title="Active CA Desk" />
              </div>

              {submitSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-[#7C3AED] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Inquiry Received</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    A Senior Chartered Accountant from our Pune/Mumbai legal desk is reviewing your details and will call you shortly.
                  </p>
                  <div className="p-2.5 bg-[#FAF9F5] rounded-lg text-xs text-slate-800 font-bold border border-[#EAE6DD]">
                    Direct Helpline: 080-6902-9999
                  </div>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setLeadForm({ name: '', mobile: '', email: '', city: 'Pune', state: 'Maharashtra' });
                    }}
                    className="text-xs text-[#0084D1] font-bold hover:underline"
                  >
                    Submit another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleHeroFormSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-[#E11D48]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Rao"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs font-medium text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number <span className="text-[#E11D48]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 border-r border-[#EAE6DD] pr-1.5">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          placeholder="98765 43210"
                          value={leadForm.mobile}
                          onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-[#EAE6DD] text-xs font-medium text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs font-medium text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City / District
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pune, Mumbai"
                        value={leadForm.city}
                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs font-medium text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={whatsappConsent}
                      onChange={(e) => setWhatsappConsent(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#059669] focus:ring-[#059669] border-slate-300"
                    />
                    <span className="text-[11px] text-slate-600">
                      Receive quote &amp; filing updates on <strong className="text-slate-900">WhatsApp</strong>
                    </span>
                  </label>

                  {submitError && (
                    <p className="text-xs text-[#E11D48] font-semibold">{submitError}</p>
                  )}

                  {/* Multicolour Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2 btn-multicolor"
                  >
                    {isSubmitting ? (
                      <span>Connecting to Senior CA...</span>
                    ) : (
                      <>
                        <span>Request Free Callback &amp; Quote</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> 256-Bit SSL Encrypted
                    </span>
                    <span>Zero Spam Guarantee</span>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          3. STATUTORY INTEGRATION & TRUST CREDENTIALS BAR
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-8 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Statutory &amp; Regulatory Integrations
              </p>
              <p className="text-[11px] text-slate-500">
                Direct MCA V3, GSTN, CBDT, and IP India online filing workflows
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0084D1]" /> MCA SPICe+ V3
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED]" /> GSTN Portal
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E11D48]" /> Income Tax e-Filing
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F97316]" /> IP India TM Registry
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-800" /> ISO 9001:2015
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          4. INSTANT SEARCH ACROSS 250+ SERVICES (Minimalist Light Hub)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Looking for a specific service?
          </h2>
          <p className="text-xs text-slate-500">
            Search our comprehensive directory of 250+ corporate, tax, compliance, and license services.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Type a service (e.g. Private Limited, Section 8, GST, Trademark, FSSAI, 80G, ISO)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#EAE6DD] text-xs font-medium text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] shadow-xs bg-white"
          />

          {searchResults.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-[#EAE6DD] shadow-xl overflow-hidden divide-y divide-slate-100">
              {searchResults.map((s) => (
                <Link
                  key={s.id}
                  to={`/services/${s.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className="p-3.5 hover:bg-[#FAF9F5] flex items-center justify-between group transition-colors"
                >
                  <div>
                    <p className="font-semibold text-xs text-slate-900 group-hover:text-[#0084D1]">{s.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{s.category}</p>
                  </div>
                  <span className="text-xs font-bold text-[#0084D1] flex items-center gap-1">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Popular Searches:</span>
          <Link to="/services/registration/private-limited" className="hover:text-[#0084D1] underline">Pvt Ltd Company</Link>
          <span>•</span>
          <Link to="/itr-filing" className="hover:text-[#0084D1] underline">ITR Return Filing</Link>
          <span>•</span>
          <Link to="/services/ip/trademark" className="hover:text-[#0084D1] underline">Trademark (TM)</Link>
          <span>•</span>
          <Link to="/fpc-training" className="hover:text-[#0084D1] underline">Farmer Producer Co.</Link>
          <span>•</span>
          <Link to="/services/compliance/pvt-ltd" className="hover:text-[#0084D1] underline">Annual ROC Compliance</Link>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          5. CORE PRACTICE VERTICALS (Bento Grid on Light Cream)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#FAF9F5] border-t border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-[#EAE6DD]">
              Core Practice Verticals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Comprehensive Corporate Lifecycle Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Handled directly by in-house Chartered Accountants, Company Secretaries, and Legal Advocates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_PRACTICE_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#EAE6DD] hover:border-slate-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-slate-800 border border-[#EAE6DD]">
                        {card.tag}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#E11D48]" /> {card.timeline}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] group-hover:border-[#7C3AED] text-slate-800 group-hover:text-[#7C3AED] flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0084D1] transition-colors">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#EAE6DD] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fee</span>
                      <span className="price-masked text-base">₹ ★ ★ ★</span>
                    </div>

                    <Link
                      to={card.link}
                      className="px-3.5 py-1.5 rounded-lg btn-multicolor font-bold text-xs shadow-xs flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          6. INTERACTIVE COMPANY INCORPORATION FEE CALCULATOR
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-t border-[#EAE6DD]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-[#EAE6DD]">
              Transparency First
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Company Incorporation Fee Estimator
            </h2>
            <p className="text-xs text-slate-500">
              Calculate government stamp duty and professional CA fees with zero hidden charges.
            </p>
          </div>

          <div className="bg-[#FAF9F5] rounded-2xl border border-[#EAE6DD] p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Entity Type</label>
                <select
                  value={calcEntityType}
                  onChange={(e) => setCalcEntityType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EAE6DD] bg-white font-semibold text-slate-800"
                >
                  <option value="pvt_ltd">Private Limited Company</option>
                  <option value="llp">LLP Partnership</option>
                  <option value="opc">One Person Company</option>
                  <option value="fpc">Farmer Producer Co (FPC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Capital</label>
                <select
                  value={calcCapital}
                  onChange={(e) => setCalcCapital(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EAE6DD] bg-white font-semibold text-slate-800"
                >
                  <option value="100000">₹1,00,000 (Standard)</option>
                  <option value="500000">₹5,00,000</option>
                  <option value="1000000">₹10,00,000</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Directors</label>
                <select
                  value={calcDirectors}
                  onChange={(e) => setCalcDirectors(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#EAE6DD] bg-white font-semibold text-slate-800"
                >
                  <option value="2">2 Directors (2 DSCs + 2 DINs)</option>
                  <option value="3">3 Directors</option>
                  <option value="4">4 Directors</option>
                </select>
              </div>

            </div>

            {/* Calculated Breakdown Card */}
            <div className="bg-white rounded-xl border border-[#EAE6DD] p-5 space-y-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span>MCA Government Stamp Duty &amp; Name Approval:</span>
                <span className="font-semibold text-slate-900">₹2,000 (Included)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Digital Signature Certificates ({calcDirectors} Class-3 DSCs):</span>
                <span className="font-semibold text-slate-900">₹3,000 (Included)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>CA Drafting (MoA, AoA, SPICe+ Filing &amp; PAN/TAN):</span>
                <span className="font-semibold text-slate-900">₹11,499 (Included)</span>
              </div>
              <div className="pt-3 border-t border-[#EAE6DD] flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase">Total All-Inclusive Fee:</span>
                  <p className="text-[11px] text-slate-500 font-medium">Includes all statutory filings &amp; post-incorporation kit</p>
                </div>
                <span className="text-2xl font-extrabold text-slate-900">
                  {calcEntityType === 'pvt_ltd' ? '₹16,499' : calcEntityType === 'llp' ? '₹9,999' : calcEntityType === 'opc' ? '₹11,999' : '₹24,999'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          7. TRANSPARENT COMPARISON TABLE (ETaxwala vs Others)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#FAF9F5] border-t border-[#EAE6DD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Indian Founders Choose ETaxwala
            </h2>
            <p className="text-xs text-slate-500">
              Clear, transparent comparison against traditional offline consultancies and generic web portals.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE6DD] overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE6DD] text-slate-700 font-bold uppercase text-[10px] bg-[#FAF9F5]">
                  <th className="py-3.5 px-5">Deliverable</th>
                  <th className="py-3.5 px-5 text-slate-900 font-extrabold text-xs">ETaxwala 2.0</th>
                  <th className="py-3.5 px-5 text-slate-500">Traditional Offline CA</th>
                  <th className="py-3.5 px-5 text-slate-500">Generic Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DD] text-slate-700 font-medium">
                <tr>
                  <td className="py-4 px-5 font-bold text-slate-900">Pricing Transparency</td>
                  <td className="py-4 px-5 text-slate-900 font-bold">100% Fixed &amp; All-Inclusive</td>
                  <td className="py-4 px-5 text-slate-500">Variable with hidden extra fees</td>
                  <td className="py-4 px-5 text-slate-500">Govt fees excluded on checkout</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-bold text-slate-900">Milestone Visibility</td>
                  <td className="py-4 px-5 text-slate-900 font-bold">10-Stage Real-Time Portal &amp; SMS</td>
                  <td className="py-4 px-5 text-slate-500">Manual phone follow-ups required</td>
                  <td className="py-4 px-5 text-slate-500">Static email notifications</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-bold text-slate-900">Professional Handling</td>
                  <td className="py-4 px-5 text-slate-900 font-bold">In-House Practicing CAs &amp; CSs</td>
                  <td className="py-4 px-5 text-slate-500">Delegated to article trainees</td>
                  <td className="py-4 px-5 text-slate-500">Automated bots / Non-CA teams</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-bold text-slate-900">Document Security</td>
                  <td className="py-4 px-5 text-slate-900 font-bold">256-Bit SSL Encrypted Vault</td>
                  <td className="py-4 px-5 text-slate-500">Physical paper folders in office</td>
                  <td className="py-4 px-5 text-slate-500">Basic shared storage</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-bold text-slate-900">Turnaround Commitment</td>
                  <td className="py-4 px-5 text-slate-900 font-bold">Guaranteed On-Time or Refund SLA</td>
                  <td className="py-4 px-5 text-slate-500">No committed timeline</td>
                  <td className="py-4 px-5 text-slate-500">Frequent portal delays</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          8. BOTTOM CONVERSION BANNER (Light Cream Theme)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-[#FAF9F5] border-t border-[#EAE6DD]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to incorporate or file tax returns?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Speak directly with a senior Chartered Accountant. Clear advice, zero jargon, and immediate execution.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="tel:08069029999"
              className="px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-xs hover:bg-[#FAF9F5] border border-[#EAE6DD] transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#F97316]" />
              <span>Call Senior CA: 080-6902-9999</span>
            </a>
            <Link
              to="/appointment"
              className="px-5 py-3 rounded-xl text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 btn-multicolor"
            >
              <span>Book In-Person / Video Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}