import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code, LayoutDashboard, Smartphone, Layers, ArrowRight,
  CheckCircle2, Sparkles, Server, Shield, Zap, Laptop,
  Database, GitBranch, Terminal, MessageCircle, Phone,
  Check, Star, Cpu, Lock
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import { cn } from '@/lib/utils';

const capabilities = [
  {
    id: 'web-apps',
    icon: Code,
    title: 'Custom Web Applications & SaaS',
    subtitle: 'High-speed, scalable web applications built for heavy transactional loads.',
    description:
      'We architect modern web applications with responsive design, secure authentication, role-based permissions, and lightning-fast APIs. Whether you are launching a new SaaS startup or digitizing legacy operations.',
    features: [
      'Modern Stack: React, Next.js, TypeScript & TailwindCSS',
      'Scalable Backends: Node.js, Python, PostgreSQL, Redis',
      'Enterprise Auth (JWT, OAuth2, SAML, Multi-Factor Auth)',
      'Automated CI/CD Pipelines & Cloudflare / AWS Deployment',
      'RESTful & GraphQL API Architecture',
    ],
    badge: 'Full-Stack',
  },
  {
    id: 'dashboards',
    icon: LayoutDashboard,
    title: 'Enterprise Business Dashboards & CRM',
    subtitle: 'Real-time telemetry, KPI monitoring, and unified operations consoles.',
    description:
      'Turn scattered data into actionable intelligence. We design interactive dashboards that connect directly to your databases, accounting records, and payment gateways with live charting and export tools.',
    features: [
      'Role-Based Executive & Staff Portals',
      'Live Revenue, Order & Ticket Telemetry',
      'Advanced Data Tables with Filtering, Sorting & Excel Export',
      'Multi-tenant Tenant Isolation & Organization Management',
      'Automated PDF Report Generation & Email Dispatch',
    ],
    badge: 'Analytics & BI',
  },
  {
    id: 'mobile-apps',
    icon: Smartphone,
    title: 'iOS & Android Mobile App Development',
    subtitle: 'Fluid cross-platform mobile apps published directly to App Store & Google Play.',
    description:
      'Deliver seamless mobile experiences to your customers and field agents. We build cross-platform native-performance mobile applications using React Native and Flutter with offline sync capabilities.',
    features: [
      'Single Codebase for iOS & Android with Native Performance',
      'Push Notifications (FCM / OneSignal) & In-App Messaging',
      'Biometric Login (FaceID / Fingerprint) & Offline SQLite Cache',
      'Deep Linking, QR Code Scanning & Camera Capture',
      'Full App Store & Play Store Publishing Management',
    ],
    badge: 'Mobile First',
  },
  {
    id: 'invoicing-tools',
    icon: Layers,
    title: 'Fintech, Invoicing & GST Automation',
    subtitle: 'Automated billing engines, GST reconciliation, and banking API integrations.',
    description:
      'Bridge the gap between accounting and engineering. We build automated billing systems that handle recurrent subscriptions, GST tax calculation, automated E-Way bill generation, and bank payout reconciliation.',
    features: [
      'Automated GST E-Invoice & E-Way Bill Generation',
      'Corporate Banking & UPI Payment Workflows (Direct Bank APIs, Dynamic QR, Multi-Bank Reconciliations)',
      'Automated Bank Statement Parsing & Reconciliation',
      'Recurring Subscription & Dunning Management',
      'Government Portal & Sandbox API Connectors',
    ],
    badge: 'Fintech Engine',
  },
];

const techStack = [
  { category: 'Frontend & UI', items: ['React 18', 'Next.js', 'TypeScript', 'TailwindCSS', 'Vite', 'Shadcn UI'] },
  { category: 'Backend & APIs', items: ['Node.js', 'Express', 'Python FastAPI', 'Go', 'GraphQL', 'REST APIs'] },
  { category: 'Database & Cache', items: ['PostgreSQL', 'Prisma ORM', 'Redis', 'MongoDB', 'Supabase'] },
  { category: 'Cloud & DevOps', items: ['AWS', 'Cloudflare Workers', 'Docker', 'GitHub Actions', 'Vercel'] },
];

export default function SoftwareSolutionsPage() {
  const [projectType, setProjectType] = useState('Custom Web Application');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [scope, setScope] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <>
      <SEO
        title="Custom Software, Web Apps & Dashboards — ETaxwala Tech"
        description="E-Taxwala engineers bespoke software, mobile apps, enterprise dashboards, and fintech billing systems for growing businesses across India."
        keywords="custom software development, web app developers India, enterprise dashboard, mobile app development, fintech software, ETaxwala tech"
        url="/software-solutions"
      />

      {/* ── Breadcrumb & Top Accent ── */}
      <div className="bg-[#FAF9F5] border-b border-[#EAE6DD] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Software & Tech Solutions' },
            ]}
            className="text-xs text-slate-500"
          />
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative bg-[#FFFDF9] py-16 sm:py-24 border-b border-[#EAE6DD] overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
              <Code className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Digital Engineering &amp; Software Solutions</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              We Build Scalable Software, Web Apps &amp; Enterprise Dashboards
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Beyond tax and legal compliance, E-Taxwala is your full-cycle technology partner. We engineer high-conversion web platforms, iOS &amp; Android mobile applications, internal admin consoles, and automated fintech billing systems.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#project-consultation"
                className="px-6 py-3.5 rounded-xl btn-multicolor font-bold text-xs shadow-md flex items-center gap-2"
              >
                <span>Request Project Architecture Call</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#capabilities"
                className="px-6 py-3.5 rounded-xl bg-white border border-[#EAE6DD] hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Explore Solutions</span>
              </a>
            </div>

            {/* Key trust badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#EAE6DD]">
              <div>
                <p className="text-xl font-extrabold text-slate-900">50+ Apps</p>
                <p className="text-xs text-slate-500">Delivered on Time</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">99.9% SLA</p>
                <p className="text-xs text-slate-500">High Availability</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">100% IP Ownership</p>
                <p className="text-xs text-slate-500">Full Code Rights</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">2-Week Sprints</p>
                <p className="text-xs text-slate-500">Agile Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Capabilities Grid ── */}
      <section id="capabilities" className="py-20 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C3AED] px-3 py-1 bg-white border border-[#EAE6DD] rounded-full">
              Full-Cycle Engineering
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Our Core Software Engineering Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              From conception to production deployment, we build robust software that drives real revenue.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.id}
                  id={cap.id}
                  className="bg-white rounded-3xl p-7 sm:p-8 border border-[#EAE6DD] shadow-card hover:border-[#7C3AED] transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#FAF9F5] text-[#7C3AED] border border-[#EAE6DD]">
                        {cap.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-slate-900">{cap.title}</h3>
                      <p className="text-xs font-bold text-[#0084D1]">{cap.subtitle}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {cap.description}
                    </p>

                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Technical Highlights</p>
                      {cap.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EAE6DD]">
                    <a
                      href="#project-consultation"
                      onClick={() => setProjectType(cap.title)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF9F5] hover:bg-slate-100 text-slate-900 border border-[#EAE6DD] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Get Architecture Proposal for {cap.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Modern Technology Stack ── */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0084D1] px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
              Enterprise Grade
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Modern, High-Performance Technology Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We never use slow, bloated templates. We build modern, modular, production-tested software.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack) => (
              <div
                key={stack.category}
                className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EAE6DD] space-y-4"
              >
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-[#EAE6DD] pb-2">
                  {stack.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {stack.items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 bg-white border border-[#EAE6DD] rounded-lg text-xs font-semibold text-slate-700 shadow-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Project Architecture & Consultation Form ── */}
      <section id="project-consultation" className="py-20 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#7C3AED]/20 shadow-2xl space-y-8 relative">
            <div className="text-center space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7C3AED] px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                Get a Direct Technical Estimate
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Let's Architect Your Next Web App or Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Share your requirements. Our Principal Solutions Architect will review your scope and provide a feasibility breakdown within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h3 className="text-xl font-extrabold text-emerald-900">Project Brief Received!</h3>
                <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>. Our technical engineering lead will reach out to you at <strong>{phone}</strong> / <strong>{email}</strong> to discuss wireframes and milestones.
                </p>
                <a
                  href={`https://wa.me/918069029999?text=Hi%20ETaxwala%20Tech%2C%20I%20just%20submitted%20a%20project%20inquiry%20for%20${encodeURIComponent(projectType)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect Instantly on WhatsApp</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">What do you want to build?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      'Custom Web Application',
                      'Enterprise Dashboard',
                      'Mobile App (iOS/Android)',
                      'Fintech / Invoicing Software',
                    ].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setProjectType(type)}
                        className={cn(
                          'p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer',
                          projectType === type
                            ? 'border-[#7C3AED] bg-purple-50/70 text-[#7C3AED] shadow-xs'
                            : 'border-[#EAE6DD] bg-[#FAF9F5] text-slate-600 hover:bg-white'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anand Verma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] bg-[#FAF9F5]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] bg-[#FAF9F5]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anand@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] bg-[#FAF9F5]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Brief Scope or Target Functionality</label>
                  <textarea
                    rows={3}
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="Tell us about the users, core features, or platforms you're integrating with..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] bg-[#FAF9F5]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl btn-multicolor font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Processing Architecture Scope...</span>
                  ) : (
                    <>
                      <span>Submit Project Details &amp; Request Free Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> NDA &amp; Code Ownership Guaranteed
                  </span>
                  <span>Direct Desk: 080-6902-9999</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
