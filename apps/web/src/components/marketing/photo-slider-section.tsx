import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Building2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PhotoItem {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  category: 'Offices & CAs' | 'Client Handover' | 'Agri & FPC' | 'Tech & Software' | 'Compliance';
  date: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  accentColor: string;
  description: string;
  highlightStat: string;
  imageUrl?: string;
}

export const DUMMY_PHOTOS: PhotoItem[] = [
  {
    id: 'photo-1',
    title: 'Chartered Accountants Filing & Document Scrutiny Desk',
    subtitle: 'Practicing CAs verifying balance sheets and MCA SPICe+ company charters.',
    location: 'Chhatrapati Sambhajinagar HQ',
    category: 'Offices & CAs',
    date: 'August 2026',
    badge: 'Senior CA Desk',
    badgeColor: 'bg-blue-50 text-[#0084D1] border-blue-200',
    gradient: 'from-blue-950 via-slate-900 to-indigo-950',
    accentColor: '#0084D1',
    description:
      'Our in-house corporate secretarial and chartered accountant wing conducting end-to-end statutory review with zero mismatch guarantee before digital signature affixation.',
    highlightStat: '100% In-House CAs',
    imageUrl: '/hero_corporate_ca.jpg',
  },
  {
    id: 'photo-2',
    title: 'Certificate of Incorporation & Corporate Kit Handover',
    subtitle: 'Handing over MCA Certificate, Share Certificates & Corporate PAN to founders.',
    location: 'Pune Advisory Office (Kothrud)',
    category: 'Client Handover',
    date: 'September 2026',
    badge: 'Founder Onboarding',
    badgeColor: 'bg-purple-50 text-[#7C3AED] border-purple-200',
    gradient: 'from-purple-950 via-slate-900 to-violet-900',
    accentColor: '#7C3AED',
    description:
      'Welcoming newly incorporated Private Limited directors with complete physical incorporation dossier, Director DIN allotments, and instant zero-fee corporate bank account kit.',
    highlightStat: '7-10 Days Turnaround',
    imageUrl: '/photos/ca_client_handover.jpg',
  },
  {
    id: 'photo-3',
    title: 'Farmer Producer Company (FPC) Cluster Workshop',
    subtitle: 'Guiding 50+ farmer directors on SFAC ₹15 Lakhs matching grant documentation.',
    location: 'Nashik Regional Center',
    category: 'Agri & FPC',
    date: 'July 2026',
    badge: 'Agri Business Hub',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gradient: 'from-emerald-950 via-slate-900 to-teal-950',
    accentColor: '#059669',
    description:
      'Empowering farmer clusters and agribusiness founders with DPR drafting, smart board resolutions, and statutory compliances to unlock central and state government agri subsidies.',
    highlightStat: '120+ FPCs Guided',
    imageUrl: '/photos/fpc_farmer_meeting.jpg',
  },
  {
    id: 'photo-4',
    title: 'Fintech & Cloud Invoicing Software Engineering Desk',
    subtitle: 'Developers & tax analysts building automated GSTR-2B matching algorithms.',
    location: 'Pune Tech Lab',
    category: 'Tech & Software',
    date: 'August 2026',
    badge: 'Tech & Cloud Team',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    gradient: 'from-cyan-950 via-slate-900 to-sky-950',
    accentColor: '#0284C7',
    description:
      'ETaxwala’s custom software development division engineering proprietary client portal tools, real-time filing trackers, and automated ITC reconciliation engines.',
    highlightStat: 'Bank-Grade 256-Bit SSL',
    imageUrl: '/hero_corporate_growth.jpg',
  },
  {
    id: 'photo-5',
    title: 'Annual ROC Compliance & Statutory Audit Review Session',
    subtitle: 'AOC-4, MGT-7, and Director KYC compliance audits for private limited entities.',
    location: 'Jalna MIDC Branch',
    category: 'Compliance',
    date: 'August 2026',
    badge: 'ROC Retainer Wing',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    gradient: 'from-amber-950 via-slate-900 to-orange-950',
    accentColor: '#D97706',
    description:
      'Ensuring manufacturing, trading, and service corporations across Maharashtra remain penalty-free and notice-proof through comprehensive statutory auditing.',
    highlightStat: 'Zero Notice Guarantee',
    imageUrl: '/about_team.jpg',
  },
  {
    id: 'photo-6',
    title: 'Startup India & DPIIT Seed Funding Mentorship Clinic',
    subtitle: 'Advising technology startup founders on Section 56(2)(viib) angel tax exemptions.',
    location: 'Chhatrapati Sambhajinagar HQ',
    category: 'Offices & CAs',
    date: 'June 2026',
    badge: 'Startup Advisory',
    badgeColor: 'bg-rose-50 text-[#E11D48] border-rose-200',
    gradient: 'from-rose-950 via-slate-900 to-pink-950',
    accentColor: '#E11D48',
    description:
      'Helping seed-stage entrepreneurs secure DPIIT recognition, 3-year tax holidays, and cap-table structuring for venture capital and angel funding rounds.',
    highlightStat: '45+ Startups Backed',
    imageUrl: '/chooseetaxwala.jpg',
  },
  {
    id: 'photo-7',
    title: 'Trademark Hearing & IP Rights Examination Team',
    subtitle: 'Attorneys clearing objections and securing trademark certificates for brands.',
    location: 'Mumbai Legal Desk',
    category: 'Compliance',
    date: 'July 2026',
    badge: 'IP & Legal Defense',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    gradient: 'from-indigo-950 via-slate-900 to-blue-950',
    accentColor: '#4F46E5',
    description:
      'Defending brand names, brand logos, and trade names across IP India classes 1 to 45 with prompt examination responses and trademark hearing representation.',
    highlightStat: '98.5% Approval Rate',
    imageUrl: '/ofc1.jpg',
  },
  {
    id: 'photo-8',
    title: 'Women Entrepreneur MSME Udyam Enrollment Drive',
    subtitle: 'Same-day Udyam registration and CGTMSE collateral-free loan briefing.',
    location: 'Solapur Regional Desk',
    category: 'Client Handover',
    date: 'May 2026',
    badge: 'MSME Empowerment',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    gradient: 'from-teal-950 via-slate-900 to-emerald-950',
    accentColor: '#0D9488',
    description:
      'Assisting small business owners, weavers, and food processors in obtaining MSME Udyam certification and unlocking government credit guarantee schemes.',
    highlightStat: 'Same-Day Issuance',
    imageUrl: '/office-2.jpg',
  },
];

export default function PhotoSliderSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  const [sliderMode, setSliderMode] = useState<'flow' | 'manual'>('flow');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const categories = [
    'All',
    'Offices & CAs',
    'Client Handover',
    'Agri & FPC',
    'Tech & Software',
    'Compliance',
  ];

  const filteredPhotos =
    selectedCategory === 'All'
      ? DUMMY_PHOTOS
      : DUMMY_PHOTOS.filter((p) => p.category === selectedCategory);

  const handleNext = () => {
    setActiveSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrev = () => {
    setActiveSlideIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  return (
    <section className="py-20 bg-white border-y border-[#EAE6DD] relative overflow-hidden">
      {/* ── Background Subtle Ambient Decor ── */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tl from-amber-50/60 via-rose-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* ── Section Header (ETaxwala Cream & Clean Design) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-xs font-bold text-slate-800 shadow-2xs">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-50 text-[#0084D1]">
                <Camera className="w-2.5 h-2.5 text-[#0084D1]" />
              </span>
              <span className="font-extrabold text-[#0084D1] tracking-wide uppercase text-[10px]">
                Life at ETaxwala
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Real Moments &amp; Offices</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Behind the Scenes: Inside ETaxwala
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              A glimpse into our chartered accountant desks, regional offices, farmer cluster
              workshops, and client certification handovers across Maharashtra.
            </p>
          </div>

          {/* Controls: Mode Switcher & Category Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Flow Mode Switcher */}
            <div className="inline-flex items-center p-1 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => setSliderMode('flow')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                  sliderMode === 'flow'
                    ? 'bg-white text-slate-900 shadow-xs border border-[#EAE6DD]'
                    : 'hover:text-slate-900 text-slate-500'
                )}
              >
                Continuous Flow
              </button>
              <button
                type="button"
                onClick={() => setSliderMode('manual')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                  sliderMode === 'manual'
                    ? 'bg-white text-slate-900 shadow-xs border border-[#EAE6DD]'
                    : 'hover:text-slate-900 text-slate-500'
                )}
              >
                Slide by Slide
              </button>
            </div>

            {/* Manual Navigation Controls (When in manual mode) */}
            {sliderMode === 'manual' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-xl bg-white border border-[#EAE6DD] hover:border-slate-400 text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-9 h-9 rounded-xl bg-white border border-[#EAE6DD] hover:border-slate-400 text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setActiveSlideIndex(0);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-[#FAF9F5] text-slate-600 hover:text-slate-900 border border-[#EAE6DD] hover:border-slate-300'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Continuous Flowing Photo Slider (Default Flow Mode) ── */}
        {sliderMode === 'flow' ? (
          <div className="relative w-full overflow-hidden py-3">
            {/* Left and Right Fade Gradient Masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 md:w-40 bg-gradient-to-r from-white via-white/90 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 md:w-40 bg-gradient-to-l from-white via-white/90 to-transparent z-20" />

            <div className="flex overflow-hidden">
              <div className="animate-marquee-left pause-on-hover flex items-center gap-5 sm:gap-6 py-2">
                {[...filteredPhotos, ...filteredPhotos].map((photo, idx) => (
                  <div
                    key={`${photo.id}-${idx}`}
                    onClick={() => setActivePhoto(photo)}
                    className="w-80 sm:w-96 aspect-[16/10] rounded-3xl overflow-hidden relative shadow-card hover:shadow-2xl border border-[#EAE6DD] group cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 shrink-0 select-none bg-slate-900"
                  >
                    {/* Realistic Photography Background with Atmospheric Depth */}
                    {photo.imageUrl ? (
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${photo.gradient} transition-transform duration-700 group-hover:scale-105`}
                      />
                    )}

                    {/* Dark gradient mask for crisp text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/50" />

                    {/* Top Pill Bar */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-xs">
                        <MapPin className="w-3 h-3 text-[#F97316]" />
                        <span>{photo.location}</span>
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-white/90 border border-white/10">
                        {photo.badge}
                      </span>
                    </div>

                    {/* Center Zoom In Hover Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-xl border border-white/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Content Card */}
                    <div className="absolute bottom-4 inset-x-4 space-y-1.5 z-10 text-left">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                          {photo.highlightStat}
                        </span>
                        <span className="text-white/40 text-[10px]">•</span>
                        <span className="text-[10px] font-medium text-slate-300">{photo.date}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-1 drop-shadow-sm group-hover:text-amber-200 transition-colors">
                        {photo.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-1 leading-normal font-normal">
                        {photo.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Manual Slide-by-Slide Showcase Mode ── */
          <div className="grid md:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="rounded-3xl overflow-hidden shadow-card hover:shadow-xl border border-[#EAE6DD] group cursor-pointer transition-all duration-300 flex flex-col justify-between bg-white text-left"
              >
                {/* Visual Header */}
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-900">
                  {photo.imageUrl ? (
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${photo.gradient} transition-transform duration-500 group-hover:scale-105`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-white border border-white/20">
                      <MapPin className="w-2.5 h-2.5 text-[#F97316]" />
                      <span>{photo.location}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-white/90">
                      {photo.date}
                    </span>
                  </div>

                  <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/30">
                      {photo.highlightStat}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0084D1]">
                      {photo.badge}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0084D1] transition-colors line-clamp-2">
                      {photo.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {photo.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EAE6DD] flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>View Story</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0084D1] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Summary Strip: Nationwide Reach ── */}
        <div className="pt-4 border-t border-[#EAE6DD] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              3 Regional Offices: <strong>Chhatrapati Sambhajinagar</strong> • <strong>Pune</strong>{' '}
              • <strong>Jalna</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0084D1] shrink-0" />
            <span>25,000+ Business Filings Handled Across 28 States &amp; 8 UTs</span>
          </div>
          <a
            href="/about"
            className="font-bold text-[#0084D1] hover:underline flex items-center gap-1"
          >
            <span>Learn More About Our Team</span>
            <span>→</span>
          </a>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          LIGHTBOX ZOOM MODAL (Full Photo & Story Experience)
          ═════════════════════════════════════════════════════════════════ */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-50"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Modal Card */}
          <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EAE6DD] flex flex-col md:flex-row select-none">
            {/* Visual Preview Half */}
            <div className="md:w-1/2 min-h-[280px] md:min-h-[420px] relative flex flex-col justify-between p-6 text-white overflow-hidden bg-slate-900">
              {activePhoto.imageUrl ? (
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${activePhoto.gradient}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-black/40 backdrop-blur-md text-white border border-white/20">
                  <MapPin className="w-3 h-3 text-[#F97316]" />
                  <span>{activePhoto.location}</span>
                </span>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/50 text-white/90">
                  {activePhoto.date}
                </span>
              </div>

              <div className="relative z-10 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-md border border-emerald-500/30 inline-block">
                  {activePhoto.highlightStat}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold leading-snug">
                  {activePhoto.title}
                </h3>
              </div>
            </div>

            {/* Story & Context Half */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left bg-[#FFFDF9]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-extrabold px-3 py-1 rounded-full border',
                      activePhoto.badgeColor
                    )}
                  >
                    {activePhoto.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Verified ETaxwala Event
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                  {activePhoto.subtitle}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {activePhoto.description}
                </p>

                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] space-y-2">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Practicing Professional Standard</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    All business charters and corporate filings are audited directly by practicing
                    Chartered Accountants and Company Secretaries.
                  </p>
                </div>
              </div>

              {/* Consultation CTA inside lightbox */}
              <div className="pt-4 border-t border-[#EAE6DD] flex items-center justify-between gap-3">
                <a
                  href="/appointment"
                  className="w-full py-3 rounded-xl btn-multicolor text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer text-slate-900"
                >
                  <span className="relative z-10 font-bold flex items-center justify-center gap-2">
                    <span>Book In-Office or Online CA Call</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
