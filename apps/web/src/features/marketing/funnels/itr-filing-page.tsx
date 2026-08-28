import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, ShieldCheck, FileText, TrendingUp, CheckCircle2, ArrowRight,
  AlertTriangle, ChevronDown, Star, Sparkles, Building2, Briefcase, Coins, Home,
  FileSpreadsheet, HelpCircle, PhoneCall
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations';

const INCOME_TYPES = [
  { icon: Briefcase, title: 'Salaried Employees', desc: 'Form 16, HRA, 80C/80D deductions & multiple Form 16 reconciliation.', tag: 'ITR-1 / ITR-2' },
  { icon: Building2, title: 'Business & Freelancers', desc: 'Presumptive taxation (44AD, 44ADA), balance sheet drafting & GST match.', tag: 'ITR-3 / ITR-4' },
  { icon: Coins, title: 'Stock & Crypto Traders', desc: 'Short-term & long-term capital gains, crypto 30% VDA taxation, F&O trading losses.', tag: 'ITR-2 / ITR-3' },
  { icon: Home, title: 'Rental & House Property', desc: 'Multi-property rent, home loan interest (Section 24b), municipal tax deduction.', tag: 'ITR-1 / ITR-2' },
  { icon: FileSpreadsheet, title: 'Foreign Assets & NRI', desc: 'DTAA relief (Section 90/91), foreign salary, RSU/ESOP vested in US stocks.', tag: 'ITR-2' },
  { icon: Sparkles, title: 'Directors & Partners', desc: 'Remuneration from Pvt Ltd / LLP, shareholding disclosure, DIN filing.', tag: 'ITR-2 / ITR-3' },
];

const ITR_FAQS = [
  {
    q: 'Why should I file ITR with ETaxwala instead of filing myself for free?',
    a: 'While basic filing is free, self-filers often miss legitimate deductions under 80C, 80D, 80G, 80TTA or mismatch AIS/TIS data, triggering automated scrutiny notices from the Income Tax department. ETaxwala pairs you with a practicing CA who verifies AIS/TIS, reconciles 26AS, maximizes your eligible refunds, and signs off on accuracy.',
  },
  {
    q: 'What documents do I need to provide for ITR filing?',
    a: 'Key documents include: PAN Card, Aadhaar Card, Form 16 / Form 16A, Bank Statements (for all active accounts), Capital gains statement (from Zerodha/Groww/Upstox), and details of any other income or deductions.',
  },
  {
    q: 'How long does the entire ITR filing process take?',
    a: 'Once your documents are submitted, your assigned CA drafts your computation and schedules a review call within 24–48 hours. After your verbal approval, the return is filed immediately and the ITR-V acknowledgment is shared on WhatsApp & email.',
  },
  {
    q: 'What is the penalty for filing after the due date?',
    a: 'Under Section 234F, a late filing fee of up to ₹5,000 is levied. Additionally, interest @ 1% per month is charged on unpaid tax under Section 234A. You also lose the benefit of carrying forward business or capital losses to future years.',
  },
  {
    q: 'Will you help if I receive an Income Tax notice after filing?',
    a: 'Yes! All ETaxwala ITR packages include complimentary initial notice support. If the department sends an intimation under Section 143(1) or a query, our CA team drafts and files the rectification or response on the e-filing portal.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Rajesh Sharma',
    role: 'Senior Software Engineer, Pune',
    rating: 5,
    text: 'I had salary from two employers plus RSUs in US stocks. ETaxwala’s CA saved me ₹42,000 in excess tax deductions and handled the foreign asset schedule flawlessly.',
  },
  {
    name: 'Pooja Deshmukh',
    role: 'Digital Marketing Freelancer, Mumbai',
    rating: 5,
    text: 'Filed under Section 44ADA. The CA explained how to legally claim 50% presumptive expenses. Fast, transparent and zero hassle!',
  },
];

export default function ITRFilingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <SEO
        title="ITR Filing Online — Expert CA Assisted Income Tax Returns"
        description="File your ITR with practicing Chartered Accountants. Maximum refund guarantee, AIS/TIS reconciliation, and penalty protection. Contact us for custom plans."
        url="/itr-filing"
        keywords="ITR filing, income tax return online, CA assisted ITR, salary ITR 1, capital gains ITR 2, business ITR 3, Section 44AD"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'FinancialProduct',
          name: 'ETaxwala ITR Filing Service',
          description: 'CA assisted income tax return filing in India with 100% compliance guarantee.',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: '499',
            highPrice: '2999',
          },
        }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#FFFDF9] py-16 lg:py-24 border-b border-[#EAE6DD] overflow-hidden">
        {/* Multicolour accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'ITR Filing' }]} className="text-slate-500" />
          </div>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> Assessment Year 2024-25 / 2025-26
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900">
              File Your Income Tax Return with <span className="text-multicolor">Senior CA Advisory</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Never leave your hard-earned tax refund on the table. Every return is audited against 80+ deduction checkpoints and AIS/TIS data by certified Chartered Accountants.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/appointment" className="px-6 py-3.5 rounded-xl btn-multicolor font-bold text-sm shadow-xs flex items-center gap-2">
                <span>Start CA Assisted Filing</span> <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:+917071070707" className="px-5 py-3.5 rounded-xl border border-[#EAE6DD] bg-white hover:bg-[#FAF9F5] text-slate-800 text-sm font-semibold transition-colors flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#0084D1]" /> Talk to Tax Expert
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="section bg-white dark:bg-slate-900 py-16">
        <div className="container-etaxwala">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">The ETaxwala Standard</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">Why 1,00,000+ Indians Trust Us For ITR</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'CA Certified Accuracy', desc: 'Every return is hand-reviewed by a practicing CA — eliminating errors and notice triggers.' },
              { icon: Calculator, title: 'Maximum Refund Engine', desc: 'Comprehensive checklist covering 80C, 80D, 80G, 80TTA, 24b & regime comparison.' },
              { icon: FileText, title: 'Complete AIS/TIS Sync', desc: 'We reconcile Annual Information Statement (AIS) & Form 26AS to prevent mismatch notices.' },
              { icon: TrendingUp, title: 'Free Notice Protection', desc: 'Complimentary response drafting & rectification filing support for all filed returns.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1.10.4: Income Types Section */}
      <section className="section bg-slate-50 dark:bg-slate-950 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="container-etaxwala">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Tailored Expertise</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">We Cover All Income Streams &amp; ITR Forms</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Whether you are a single salaried professional or manage multi-asset trading portfolios.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {INCOME_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.title} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {type.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{type.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5">{type.desc}</p>
                  </div>
                  <Link to="/appointment" className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                    <span>File this return</span> <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="section bg-white py-16">
        <div className="container-etaxwala">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">Our Plans</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Choose Your Filing Plan</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Contact us for a personalised quote — zero hidden charges, CA consultation included.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                type: 'Salary & Single Form 16',
                badge: 'Most Popular for Employees',
                features: ['Income from Salary & House Property', 'Chapter VI-A Deductions (80C, 80D)', 'AIS/TIS & 26AS Verification', 'Old vs New Tax Regime Analysis', 'ITR-V Filing & Confirmation'],
              },
              {
                type: 'Business & Professionals',
                badge: 'Freelancers & SMEs',
                popular: true,
                features: ['Presumptive Taxation (44AD / 44ADA)', 'Balance Sheet & P&L Drafting', 'Multi-source Income Reconciliation', 'GST & Bank Turnover Matching', 'Advance Tax Advisory'],
              },
              {
                type: 'Capital Gains & Crypto',
                badge: 'Traders & Investors',
                features: ['Equity, Mutual Funds, Crypto VDA', 'F&O Trading Profit/Loss Computation', 'Loss Carry-forward Setoff', 'Multiple Demat Broker Statements', 'Foreign Assets & Stock ESOPs'],
              },
            ].map((plan) => (
              <div
                key={plan.type}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-multicolor text-white shadow-xl ring-2 ring-[#7C3AED]/30 relative'
                    : 'bg-white border border-[#EAE6DD] shadow-xs'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[11px] font-black uppercase px-3 py-0.5 rounded-full shadow-md">
                    Recommended
                  </span>
                )}
                <div>
                  <span className={`text-xs font-semibold ${plan.popular ? 'text-blue-200' : 'text-slate-500'}`}>
                    {plan.badge}
                  </span>
                  <h3 className={`text-lg font-bold mt-1 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.type}
                  </h3>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`price-masked text-2xl ${plan.popular ? 'text-white' : ''}`}>
                      ₹ ★ ★ ★
                    </span>
                  </div>
                  <p className={`text-[11px] mt-1 ${plan.popular ? 'text-slate-200' : 'text-slate-400'}`}>Contact us for quote</p>
                  <div className="mt-6 space-y-2.5 text-left">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-xs sm:text-sm">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${plan.popular ? 'text-emerald-300' : 'text-emerald-600'}`} />
                        <span className={plan.popular ? 'text-slate-100' : 'text-slate-600'}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  to="/appointment"
                  className={`mt-8 py-3 px-4 rounded-xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-md'
                      : 'btn-multicolor'
                  }`}
                >
                  <span>Get a Free Quote</span> <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 1.10.5: Urgency Section */}
      <section className="bg-amber-500/10 border-y border-amber-500/20 py-10">
        <div className="container-etaxwala max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Don't Risk Late Filing Penalties &amp; Interest</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Filing past the due date triggers up to ₹5,000 late fee under Section 234F, plus 1% monthly interest under Section 234A. File early to ensure smooth refunds.
              </p>
            </div>
            <Link to="/appointment" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap shadow-sm">
              File Today
            </Link>
          </div>
        </div>
      </section>

      {/* 1.10.7: Testimonial Section */}
      <section className="section bg-slate-50 dark:bg-slate-950 py-16">
        <div className="container-etaxwala max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Client Reviews</span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">What Our Tax Clients Say</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{t.text}"</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1.10.6: FAQ Accordion Section */}
      <section className="section bg-white dark:bg-slate-900 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="container-etaxwala max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Help &amp; FAQs</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {ITR_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-blue-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
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
    </>
  );
}