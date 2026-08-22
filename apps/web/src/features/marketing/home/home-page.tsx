import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/seo';
import {
  Stethoscope, Building2, Calculator, ClipboardCheck, Lightbulb, TrendingUp,
  Users, FileText, ShieldCheck, Sparkles, ArrowRight, Star, CheckCircle2,
  MapPin, Phone, Award, Target, Eye, Rocket, Handshake, Briefcase,
  Code2, Smartphone, Search, FileBadge, Receipt, Globe,
  ChevronDown, MessageCircle, Calendar, Zap,
} from 'lucide-react';

const _Trademark: any = FileBadge;

const heroStats = [
  { v: '1L+', l: 'Happy Customers' },
  { v: '200+', l: 'Expert Team' },
  { v: '120+', l: 'Franchises' },
  { v: '98.9%', l: 'Success Rate' },
];

const megaStats = [
  { value: '1', suffix: 'Lakh+', label: 'Happy Customers', icon: Users, color: 'text-blue-500' },
  { value: '200', suffix: '+', label: 'Team Members', icon: Briefcase, color: 'text-emerald-500' },
  { value: '120', suffix: '+', label: 'Franchises in India', icon: Handshake, color: 'text-purple-500' },
  { value: '98.9', suffix: '%', label: 'Success Rate', icon: Award, color: 'text-orange-500' },
];

const serviceCategories = [
  {
    icon: Building2, title: 'Business Registration', count: '9 Services', color: 'from-blue-500 to-blue-600',
    items: ['Private Limited', 'LLP', 'OPC', 'Partnership', 'Section 8 NGO', 'Producer Company', 'Public Limited'],
    startingPrice: 16499,
  },
  {
    icon: FileBadge, title: 'Tax & GST Registration', count: '10 Services', color: 'from-emerald-500 to-emerald-600',
    items: ['GST Registration', 'MSME', 'FSSAI', 'Import Export', 'Professional Tax', 'TAN', 'DSC'],
    startingPrice: 999,
  },
  {
    icon: Receipt, title: 'ITR & Return Filing', count: '20+ Services', color: 'from-purple-500 to-purple-600',
    items: ['ITR Filing', 'GST Return', 'TDS Return', 'EPFO/ESIC', 'Tax Audit', 'CMA Report'],
    startingPrice: 499,
  },
  {
    icon: ClipboardCheck, title: 'Audit & Compliance', count: '9 Services', color: 'from-rose-500 to-rose-600',
    items: ['Pvt Ltd Audit', 'LLP Audit', 'OPC Audit', 'Section 8 Audit', 'Multi-State Audit', 'Co-op Audit'],
    startingPrice: 9999,
  },
  {
    icon: FileBadge, title: 'IP & Trademark', count: '12 Services', color: 'from-cyan-500 to-cyan-600',
    items: ['Trademark Registration', 'Copyright', 'Patent', 'Design Registration', 'ISO Certification'],
    startingPrice: 6999,
  },
  {
    icon: Lightbulb, title: 'Business Consultancy', count: '13 Services', color: 'from-amber-500 to-amber-600',
    items: ['CFO Services', 'HR & Payroll', 'Startup Funding', 'Business Automation', 'Growth Strategy'],
    startingPrice: 2999,
  },
  {
    icon: Code2, title: 'Web & App Development', count: '15+ Services', color: 'from-indigo-500 to-indigo-600',
    items: ['Website Development', 'Mobile App', 'Landing Page', 'SEO', 'Social Media Marketing'],
    startingPrice: 4999,
    isUnique: true,
  },
  {
    icon: Sparkles, title: 'Marketing & Branding', count: '20+ Services', color: 'from-pink-500 to-pink-600',
    items: ['Logo Design', 'Brand Identity', 'Digital Marketing', 'Influencer Marketing', 'PR Marketing'],
    startingPrice: 2999,
  },
];

const quickActions = [
  { icon: Calculator, label: 'Talk to a CA', desc: 'Chartered Accountant', color: 'bg-blue-500' },
  { icon: FileText, label: 'Talk to a Lawyer', desc: 'Legal Expert', color: 'bg-purple-500' },
  { icon: _Trademark, label: 'Talk to CS', desc: 'Company Secretary', color: 'bg-emerald-500' },
  { icon: Lightbulb, label: 'Business Consultation', desc: 'Growth Advisor', color: 'bg-orange-500' },
];

const whyChooseUs = [
  { icon: Target, title: 'Tailored Solutions', description: 'Your business is unique. Solutions customized to your specific challenges and goals.' },
  { icon: Users, title: '200+ Expert Team', description: 'Chartered Accountants, lawyers, and consultants handling even the most complex cases.' },
  { icon: Zap, title: 'Proactive Approach', description: 'We don\'t just react — we anticipate. Stay ahead with strategies for tomorrow.' },
  { icon: Handshake, title: 'Client-Centric Focus', description: '1 Lakh+ happy customers. Long-term relationships built on trust and results.' },
];

const process = [
  { step: '01', title: 'Diagnose', desc: 'We analyze your business challenges, identify root causes, and assess your current position.', icon: Stethoscope },
  { step: '02', title: 'Strategize', desc: 'Our experts craft a tailored action plan with clear steps, timelines, and pricing.', icon: Target },
  { step: '03', title: 'Execute', desc: 'Our team handles everything — documentation, filing, compliance — while you focus on business.', icon: Rocket },
  { step: '04', title: 'Succeed', desc: 'Track progress in real-time, get ongoing support, and watch your business thrive.', icon: TrendingUp },
];

const testimonials = [
  { name: 'Rajesh Kumar', role: 'CEO, Kumar Industries', text: 'ETaxwala transformed our business operations with expert financial guidance. From tax management to strategic planning, their team delivered beyond expectations.', rating: 5, avatar: 'RK', company: 'Kumar Industries' },
  { name: 'Priya Sharma', role: 'Founder, GreenLeaf Agro', text: 'Their consultancy helped us identify growth opportunities we never considered. Expert advice that made a real difference in our bottom line.', rating: 5, avatar: 'PS', company: 'GreenLeaf Agro' },
  { name: 'Mohammed Ansari', role: 'Director, Ansari Traders', text: 'We\'ve been with ETaxwala for over a year. The personalized service is exceptional. They helped us navigate complex financial decisions with ease.', rating: 5, avatar: 'MA', company: 'Ansari Traders' },
  { name: 'Sunita Patil', role: 'Owner, Patil FPC', text: 'The FPC training program was eye-opening. We went from just producing to running a profitable agri-business. Highly recommended!', rating: 5, avatar: 'SP', company: 'Patil FPC' },
  { name: 'Vikram Singh', role: 'MD, Singh Constructions', text: 'Got our Pvt Ltd registered in 15 days. The team handled everything — DSC, DIN, MoA, AoA, PAN, TAN. Truly hassle-free!', rating: 5, avatar: 'VS', company: 'Singh Constructions' },
  { name: 'Anjali Desai', role: 'Startup Founder', text: 'From company registration to funding consultancy to building our website — ETaxwala is our one-stop business partner.', rating: 5, avatar: 'AD', company: 'TechStart India' },
];

const trustBadges = [
  '10+ Years Experience', 'ISO Certified', 'CA-Led Services', 'Data Secure', '24/7 Support', '1L+ Satisfied Clients',
];

const faqs = [
  { q: 'How long does company registration take?', a: 'Private Limited Company registration typically takes 15-25 working days from document submission. We handle everything — DSC, DIN, name approval, MoA/AoA, and incorporation certificate.' },
  { q: 'Do you provide services across India?', a: 'Yes! With 120+ franchises across 28 states and 500+ cities, we serve clients pan-India. All services are online — you don\'t need to visit our office.' },
  { q: 'What makes ETaxwala different from other platforms?', a: 'We\'re your "Business Doctor" — we diagnose root causes, not just symptoms. Plus, we offer web & app development, marketing, and franchise opportunities that no other compliance platform provides.' },
  { q: 'Can I track my service status online?', a: 'Absolutely. Our client portal gives you real-time status updates, document tracking, direct chat with your assigned CA, and a complete work timeline for every service.' },
  { q: 'Do you offer web development and digital marketing?', a: 'Yes! Unlike other compliance platforms, ETaxwala offers full-stack business solutions including website development, mobile apps, SEO, social media marketing, branding, and influencer marketing.' },
  { q: 'How are your prices compared to competitors?', a: 'Our prices are transparent and all-inclusive. No hidden charges. We offer the same services as IndiaFilings/Vakilsearch at competitive rates, with the added benefit of personalized CA support.' },
  { q: 'What is your refund policy?', a: 'If a service hasn\'t been initiated and you request a refund within 7 working days, we process it. Once work starts, fees are non-refundable except in specific cases. See our Refund Policy page.' },
  { q: 'Can I become a franchise partner?', a: 'Yes! We have 120+ franchise partners across India. If you\'re a CA, consultant, or entrepreneur looking to offer business services in your city, contact us to become a partner.' },
];

const offices = [
  { name: 'Chhatrapati Sambhaji Nagar (Aurangabad)', address: '3rd Floor, Infront of Reliance Digital, Ashoka\'s Residency, Beed Bypass Rd, Deolai Parisar, Chhatrapati Sambhaji Nagar, Maharashtra 431001', phone: '+91 70710 70707', isHead: true },
  { name: 'Ambad Office, Jalna', address: '150, Jalna Road, beside Bhagwati Traders, Ambad, Maharashtra 431204', phone: '+91 70710 70707', isHead: false },
];

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export default function HomePage() {
  return (
    <>
      <SEO
        title="ETaxwala - Your Business Doctor"
        description="Diagnose. Strategize. Succeed. 250+ business services: company registration, ITR, GST, audit, compliance, web development, marketing. 1L+ customers, 120+ franchises, 98.9% success rate."
        keywords="business registration, company registration, ITR filing, GST, tax audit, LLP, private limited, MSME, FSSAI, trademark, web development, marketing, business consultancy"
        url="/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'ETaxwala Business Solutions Pvt Ltd',
          url: 'https://etaxwala.com',
          logo: 'https://etaxwala.com/public/img/logo_black.png',
          description: 'Your Business Doctor - Business registration, taxation, audit & compliance services in India',
          telephone: '+91-70710-70707',
          email: 'support@etaxwala.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '3rd Floor, Ashoka\'s Residency, Beed Bypass Rd, Deolai Parisar',
            addressLocality: 'Chhatrapati Sambhaji Nagar',
            addressRegion: 'Maharashtra',
            postalCode: '431001',
            addressCountry: 'IN',
          },
          foundingDate: '2014',
          areaServed: 'IN',
        }}
      />
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        {/* Glow */}
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="container-etaxwala relative z-10 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Stethoscope className="h-4 w-4 text-accent" />
                India's Trusted Business Doctor Platform
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-6xl">
                Diagnose. <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">Strategize.</span> Succeed.
              </h1>
              <p className="mt-6 text-lg text-white/80 lg:text-xl">
                From company registration to compliance, taxation, audit, web development, and
                growth strategy — we're your one-stop business partner trusted by 1 Lakh+ entrepreneurs.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/appointment" className="btn-accent group">
                  Book Free Consultation
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <a href="https://wa.me/917071070707" className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-accent hover:text-accent">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
                </a>
              </div>
              {/* Hero inline stats */}
              <div className="mt-10 grid grid-cols-4 gap-4">
                {heroStats.map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl font-bold text-accent">{s.v}</div>
                    <div className="text-xs text-white/60">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Dashboard mockup */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                      <Stethoscope className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-white">Business Health Check</span>
                  </div>
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">● Live</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Active Services', value: '1,245', icon: FileText, trend: '+12%' },
                    { label: 'In Progress', value: '89', icon: ClipboardCheck, trend: '+5%' },
                    { label: 'Completed', value: '98,765', icon: CheckCircle2, trend: '+8%' },
                    { label: 'Success Rate', value: '98.9%', icon: Award, trend: '+0.2%' },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="rounded-xl bg-white/5 p-4">
                        <Icon className="h-5 w-5 text-accent" />
                        <div className="mt-2 text-2xl font-bold text-white">{card.value}</div>
                        <div className="text-xs text-white/60">{card.label}</div>
                        <div className="mt-1 text-xs text-accent">{card.trend}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Monthly Revenue</span>
                    <span className="font-bold text-accent">₹12.4L</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-accent" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trust badges bar */}
        <div className="relative z-10 border-t border-white/10 bg-white/5 py-4 backdrop-blur">
          <div className="container-etaxwala">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center text-sm text-white/70">
              {trustBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80H1440V40C1320 20 1080 0 720 0C360 0 120 20 0 40V80Z" fill="white" />
        </svg>
      </section>

      {/* ═══ Quick Actions (Talk to Expert) ═══ */}
      <section className="bg-white py-12">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to="/appointment" className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-accent hover:shadow-lg">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${action.color} text-white transition group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{action.label}</div>
                    <div className="text-xs text-slate-500">{action.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="bg-slate-50 py-16">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {megaStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md">
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-bold text-primary lg:text-5xl">
                    {stat.value}<span className="text-accent">{stat.suffix}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ About ═══ */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">About ETaxwala</span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">
                Your Business Doctor —<br />Not Just Another Compliance Portal
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Running a business is complex. But just like your health, your business needs
                proper care and expert guidance. ETaxwala is your dedicated business doctor —
                we don't just treat symptoms; we diagnose the root cause and prescribe solutions
                that work.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                With 200+ expert Chartered Accountants, lawyers, and consultants, 120+ franchises
                across India, and 1 Lakh+ happy customers, we provide 250+ services — from
                company registration to audit, web development, and growth strategy.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, text: '100% Genuine Assistance' },
                  { icon: Rocket, text: 'Faster & Reliable Execution' },
                  { icon: Award, text: 'Accurate & Expert Advice' },
                  { icon: Globe, text: 'Pan-India Coverage' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <img src="https://etaxwala.com/public/img/ofc2.jpg" alt="ETaxwala Office" className="rounded-2xl shadow-2xl" />
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent"><Award className="h-6 w-6 text-white" /></div>
                  <div><p className="text-2xl font-bold text-primary">10+</p><p className="text-xs text-slate-600">Years Experience</p></div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="absolute -right-6 top-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary"><Users className="h-6 w-6 text-white" /></div>
                  <div><p className="text-2xl font-bold text-primary">1L+</p><p className="text-xs text-slate-600">Happy Clients</p></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Service Categories (IndiaFilings-style grid) ═══ */}
      <section className="section bg-slate-50">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">Our Services</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">250+ Services for Every Business Need</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From starting your business to scaling it globally — we've got you covered.
              Transparent pricing, expert execution, real-time tracking.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {cat.isUnique && (
                    <span className="absolute right-4 top-4 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Exclusive</span>
                  )}
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{cat.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{cat.count}</p>
                  <div className="mt-3 space-y-1">
                    {cat.items.slice(0, 4).map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> {item}
                      </div>
                    ))}
                    {cat.items.length > 4 && <p className="text-xs text-slate-400">+ {cat.items.length - 4} more</p>}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-xs text-slate-500">Starting from</span>
                      <p className="text-lg font-bold text-primary">₹{cat.startingPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <Link to="/services" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-accent group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link to="/services" className="btn-primary group">
              View All 250+ Services <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ How It Works (Diagnose → Strategize → Execute → Succeed) ═══ */}
      <section className="section bg-primary-700 text-white">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-accent">How It Works</span>
            <h2 className="mt-4 text-3xl font-bold lg:text-4xl">The Business Doctor Process</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">4 simple steps to transform your business — just like visiting a doctor.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div key={p.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <span className="text-4xl font-bold text-white/20">{p.step}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{p.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 z-10 -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-accent/50" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Why Choose Us ═══ */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">Why Choose Us</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">Why Businesses Trust ETaxwala</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="section bg-slate-50">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">Client Reviews</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">Loved by 1 Lakh+ Customers</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">Real stories from real businesses we've helped grow.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Franchise Network ═══ */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-800 p-12 text-white lg:p-16">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">Our Network</span>
                <h2 className="mt-4 text-3xl font-bold lg:text-4xl">120+ Franchises Across India</h2>
                <p className="mt-6 text-lg text-white/80">
                  ETaxwala has built a strong franchise network spanning across India. Our partners
                  bring expert business solutions to entrepreneurs in every corner of the country.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div><div className="text-3xl font-bold text-accent">120+</div><div className="text-sm text-white/60">Franchise Partners</div></div>
                  <div><div className="text-3xl font-bold text-accent">28</div><div className="text-sm text-white/60">States Covered</div></div>
                  <div><div className="text-3xl font-bold text-accent">500+</div><div className="text-sm text-white/60">Cities Served</div></div>
                </div>
                <Link to="/appointment" className="btn-accent mt-8">Become a Franchise Partner</Link>
              </div>
              <div className="relative">
                <div className="rounded-2xl bg-white/5 p-8 backdrop-blur">
                  <div className="grid grid-cols-3 gap-3">
                    {['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'UP', 'MP', 'Bihar', 'WB', 'Punjab', 'Haryana', 'Delhi'].map((state) => (
                      <div key={state} className="rounded-lg bg-white/10 px-3 py-2 text-center text-xs font-medium text-white/80">{state}</div>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-xs text-white/50">+ 16 more states across India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="section bg-slate-50">
        <div className="container-etaxwala max-w-4xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">FAQ</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-6 [&_summary]:cursor-pointer">
                <summary className="flex items-center justify-between text-sm font-semibold text-slate-900 list-none">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Offices ═══ */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">Our Offices</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">Visit Our Offices</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">Our doors are always open to help you achieve your business goals.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {offices.map((office) => (
              <div key={office.name} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
                {office.isHead && <span className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Head Office</span>}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{office.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{office.address}</p>
                    <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="mt-3 flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                      <Phone className="h-4 w-4" /> {office.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="relative overflow-hidden bg-accent py-20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 80% 20%, white 2px, transparent 2px)`, backgroundSize: '50px 50px' }} />
        <div className="container-etaxwala relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">Ready to Transform Your Business?</h2>
          <p className="mt-4 text-lg text-white/90">Join 1 Lakh+ happy customers. Get a free consultation with our experts today.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/appointment" className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-sm font-semibold text-accent shadow-lg transition hover:bg-slate-50">
              <Calendar className="mr-2 h-4 w-4" /> Book Appointment
            </Link>
            <a href="https://wa.me/917071070707" className="inline-flex items-center justify-center rounded-md border border-white/40 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}