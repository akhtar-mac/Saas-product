import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Volume2, VolumeX, Heart, Share2, Eye,
  ArrowRight, X, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Dummy Reels Data (Easily replaced with real Instagram/YouTube links) ─────
export interface ReelItem {
  id: string;
  title: string;
  category: 'Tax Hacks' | 'Company Setup' | 'GST Rules' | 'Agri & FPC' | 'MSME & Loans';
  speaker: {
    name: string;
    role: string;
    city: string;
    initials: string;
    avatarBg: string;
  };
  duration: string;
  views: string;
  likes: number;
  tags: string[];
  description: string;
  gradient: string;
  accentColor: string;
  posterUrl?: string;
}

export const DUMMY_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'Save 30% Income Tax using Section 44ADA (Freelancers & Tech)',
    category: 'Tax Hacks',
    speaker: {
      name: 'CA Rohan Sharma',
      role: 'Senior Tax Partner',
      city: 'Pune',
      initials: 'RS',
      avatarBg: 'from-blue-600 to-indigo-600',
    },
    duration: '0:52',
    views: '248K',
    likes: 18420,
    tags: ['#TaxHack', '#Section44ADA', '#ITRFiling'],
    description: 'If you earn freelance or consulting income under ₹75 Lakhs, declare only 50% as taxable profit and save thousands with zero book-keeping hassle.',
    gradient: 'from-blue-900 via-indigo-950 to-slate-900',
    accentColor: 'text-[#0084D1]',
    posterUrl: '/reels/reel_tax_hack.jpg',
  },
  {
    id: 'reel-2',
    title: 'Pvt Ltd vs LLP: 3 Hidden Traps Before You Choose Entity',
    category: 'Company Setup',
    speaker: {
      name: 'CS Neha Deshmukh',
      role: 'Corporate Secretary Lead',
      city: 'Sambhajinagar',
      initials: 'ND',
      avatarBg: 'from-purple-600 to-pink-600',
    },
    duration: '0:58',
    views: '315K',
    likes: 24190,
    tags: ['#PvtLtd', '#LLP', '#StartupIndia'],
    description: 'Venture capitalists cannot invest in LLPs. Watch this 60-second comparison on ESOPs, annual compliance costs, and foreign equity rules.',
    gradient: 'from-purple-950 via-violet-900 to-slate-900',
    accentColor: 'text-[#7C3AED]',
    posterUrl: '/reels/reel_startup_ca.jpg',
  },
  {
    id: 'reel-3',
    title: 'How Farmer Companies Get ₹15 Lakhs SFAC Equity Grant',
    category: 'Agri & FPC',
    speaker: {
      name: 'Sachin Kadam',
      role: 'Agri Cluster Director',
      city: 'Nashik',
      initials: 'SK',
      avatarBg: 'from-emerald-600 to-teal-600',
    },
    duration: '0:49',
    views: '182K',
    likes: 14850,
    tags: ['#FarmerProducerCo', '#SFACGrant', '#NABARD'],
    description: '100% government matching equity grant for registered FPCs with at least 50 farmer shareholders. Learn how to draft the DPR without brokers.',
    gradient: 'from-emerald-950 via-teal-900 to-slate-900',
    accentColor: 'text-emerald-500',
    posterUrl: '/reels/reel_fpc_agri.jpg',
  },
  {
    id: 'reel-4',
    title: 'Avoid ₹50/Day GST Late Fee & Protect Your ITC Credit',
    category: 'GST Rules',
    speaker: {
      name: 'CA Amit Verma',
      role: 'GST Advisory Lead',
      city: 'Jalna',
      initials: 'AV',
      avatarBg: 'from-amber-600 to-orange-600',
    },
    duration: '0:45',
    views: '412K',
    likes: 38200,
    tags: ['#GSTLateFee', '#GSTR3B', '#InputTaxCredit'],
    description: 'Did you know GSTR-3B filed after the 20th triggers a compounding late penalty and blocks your e-way bill generation? Follow these 3 audit tips.',
    gradient: 'from-amber-950 via-rose-900 to-slate-900',
    accentColor: 'text-amber-500',
    posterUrl: '/reels/reel_gst_audit.jpg',
  },
  {
    id: 'reel-5',
    title: 'Why MCA Rejects 80% Company Names on SPICe+ Portal',
    category: 'Company Setup',
    speaker: {
      name: 'Pooja Kulkarni',
      role: 'MCA Compliance Head',
      city: 'Pune',
      initials: 'PK',
      avatarBg: 'from-rose-600 to-red-600',
    },
    duration: '0:55',
    views: '194K',
    likes: 16730,
    tags: ['#MCANameSearch', '#SPICePlus', '#Incorporation'],
    description: 'Using generic words like "Tech" or existing trademarks leads to instant MCA name rejection. Here is our 4-step naming clearance checklist.',
    gradient: 'from-rose-950 via-pink-900 to-slate-900',
    accentColor: 'text-[#E11D48]',
    posterUrl: '/reels/reel_startup_ca.jpg',
  },
  {
    id: 'reel-6',
    title: 'Trademark Class 35 vs Class 42: What Startups Miss',
    category: 'Tax Hacks',
    speaker: {
      name: 'Adv. Priya Nair',
      role: 'IP & Trademark Attorney',
      city: 'Mumbai',
      initials: 'PN',
      avatarBg: 'from-cyan-600 to-blue-600',
    },
    duration: '0:50',
    views: '168K',
    likes: 13200,
    tags: ['#TrademarkClass', '#BrandProtection', '#TMRegister'],
    description: 'Software products fall under Class 42 while marketing agencies belong in Class 35. Filing under the wrong class leaves your brand undefended.',
    gradient: 'from-sky-950 via-cyan-900 to-slate-900',
    accentColor: 'text-cyan-400',
    posterUrl: '/reels/reel_trademark_ip.jpg',
  },
  {
    id: 'reel-7',
    title: 'Udyam MSME: Get Collateral-Free Loans up to ₹2 Crore',
    category: 'MSME & Loans',
    speaker: {
      name: 'Vikas Patil',
      role: 'Banking & Subsidy Consultant',
      city: 'Aurangabad',
      initials: 'VP',
      avatarBg: 'from-violet-600 to-purple-600',
    },
    duration: '0:54',
    views: '286K',
    likes: 22400,
    tags: ['#UdyamMSME', '#CGTMSELoan', '#BusinessFinance'],
    description: 'How simple 5-minute Udyam registration unlocks CGTMSE collateral-free bank loans, electricity tariff concessions, and ISO reimbursement.',
    gradient: 'from-violet-950 via-fuchsia-900 to-slate-900',
    accentColor: 'text-purple-400',
    posterUrl: '/reels/reel_udyam_msme.jpg',
  },
  {
    id: 'reel-8',
    title: 'Old vs New Tax Regime: The Exact Math for Salaried Founders',
    category: 'Tax Hacks',
    speaker: {
      name: 'CA Rahul Mehta',
      role: 'Personal Tax Specialist',
      city: 'Solapur',
      initials: 'RM',
      avatarBg: 'from-emerald-600 to-teal-700',
    },
    duration: '0:59',
    views: '520K',
    likes: 46100,
    tags: ['#TaxRegime', '#OldVsNewTax', '#IncomeTaxIndia'],
    description: 'If total deductions (80C, 80D, HRA, Home Loan) exceed ₹3.75 Lakhs, Old Regime wins. Otherwise, New Regime gives you flat lower brackets.',
    gradient: 'from-teal-950 via-emerald-900 to-slate-900',
    accentColor: 'text-emerald-400',
    posterUrl: '/reels/reel_tax_hack.jpg',
  },
];

// ─── Continuous Flowing Topic Ticker Items ──────────────────────────────────
const TRENDING_TOPICS = [
  { tag: '#Section44ADA', label: '50% Presumptive Tax' },
  { tag: '#MCA_V3_Portal', label: 'SPICe+ Name Approval' },
  { tag: '#SFAC_15LakhsGrant', label: 'Farmer Co. Subsidy' },
  { tag: '#GSTR3B_NoLateFee', label: 'ITC Zero Mismatch' },
  { tag: '#Trademark_Class42', label: 'Software Brand Rights' },
  { tag: '#Udyam_CGTMSE', label: '₹2 Cr Collateral-Free' },
  { tag: '#DIR3_KYC_Alert', label: 'Avoid ₹5,000 Penalty' },
  { tag: '#StartupIndia_DPIIT', label: '3-Year Tax Holiday' },
  { tag: '#FSSAI_Central', label: 'Online Food License' },
  { tag: '#AOC4_MGT7', label: 'Annual ROC Compliance' },
];

export default function ReelsShowcaseSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const categories = ['All', 'Tax Hacks', 'Company Setup', 'GST Rules', 'Agri & FPC', 'MSME & Loans'];

  const filteredReels = selectedCategory === 'All'
    ? DUMMY_REELS
    : DUMMY_REELS.filter((r) => r.category === selectedCategory);

  // Auto-progress simulation for modal video
  useEffect(() => {
    let timer: any;
    if (activeReel && isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 1.5;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeReel, isPlaying]);

  const handleOpenReel = (reel: ReelItem) => {
    setActiveReel(reel);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleCloseReel = () => {
    setActiveReel(null);
    setProgress(0);
  };

  const handleToggleLike = (id: string) => {
    setLikedReels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activeReel?.title,
        text: activeReel?.description,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNextReel = () => {
    if (!activeReel) return;
    const currentIndex = DUMMY_REELS.findIndex((r) => r.id === activeReel.id);
    const nextIndex = (currentIndex + 1) % DUMMY_REELS.length;
    setActiveReel(DUMMY_REELS[nextIndex]);
    setProgress(0);
  };

  const handlePrevReel = () => {
    if (!activeReel) return;
    const currentIndex = DUMMY_REELS.findIndex((r) => r.id === activeReel.id);
    const prevIndex = (currentIndex - 1 + DUMMY_REELS.length) % DUMMY_REELS.length;
    setActiveReel(DUMMY_REELS[prevIndex]);
    setProgress(0);
  };

  return (
    <section className="py-20 bg-[#FAF9F5] border-y border-[#EAE6DD] relative overflow-hidden">

      {/* ── Background Subtle Ambient Shapes ── */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-rose-100/30 via-purple-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/30 via-teal-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">

        {/* ── Section Header (ETaxwala Cream Theme) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-slate-800 shadow-2xs">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-50 text-[#E11D48]">
                <Play className="w-2.5 h-2.5 fill-[#E11D48] text-[#E11D48] ml-0.5" />
              </span>
              <span className="font-extrabold text-[#E11D48] tracking-wide uppercase text-[10px]">
                CA Shorts &amp; Reels
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Bite-Sized Video Insights</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master Business &amp; Taxes in 60 Seconds
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Watch actionable tax-saving strategies, entity structuring traps, and government subsidy guides explained simply by practicing Chartered Accountants.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-[#EAE6DD] hover:border-slate-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Fast Continuous Flowing Topic Ticker (The Slider That Flows Continuously) ── */}
        <div className="relative overflow-hidden py-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#EAE6DD] shadow-2xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          <div className="flex overflow-hidden">
            <div className="animate-marquee-left-fast pause-on-hover flex items-center gap-6 whitespace-nowrap">
              {[...TRENDING_TOPICS, ...TRENDING_TOPICS].map((topic, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="font-extrabold text-[#7C3AED]">{topic.tag}</span>
                  <span className="text-slate-400">({topic.label})</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084D1] opacity-50 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── The 9:16 Vertical Reels Continuous Flowing Slider ── */}
        <div className="relative w-full overflow-hidden py-2">

          {/* Edge Gradient Fade Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 md:w-40 bg-gradient-to-r from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 md:w-40 bg-gradient-to-l from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent z-20" />

          {/* Marquee Row */}
          <div className="flex overflow-hidden">
            <div className="animate-marquee-left pause-on-hover flex items-center gap-5 sm:gap-6 py-3">
              {[...filteredReels, ...filteredReels].map((reel, idx) => (
                <div
                  key={`${reel.id}-${idx}`}
                  onClick={() => handleOpenReel(reel)}
                  className="w-64 sm:w-72 aspect-[9/16] rounded-3xl overflow-hidden relative shadow-card hover:shadow-2xl border border-[#EAE6DD] group cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 shrink-0 select-none"
                >
                  {/* Background Video Reel Poster / Simulation */}
                  {reel.posterUrl ? (
                    <img
                      src={reel.posterUrl}
                      alt={reel.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-b ${reel.gradient} transition-transform duration-500 group-hover:scale-105`} />
                  )}

                  {/* Dark gradient mask for top & bottom content readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60" />

                  {/* Top Bar: Category Pill & Duration Badge */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {reel.category}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{reel.duration}</span>
                    </div>
                  </div>

                  {/* Center: Glowing Play Button with Ripple on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Live Equalizer Simulation Indicator (Corner) */}
                  <div className="absolute top-14 right-4 flex items-end gap-0.5 h-4 z-10 opacity-70">
                    <span className="w-1 bg-white/80 h-3 rounded-full animate-pulse" />
                    <span className="w-1 bg-white/80 h-4 rounded-full animate-pulse delay-75" />
                    <span className="w-1 bg-white/80 h-2 rounded-full animate-pulse delay-150" />
                  </div>

                  {/* Bottom Content Card */}
                  <div className="absolute bottom-4 inset-x-4 space-y-3 z-10 text-left">
                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5">
                      {reel.tags.slice(0, 2).map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-extrabold text-white/80">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2 drop-shadow-md">
                      {reel.title}
                    </h3>

                    {/* Speaker Info */}
                    <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${reel.speaker.avatarBg} text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs shrink-0 border border-white/30`}>
                          {reel.speaker.initials}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate leading-tight">
                            {reel.speaker.name}
                          </p>
                          <p className="text-[10px] text-slate-300 truncate leading-tight">
                            {reel.speaker.city}
                          </p>
                        </div>
                      </div>

                      {/* Views */}
                      <div className="flex items-center gap-1 text-[11px] font-bold text-white/90 shrink-0">
                        <Eye className="w-3.5 h-3.5 text-white/70" />
                        <span>{reel.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Section Banner with CA Callback Callout ── */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE6DD] shadow-card flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
          {/* Top signature multicolor border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316]" />

          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                Have a Question About Any of These Shorts?
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Speak directly with our practicing Chartered Accountants and Company Secretaries. Get verified statutory answers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="tel:08069029999"
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] hover:border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#F97316]" />
              <span>080-6902-9999</span>
            </a>

            <Link
              to="/appointment"
              aria-label="Book a free consultation call with a Chartered Accountant"
              className="group px-5 py-2.5 rounded-xl btn-multicolor text-xs font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer inline-flex items-center"
            >
              <span className="relative z-10 text-slate-900 font-extrabold flex items-center gap-1.5">
                <span>Book Free CA Call</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-700 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════════════
          INTERACTIVE 9:16 PHONE REEL PLAYER MODAL
          ═════════════════════════════════════════════════════════════════ */}
      {activeReel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">

          {/* Close Button */}
          <button
            type="button"
            onClick={handleCloseReel}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-50"
            title="Close Reel"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows (Desktop) */}
          <button
            type="button"
            onClick={handlePrevReel}
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-all cursor-pointer z-50 hover:scale-110"
            title="Previous Reel"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNextReel}
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-all cursor-pointer z-50 hover:scale-110"
            title="Next Reel"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Phone Reel Frame (9:16 Aspect Ratio) */}
          <div className="relative w-full max-w-[380px] h-[85vh] max-h-[720px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-slate-800 bg-black flex flex-col justify-between select-none">

            {/* Reel Video Simulation Background */}
            {activeReel.posterUrl ? (
              <img
                src={activeReel.posterUrl}
                alt={activeReel.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-b ${activeReel.gradient}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/70" />

            {/* Top Progress Bar & Controls */}
            <div className="relative z-20 p-4 space-y-3">
              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0084D1] via-[#E11D48] to-[#F97316] transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Header inside Phone */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${activeReel.speaker.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shadow-xs border border-white/40`}>
                    {activeReel.speaker.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-white leading-tight">
                        {activeReel.speaker.name}
                      </p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0084D1]" />
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      {activeReel.speaker.role} • {activeReel.speaker.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Play / Pause Clickable Area */}
            <div
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 flex-1 flex items-center justify-center cursor-pointer"
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl animate-in zoom-in-90">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              )}
            </div>

            {/* Right Action Bar (Instagram/TikTok style side buttons) */}
            <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => handleToggleLike(activeReel.id)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-125 backdrop-blur-md",
                  likedReels[activeReel.id]
                    ? "bg-rose-600 text-white"
                    : "bg-black/40 text-white hover:bg-black/60"
                )}>
                  <Heart className={cn("w-5 h-5", likedReels[activeReel.id] && "fill-current")} />
                </div>
                <span className="text-[10px] font-bold drop-shadow">
                  {likedReels[activeReel.id] ? activeReel.likes + 1 : activeReel.likes}
                </span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-transform active:scale-110">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold drop-shadow">
                  {copied ? 'Copied!' : 'Share'}
                </span>
              </button>

              {/* Views */}
              <div className="flex flex-col items-center gap-0.5 text-white/80">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold drop-shadow">{activeReel.views}</span>
              </div>
            </div>

            {/* Bottom Content & Direct CA Consultation CTA */}
            <div className="relative z-20 p-4 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent pt-6 text-left pr-16">
              <div className="flex flex-wrap gap-1.5">
                {activeReel.tags.map((t, idx) => (
                  <span key={idx} className="text-[11px] font-extrabold text-[#0084D1]">
                    {t}
                  </span>
                ))}
              </div>

              <h3 className="text-sm font-extrabold text-white leading-snug">
                {activeReel.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {activeReel.description}
              </p>

              {/* Direct Booking CTA inside player */}
                <Link
                  to="/appointment"
                  aria-label={`Consult with ${activeReel.speaker.name}`}
                  className="group w-full py-2.5 px-4 rounded-xl btn-multicolor font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-slate-900 transition-all"
                >
                  <span className="relative z-10 font-bold flex items-center justify-center gap-1.5">
                    <span>Consult with {activeReel.speaker.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
