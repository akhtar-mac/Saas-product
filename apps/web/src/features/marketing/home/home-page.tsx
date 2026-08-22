import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  Calculator,
  ClipboardCheck,
  Lightbulb,
  TrendingUp,
  Users,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Target,
  Eye,
  Rocket,
  Handshake,
  Briefcase,
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { value: '1', suffix: 'Lakh+', label: 'Happy Customers', icon: Users },
  { value: '200', suffix: '+', label: 'Team Members', icon: Briefcase },
  { value: '120', suffix: '+', label: 'Franchises in India', icon: Handshake },
  { value: '98.9', suffix: '%', label: 'Success Rate', icon: Award },
];

const heroSlides = [
  {
    title: 'Your Business Doctor is Here',
    subtitle: 'Diagnose. Strategize. Succeed.',
    description: 'Facing business challenges? Our experienced consultants analyze your problems and offer practical solutions to help you thrive.',
  },
  {
    title: 'Start Your Business with Simple Steps',
    subtitle: 'Turn Your Business Dream into Reality',
    description: 'From company registration to legal compliance, we make starting your business simple and stress-free.',
  },
  {
    title: 'All-in-One Business Solutions',
    subtitle: 'Start, Manage, and Grow with ETaxwala',
    description: 'Whether you\'re a startup, SME, or an established firm, we provide tailored solutions to meet your business goals.',
  },
];

const coreServices = [
  {
    icon: Lightbulb,
    title: 'Business Consultation & Planning',
    description: 'Expert consultation and strategic planning to help you grow, restructure, or enhance business efficiency.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Building2,
    title: 'Business Setup & Registration',
    description: 'From company incorporation to essential licenses, we handle all aspects of setting up your business.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Users,
    title: 'Team Building & Start-up Training',
    description: 'Build a strong, skilled team while offering start-up training programs for navigating business complexities.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Business Funding',
    description: 'Guidance through various funding options to fuel your business growth and expansion.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: ShieldCheck,
    title: 'Audit Taxation & Compliance',
    description: 'Stay compliant with tax regulations while optimizing your tax strategy to enhance financial efficiency.',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: Sparkles,
    title: 'Marketing & Branding',
    description: 'Strategic marketing and branding initiatives to enhance visibility and strengthen brand identity.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Rocket,
    title: 'Business Growth & Expansion',
    description: 'Identify growth opportunities, develop strategies, and execute expansion plans for your business.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Stethoscope,
    title: 'Start-up Support',
    description: 'From business plans to early-stage financial management, we provide essential tools for start-ups.',
    color: 'from-teal-500 to-teal-600',
  },
];

const whyChooseUs = [
  { icon: Target, title: 'Tailored Solutions', description: 'We understand that your business is unique. Our solutions are customized to fit your specific needs and challenges.' },
  { icon: Users, title: 'Experienced Professionals', description: 'Our team of 200+ Chartered Accountants and business consultants handle even the most complex business issues.' },
  { icon: Eye, title: 'Proactive Approach', description: 'We don\'t just react to problems — we anticipate them. Stay ahead with strategies that prepare you for tomorrow.' },
  { icon: Handshake, title: 'Client-Centric Focus', description: 'We build long-term relationships based on trust, transparency, and results. 1 Lakh+ happy customers and counting.' },
];

const testimonials = [
  { name: 'Rajesh Kumar', role: 'CEO, Kumar Industries', text: 'ETaxwala transformed our business operations with expert financial guidance. From tax management to strategic planning, their team delivered beyond expectations.', rating: 5, avatar: 'RK' },
  { name: 'Priya Sharma', role: 'Founder, GreenLeaf Agro', text: 'Their consultancy helped us identify growth opportunities we never considered. Expert advice that made a real difference in our bottom line.', rating: 5, avatar: 'PS' },
  { name: 'Mohammed Ansari', role: 'Director, Ansari Traders', text: 'We\'ve been with ETaxwala for over a year. The personalized service is exceptional. They helped us navigate complex financial decisions with ease.', rating: 5, avatar: 'MA' },
  { name: 'Sunita Patil', role: 'Owner, Patil FPC', text: 'The FPC training program was eye-opening. We went from just producing to actually running a profitable agri-business. Highly recommended!', rating: 5, avatar: 'SP' },
];

const offices = [
  {
    name: 'Chhatrapati Sambhaji Nagar (Aurangabad)',
    address: '3rd Floor, Infront of Reliance Digital, Ashoka\'s Residency, Beed Bypass Rd, Deolai Parisar, Chhatrapati Sambhaji Nagar, Maharashtra 431001',
    phone: '+91 70710 70707',
    isHead: true,
  },
  {
    name: 'Ambad Office, Jalna',
    address: '150, Jalna Road, beside Bhagwati Traders, Ambad, Maharashtra 431204',
    phone: '+91 70710 70707',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section with animated gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Glow effects */}
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="container-etaxwala relative z-10 py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Stethoscope className="h-4 w-4 text-accent" />
                Your Business Doctor
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-6xl">
                Diagnose. <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">Strategize.</span> Succeed.
              </h1>
              <p className="mt-6 text-lg text-white/80 lg:text-xl">
                Facing business challenges? Our experienced consultants analyze your problems and
                offer practical solutions to help your business thrive. From company registration
                to compliance, taxation, and growth strategy — we're your trusted partner.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/appointment" className="btn-accent group">
                  Book Free Appointment
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-accent hover:text-accent"
                >
                  Explore Services
                </Link>
              </div>
              {/* Mini stats inline */}
              <div className="mt-10 flex flex-wrap gap-8">
                {[
                  { v: '1L+', l: 'Customers' },
                  { v: '200+', l: 'Experts' },
                  { v: '120+', l: 'Franchises' },
                  { v: '98.9%', l: 'Success' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl font-bold text-accent">{s.v}</div>
                    <div className="text-xs text-white/60">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right visual - dashboard mockup card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                      <Stethoscope className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-white">Business Health Check</span>
                  </div>
                  <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">Live</span>
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
                    <span className="text-white/80">This Month Revenue</span>
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

        {/* Wave divider */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80H1440V40C1320 20 1080 0 720 0C360 0 120 20 0 40V80Z" fill="white" />
        </svg>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-16">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
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

      {/* About Section */}
      <section className="section bg-slate-50">
        <div className="container-etaxwala">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                About the company
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">
                Welcome to ETaxwala —<br />Your Business Doctor
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Running a business can be complex and overwhelming. But just like your health, your
                business needs proper care, attention, and expert guidance to thrive. That's where
                ETaxwala steps in — as your dedicated business doctor, we don't just treat the
                symptoms; we diagnose the root cause and prescribe solutions that work.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                With 200+ expert Chartered Accountants and business consultants, 120+ franchises
                across India, and 1 Lakh+ happy customers, we provide holistic solutions across
                business consultation, registration, audit, compliance, marketing, and branding.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, text: '100% Genuine Assistance' },
                  { icon: Rocket, text: 'Faster & Reliable Execution' },
                  { icon: Award, text: 'Accurate & Expert Advice' },
                  { icon: Clock, text: '24/7 Support Available' },
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
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="https://etaxwala.com/public/img/ofc2.jpg"
                  alt="ETaxwala Office"
                  className="rounded-2xl shadow-2xl"
                />
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">10+</p>
                    <p className="text-xs text-slate-600">Years Experience</p>
                  </div>
                </motion.div>
                {/* Floating badge 2 */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -right-6 top-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">1L+</p>
                    <p className="text-xs text-slate-600">Happy Clients</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
              Our Core Services
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">
              Driving Business Success
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              We specialize in empowering businesses to thrive with tailored solutions. From
              strategic consulting to operational optimization, our services help you navigate
              challenges and achieve sustainable growth.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Gradient hover bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 transition group-hover:opacity-5`} />
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                    Explore More <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link to="/services" className="btn-primary group">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative overflow-hidden bg-primary-700 py-20 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="container-etaxwala relative z-10">
          <div className="text-center">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-accent">
              Why Choose Us
            </span>
            <h2 className="mt-4 text-3xl font-bold lg:text-4xl">Why ETaxwala?</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-slate-50">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
              Client Reviews
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">What Our Clients Say</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Join 1 Lakh+ happy customers who trust ETaxwala with their business.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {t.avatar}
                  </div>
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

      {/* Franchise Network */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-800 p-12 text-white lg:p-16">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">
                  Our Network
                </span>
                <h2 className="mt-4 text-3xl font-bold lg:text-4xl">
                  120+ Franchises Across India
                </h2>
                <p className="mt-6 text-lg text-white/80">
                  ETaxwala has built a strong franchise network spanning across India. Our partners
                  bring our expert business solutions to entrepreneurs and businesses in every
                  corner of the country.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-accent">120+</div>
                    <div className="text-sm text-white/60">Franchise Partners</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent">28</div>
                    <div className="text-sm text-white/60">States Covered</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent">500+</div>
                    <div className="text-sm text-white/60">Cities Served</div>
                  </div>
                </div>
                <Link to="/appointment" className="btn-accent mt-8">
                  Become a Franchise Partner
                </Link>
              </div>
              <div className="relative">
                {/* India map illustration placeholder */}
                <div className="rounded-2xl bg-white/5 p-8 backdrop-blur">
                  <div className="grid grid-cols-3 gap-3">
                    {['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'UP', 'MP', 'Bihar', 'WB', 'Punjab', 'Haryana', 'Delhi'].map((state) => (
                      <div key={state} className="rounded-lg bg-white/10 px-3 py-2 text-center text-xs font-medium text-white/80">
                        {state}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-xs text-white/50">
                    + 16 more states across India
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="section bg-slate-50">
        <div className="container-etaxwala">
          <div className="text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
              Our Offices
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 lg:text-4xl">Explore Our Offices</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              We invite you to explore our offices and experience the ETaxwala difference firsthand.
              Our doors are always open to help you achieve your goals.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {offices.map((office) => (
              <div key={office.name} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
                {office.isHead && (
                  <span className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    Head Office
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{office.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{office.address}</p>
                    <a
                      href={`tel:${office.phone.replace(/\s/g, '')}`}
                      className="mt-3 flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    >
                      <Phone className="h-4 w-4" /> {office.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-accent py-20">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 80% 20%, white 2px, transparent 2px)`, backgroundSize: '50px 50px' }} />
        <div className="container-etaxwala relative z-10 text-center">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Join 1 Lakh+ happy customers. Book a free consultation with our experts today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/appointment"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-sm font-semibold text-accent shadow-lg transition hover:bg-slate-50"
            >
              Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/917071070707"
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}