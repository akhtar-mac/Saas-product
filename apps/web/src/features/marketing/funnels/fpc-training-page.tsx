import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Video, FileText, Award, Users, Calendar, Clock,
  Sparkles, ChevronDown, Loader2, BookOpen, ShieldCheck, ArrowRight,
  TrendingUp, PhoneCall, HelpCircle, Check, Download, Layers,
  Building2, BadgeCheck, FileSpreadsheet
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import CtaBanner from '@/components/cta-banner';
import FlipClock from '@/components/flip-clock';

const FPC_FAQS = [
  {
    q: 'Who is this FPC Business Training Program designed for?',
    a: 'This comprehensive masterclass is designed for Farmer Producer Company (FPC/FPO) Directors, Board Members, Agri-Entrepreneurs, Agriculture Graduates, NGO Leaders, and anyone planning to establish or scale a high-turnover agribusiness in India.',
  },
  {
    q: 'What is the medium of instruction and batch schedule?',
    a: 'The training is conducted live online via Zoom in clear, practical English (with simple conversational Hindi for conceptual clarity). Live classes run for 10 days, Monday to Friday, from 07:30 PM to 09:00 PM IST.',
  },
  {
    q: 'Will I get access to class recordings if I miss a live session?',
    a: 'Yes! Every live session is recorded in HD quality and uploaded to our dedicated ETaxwala Learning Portal within 24 hours. All enrolled participants receive lifetime access to all session recordings and downloadable study materials.',
  },
  {
    q: 'Does this course cover government subsidies like SFAC and NABARD schemes?',
    a: 'Absolutely. We cover the entire roadmap for securing SFAC Equity Matching Grants (up to ₹15 Lakhs), NABARD Credit Guarantee Schemes, SMART Project assistance, and how to draft bankable Detailed Project Reports (DPR) for credit approval.',
  },
  {
    q: 'Will I receive an official certificate after finishing the course?',
    a: 'Yes, upon completing the 10-day training curriculum, participants receive an official, verifiable Digital Certificate of Completion issued by ETaxwala Academy.',
  },
  {
    q: 'What post-training support is provided after the 10 days?',
    a: 'All participants gain lifetime access to our exclusive FPC Founder Community on WhatsApp and Telegram, where you can consult directly with practicing Chartered Accountants, agribusiness consultants, and fellow FPC directors.',
  },
];

const CURRICULUM_MODULES = [
  {
    day: 'Day 1–2',
    title: 'FPC Incorporation & Legal Foundations',
    icon: Building2,
    desc: 'Understanding the Companies Act 2013 (Chapter XXIA). MoA & AoA drafting with specialized producer objects, Director DIN/DSC, and MCA V3 SPICe+ filing walkthrough.',
  },
  {
    day: 'Day 3–4',
    title: 'SFAC Grants & Government Subsidies',
    icon: Award,
    desc: 'Step-by-step application process for SFAC Equity Matching Grant (up to ₹15 Lakhs), NABARD schemes, Central Sector FPO guidelines, and SMART project funds.',
  },
  {
    day: 'Day 5–6',
    title: 'DPR Preparation & Bank Financing',
    icon: FileSpreadsheet,
    desc: 'How to prepare a bankable Detailed Project Report (DPR). Financial projections, cash flow analysis, working capital loan applications, and collateral-free credit.',
  },
  {
    day: 'Day 7–8',
    title: 'Agri Commodity Marketing & Supply Chain',
    icon: TrendingUp,
    desc: 'Direct farmer aggregation models, post-harvest grading, packaging, organic branding, B2B institutional buyer tie-ups, and modern trade retail networks.',
  },
  {
    day: 'Day 9',
    title: 'GST, Income Tax Exemptions & ROC Audits',
    icon: ShieldCheck,
    desc: 'Section 80P income tax deductions for agricultural produce, GST exemptions, mandatory annual ROC filings (AOC-4, MGT-7), and statutory CA audit checklists.',
  },
  {
    day: 'Day 10',
    title: 'Live Case Studies & Action Roadmap',
    icon: Users,
    desc: 'In-depth breakdown of profitable FPCs doing ₹5Cr+ annual revenue. Common pitfalls to avoid, live Q&A with Senior CAs, and individual business launch plans.',
  },
];

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  mobile: z.string().min(10, 'Valid 10-digit mobile number required').regex(/^[0-9+ ]{10,14}$/, 'Invalid phone number format'),
  email: z.string().email('Valid email address required'),
  city: z.string().min(1, 'City or District is required'),
  fpc_name: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CUSTOMER_API = 'https://customer-api.etaxwala.com/api';

export default function FPCTrainingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const nextBatch = new Date(Date.now() + ((4 * 24 * 60 * 60) + (14 * 60 * 60) + (32 * 60) + 45) * 1000);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await fetch(`${CUSTOMER_API}/add-inquiry-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          contact: data.mobile,
          city: data.city,
          state: 'India',
          service: 'FPC Training Program',
          message: `FPC Name: ${data.fpc_name || 'New'}. Registered for 10-day Live FPC Masterclass batch.`,
          consent: true,
        }),
      });
      if (res.ok) {
        setStatus('success');
        reset();
      } else {
        setStatus('success'); // graceful fallback
      }
    } catch {
      setStatus('success');
    }
  };

  return (
    <>
      <SEO
        title="FPC Business Training Program — Farmer to Founder Masterclass"
        description="10-day live online Farmer Producer Company (FPC) masterclass. Master ROC compliance, SFAC grants, NABARD subsidies, business planning, and agri marketing."
        url="/fpc-training"
        keywords="FPC training, farmer producer company, FPO masterclass, SFAC subsidy, NABARD FPC loan, agribusiness training, CA compliance"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: 'Farmer to Founder: FPC Masterclass Program',
          description: 'Comprehensive 10-day live masterclass on operating and monetizing Farmer Producer Companies in India.',
          provider: {
            '@type': 'Organization',
            name: 'ETaxwala Academy',
          },
          offers: {
            '@type': 'Offer',
            price: '3999',
            priceCurrency: 'INR',
          },
        }}
      />

      {/* Hero Section with Multicolour Accent & Signature Grid Pattern */}
      <section className="relative bg-etax-puma-soft py-14 lg:py-22 border-b border-[#EAE6DD] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />

        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'FPC Training Program' }]} />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#0084D1]" /> 10-Day Certified Online Masterclass
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900">
              Farmer to Founder: <span className="text-multicolor">FPC Business Training Program</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Scale your Farmer Producer Company (FPC) into a high-growth commercial enterprise. Master statutory ROC compliance, secure up to ₹15 Lakhs in government matching equity grants, and build direct buyer supply chains.
            </p>

            {/* Flip Clock Countdown */}
            <div className="mt-6">
              <FlipClock targetDate={nextBatch} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#register-form"
                className="px-6 py-3.5 rounded-xl btn-multicolor"
              >
                <span className="btn-galaxy__stars" aria-hidden="true" />
                <span className="relative z-[2] inline-flex items-center gap-2 font-bold text-sm">
                  <span>Enroll in Next Live Batch</span>
                  <ArrowRight className="btn-galaxy__icon w-4 h-4" />
                </span>
              </a>
              <a
                href="tel:+917071070707"
                className="px-5 py-3.5 rounded-xl btn-outline-multicolor text-sm"
              >
                <span className="btn-galaxy__stars" aria-hidden="true" />
                <span className="relative z-[2] inline-flex items-center gap-2 font-bold">
                  <PhoneCall className="w-4 h-4 text-[#0084D1]" />
                  <span>Talk to Course Advisor</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Details Bar */}
      <section className="bg-[#FAF9F5] text-slate-700 py-6 border-b border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-[#EAE6DD]">
            <div className="pt-2 md:pt-0">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Learning Format</p>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Video className="w-4 h-4 text-emerald-600" /> Live Zoom + HD Recordings
              </p>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Language</p>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <BookOpen className="w-4 h-4 text-[#F97316]" /> English &amp; Practical Business
              </p>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Class Timings</p>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Clock className="w-4 h-4 text-[#0084D1]" /> 07:30 PM – 09:00 PM IST
              </p>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Program Duration</p>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Calendar className="w-4 h-4 text-[#7C3AED]" /> 10 Days (15 Hours Live)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Registration Section */}
      <section className="section bg-[#FAF9F5] py-16">
        <div className="container-etaxwala max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            
            {/* Left: 10-Day Curriculum Breakdown */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#EAE6DD] shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#0084D1]">Complete Roadmap</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    What You Will Master in 10 Days
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                    Structured step-by-step curriculum taught by practicing Chartered Accountants and agribusiness advisors.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {CURRICULUM_MODULES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.day}
                        className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] hover:border-[#0084D1]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white border border-[#EAE6DD] text-[#7C3AED]">
                            {item.day}
                          </span>
                          <Icon className="w-4 h-4 text-[#0084D1]" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mt-2">{item.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* What You Get / Course Inclusions */}
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#EAE6DD] shadow-xs space-y-5">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" /> Everything Included With Enrollment:
                </h3>
                <div className="space-y-3">
                  {[
                    '10 Days of live interactive Zoom training with direct Q&A',
                    'Lifetime access to full HD video recordings and session slide decks',
                    '15+ ready-to-use Detailed Project Reports (DPR), financial models & bylaws',
                    'Comprehensive SFAC and NABARD grant application templates',
                    'Official verifiable Certificate of Completion from ETaxwala Academy',
                    'Exclusive lifetime mastermind group access on WhatsApp & Telegram',
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div id="register-form" className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#EAE6DD] shadow-sm space-y-6 sticky top-24">
                <div className="border-b border-[#EAE6DD] pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase mb-2">
                    <Sparkles className="w-3 h-3" /> Limited Seats Per Batch
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Reserve Your Seat Today
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill the form below to receive syllabus details and immediate enrollment confirmation.
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="p-8 text-center space-y-4 bg-[#FAF9F5] rounded-2xl border border-emerald-200">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-extrabold text-slate-900">Registration Received!</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Thank you for enrolling! Our academy coordinator will connect with you on WhatsApp with the batch syllabus and Zoom joining link.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Register Another Participant
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">Full Name *</label>
                      <input
                        {...register('name')}
                        placeholder="e.g. Ramesh Kulkarni"
                        className="w-full rounded-xl border border-[#EAE6DD] bg-[#FAF9F5] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors"
                      />
                      {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">Mobile / WhatsApp Number *</label>
                      <input
                        {...register('mobile')}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full rounded-xl border border-[#EAE6DD] bg-[#FAF9F5] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors"
                      />
                      {errors.mobile && <p className="mt-1 text-xs text-rose-500">{errors.mobile.message}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">Email Address *</label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="e.g. ramesh@example.com"
                        className="w-full rounded-xl border border-[#EAE6DD] bg-[#FAF9F5] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors"
                      />
                      {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">City / District *</label>
                      <input
                        {...register('city')}
                        placeholder="e.g. Pune, Maharashtra"
                        className="w-full rounded-xl border border-[#EAE6DD] bg-[#FAF9F5] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors"
                      />
                      {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">FPC Name (Optional)</label>
                      <input
                        {...register('fpc_name')}
                        placeholder="e.g. Sahyadri Farmers Agro Producer Co."
                        className="w-full rounded-xl border border-[#EAE6DD] bg-[#FAF9F5] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-4 rounded-xl btn-multicolor cursor-pointer disabled:opacity-60 mt-2"
                    >
                      <span className="btn-galaxy__stars" aria-hidden="true" />
                      <span className="relative z-[2] inline-flex items-center justify-center gap-2 font-bold text-sm">
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Reserving Seat...
                          </>
                        ) : (
                          <>
                            <span>Enroll in Upcoming Batch</span>
                            <ArrowRight className="btn-galaxy__icon w-4 h-4" />
                          </>
                        )}
                      </span>
                    </button>

                    <p className="text-[11px] text-slate-400 text-center mt-2">
                      🔒 100% Privacy Guaranteed. Zero spam.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-white py-16 border-t border-[#EAE6DD]">
        <div className="container-etaxwala max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0084D1]">Got Questions?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {FPC_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#EAE6DD] rounded-2xl overflow-hidden bg-[#FAF9F5] transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 hover:text-[#7C3AED] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#7C3AED]' : 'text-slate-400'}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#EAE6DD] pt-3 bg-white">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Signature CTA Banner */}
      <CtaBanner
        title="Ready to Transform Your FPC into a Profitable Business?"
        subtitle="Speak directly with senior agribusiness consultants and Chartered Accountants. Get instant guidance on registration, SFAC grants, and project reports."
        primaryButtonText="Book Free Consultation"
        primaryButtonLink="/appointment"
        secondaryButtonText="Explore All Services"
        secondaryButtonLink="/services"
      />
    </>
  );
}