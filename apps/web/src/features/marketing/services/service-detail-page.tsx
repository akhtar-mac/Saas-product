import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, Phone, MessageCircle, FileBadge,
  ChevronRight, Star, Clock, ShieldCheck, FileCheck, HelpCircle,
  Sparkles, Lock, Building2, UserCheck, AlertCircle, Laptop,
  Check, X, ChevronDown, Award, Send, Info, Layers, Zap
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import QuickEnquiryModal from '@/components/quick-enquiry-modal';
import {
  getServiceBySlug,
  getCategoryById,
  services,
  formatPrice,
  getServicePackages,
  getServiceProcessSteps,
  getServiceDocuments,
  getServiceComparison,
  getServiceSoftwareFeatures,
  getServiceFaqs,
  ServicePackage
} from '@/lib/constants/services';
import { cn } from '@/lib/utils';
import LiveSocialProofGrid from '@/components/marketing/live-social-proof-grid';

export default function ServiceDetailPage() {
  const { serviceSlug, categorySlug } = useParams();
  const service = getServiceBySlug(serviceSlug || '');
  const category = service ? getCategoryById(service.category) : null;

  // Selected package state
  const packages = useMemo(() => service ? getServicePackages(service) : [], [service]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>(() => packages[1]?.id || packages[0]?.id || 'standard');
  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPkgId) || packages[0],
    [packages, selectedPkgId]
  );

  // Document tab state
  const docGroups = useMemo(() => service ? getServiceDocuments(service) : [], [service]);
  const [activeDocTab, setActiveDocTab] = useState<number>(0);

  // FAQ accordion state
  const faqs = useMemo(() => service ? getServiceFaqs(service) : [], [service]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadMobile, setLeadMobile] = useState('');
  const [leadCity, setLeadCity] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState('');

  // Modal state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // Handle lead form submission
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = leadMobile.replace(/\D/g, '');
    if (!leadName.trim()) {
      setLeadError('Please enter your name');
      return;
    }
    if (cleanMobile.length < 10) {
      setLeadError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLeadError('');
    setLeadLoading(true);

    // Simulate instant lead routing & CRM assignment
    setTimeout(() => {
      setLeadLoading(false);
      setLeadSubmitted(true);
    }, 800);
  };

  // If service is not found
  if (!service) {
    const formattedTitle = serviceSlug
      ? serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Custom CA Consultation';

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-[#FAF9F5]">
        <SEO title="Consult CA — ETaxwala" url="/services" />
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#EAE6DD] shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Need Help with {formattedTitle}?
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our practicing Chartered Accountants handle all custom legal incorporations, registrations, and tax appeals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowEnquiryModal(true)}
            className="w-full py-3.5 rounded-xl btn-multicolor text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Request Instant CA Callback</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/services"
            className="block text-xs font-bold text-[#0084D1] hover:underline pt-2"
          >
            ← Browse All 250+ Services Catalog
          </Link>
        </div>

        <QuickEnquiryModal
          isOpen={showEnquiryModal}
          onClose={() => setShowEnquiryModal(false)}
          serviceTitle={formattedTitle}
        />
      </div>
    );
  }

  // Derive all rich data
  const processSteps = getServiceProcessSteps(service);
  const comparison = getServiceComparison(service);
  const softwareFeatures = getServiceSoftwareFeatures(service);
  const related = services.filter((s) => s.category === service.category && s.id !== service.id).slice(0, 3);

  const displayRating = service.rating || 4.9;
  const displayReviews = service.reviewCount || 3420;
  const displayTurnaround = service.turnaround || '3 - 7 Working Days';

  return (
    <>
      {/* ── SEO & JSON-LD Structured Data ── */}
      <SEO
        title={`${service.name} Online in India | ETaxwala CA Platform`}
        description={service.subtitle || `${service.name} filing by practicing Chartered Accountants and automated software. 100% compliant, transparent pricing, fast turnaround.`}
        keywords={`${service.name}, ${category?.name || 'Taxation'}, CA filing India, GST compliance, ETaxwala software`}
        url={`/services/${service.category}/${service.slug}`}
        type="product"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.name,
          description: service.subtitle || service.inclusions.join(', '),
          category: category?.name || service.category,
          provider: {
            '@type': 'Organization',
            name: 'ETaxwala Business Solutions Pvt Ltd',
            url: 'https://etaxwala.com',
            telephone: '080-6902-9999',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: displayRating.toString(),
            reviewCount: displayReviews.toString(),
          },
          offers: {
            '@type': 'Offer',
            price: service.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        }}
        faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))}
      />

      {/* ── Sticky Top Jump Navigation (Sub-bar) ── */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE6DD] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 text-xs font-semibold">
          <div className="flex items-center gap-6 text-slate-600">
            <a href="#overview" className="hover:text-[#0084D1] transition-colors">Overview</a>
            <a href="#packages" className="hover:text-[#0084D1] transition-colors">Plans &amp; Pricing</a>
            <a href="#process" className="hover:text-[#0084D1] transition-colors">Step-by-Step Process</a>
            <a href="#documents" className="hover:text-[#0084D1] transition-colors">Required Documents</a>
            <a href="#software-edge" className="hover:text-[#0084D1] transition-colors">Software Edge</a>
            <a href="#comparison" className="hover:text-[#0084D1] transition-colors">Why ETaxwala</a>
            <a href="#faqs" className="hover:text-[#0084D1] transition-colors">FAQs</a>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Starting from</span>
            <span className="text-sm font-extrabold tracking-widest font-mono text-slate-900">
              ₹ * * * *
            </span>
            <a
              href="#lead-form"
              className="px-4 py-2 rounded-xl btn-multicolor text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span className="relative z-10 text-slate-900 font-bold flex items-center gap-1.5">
                <span>Get Started Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero Section (Split Grid with Sticky Lead Capture Form) ── */}
      <section id="overview" className="relative bg-[#FFFDF9] py-10 sm:py-16 border-b border-[#EAE6DD] overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50/50 via-purple-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: 'Services', href: '/services' },
                { label: category?.name || service.category, href: `/services` },
                { label: service.name },
              ]}
              className="text-slate-500 text-xs"
            />
          </div>

          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* Left Column: Value Proposition, Badges & Highlights */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category & Status Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> Chartered Accountant Managed
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Government Certified
                </span>
              </div>

              {/* H1 Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900">
                {service.name}
              </h1>

              {/* Subtitle / Value Stack */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {service.subtitle ||
                  'Professional chartered accountants handle your end-to-end statutory filing, document reconciliation, and compliance with zero mismatch guarantee.'}
              </p>

              {/* Key Deliverables Bullet Checklist */}
              <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
                {service.inclusions.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#EAE6DD]">
                {(service.stats || [
                  { label: 'Returns Filed', value: '45,000+' },
                  { label: 'On-Time Rate', value: '99.8%' },
                  { label: 'Verified CAs', value: '100% Certified' },
                  { label: 'Turnaround', value: displayTurnaround },
                ]).map((stat, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs">
                    <p className="text-lg sm:text-xl font-extrabold text-slate-900">{stat.value}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Rating & Trust Statement */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900 font-extrabold text-sm">{displayRating}</span>
                  <span className="text-slate-400 font-normal">({displayReviews.toLocaleString()} reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-[#0084D1]" /> 100% Data Confidentiality
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Clock className="w-4 h-4 text-[#E11D48]" /> SLA Protected Delivery
                </span>
              </div>
            </div>

            {/* Right Column: Sticky Quick Enquiry Card (IndiaFilings Conversion Pattern) */}
            <div id="lead-form" className="lg:col-span-5 sticky top-32">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#0084D1]/20 shadow-2xl space-y-5 relative">
                {/* Multicolour accent strip */}
                <div className="absolute top-0 left-6 right-6 h-1 bg-multicolor rounded-full" />

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7C3AED]">
                      Direct CA Callback
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Average Response: 15 Mins
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Get Free CA Consultation &amp; Quote
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selected: <strong className="text-slate-800">{selectedPackage?.name}</strong> (<span className="tracking-widest font-mono">₹ * * * *</span>)
                  </p>
                </div>

                {leadSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in-95">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h4 className="text-base font-extrabold text-emerald-900">Request Received!</h4>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Thank you, <strong>{leadName}</strong>. Our senior tax specialist has been assigned and will call you at <strong>{leadMobile}</strong> shortly.
                    </p>
                    <a
                      href={`https://wa.me/918069029999?text=Hi%20ETaxwala%2C%20I%20just%20enquired%20for%20${encodeURIComponent(service.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp Now</span>
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                    {leadError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{leadError}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0084D1] bg-[#FAF9F5]/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={leadMobile}
                          onChange={(e) => setLeadMobile(e.target.value)}
                          placeholder="10-digit number"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0084D1] bg-[#FAF9F5]/50 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">City / State</label>
                        <input
                          type="text"
                          value={leadCity}
                          onChange={(e) => setLeadCity(e.target.value)}
                          placeholder="e.g. Mumbai, MH"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0084D1] bg-[#FAF9F5]/50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Choose Filing Package</label>
                      <select
                        value={selectedPkgId}
                        onChange={(e) => setSelectedPkgId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 focus:outline-none focus:border-[#0084D1] bg-[#FAF9F5]/50 focus:bg-white font-medium"
                      >
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} — ₹ * * * * {pkg.period}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={leadLoading}
                      className="w-full py-3.5 rounded-xl btn-multicolor font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                    >
                      <span className="relative z-10 text-slate-900 font-extrabold flex items-center justify-center gap-2">
                        {leadLoading ? (
                          <span>Assigning Senior CA...</span>
                        ) : (
                          <>
                            <span>Request Instant Callback</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </button>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> 100% Privacy Protected
                      </span>
                      <a href="tel:08069029999" className="font-bold text-[#0084D1] hover:underline">
                        Or Call: 080-6902-9999
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Statutory Compliance & Penalty Warning Box ── */}
      {service.complianceAlert && (
        <section className="bg-amber-50/70 border-b border-amber-200/80 py-4 px-4">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-xs text-amber-900">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-extrabold text-slate-900">
                Statutory Compliance Alert ({service.complianceAlert.legalSection || 'Department Rules'})
              </p>
              <p className="text-amber-800">
                <strong>Due Date:</strong> {service.complianceAlert.dueDate}. {service.complianceAlert.penaltyText}
              </p>
            </div>
            <a
              href="#lead-form"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors"
            >
              Avoid Late Fees
            </a>
          </div>
        </section>
      )}

      {/* ── 3-Tier Packages & Pricing (Transparent Matrix) ── */}
      <section id="packages" className="py-16 sm:py-20 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C3AED] px-3 py-1 bg-white border border-[#EAE6DD] rounded-full">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Choose the Right Plan for Your Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              No hidden charges. Standard government statutory fees and CA drafting charges are bundled transparently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {packages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={cn(
                    'rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative cursor-pointer',
                    isSelected
                      ? 'bg-white shadow-2xl scale-[1.02] z-10'
                      : 'bg-white/90 hover:bg-white border border-[#EAE6DD] hover:border-slate-300 shadow-card'
                  )}
                >
                  {/* Smooth 60fps Shifting Outline with Framer Motion layoutId */}
                  {isSelected && (
                    <motion.div
                      layoutId="activePlanOutline"
                      className="absolute inset-0 rounded-3xl border-2 border-[#0084D1] ring-4 ring-[#0084D1]/15 pointer-events-none z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  {/* Smooth 60fps Shifting Top Badge */}
                  {isSelected ? (
                    <motion.div
                      layoutId="activePlanBadge"
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#0084D1] to-[#7C3AED] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5 z-20 whitespace-nowrap"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{pkg.popular ? 'Most Popular Choice' : 'Selected Plan'}</span>
                    </motion.div>
                  ) : pkg.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-[#EAE6DD] text-[9.5px] font-bold uppercase tracking-wider">
                      Popular Pick
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-slate-900">{pkg.name}</h3>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 min-h-[32px]">{pkg.tagline}</p>
                    </div>

                    {/* Price Block (Masked with *) */}
                    <div className="pt-2 pb-3 border-y border-[#EAE6DD]">
                      <div className="flex items-baseline gap-2">
                        <span className="price-masked text-3xl font-extrabold tracking-widest text-slate-900 font-mono">
                          ₹ * * * *
                        </span>
                        {pkg.originalPrice && (
                          <span className="price-masked text-xs text-slate-400 line-through tracking-widest font-mono">
                            ₹ * * * * *
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">{pkg.period}</span>
                      </div>
                      {pkg.govtFeeNote && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          ✓ {pkg.govtFeeNote}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> Execution: {pkg.turnaround || displayTurnaround}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">What's Included</p>
                      {pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button: Smoothly shifts to active galaxy button on selection */}
                  <div className="pt-6 mt-6 border-t border-[#EAE6DD] relative z-20">
                    {isSelected ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPkgId(pkg.id);
                          document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-3.5 rounded-xl btn-multicolor text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
                      >
                        <span className="relative z-10 text-slate-900 font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0084D1]" />
                          <span>Proceed with {pkg.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPkgId(pkg.id);
                        }}
                        className="w-full py-3.5 rounded-xl bg-[#FAF9F5] hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-[#EAE6DD] hover:border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span>Select {pkg.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Step-by-Step Execution Process Timeline ── */}
      <section id="process" className="py-16 sm:py-20 bg-white border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0084D1] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              Hassle-Free Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How E-Taxwala Executes Your {service.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Our 4-step structured methodology ensures zero manual errors and strict statutory deadline compliance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => (
              <div
                key={step.step}
                className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EAE6DD] shadow-xs relative flex flex-col justify-between group hover:border-[#0084D1] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-white border border-[#EAE6DD] text-slate-900 font-extrabold text-sm flex items-center justify-center shadow-xs">
                      0{step.step}
                    </span>
                    {step.duration && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-[#0084D1] border border-blue-200">
                        {step.duration}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#0084D1] transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EAE6DD]/60 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>CA Supervised Stage</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Documents Required Section (Entity Tabs) ── */}
      <section id="documents" className="py-16 sm:py-20 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#E11D48] px-3 py-1 bg-rose-50 border border-rose-200 rounded-full">
              Checklist &amp; KYC
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Documents Required Checklist
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Upload clear scanned copies or smartphone photos directly to our encrypted portal.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white border border-[#EAE6DD] rounded-2xl max-w-xl mx-auto shadow-xs">
            {docGroups.map((group, idx) => (
              <button
                key={group.entityType}
                onClick={() => setActiveDocTab(idx)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  activeDocTab === idx
                    ? 'bg-[#FAF9F5] text-slate-900 border border-[#EAE6DD] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {group.entityType}
              </button>
            ))}
          </div>

          {/* Active Documents List Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DD]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0084D1]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  {docGroups[activeDocTab]?.entityType} Checklist
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {docGroups[activeDocTab]?.items.length} Documents Needed
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {docGroups[activeDocTab]?.items.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] text-xs sm:text-sm text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0084D1] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{doc}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0084D1] shrink-0" />
                <span>Don't have all documents right now? Our CA will guide you on how to procure or format them.</span>
              </span>
              <a href="#lead-form" className="font-bold text-[#0084D1] hover:underline shrink-0 ml-2">
                Ask CA →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Software & Tech Advantage (IndiaFilings Ledgers Equivalent) ── */}
      <section id="software-edge" className="py-16 sm:py-20 bg-[#FAF9F5] border-b border-[#EAE6DD] relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-purple-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-gradient-to-tr from-amber-100/40 via-rose-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0084D1] px-3.5 py-1 bg-blue-50 border border-blue-200/80 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#0084D1]" /> Fintech &amp; Tech Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powered by E-Taxwala Cloud Software &amp; Client Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Unlike traditional CAs using manual spreadsheets, every client receives free access to our proprietary cloud portal for automated reconciliations, status tracking, and 8-year document vault.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {softwareFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-[#EAE6DD] shadow-card hover:shadow-lg hover:border-[#0084D1] transition-all space-y-3.5 group relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0084D1] border border-blue-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
                    <Laptop className="w-5 h-5 text-[#0084D1]" />
                  </div>
                  {feat.badge && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-slate-600 border border-[#EAE6DD]">
                      {feat.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0084D1] transition-colors">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Software Portal Preview Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE6DD] shadow-card flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
            {/* Top multicolor accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316]" />

            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Already an E-Taxwala Client?
                </h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log into your client dashboard to view your active service milestones, download invoices &amp; certificates.
              </p>
            </div>

            <Link
              to="/portal/login"
              className="px-6 py-3 rounded-xl btn-multicolor text-xs font-extrabold shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer"
            >
              <span className="relative z-10 text-slate-900 font-extrabold flex items-center gap-1.5">
                <span>Open Client Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Side-by-Side Comparison (Why ETaxwala) ── */}
      <section id="comparison" className="py-16 sm:py-20 bg-white border-b border-[#EAE6DD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#F97316] px-3 py-1 bg-orange-50 border border-orange-200 rounded-full">
              Transparent Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Smart Businesses Choose E-Taxwala
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              See how we stack up against traditional local accounting firms and fly-by-night portals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-[#EAE6DD] rounded-2xl overflow-hidden text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#EAE6DD] text-slate-700">
                  <th className="p-4 font-extrabold">Feature / Capability</th>
                  <th className="p-4 font-extrabold text-[#0084D1] bg-blue-50/50">E-Taxwala Platform</th>
                  <th className="p-4 font-bold text-slate-500">Traditional Offline CA</th>
                  <th className="p-4 font-bold text-slate-500">Cheap / Discount Sites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DD]">
                {comparison.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{row.feature}</td>
                    <td className="p-4 font-extrabold text-[#0084D1] bg-blue-50/30">
                      {typeof row.etaxwala === 'boolean' ? (
                        row.etaxwala ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />
                      ) : (
                        row.etaxwala
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      {typeof row.traditionalCA === 'boolean' ? (
                        row.traditionalCA ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />
                      ) : (
                        row.traditionalCA
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      {typeof row.cheapSites === 'boolean' ? (
                        row.cheapSites ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-500" />
                      ) : (
                        row.cheapSites
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Frequently Asked Questions (Accordion) ── */}
      <section id="faqs" className="py-16 sm:py-20 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 bg-white border border-[#EAE6DD] rounded-full">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Frequently Asked Questions on {service.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers to the most common statutory, legal, and pricing questions.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#EAE6DD] rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-[#0084D1] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200 text-slate-400',
                        isOpen && 'rotate-180 text-[#0084D1]'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#EAE6DD]/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live Customer Reviews & Brand Flow (CleverPe Style) ── */}
      <LiveSocialProofGrid title={`Trusted by 50,000+ Businesses for ${service.name}`} />

      {/* ── Related Services in this Category ── */}
      {related.length > 0 && (
        <section className="py-12 bg-white border-b border-[#EAE6DD]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Related Services in {category?.name || 'this Category'}
                </h3>
                <p className="text-xs text-slate-500">Explore complementary business registrations &amp; return filings.</p>
              </div>
              <Link to="/services" className="text-xs font-bold text-[#0084D1] hover:underline flex items-center gap-1">
                <span>View All 250+</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/services/${rel.category}/${rel.slug}`}
                  className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] hover:border-[#0084D1] transition-all block group"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0084D1] transition-colors line-clamp-1">
                    {rel.name}
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Professional Service</span>
                    <span className="font-extrabold tracking-widest font-mono text-slate-800">
                      ₹ * * * *
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom Full-Width Conversion CTA Banner ── */}
      <section className="py-16 bg-[#FFFDF9] border-t border-[#EAE6DD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-multicolor text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Ready to Complete Your {service.name}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Speak directly with our practicing Chartered Accountant team. Avoid delays, maximize tax savings, and stay 100% compliant.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#lead-form"
              className="px-6 py-3.5 rounded-xl btn-multicolor font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2 text-slate-900 font-bold">
                <span>Get Started with {service.name}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
            <a
              href="tel:08069029999"
              className="px-6 py-3.5 rounded-xl bg-white border border-[#EAE6DD] hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Call: 080-6902-9999</span>
            </a>
            <a
              href={`https://wa.me/918069029999?text=Hello%20ETaxwala%2C%20I%20need%20assistance%20with%20${encodeURIComponent(service.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2 transition-colors hover:bg-emerald-100"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Sticky Mobile Floating Bottom Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EAE6DD] p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Starting At</p>
          <p className="text-base font-extrabold tracking-widest font-mono text-slate-900">
            ₹ * * * *
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:08069029999"
            className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-slate-800"
            title="Call CA"
          >
            <Phone className="w-4 h-4 text-[#F97316]" />
          </a>
          <a
            href="#lead-form"
            className="px-4 py-2.5 rounded-xl btn-multicolor text-xs font-bold shadow-xs cursor-pointer"
          >
            <span className="relative z-10 text-slate-900 font-bold">Get Free Quote</span>
          </a>
        </div>
      </div>
    </>
  );
}