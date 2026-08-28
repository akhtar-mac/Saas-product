import { Link } from 'react-router-dom';
import SEO from '@/components/seo';
import {
  Award, Users, Target, Globe, HeartHandshake,
  Building2, Briefcase, Calendar, ArrowRight,
  CheckCircle2, Star, ShieldCheck, Lightbulb, Sparkles,
  TrendingUp, MapPin, Clock,
} from 'lucide-react';

const milestones = [
  { year: '2014', title: 'Founded in Aurangabad', desc: 'Started as a small CA consultancy with 2 experts and a big vision.' },
  { year: '2016', title: 'Crossed 1,000 Clients',  desc: 'Expanded into GST, company registration, and trademark services.' },
  { year: '2018', title: '50+ Expert Team',         desc: 'Added digital marketing, web development, and HR services.' },
  { year: '2020', title: 'Franchise Model Launched',desc: 'Opened our franchise model — now 120+ centers across India.' },
  { year: '2022', title: 'FPC Training Division',   desc: 'Launched FPC & PACS consultancy — transforming India\'s agriculture.' },
  { year: '2024', title: '1 Lakh+ Happy Clients',   desc: 'Serving 1L+ businesses across 28 states with 250+ services.' },
];

const team = [
  { name: 'CA Ravan',    role: 'Founder & CEO',          expertise: 'Taxation & Business Strategy',    color: '#003A66' },
  { name: 'Adv. Priya',  role: 'Head of Legal Services',  expertise: 'Corporate & IP Law',              color: '#7C3AED' },
  { name: 'CS Rahul',    role: 'Company Secretary',        expertise: 'MCA, ROC & Compliance',           color: '#0084D1' },
  { name: 'CA Meena',    role: 'Senior Tax Consultant',    expertise: 'Direct & Indirect Taxation',      color: '#E11D48' },
  { name: 'Vijay',       role: 'Head of Digital Services', expertise: 'Web, App & Digital Marketing',   color: '#F97316' },
  { name: 'Sunita',      role: 'Head of FPC Division',     expertise: 'Agriculture & PACS',              color: '#059669' },
];

const values = [
  { icon: ShieldCheck,    title: 'Integrity',        desc: 'Transparent pricing, honest advice, no hidden charges — always.', color: '#0084D1' },
  { icon: Target,         title: 'Precision',        desc: 'Every filing, document, and deadline handled with meticulous accuracy.', color: '#7C3AED' },
  { icon: HeartHandshake, title: 'Partnership',      desc: 'We succeed when you succeed — long-term relationships over transactions.', color: '#E11D48' },
  { icon: Lightbulb,      title: 'Innovation',       desc: 'Tech-first approach to compliance — real-time tracking, digital documents.', color: '#F97316' },
  { icon: Globe,          title: 'Accessibility',    desc: 'Premium CA services at accessible prices for every business size.', color: '#059669' },
  { icon: Users,          title: 'People First',     desc: '200+ expert team members who care deeply about client outcomes.', color: '#003A66' },
];

const stats = [
  { v: '10+',  l: 'Years of Excellence',  icon: Calendar },
  { v: '1L+',  l: 'Happy Clients',        icon: Users },
  { v: '200+', l: 'Expert Professionals', icon: Award },
  { v: '120+', l: 'Franchise Centers',    icon: MapPin },
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
      <section className="relative pt-28 pb-16 bg-gradient-to-b from-[#FAF9F5] to-white border-b border-[#EAE6DD] overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)', backgroundSize: '50px 50px' }}
        />
        {/* Multicolour accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />

        <div className="container-etaxwala relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-[#7C3AED] mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              India's Business Doctor Since 2014
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
              We are <span className="text-multicolor">ETaxwala</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              From a 2-person CA firm in Aurangabad to India's fastest-growing multi-service business platform —
              serving 1 Lakh+ businesses across 28 states.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/appointment" className="px-5 py-3 rounded-xl btn-multicolor font-bold text-sm flex items-center gap-2 shadow-xs">
                Book Free Consultation <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/services" className="px-5 py-3 rounded-xl border border-[#EAE6DD] bg-white font-bold text-sm text-slate-700 hover:bg-[#FAF9F5] transition-colors">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Team Photo Banner ─── */}
      <section className="bg-[#FAF9F5] py-12 border-b border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/about_team.jpg"
              alt="ETaxwala Expert Team"
              className="w-full h-auto object-cover"
              style={{ maxHeight: 420 }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-14 bg-white border-b border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map(({ v, l, icon: Icon }) => (
              <div key={l} className="p-7 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] text-center hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-multicolor flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mb-1">{v}</p>
                <p className="text-xs text-slate-500 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Story Split ─── */}
      <section className="py-16 border-b border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-xs font-bold text-[#7C3AED]">
                Our Story
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                We Started as a Business,<br />Just Like Yours
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                ETaxwala was born in 2014 from a simple frustration — why should quality CA and legal services only be available to large corporations? Why can't small businesses get the same expert guidance?
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our founder, <strong className="text-slate-700">CA Ravan</strong>, built ETaxwala to be India's Business Doctor — diagnosing problems at the root, not just treating symptoms. Today we serve 1 Lakh+ businesses across India with 250+ services under one roof.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {['Pan-India Online Services', 'CA-Led Every Service', 'Real-time Client Portal', '98.9% Success Rate'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-multicolor flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Image / Office */}
            <div className="rounded-3xl overflow-hidden shadow-xl bg-[#FAF9F5] min-h-[320px] relative border border-[#EAE6DD]">
              <img
                src="/ofc2.jpg"
                alt="ETaxwala Office"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Overlay stats */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold">2014</p>
                    <p className="text-xs opacity-80">Founded</p>
                  </div>
                  <div className="w-px h-10 bg-white/30" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold">Aurangabad</p>
                    <p className="text-xs opacity-80">Headquarters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Our Values ─── */}
      <section className="py-16 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-[#7C3AED] mb-4">
              <TrendingUp className="w-3.5 h-3.5" /> Our Values
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">What Drives Us Every Day</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#EAE6DD] hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section className="py-16 bg-white border-b border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-xs font-bold text-[#7C3AED] mb-4">
              <Clock className="w-3.5 h-3.5" /> Our Journey
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">A Decade of Growth</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-[#EAE6DD]" />
            <div className="space-y-8">
              {milestones.map((m, idx) => (
                <div key={m.year} className="flex items-start gap-8">
                  <div className="w-14 shrink-0 text-right">
                    <span className="font-extrabold text-sm text-[#7C3AED]">{m.year}</span>
                  </div>
                  <div className="relative">
                    <div
                      className="absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 border-white shadow"
                      style={{ background: idx === milestones.length - 1 ? '#7C3AED' : '#003A66' }}
                    />
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] flex-1 hover:shadow-sm transition-shadow">
                    <h3 className="font-bold text-slate-800 mb-1">{m.title}</h3>
                    <p className="text-sm text-slate-500">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Team ─── */}
      <section className="py-16 bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="container-etaxwala">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-[#7C3AED] mb-4">
              <Users className="w-3.5 h-3.5" /> Our Team
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">200+ Experts in Your Corner</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
              Chartered Accountants, Lawyers, Company Secretaries and Business Advisors working together for your success.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {team.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-[#EAE6DD] hover:shadow-md transition-all flex items-center gap-4 group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shrink-0"
                  style={{ background: t.color }}
                >
                  {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-[#003A66] transition-colors">{t.name}</h3>
                  <p className="text-xs font-bold mt-0.5" style={{ color: t.color }}>{t.role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.expertise}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-white">
        <div className="container-etaxwala">
          <div className="rounded-3xl bg-multicolor p-10 sm:p-14 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                Ready to Work with India's Best?
              </h2>
              <p className="text-sm sm:text-base opacity-90 max-w-xl mx-auto mb-8 leading-relaxed">
                Book a free consultation and discover how ETaxwala can transform your business compliance experience.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/appointment"
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-[#FAF9F5] transition-colors flex items-center gap-2 shadow-md"
                >
                  Book Free Consultation <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/services"
                  className="px-6 py-3.5 rounded-xl border border-white/40 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}