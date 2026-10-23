import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Shield,
  FileText,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  Star,
  Sparkles,
  Building2,
  Briefcase,
  Coins,
  Home,
  FileSpreadsheet,
  PhoneCall,
  User,
  ShieldAlert,
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import CtaBanner from '@/components/cta-banner';
const INCOME_TYPES = [
  {
    icon: Briefcase,
    title: 'Salaried Employees',
    desc: 'Form 16, HRA exemptions, 80C/80D deductions & multiple Form 16 salary reconciliations.',
    tag: 'ITR-1 / ITR-2',
  },
  {
    icon: Building2,
    title: 'Business & Freelancers',
    desc: 'Presumptive taxation (Section 44AD / 44ADA), balance sheet drafting, and GST turnover matching.',
    tag: 'ITR-3 / ITR-4',
  },
  {
    icon: Coins,
    title: 'Stock & Crypto Traders',
    desc: 'Short/long term capital gains, crypto 30% VDA taxation, F&O loss carryforward and Zerodha/Groww P&L sync.',
    tag: 'ITR-2 / ITR-3',
  },
  {
    icon: Home,
    title: 'Rental & House Property',
    desc: 'Multi-property rental income, home loan interest deductions (Section 24b), and municipal tax reliefs.',
    tag: 'ITR-1 / ITR-2',
  },
  {
    icon: FileSpreadsheet,
    title: 'Foreign Assets & NRI',
    desc: 'DTAA relief (Section 90/91), foreign salary remittances, and US stock RSU/ESOP capital taxation.',
    tag: 'ITR-2',
  },
  {
    icon: Sparkles,
    title: 'Directors & Partners',
    desc: 'Remuneration & profit share from Pvt Ltd / LLP, shareholding disclosure schedules, and DIN filings.',
    tag: 'ITR-2 / ITR-3',
  },
];

const ITR_FAQS = [
  {
    q: 'Why should I file ITR with ETaxwala instead of self-filing for free?',
    a: 'While generic portals offer automated self-filing, most self-filers miss legitimate deductions under 80C, 80D, 80G, 80TTA or fail to match AIS/TIS figures, triggering automated scrutiny notices from the Income Tax department. ETaxwala assigns you a practicing Chartered Accountant who audits AIS/TIS, reconciles Form 26AS, maximizes legal refunds, and signs off on accuracy.',
  },
  {
    q: 'What documents are required to file my Income Tax Return?',
    a: 'Key documents include: PAN Card, Aadhaar Card, Form 16 / Form 16A, bank statements for all active accounts, capital gains statements (from Zerodha, Groww, Upstox, etc.), and proof of any additional deductions or home loan interest certificates.',
  },
  {
    q: 'How long does the CA-assisted filing process take?',
    a: 'Once your documents are submitted, your assigned CA prepares the initial computation and schedules a review call within 24–48 hours. After your verbal or written sign-off, the return is transmitted immediately to the IT portal, and your ITR-V acknowledgment is shared on WhatsApp and email.',
  },
  {
    q: 'What are the penalties for filing after the statutory due date?',
    a: 'Under Section 234F, a late filing fee of up to ₹5,000 is levied. Additionally, interest @ 1% per month is charged on unpaid tax liability under Section 234A. You also lose the legal right to carry forward capital gains losses or business losses to subsequent assessment years.',
  },
  {
    q: 'Does ETaxwala assist if I receive an Income Tax notice after filing?',
    a: 'Yes! All ETaxwala ITR filing packages include complimentary initial notice support. If the department sends an intimation under Section 143(1) or a query regarding your return, our CA team analyzes the notice, drafts an official reply, and files the response or rectification on the e-filing portal.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Rajesh Sharma',
    role: 'Senior Software Engineer, Bengaluru',
    rating: 5,
    text: 'I had salary from two employers plus US stock RSUs. ETaxwala’s CA saved me ₹42,000 in excess TDS deductions and filed the foreign assets schedule with zero friction.',
  },
  {
    name: 'Pooja Deshmukh',
    role: 'Digital Marketing Consultant, Mumbai',
    rating: 5,
    text: 'Filed under Section 44ADA. The CA clearly explained how to legally claim 50% presumptive expenses. Transparent, fast, and delivered my ITR-V within 24 hours!',
  },
];

export default function ITRFilingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPlan, setSelectedPlan] = useState<number>(1);
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="ITR Filing Online — Expert CA Assisted Income Tax Returns"
        description="File your ITR with practicing Chartered Accountants. Maximum refund guarantee, AIS/TIS reconciliation, and penalty protection. Book your consultation today."
        url="/itr-filing"
        keywords="ITR filing, income tax return online, CA assisted ITR, salary ITR 1, capital gains ITR 2, business ITR 3, Section 44AD"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'FinancialProduct',
          name: 'ETaxwala ITR Filing Service',
          description:
            'CA assisted income tax return filing in India with 100% compliance guarantee.',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: '499',
            highPrice: '2999',
          },
        }}
        faqs={ITR_FAQS.map((f) => ({ question: f.q, answer: f.a }))}
      />

      {/* Hero Section with Signature Multicolour Accent & Grid Pattern */}
      <section className="relative bg-etax-puma-soft py-14 lg:py-22 border-b border-[#EAE6DD] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />

        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'ITR Filing' }]} />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> Assessment Year 2025-26 (FY
              2024-25)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900">
              File Your Income Tax Return with{' '}
              <span className="text-multicolor">Senior CA Advisory</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Never leave your hard-earned tax refund on the table. Every return is audited against
              80+ deduction checkpoints and cross-verified with AIS/TIS data by certified Chartered
              Accountants.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/appointment" className="px-6 py-3.5 rounded-xl btn-multicolor">
                <span className="btn-galaxy__stars" aria-hidden="true" />
                <span className="relative z-[2] inline-flex items-center gap-2 font-bold text-sm">
                  <span>Start CA Assisted Filing</span>
                  <ArrowRight className="btn-galaxy__icon w-4 h-4" />
                </span>
              </Link>
              <a
                href="tel:08069029999"
                className="px-5 py-3.5 rounded-xl btn-outline-multicolor text-sm"
              >
                <span className="btn-galaxy__stars" aria-hidden="true" />
                <span className="relative z-[2] inline-flex items-center gap-2 font-bold">
                  <PhoneCall className="w-4 h-4 text-[#F97316]" />
                  <span>Call Senior CA: 080-6902-9999</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Guarantees Bar */}
      <section className="section bg-white py-16">
        <div className="container-etaxwala">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0084D1]">
              The ETaxwala Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Why 1,00,000+ Taxpayers Trust Our CAs
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                color: '#0084D1',
                bg: 'rgba(0,132,209,0.08)',
                title: 'CA Certified Accuracy',
                desc: 'Every return is hand-reviewed by practicing CAs, eliminating arithmetic errors and notice triggers.',
              },
              {
                icon: Calculator,
                color: '#7C3AED',
                bg: 'rgba(124,58,237,0.08)',
                title: 'Maximum Refund Engine',
                desc: 'Exhaustive checklist covering 80C, 80D, 80G, 80TTA, 24b and Old vs New tax regime optimization.',
              },
              {
                icon: FileText,
                color: '#E11D48',
                bg: 'rgba(225,29,72,0.08)',
                title: 'Complete AIS/TIS Sync',
                desc: 'We reconcile Annual Information Statement (AIS) and Form 26AS to prevent mismatch tax notices.',
              },
              {
                icon: TrendingUp,
                color: '#F97316',
                bg: 'rgba(249,115,22,0.08)',
                title: 'Free Notice Protection',
                desc: 'Complimentary query response drafting and rectification filing support for all processed returns.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-[#FAF9F5] rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] hover:border-[#7C3AED]/40 hover:bg-white shadow-xs hover:shadow-md transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Income Streams & Form Matching */}
      <section className="section bg-[#FAF9F5] py-16 border-y border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
              Tailored Expertise
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              We Cover All Income Streams &amp; ITR Forms
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Whether you are a salaried employee or manage multi-asset trading and business
              portfolios.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {INCOME_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-xs hover:border-[#7C3AED]/40 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] text-[#7C3AED] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700">
                        {type.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{type.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">{type.desc}</p>
                  </div>
                  <Link
                    to="/appointment"
                    className="mt-5 pt-3.5 border-t border-[#EAE6DD] text-xs font-bold text-[#0084D1] flex items-center gap-1.5 hover:text-[#7C3AED] transition-colors"
                  >
                    <span>File this return with CA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
            <span className="text-xs font-bold uppercase tracking-widest text-[#E11D48]">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Select Your ITR Filing Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              All plans include 1-on-1 Chartered Accountant review and instant acknowledgment
              generation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                type: 'Salary & Single Form 16',
                badge: 'Salaried Employees',
                price: '₹ * * * *',
                features: [
                  'Salary & Single House Property Income',
                  'Chapter VI-A Deductions (80C, 80D, 80G)',
                  'AIS/TIS & Form 26AS Tax Credit Matching',
                  'Old vs New Tax Regime Comparison',
                  'Instant ITR-V Filing Confirmation',
                ],
              },
              {
                type: 'Business & Professionals',
                badge: 'Freelancers & SMEs',
                popular: true,
                price: '₹ * * * *',
                features: [
                  'Presumptive Taxation (Section 44AD / 44ADA)',
                  'Profit & Loss and Balance Sheet Drafting',
                  'Multiple Bank Accounts Reconciliation',
                  'GST & Bank Turnover Matching',
                  'Advance Tax Computation & Guidance',
                ],
              },
              {
                type: 'Capital Gains & Crypto',
                badge: 'Traders & Investors',
                price: '₹ * * * *',
                features: [
                  'Equity, Mutual Funds & Crypto VDA Reporting',
                  'F&O Trading Profit / Loss Computation',
                  'Loss Set-off & Carry-forward to Future Years',
                  'Multiple Broker Demat Statement Sync',
                  'Foreign Stocks & RSU/ESOP Reporting',
                ],
              },
            ].map((plan, idx) => {
              const isSelected = selectedPlan === idx;
              return (
                <div
                  key={plan.type}
                  onClick={() => setSelectedPlan(idx)}
                  className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 relative cursor-pointer ${
                    isSelected
                      ? 'bg-white shadow-xl scale-[1.02] z-10'
                      : 'bg-[#FAF9F5] border border-[#EAE6DD] shadow-xs hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Smooth Shifting Outline with Framer Motion layoutId */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeItrPlanOutline"
                      className="absolute inset-0 rounded-3xl border-2 border-[#7C3AED] ring-4 ring-[#7C3AED]/15 pointer-events-none z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  {/* Top Badge */}
                  {isSelected ? (
                    <motion.div
                      layoutId="activeItrPlanBadge"
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-multicolor text-white text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1.5 z-20 whitespace-nowrap"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    >
                      <span>{plan.popular ? 'Most Popular' : 'Selected Plan'}</span>
                    </motion.div>
                  ) : plan.popular ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-100 border border-[#EAE6DD] text-slate-600 text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full shadow-xs tracking-wider">
                      Most Popular
                    </div>
                  ) : null}

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {plan.badge}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">{plan.type}</h3>
                    <div className="mt-4 pb-4 border-b border-[#EAE6DD]">
                      <span className="text-xl font-extrabold text-[#7C3AED]">{plan.price}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Includes full CA consultation
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span className="text-slate-600">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 relative z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          setSelectedPlan(idx);
                        } else {
                          navigate('/appointment');
                        }
                      }}
                      className={`w-full py-3.5 px-4 rounded-xl text-center cursor-pointer transition-all duration-200 ${
                        isSelected ? 'btn-multicolor shadow-md' : 'btn-outline-multicolor'
                      }`}
                    >
                      <span className="btn-galaxy__stars" aria-hidden="true" />
                      <span className="relative z-[2] inline-flex items-center justify-center gap-2 font-bold text-xs sm:text-sm">
                        <span>File with CA Now</span>
                        <ArrowRight className="btn-galaxy__icon w-4 h-4" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="bg-[#FAF9F5] border-y border-[#EAE6DD] py-10">
        <div className="container-etaxwala max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center gap-5 p-6 sm:p-7 rounded-3xl bg-white border border-amber-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-extrabold text-slate-900 text-base">
                Avoid Late Filing Penalties Under Section 234F
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Filing past the deadline triggers up to ₹5,000 in penalties plus 1% monthly interest
                under Section 234A. File on time with CA sign-off to ensure seamless refunds.
              </p>
            </div>
            <Link
              to="/appointment"
              className="px-6 py-3 rounded-xl btn-multicolor whitespace-nowrap shrink-0"
            >
              <span className="btn-galaxy__stars" aria-hidden="true" />
              <span className="relative z-[2] inline-flex items-center gap-2 font-bold text-xs">
                File Return Today
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white py-16">
        <div className="container-etaxwala max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0084D1]">
              Client Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              What Our Tax Filing Clients Say
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-[#FAF9F5] rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] space-y-3.5 shadow-xs"
              >
                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{t.text}"
                </p>
                <div className="pt-3 border-t border-[#EAE6DD]">
                  <p className="font-bold text-sm text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="section bg-[#FAF9F5] py-16 border-t border-[#EAE6DD]">
        <div className="container-etaxwala max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
              Help &amp; FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {ITR_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#EAE6DD] rounded-2xl overflow-hidden bg-white shadow-xs transition-colors"
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
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#EAE6DD] pt-3 bg-[#FAF9F5]">
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
        title="Ready to File Your ITR with 100% CA Sign-Off?"
        subtitle="Book a free consultation and let our practicing Chartered Accountants maximize your refunds with zero scrutiny risk."
        primaryButtonText="Book Free Consultation"
        primaryButtonLink="/appointment"
        secondaryButtonText="Explore Services"
        secondaryButtonLink="/services"
      />
    </>
  );
}
