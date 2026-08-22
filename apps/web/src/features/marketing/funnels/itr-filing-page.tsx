import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck, FileText, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ITRFilingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 py-20 text-white">
        <div className="container-etaxwala">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase text-accent">ETaxwala ITR Filing</span>
            <h1 className="mt-2 text-4xl font-bold lg:text-5xl">
              File Your Income Tax Return with India's Trusted Tax Platform
            </h1>
            <p className="mt-6 text-lg text-white/80">
              Not just a tax filing portal — we're Your Business Doctor for all tax compliance needs.
              Every return is double-checked by a licensed CA.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/appointment" className="btn-accent">Get Started</Link>
              <a href="tel:+917071070707" className="btn-outline border-white/30 text-white">Call Expert</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-etaxwala">
          <h2 className="section-title text-center">Why Choose ETaxwala for ITR?</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'CA Excellence', desc: 'Every return reviewed and signed by a licensed CA — no shortcuts.' },
              { icon: Calculator, title: 'Maximum Refund', desc: 'Proprietary checklists covering 80+ deductions ensure you never leave money on the table.' },
              { icon: FileText, title: 'Transparent Pricing', desc: 'Flat fee pricing with no hidden add-ons. Webinar attendees get 10% discount.' },
              { icon: TrendingUp, title: 'Zero Stress', desc: 'Clear communication, on-time reminders, and instant support via chat, phone, or community.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card p-6">
                  <Icon className="h-8 w-8 text-accent" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-etaxwala">
          <h2 className="section-title text-center">ITR Pricing Plans</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { type: 'Salary Income', price: 499, features: ['Income from Salary', 'All Inclusive'] },
              { type: 'Business & Professional', price: 1999, features: ['Business Income (Non-Audit)', 'Other Sources Income', 'Agriculture Income', 'Salary Income', 'Rental Income'] },
              { type: 'Capital Gains', price: 2999, features: ['Capital Gain Income', 'Business Income', 'Other Sources', 'Agriculture + Salary + Rental'] },
            ].map((plan) => (
              <div key={plan.type} className="card p-8 text-center">
                <h3 className="text-lg font-semibold">{plan.type}</h3>
                <p className="mt-4 text-4xl font-bold text-primary">₹{plan.price}</p>
                <div className="mt-6 space-y-2 text-left">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-accent" /> {f}
                    </div>
                  ))}
                </div>
                <Link to="/appointment" className="btn-primary mt-6 w-full">File Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}