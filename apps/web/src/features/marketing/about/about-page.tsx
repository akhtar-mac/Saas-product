import { Link } from 'react-router-dom';
import SEO from '@/components/seo';
import {
  Award, Users, Target, Globe, HeartHandshake,
  Building2, Briefcase, Calendar, ArrowRight,
  CheckCircle2, Star, ShieldCheck, Lightbulb,
} from 'lucide-react';

const milestones = [
  { year: '2014', title: 'Founded in Aurangabad', desc: 'Started as a small CA consultancy with 2 experts and a big vision.' },
  { year: '2016', title: 'Crossed 1,000 clients',  desc: 'Expanded into GST, company registration, and trademark services.' },
  { year: '2018', title: '50+ Expert Team',         desc: 'Added digital marketing, web development, and HR services.' },
  { year: '2020', title: 'Franchise Model Launched',desc: 'Opened our franchise model — now 120+ centers across India.' },
  { year: '2022', title: 'FPC Training Division',   desc: 'Launched FPC & PACS consultancy — transforming India\'s agriculture.' },
  { year: '2024', title: '1 Lakh+ Happy Clients',   desc: 'Serving 1L+ businesses across 28 states with 250+ services.' },
];

const team = [
  { name: 'CA Ravan',       role: 'Founder & CEO',             initials: 'CR', expertise: 'Taxation & Business Strategy' },
  { name: 'Adv. Priya',     role: 'Head of Legal Services',    initials: 'AP', expertise: 'Corporate & IP Law' },
  { name: 'CS Rahul',       role: 'Company Secretary',          initials: 'CR', expertise: 'MCA, ROC & Compliance' },
  { name: 'CA Meena',       role: 'Senior Tax Consultant',      initials: 'CM', expertise: 'Direct & Indirect Taxation' },
  { name: 'Vijay',          role: 'Head of Digital Services',   initials: 'VK', expertise: 'Web, App & Digital Marketing' },
  { name: 'Sunita',         role: 'Head of FPC Division',       initials: 'SK', expertise: 'Agriculture & PACS' },
];

const values = [
  { icon: ShieldCheck,    title: 'Integrity',        desc: 'Transparent pricing, honest advice, no hidden charges — always.' },
  { icon: Target,         title: 'Precision',        desc: 'Every filing, document, and deadline handled with meticulous accuracy.' },
  { icon: HeartHandshake, title: 'Partnership',      desc: 'We succeed when you succeed — long-term relationships over transactions.' },
  { icon: Lightbulb,      title: 'Innovation',       desc: 'Tech-first approach to compliance — real-time tracking, digital documents.' },
  { icon: Globe,          title: 'Accessibility',    desc: 'Premium CA services at accessible prices for every business size.' },
  { icon: Users,          title: 'People First',     desc: '200+ expert team members who care deeply about client outcomes.' },
];

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About ETaxwala | Your Business Doctor Since 2014"
        description="ETaxwala is India's trusted platform for business registration, taxation, compliance and digital services. 1L+ clients, 200+ experts, 120+ franchise centers."
        url="/about"
      />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'var(--navy)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container-etaxwala relative text-center text-white">
          <p className="section-tag mx-auto" style={{ color: 'var(--gold-light)' }}>About ETaxwala</p>
          <h1 className="section-title text-white mb-4">India's Business Doctor Since 2014</h1>
          <p className="section-subtitle mx-auto text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
            From a 2-person CA firm in Aurangabad to India's fastest-growing multi-service business platform —
            serving 1 Lakh+ businesses across 28 states.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ─── Stats ─── */}
      <section className="section-white">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { v: '10+',   l: 'Years of Excellence' },
              { v: '1L+',   l: 'Happy Clients'        },
              { v: '200+',  l: 'Expert Professionals' },
              { v: '120+',  l: 'Franchise Centers'    },
            ].map(s => (
              <div key={s.l} className="card-offwhite text-center p-8">
                <p className="stat-value text-4xl mb-2">{s.v}</p>
                <p className="stat-label">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Split: Story ─── */}
      <section className="split-section section-border">
        <div className="split-image" style={{ minHeight: 420 }}>
          <img
            src="/ofc2.jpg"
            alt="ETaxwala Office"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = 'linear-gradient(135deg,#003A66,#004d87)'; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div className="split-content">
          <p className="section-tag">Our Story</p>
          <h2 className="section-title mb-4">We Started as a Business, Just Like Yours</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            ETaxwala was born in 2014 from a simple frustration — why should quality CA and legal services only be available to large corporations? Why can't small businesses get the same expert guidance?
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Our founder, CA Ravan, built ETaxwala to be India's <strong className="text-slate-700">Business Doctor</strong> — diagnosing problems at the root, not just treating symptoms. Today we serve 1 Lakh+ businesses across India with 250+ services under one roof.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['Pan-India Online Services', 'CA-Led Every Service', 'Real-time Client Portal', '98.9% Success Rate'].map(i => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--gold)' }} />
                {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Our Values ─── */}
      <section className="section-off section-border">
        <div className="container-etaxwala">
          <div className="text-center mb-12">
            <p className="section-tag mx-auto">Our Values</p>
            <h2 className="section-title">What Drives Us Every Day</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(212,157,14,0.1)' }}>
                  <Icon className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                </div>
                <h3 className="font-poppins font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="section-white section-border">
        <div className="container-etaxwala">
          <div className="text-center mb-12">
            <p className="section-tag mx-auto">Our Journey</p>
            <h2 className="section-title">A Decade of Growth</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-16 top-0 bottom-0 w-0.5" style={{ background: 'var(--border)' }} />
            <div className="space-y-8">
              {milestones.map((m, idx) => (
                <div key={m.year} className="flex items-start gap-8">
                  <div className="w-14 shrink-0 text-right">
                    <span className="font-poppins font-bold text-sm" style={{ color: 'var(--gold-dark)' }}>{m.year}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 border-white" style={{ background: idx === milestones.length - 1 ? 'var(--gold)' : 'var(--navy)' }} />
                  </div>
                  <div className="card-flat p-5 flex-1">
                    <h3 className="font-poppins font-semibold text-slate-800 mb-1">{m.title}</h3>
                    <p className="text-sm text-slate-500">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Team ─── */}
      <section className="section-off section-border">
        <div className="container-etaxwala">
          <div className="text-center mb-12">
            <p className="section-tag mx-auto">Our Team</p>
            <h2 className="section-title">200+ Experts in Your Corner</h2>
            <p className="section-subtitle mx-auto text-center">
              Chartered Accountants, Lawyers, Company Secretaries and Business Advisors working together for your success.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {team.map(t => (
              <div key={t.name} className="card p-6 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-poppins font-bold text-lg" style={{ background: 'var(--navy)' }}>
                  {t.initials}
                </div>
                <h3 className="font-poppins font-semibold text-slate-800">{t.name}</h3>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--gold-dark)' }}>{t.role}</p>
                <p className="text-xs text-slate-400">{t.expertise}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-navy">
        <div className="container-etaxwala text-center">
          <h2 className="section-title text-white mb-4">Ready to Work with India's Best?</h2>
          <p className="section-subtitle mx-auto text-center mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Book a free consultation and discover how ETaxwala can transform your business compliance experience.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/appointment" className="btn btn-gold btn-lg">Book Free Consultation <ArrowRight className="h-5 w-5" /></Link>
            <Link to="/services" className="btn btn-outline-white btn-lg">Explore Services</Link>
          </div>
        </div>
      </section>
    </>
  );
}