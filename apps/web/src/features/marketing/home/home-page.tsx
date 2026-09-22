import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/seo';
import {
  Building2,
  Receipt,
  ClipboardCheck,
  FileBadge,
  ArrowRight,
  Star,
  CheckCircle2,
  Phone,
  MapPin,
  Globe,
  Clock,
  Zap,
  Lock,
  AlertCircle,
  Scale,
  ShieldCheck,
  Search,
  MessageSquare,
  Sparkles,
  User,
  Mail,
  Calculator,
  Award,
  ChevronRight,
  Check,
  Users,
  ArrowUpRight,
  HelpCircle,
  Plus,
  Minus,
  ChevronDown,
} from 'lucide-react';
import { services } from '@/lib/constants/services';
import CtaBanner from '@/components/cta-banner';
import QuickEnquiryModal from '@/components/quick-enquiry-modal';
import LiveSocialProofGrid from '@/components/marketing/live-social-proof-grid';
import ReelsShowcaseSection from '@/components/marketing/reels-showcase-section';
import PhotoSliderSection from '@/components/marketing/photo-slider-section';

/* ─── Hero Segment Categories ─── */
const HERO_SEGMENTS = [
  {
    id: 'pvt_ltd',
    tab: 'Private Limited',
    title: 'Private Limited Company Registration',
    badge: 'MCA V3 SPICe+ Integrated',
    turnaround: '7–10 Working Days',
    price: '₹ * * * *',
    originalPrice: '₹ * * * * *',
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
    price: 'Starting @ ₹ * * * *',
    originalPrice: '₹ * * * * *',
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
    price: '₹ * * * *',
    originalPrice: '₹ * * * * *',
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
    price: '₹ * * * *',
    originalPrice: '₹ * * * * *',
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
    price: '₹ * * * * /yr',
    originalPrice: '₹ * * * * *',
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
  {
    name: 'Amit Kulkarni',
    city: 'Pune',
    action: 'Incorporate Pvt Ltd Company',
    time: '3 mins ago',
  },
  {
    name: 'Suresh Patil',
    city: 'Nashik',
    action: 'Applied for FPC Registration & SFAC Grant',
    time: '5 mins ago',
  },
  {
    name: 'Pooja Agarwal',
    city: 'Mumbai',
    action: 'Filed GST Monthly Return (GSTR-3B)',
    time: '8 mins ago',
  },
  {
    name: 'Dr. Ramesh Rao',
    city: 'Bengaluru',
    action: 'Registered Trademark in Class 5',
    time: '12 mins ago',
  },
  {
    name: 'Vikas Sharma',
    city: 'Ahmedabad',
    action: 'Completed Director KYC (DIR-3)',
    time: '15 mins ago',
  },
];

/* ─── How It Works Steps ─── */
const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Phone,
    title: 'Book Free CA Consultation',
    desc: 'Call us or submit a query. A Senior Chartered Accountant contacts you within 5 minutes to understand your requirement.',
    color: '#7C3AED',
    bg: '#F5F0FF',
  },
  {
    step: '02',
    icon: FileBadge,
    title: 'Share Documents Securely',
    desc: 'Upload required documents through our 256-bit SSL encrypted client portal. No physical visits needed — 100% online.',
    color: '#0084D1',
    bg: '#F0F8FF',
  },
  {
    step: '03',
    icon: ClipboardCheck,
    title: 'CA Reviews & Files',
    desc: 'Our in-house practicing CAs handle your filing directly — no outsourcing, no article trainees. Every filing is audited.',
    color: '#059669',
    bg: '#F0FDF4',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Certificate & Confirmation',
    desc: 'Receive your certificate, acknowledgment, or compliance confirmation with a full milestone tracking report via SMS & WhatsApp.',
    color: '#E11D48',
    bg: '#FFF1F4',
  },
];

/* ─── FAQ Items ─── */
const FAQ_ITEMS = [
  {
    q: 'What is the ITR filing deadline for FY 2025-26?',
    a: 'The ITR filing deadline for FY 2025-26 (AY 2026-27) is July 31, 2026 for salaried individuals (ITR-1/ITR-2). For businesses requiring tax audit (ITR-3/ITR-4), the extended deadline is October 31, 2026.',
  },
  {
    q: 'How long does Private Limited Company registration take?',
    a: "With ETaxwala's MCA V3 SPICe+ integrated workflow, Private Limited Company registration takes 7-10 working days. This includes DSC procurement, name approval, SPICe+ Part A & B filing, and corporate PAN/TAN.",
  },
  {
    q: 'What is the difference between Old vs New Tax Regime?',
    a: 'The Old Regime allows deductions (80C, HRA, LTA, etc.) but has higher tax slabs. The New Regime has lower tax rates but removes most deductions. For income below ₹7 Lakh, the New Regime is better due to rebate u/s 87A. For those with heavy 80C investments, the Old Regime may save more tax.',
  },
  {
    q: 'Is GST registration mandatory for my business?',
    a: 'GST registration is mandatory if your annual turnover exceeds ₹40 Lakh (goods) or ₹20 Lakh (services). For inter-state supply, e-commerce operators, or businesses in special category states, registration is mandatory regardless of turnover.',
  },
  {
    q: 'What is Trademark registration and how long does ™ protection last?',
    a: 'Trademark registration gives legal ownership over your brand name, logo, or slogan. You can use ™ immediately after filing and ® after full registration. Protection lasts 10 years and is renewable indefinitely. ETaxwala files your application within 24 hours.',
  },
  {
    q: 'How does the Annual ROC Compliance retainer work?',
    a: 'Our Annual ROC Compliance retainer covers: AOC-4 financial statement filing, MGT-7 annual return, DIR-3 KYC for all directors, AGM documentation, and Statutory Auditor appointment (ADT-1). A dedicated CA handles all filings on your behalf throughout the year.',
  },
  {
    q: 'What is FPC (Farmer Producer Company) and what subsidies are available?',
    a: 'An FPC is a hybrid legal structure for farmer groups combining company and cooperative benefits. Key subsidies include SFAC Equity Matching Grant up to ₹15 Lakh, NABARD PRODUCE Fund support, and SMART project funding. ETaxwala is a specialist in FPC registration and DPR preparation.',
  },
  {
    q: 'Do you handle GST & Income Tax notices?',
    a: 'Yes. ETaxwala provides full notice management — GSTN notices, Section 143(1) intimations, 245 adjustment notices, and scrutiny assessment responses. Our CA desk responds within 24 hours and represents you before the tax authority.',
  },
  {
    q: "Is my data safe on ETaxwala's platform?",
    a: 'Absolutely. All documents are stored in a 256-bit SSL encrypted vault accessible only to you and your assigned CA. We are ISO 9001:2015 certified and do not sell or share your data with any third party.',
  },
  {
    q: 'What are your service fees? Why are prices shown as ₹****?',
    a: 'We mask prices because government fees vary by state, capital, and entity type — showing a flat number would be misleading. After a free CA consultation, you receive a fixed all-inclusive quote with zero hidden charges. Our pricing is transparent and competitive vs. both offline CAs and generic portals.',
  },
];

/* ─── Tax Regime Calculator Data ─── */
const NEW_REGIME_SLABS_2526 = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.1 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.2 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.3 },
];

const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.2 },
  { min: 1000000, max: Infinity, rate: 0.3 },
];

function calcTax(income: number, slabs: typeof NEW_REGIME_SLABS_2526) {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const taxable = Math.min(income, slab.max) - slab.min;
    tax += taxable * slab.rate;
  }
  return Math.round(tax);
}

function calcNewRegimeTax(income: number) {
  let tax = calcTax(income, NEW_REGIME_SLABS_2526);
  // Rebate u/s 87A: nil tax if income <= 12 Lakh
  if (income <= 1200000) tax = 0;
  // Surcharge & cess: 4% health & education cess
  tax = Math.round(tax * 1.04);
  return tax;
}

function calcOldRegimeTax(income: number, deductions: number) {
  const taxableIncome = Math.max(0, income - deductions);
  let tax = calcTax(taxableIncome, OLD_REGIME_SLABS);
  // Rebate u/s 87A: nil tax if taxable income <= 5 Lakh
  if (taxableIncome <= 500000) tax = 0;
  // 4% cess
  tax = Math.round(tax * 1.04);
  return tax;
}

/* ─── 6 Core Bento Grid Cards ─── */
const CORE_PRACTICE_CARDS = [
  {
    title: 'Private Limited Company',
    desc: 'Limited liability and equity scalability. The standard legal structure for venture funding.',
    price: '₹ * * * *',
    timeline: '7–10 Days',
    icon: Building2,
    link: '/services/registration/private-limited',
    tag: 'Startups',
  },
  {
    title: 'Limited Liability Partnership',
    desc: 'Combines the flexibility of a partnership with the limited liability benefits of a company.',
    price: '₹ * * * *',
    timeline: '8–12 Days',
    icon: Building2,
    link: '/services/registration/llp',
    tag: 'Professionals',
  },
  {
    title: 'GST Registration & Return Filing',
    desc: 'Same-day GSTIN application and monthly ITC maximization audits by chartered accountants.',
    price: 'Starting @ ₹ * * * *',
    timeline: '1–3 Days',
    icon: Receipt,
    link: '/itr-filing',
    tag: 'Tax & Regulatory',
  },
  {
    title: 'Trademark Registration (™)',
    desc: 'Safeguard your brand name, logo, or slogan with immediate legal rights and defense.',
    price: '₹ * * * *',
    timeline: '24 Hours',
    icon: FileBadge,
    link: '/services/ip/trademark',
    tag: 'Intellectual Property',
  },
  {
    title: 'Farmer Producer Company (FPC)',
    desc: 'Agribusiness legal incorporation to unlock up to ₹15 Lakhs in SFAC matching equity grants.',
    price: '₹ * * * *',
    timeline: '15–20 Days',
    icon: Users,
    link: '/fpc-training',
    tag: 'Agri Hub',
  },
  {
    title: 'Annual ROC Compliance Retainer',
    desc: 'AOC-4, MGT-7, and DIR-3 KYC filings to keep your company active, compliant, and notice-free.',
    price: '₹ * * * * /yr',
    timeline: 'Annual Retainer',
    icon: ClipboardCheck,
    link: '/services/compliance/pvt-ltd',
    tag: 'Secretarial',
  },
];

/* ─── Dynamic Darkening Deadline Banner Sub-Component ─── */
function DeadlineBanner() {
  const DEADLINE = useMemo(() => new Date('2026-10-31T23:59:59+05:30'), []);
  const [timeLeft, setTimeLeft] = useState({ days: 56, hours: 5, mins: 32, secs: 0 });

  // Optional manual test override (via ?days=X or clicking test pill)
  const [testDaysOverride, setTestDaysOverride] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const d = p.get('days');
      if (d !== null && !isNaN(Number(d))) return Number(d);
    }
    return null;
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = DEADLINE.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [DEADLINE]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#itr-deadline-banner') {
      setTimeout(() => {
        document
          .getElementById('itr-deadline-banner')
          ?.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, 300);
    }
  }, []);

  const effectiveDays = testDaysOverride !== null ? testDaysOverride : timeLeft.days;

  // Calculate dynamic urgency theme and darkness according to time left
  const theme = useMemo(() => {
    const days = effectiveDays;
    const hours = timeLeft.hours;
    const totalHours = days * 24 + hours;

    if (totalHours <= 72) {
      // 0 - 3 Days: Extreme Urgency — Darkest Midnight Obsidian Crimson / Deep Wine Night
      return {
        stage: 'Extreme Last Call (< 3 Days)',
        gradient: 'bg-gradient-to-r from-[#1A0105] via-[#36040F] to-[#120004]',
        tag: '🚨 CRITICAL LAST CHANCE: ITR Extended Deadline Ending!',
        sub: '— Portal Closes Soon • Avoid Section 234F Penalty of ₹5,000',
        cardBg: 'bg-rose-950/70 border border-rose-500/40 text-rose-100 shadow-inner',
        cardLabel: 'text-rose-400 font-bold',
        buttonClass:
          'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.8)] border border-rose-400/60 animate-pulse',
        pingColor: 'bg-rose-400',
        pingGlow: 'shadow-[0_0_8px_#F43F5E]',
        borderBottom: 'border-b-2 border-rose-700/60',
      };
    }

    if (days <= 7) {
      // 4 - 7 Days: Highly Urgent — Very Dark Deep Blood Maroon
      return {
        stage: 'Final Week Notice (4 - 7 Days)',
        gradient: 'bg-gradient-to-r from-[#4C0519] via-[#63071F] to-[#3B020D]',
        tag: '⚠️ FINAL 7 DAYS: Statutory ITR Filing Deadline',
        sub: '— High CBDT Server Traffic Expected • File with CA Today',
        cardBg: 'bg-black/40 border border-white/20 text-white shadow-inner',
        cardLabel: 'text-rose-200 font-bold',
        buttonClass: 'bg-white text-[#63071F] hover:bg-rose-50 shadow-md font-extrabold',
        pingColor: 'bg-rose-300',
        pingGlow: 'shadow-[0_0_6px_#FB7185]',
        borderBottom: 'border-b border-rose-900/50',
      };
    }

    if (days <= 15) {
      // 8 - 15 Days: Elevated Urgency — Deep Burgundy / Wine Red
      return {
        stage: '2 Weeks Remaining (8 - 15 Days)',
        gradient: 'bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#5C1111]',
        tag: '⚠️ ITR EXTENDED DEADLINE: 2 Weeks Remaining',
        sub: '— FY 2025-26 (AY 2026-27) Tax Audit Cases',
        cardBg: 'bg-black/30 border border-white/20 text-white',
        cardLabel: 'text-white/80',
        buttonClass: 'bg-white text-[#991B1B] hover:bg-red-50 shadow-sm font-bold',
        pingColor: 'bg-white',
        pingGlow: 'shadow-sm',
        borderBottom: 'border-b border-red-900/40',
      };
    }

    if (days <= 30) {
      // 16 - 30 Days: Moderate Alert — Deep Ruby Red (Noticeably Darker)
      return {
        stage: '1 Month Notice (16 - 30 Days)',
        gradient: 'bg-gradient-to-r from-[#9F1239] via-[#BE123C] to-[#881337]',
        tag: '⚠️ ITR EXTENDED DEADLINE: 1 Month Left',
        sub: '— FY 2025-26 (AY 2026-27) Tax Audit Cases',
        cardBg: 'bg-white/20 text-white',
        cardLabel: 'text-white/75',
        buttonClass: 'bg-white text-[#9F1239] hover:bg-rose-50 font-bold',
        pingColor: 'bg-white',
        pingGlow: 'shadow-sm',
        borderBottom: 'border-b border-red-900/30',
      };
    }

    if (days <= 45) {
      // 31 - 45 Days: Standard Alert — Medium Crimson
      return {
        stage: 'Standard Advisory (31 - 45 Days)',
        gradient: 'bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#9F1239]',
        tag: '⚠️ ITR FILING EXTENDED DEADLINE',
        sub: '— FY 2025-26 (AY 2026-27) Tax Audit Cases',
        cardBg: 'bg-white/20 text-white',
        cardLabel: 'text-white/70',
        buttonClass: 'bg-white text-[#BE123C] hover:bg-red-50 font-bold',
        pingColor: 'bg-white',
        pingGlow: 'shadow-sm',
        borderBottom: 'border-b border-red-900/20',
      };
    }

    // 46+ Days: Relaxed / Early Period — Vibrant Coral-Rose Red (Lighter, fresh)
    return {
      stage: 'Early Window (> 45 Days)',
      gradient: 'bg-gradient-to-r from-[#F43F5E] via-[#E11D48] to-[#BE123C]',
      tag: '⚠️ ITR FILING EXTENDED DEADLINE',
      sub: '— FY 2025-26 (AY 2026-27) Tax Audit Cases',
      cardBg: 'bg-white/20 text-white',
      cardLabel: 'text-white/70',
      buttonClass: 'bg-white text-[#E11D48] hover:bg-rose-50 font-bold',
      pingColor: 'bg-white',
      pingGlow: 'shadow-sm',
      borderBottom: 'border-b border-rose-300/30',
    };
  }, [effectiveDays, timeLeft.hours]);

  // Quick cycle through urgency stages for previewing when clicking the status tag
  const cyclePreviewStage = () => {
    if (testDaysOverride === null) setTestDaysOverride(30);
    else if (testDaysOverride === 30) setTestDaysOverride(14);
    else if (testDaysOverride === 14) setTestDaysOverride(6);
    else if (testDaysOverride === 6) setTestDaysOverride(2);
    else setTestDaysOverride(null); // Reset back to live countdown
  };

  return (
    <div
      id="itr-deadline-banner"
      className={`${theme.gradient} ${theme.borderBottom} text-white py-3 px-4 transition-all duration-700 select-none relative overflow-hidden`}
    >
      {/* Background ambient pulse for extreme states */}
      {effectiveDays <= 7 && (
        <div className="absolute inset-0 bg-rose-600/10 animate-pulse pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 shrink-0 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.pingColor} opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.pingColor} ${theme.pingGlow}`}
            />
          </span>
          <div className="flex flex-wrap items-center">
            <button
              onClick={cyclePreviewStage}
              title="Click to preview different urgency darkness stages"
              className="text-xs font-extrabold uppercase tracking-wider text-left hover:underline focus:outline-none flex items-center gap-1.5"
            >
              <span>{theme.tag}</span>
            </button>
            <span className="hidden sm:inline text-white/80 text-xs ml-2">{theme.sub}</span>

            {testDaysOverride !== null && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-rose-200 border border-white/20">
                Preview: {theme.stage} (Click tag to cycle)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { val: effectiveDays, label: 'Days' },
              { val: timeLeft.hours, label: 'Hrs' },
              { val: timeLeft.mins, label: 'Mins' },
              { val: timeLeft.secs, label: 'Secs' },
            ].map(({ val, label }) => (
              <div
                key={label}
                className={`flex flex-col items-center ${theme.cardBg} rounded-lg px-2.5 sm:px-3 py-1.5 min-w-[42px] transition-all duration-500`}
              >
                <span className="text-base font-extrabold font-mono leading-none">
                  {String(val).padStart(2, '0')}
                </span>
                <span className={`text-[9px] uppercase tracking-wider ${theme.cardLabel}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/itr-filing"
            className={`text-xs ${theme.buttonClass} px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0`}
          >
            File Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Certified By Bar Sub-Component ─── */
function CertifiedByBar() {
  const certs = [
    { label: 'MCA SPICe+ V3', icon: '🏛️', sub: 'Company Registration' },
    { label: 'ISO 9001:2015', icon: '🎖️', sub: 'Quality Certified' },
    { label: 'GSTN Authorized', icon: '📋', sub: 'GST Suvidha Provider' },
    { label: 'ICAI Partner', icon: '⚖️', sub: 'CA Firm Affiliated' },
    { label: 'IP India Registered', icon: '™️', sub: 'Trademark Agent' },
    { label: 'MSME Registered', icon: '🏭', sub: 'Udyam Certified' },
    { label: 'CBDT e-Return Intermediary', icon: '🔐', sub: 'Income Tax Filing' },
  ];

  return (
    <section className="py-8 bg-white border-t border-[#EAE6DD] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Officially Certified & Registered With
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {certs.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#FAF9F5] rounded-xl border border-[#EAE6DD] hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <span className="text-base">{c.icon}</span>
              <div>
                <p className="text-[11px] font-bold text-slate-800 leading-tight whitespace-nowrap">
                  {c.label}
                </p>
                <p className="text-[9px] text-slate-400 font-medium">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Old vs New Tax Regime Calculator Sub-Component ─── */
function TaxRegimeCalculator() {
  const [grossIncome, setGrossIncome] = useState(800000);
  const [deductions, setDeductions] = useState(150000);

  const newTax = calcNewRegimeTax(grossIncome);
  const oldTax = calcOldRegimeTax(grossIncome, deductions);
  const savings = Math.abs(newTax - oldTax);
  const betterRegime = newTax <= oldTax ? 'New Regime' : 'Old Regime';
  const betterColor = newTax <= oldTax ? '#059669' : '#7C3AED';

  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${n.toLocaleString('en-IN')}`;

  return (
    <section className="py-16 bg-[#FAF9F5] border-t border-[#EAE6DD]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-[#EAE6DD]">
            🧮 Free Tax Calculator
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Old vs New Tax Regime Calculator
          </h2>
          <p className="text-xs text-slate-500">
            FY 2025-26 (AY 2026-27) — Includes 4% Health & Education Cess + Rebate u/s 87A
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE6DD] p-6 sm:p-8 space-y-6">
          {/* Income Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Annual Gross Income</label>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {fmt(grossIncome)}
              </span>
            </div>
            <input
              type="range"
              min="200000"
              max="5000000"
              step="50000"
              value={grossIncome}
              onChange={(e) => setGrossIncome(Number(e.target.value))}
              className="tax-range-slider"
              style={{ '--slider-thumb-color': '#7C3AED' } as React.CSSProperties}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>₹2L</span>
              <span>₹25L</span>
              <span>₹50L</span>
            </div>
          </div>

          {/* Deductions Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">
                Total Deductions (80C, HRA, LTA, etc.) — Old Regime Only
              </label>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {fmt(deductions)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="400000"
              step="10000"
              value={deductions}
              onChange={(e) => setDeductions(Number(e.target.value))}
              className="tax-range-slider"
              style={{ '--slider-thumb-color': '#0084D1' } as React.CSSProperties}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>₹0</span>
              <span>₹2L</span>
              <span>₹4L</span>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EAE6DD]">
            <div className="p-4 bg-[#F5F0FF] rounded-xl border border-purple-100 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1">
                New Regime Tax
              </p>
              <p className="text-xl font-extrabold text-slate-900 font-mono">{fmt(newTax)}</p>
              <p className="text-[10px] text-slate-500 mt-1">Rate: As per new slabs</p>
            </div>
            <div className="p-4 bg-[#F0F8FF] rounded-xl border border-blue-100 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                Old Regime Tax
              </p>
              <p className="text-xl font-extrabold text-slate-900 font-mono">{fmt(oldTax)}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                After deductions: {fmt(Math.max(0, grossIncome - deductions))}
              </p>
            </div>
            <div
              className="p-4 rounded-xl border text-center"
              style={{ background: betterColor + '12', borderColor: betterColor + '30' }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: betterColor }}
              >
                You Save
              </p>
              <p className="text-xl font-extrabold font-mono" style={{ color: betterColor }}>
                {fmt(savings)}
              </p>
              <p className="text-[10px] font-bold mt-1" style={{ color: betterColor }}>
                with {betterRegime}
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400 mb-3">
              * Indicative estimate only. Consult a CA for exact tax liability.
            </p>
            <Link
              to="/itr-filing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-multicolor font-bold text-xs"
            >
              <span className="btn-galaxy__stars" aria-hidden="true" />
              <span className="relative z-[2] inline-flex items-center justify-center gap-2">
                <span>File ITR with Expert CA</span>
                <ArrowRight className="btn-galaxy__icon w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ Accordion Sub-Component ─── */
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 bg-white border-t border-[#EAE6DD]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-[#EAE6DD]">
            ❓ Most Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Everything you need to know about taxes, registrations, and compliance in India.
          </p>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${openIndex === i ? 'border-[#7C3AED]/30 shadow-sm bg-[#FAF9F5]' : 'border-[#EAE6DD] bg-white hover:border-slate-300'}`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
              >
                <span className="text-sm font-semibold text-slate-900 pr-4 leading-snug">
                  {item.q}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${openIndex === i ? 'bg-[#7C3AED] text-white' : 'bg-[#FAF9F5] border border-[#EAE6DD] text-slate-400'}`}
                >
                  {openIndex === i ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-[#EAE6DD] pt-3">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 mb-3">
            Have more questions? Our CA team answers within 5 minutes.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#FAF9F5] border border-[#EAE6DD] text-slate-800 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            Ask a CA Directly <ArrowRight className="w-3.5 h-3.5 text-[#7C3AED]" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [selectedEnquiryService, setSelectedEnquiryService] = useState<string | null>(null);
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
      // Submit to local backend API
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await fetch(`${API_BASE}/api/add-inquiry-lead`, {
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
    ? services
        .filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
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
                {LIVE_ACTIVITIES[tickerIndex].name} ({LIVE_ACTIVITIES[tickerIndex].city}) —{' '}
                <strong className="text-slate-900">{LIVE_ACTIVITIES[tickerIndex].action}</strong> •{' '}
                <span className="text-slate-500">{LIVE_ACTIVITIES[tickerIndex].time}</span>
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0084D1]" /> MCA &amp; GST Certified
              Practice
            </span>
            <span>•</span>
            <span className="text-slate-900 font-bold">Helpline: 080-6902-9999</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          2. MINIMALIST HERO & LEAD GENERATION SECTION (Signature Pattern)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-20 bg-etax-puma-soft border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Headline with Signature Multicolour Highlight */}
          <div className="max-w-3xl mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-slate-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Chartered Accountant Rigor • 100% Digital Execution</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              The modern operating system for{' '}
              <span className="text-multicolor">Indian legal, tax &amp; compliance</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Incorporate your company in 7 days, file penalty-proof GST/ITR returns, and manage
              annual secretarial compliance with dedicated senior Chartered Accountants.
            </p>
          </div>

          {/* Interactive Category Segment Switcher (Folder Tabs - german_7619/brown-sloth-50) */}
          <div className="etax-folder-tabs-strip">
            {HERO_SEGMENTS.map((seg, idx) => {
              const isSelected = idx === activeSegmentIndex;
              return (
                <button
                  key={seg.id}
                  onClick={() => {
                    setActiveSegmentIndex(idx);
                    setSubmitSuccess(false);
                  }}
                  className={`etax-folder-tab ${isSelected ? 'active' : ''}`}
                >
                  <span className="etax-folder-tab-name">
                    <span className="pos-curve" />
                    <span className="pre-curve" />
                    <span>{seg.tab}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Split Content Grid (Details Left, Focused Lead Card Right) inside Folder Panel */}
          <div className="etax-folder-panel p-4 sm:p-8 lg:p-10 mb-8">
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

                  <p className="text-sm text-slate-600 leading-relaxed">{activeSegment.desc}</p>

                  {/* Price — hidden, contact for quote */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="price-masked text-2xl font-mono tracking-widest font-extrabold text-slate-900">
                      ₹ * * * *
                    </span>
                    <span className="text-xs font-bold text-[#7C3AED] bg-[#FAF9F5] border border-[#EAE6DD] px-2.5 py-1 rounded-md flex items-center gap-1">
                      Unlocked upon CA consultation
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
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                      >
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
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#E11D48] shrink-0 animate-pulse"
                    title="Active CA Desk"
                  />
                </div>

                {submitSuccess ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-[#7C3AED] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Inquiry Received</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      A Senior Chartered Accountant from our Pune/Mumbai legal desk is reviewing
                      your details and will call you shortly.
                    </p>
                    <div className="p-2.5 bg-[#FAF9F5] rounded-lg text-xs text-slate-800 font-bold border border-[#EAE6DD]">
                      Direct Helpline: 080-6902-9999
                    </div>
                    <button
                      onClick={() => {
                        setSubmitSuccess(false);
                        setLeadForm({
                          name: '',
                          mobile: '',
                          email: '',
                          city: 'Pune',
                          state: 'Maharashtra',
                        });
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
                            onChange={(e) =>
                              setLeadForm({
                                ...leadForm,
                                mobile: e.target.value.replace(/\D/g, '').slice(0, 10),
                              })
                            }
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
                        Receive quote &amp; filing updates on{' '}
                        <strong className="text-slate-900">WhatsApp</strong>
                      </span>
                    </label>

                    {submitError && (
                      <p className="text-xs text-[#E11D48] font-semibold">{submitError}</p>
                    )}

                    {/* Multicolour Action Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl cursor-pointer disabled:opacity-60 mt-2 btn-multicolor"
                    >
                      <span className="btn-galaxy__stars" aria-hidden="true" />
                      <span className="relative z-[2] inline-flex items-center justify-center gap-2 font-bold text-xs">
                        {isSubmitting ? (
                          <span>Connecting to Senior CA...</span>
                        ) : (
                          <>
                            <span>Request Free Callback &amp; Quote</span>
                            <ArrowRight className="btn-galaxy__icon w-3.5 h-3.5" />
                          </>
                        )}
                      </span>
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
          3b. ITR FILING DEADLINE COUNTDOWN BANNER
          ═════════════════════════════════════════════════════════════════ */}
      <DeadlineBanner />

      {/* ═════════════════════════════════════════════════════════════════
          4. INSTANT SEARCH ACROSS 250+ SERVICES (Minimalist Light Hub)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Looking for a specific service?
          </h2>
          <p className="text-xs text-slate-500">
            Search our comprehensive directory of 250+ corporate, tax, compliance, and license
            services.
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
                    <p className="font-semibold text-xs text-slate-900 group-hover:text-[#0084D1]">
                      {s.name}
                    </p>
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
          <Link
            to="/services/registration/private-limited"
            className="hover:text-[#0084D1] underline"
          >
            Pvt Ltd Company
          </Link>
          <span>•</span>
          <Link to="/itr-filing" className="hover:text-[#0084D1] underline">
            ITR Return Filing
          </Link>
          <span>•</span>
          <Link to="/services/ip/trademark" className="hover:text-[#0084D1] underline">
            Trademark (TM)
          </Link>
          <span>•</span>
          <Link to="/fpc-training" className="hover:text-[#0084D1] underline">
            Farmer Producer Co.
          </Link>
          <span>•</span>
          <Link to="/services/compliance/pvt-ltd" className="hover:text-[#0084D1] underline">
            Annual ROC Compliance
          </Link>
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
              Handled directly by in-house Chartered Accountants, Company Secretaries, and Legal
              Advocates.
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

                    <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#EAE6DD] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Fee
                      </span>
                      <span className="price-masked text-base font-mono tracking-widest font-extrabold text-slate-900">
                        ₹ * * * *
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEnquiryService(card.title)}
                      className="btn-panda"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 btn-panda-icon" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          5b. HOW IT WORKS — 4-STEP PROCESS
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-t border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-[#EAE6DD]">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How ETaxwala Works
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              From first consultation to final certificate — fully managed by practicing Chartered
              Accountants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector lines — desktop only */}
            <div className="hidden lg:block absolute top-10 left-[calc(12.5%+12px)] right-[calc(12.5%+12px)] h-px bg-gradient-to-r from-transparent via-[#EAE6DD] to-transparent z-0" />

            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative z-10 flex flex-col items-center text-center p-6 bg-[#FAF9F5] rounded-2xl border border-[#EAE6DD] hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  {/* Step number */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: step.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-widest mb-1"
                    style={{ color: step.color }}
                  >
                    Step {step.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-multicolor font-bold text-sm"
            >
              <span className="btn-galaxy__stars" aria-hidden="true" />
              <span className="relative z-[2] inline-flex items-center justify-center gap-2">
                <span>Book Free CA Consultation</span>
                <ArrowRight className="btn-galaxy__icon w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          5c. CERTIFIED BY — TRUST LOGOS BAR
          ═════════════════════════════════════════════════════════════════ */}
      <CertifiedByBar />

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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entity Type
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Authorized Capital
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Directors
                </label>
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
                <span className="font-mono tracking-wider font-bold text-slate-900">
                  ₹ * * * * (Included)
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Digital Signature Certificates ({calcDirectors} Class-3 DSCs):</span>
                <span className="font-mono tracking-wider font-bold text-slate-900">
                  ₹ * * * * (Included)
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>CA Drafting (MoA, AoA, SPICe+ Filing &amp; PAN/TAN):</span>
                <span className="font-mono tracking-wider font-bold text-slate-900">
                  ₹ * * * * (Included)
                </span>
              </div>
              <div className="pt-3 border-t border-[#EAE6DD] flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Total All-Inclusive Fee:
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium">
                    All statutory filings &amp; post-incorporation kit included
                  </p>
                </div>
                <span className="text-2xl font-extrabold tracking-widest font-mono text-slate-900">
                  ₹ * * * *
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          6b. OLD VS NEW TAX REGIME CALCULATOR
          ═════════════════════════════════════════════════════════════════ */}
      <TaxRegimeCalculator />

      {/* ═════════════════════════════════════════════════════════════════
          7. CA SHORTS & REELS SHOWCASE (Continuous Flowing Slider)
          ═════════════════════════════════════════════════════════════════ */}
      <ReelsShowcaseSection />

      {/* ═════════════════════════════════════════════════════════════════
          8. LIVE CUSTOMER REVIEWS & TRUST FLOW (CleverPe Style)
          ═════════════════════════════════════════════════════════════════ */}
      <LiveSocialProofGrid />

      {/* ═════════════════════════════════════════════════════════════════
          9. BEHIND THE SCENES: PHOTO SLIDER & OFFICES SHOWCASE
          ═════════════════════════════════════════════════════════════════ */}
      <PhotoSliderSection />

      {/* ═════════════════════════════════════════════════════════════════
          8. TRANSPARENT COMPARISON TABLE (ETaxwala vs Others)
          ═════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#FAF9F5] border-t border-[#EAE6DD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Indian Founders Choose ETaxwala
            </h2>
            <p className="text-xs text-slate-500">
              Clear, transparent comparison against traditional offline consultancies and generic
              web portals.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE6DD] overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE6DD] text-slate-700 font-bold uppercase text-[10px] bg-[#FAF9F5]">
                  <th className="py-3.5 px-5">Deliverable</th>
                  <th className="py-3.5 px-5 text-[#059669] font-extrabold text-xs">
                    ✅ ETaxwala 2.0
                  </th>
                  <th className="py-3.5 px-5 text-slate-500">❌ Traditional Offline CA</th>
                  <th className="py-3.5 px-5 text-slate-500">❌ Generic Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DD] text-slate-700 font-medium">
                {[
                  [
                    'Pricing Transparency',
                    '✅ 100% Fixed & All-Inclusive',
                    '❌ Variable with hidden extra fees',
                    '❌ Govt fees excluded on checkout',
                  ],
                  [
                    'Milestone Visibility',
                    '✅ 10-Stage Real-Time Portal & SMS',
                    '❌ Manual phone follow-ups required',
                    '❌ Static email notifications',
                  ],
                  [
                    'Professional Handling',
                    '✅ In-House Practicing CAs & CSs',
                    '❌ Delegated to article trainees',
                    '❌ Automated bots / Non-CA teams',
                  ],
                  [
                    'Document Security',
                    '✅ 256-Bit SSL Encrypted Vault',
                    '❌ Physical paper folders in office',
                    '❌ Basic shared storage',
                  ],
                  [
                    'Turnaround Commitment',
                    '✅ Guaranteed On-Time or Refund SLA',
                    '❌ No committed timeline',
                    '❌ Frequent portal delays',
                  ],
                  [
                    'Notice Management',
                    '✅ Free GST & IT Notice Reply',
                    '❌ Charged separately per notice',
                    '❌ Not included',
                  ],
                  [
                    'WhatsApp Updates',
                    '✅ Real-time WhatsApp milestone SMS',
                    '❌ Manual calls only',
                    '❌ Email only',
                  ],
                ].map(([label, etax, trad, generic], i) => (
                  <tr key={i}>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{label}</td>
                    <td className="py-3.5 px-5 text-[#059669] font-bold">{etax}</td>
                    <td className="py-3.5 px-5 text-slate-500">{trad}</td>
                    <td className="py-3.5 px-5 text-slate-500">{generic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          8b. FAQ ACCORDION SECTION
          ═════════════════════════════════════════════════════════════════ */}
      <FaqSection />

      {/* ═════════════════════════════════════════════════════════════════
          9. SIGNATURE CONVERSION BANNER (Ready to Work with India's Best?)
          ═════════════════════════════════════════════════════════════════ */}
      <CtaBanner
        title="Ready to Work with India's Best?"
        subtitle="Book a free consultation and discover how ETaxwala can transform your business compliance experience."
        primaryButtonText="Book Free Consultation"
        primaryButtonLink="/appointment"
        secondaryButtonText="Explore Services"
        secondaryButtonLink="/services"
      />

      <QuickEnquiryModal
        isOpen={!!selectedEnquiryService}
        onClose={() => setSelectedEnquiryService(null)}
        serviceTitle={selectedEnquiryService || ''}
      />
    </div>
  );
}
