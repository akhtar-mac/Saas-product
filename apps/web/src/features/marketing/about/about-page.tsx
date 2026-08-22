import { Target, Eye, Award, Users, Briefcase, Handshake, ShieldCheck, Rocket, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-800 py-20 text-white">
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="container-etaxwala relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-accent">
              About Us
            </span>
            <h1 className="mt-4 text-4xl font-bold lg:text-5xl">Your Business Doctor</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Diagnosing root causes and prescribing solutions that work — helping businesses across India thrive since 2014.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { v: '10+', l: 'Years Experience', icon: Award },
              { v: '1L+', l: 'Happy Customers', icon: Users },
              { v: '200+', l: 'Team Members', icon: Briefcase },
              { v: '120+', l: 'Franchises', icon: Handshake },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.l} className="text-center">
                  <Icon className="mx-auto mb-2 h-8 w-8 text-accent" />
                  <div className="text-3xl font-bold text-primary">{s.v}</div>
                  <div className="text-sm text-slate-600">{s.l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container-etaxwala max-w-4xl">
          <span className="text-sm font-semibold uppercase text-accent">Our Story</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">The ETaxwala Journey</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
            <p>
              ETaxwala Business Solutions Pvt Ltd was founded with a simple mission: to be the
              "business doctor" for entrepreneurs and companies across India. Just as a doctor
              diagnoses illness and prescribes treatment, we diagnose business problems and
              prescribe actionable solutions.
            </p>
            <p>
              Starting from a single office in Aurangabad, Maharashtra, we've grown into a nationwide
              network with 120+ franchises, 200+ team members, and over 1 Lakh satisfied customers.
              Our team of expert Chartered Accountants and business consultants provides 200+ services
              across business registration, taxation, audit, compliance, consultancy, and marketing.
            </p>
            <p>
              Whether you're a startup seeking guidance, an established company looking for growth, or
              in need of regulatory assistance, ETaxwala is your trusted partner for all your business
              needs. We don't just treat symptoms — we diagnose the root cause and prescribe solutions
              that help your business flourish.
            </p>
          </div>

          {/* Mission / Vision / Values */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, title: 'Our Mission', desc: 'Empowering every Indian business with expert guidance, maximum savings, and stress-free compliance services.' },
              { icon: Eye, title: 'Our Vision', desc: 'To be India\'s most trusted business solutions platform, making compliance accessible to every entrepreneur.' },
              { icon: ShieldCheck, title: 'Our Values', desc: 'Trust, transparency, expertise, and a genuine commitment to client success in everything we do.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-16">
        <div className="container-etaxwala text-center">
          <h2 className="text-3xl font-bold text-white">Partner with ETaxwala Today</h2>
          <p className="mt-4 text-white/90">Join 1 Lakh+ businesses that trust us with their growth.</p>
        </div>
      </section>
    </>
  );
}