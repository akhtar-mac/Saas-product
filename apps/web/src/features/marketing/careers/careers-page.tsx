import { Briefcase, MapPin, Clock, ArrowRight, TrendingUp, Users, GraduationCap, Heart } from 'lucide-react';
import SEO from '@/components/seo';

const jobOpenings = [
  { title: 'Chartered Accountant', type: 'Full-Time', location: 'Aurangabad, MH', dept: 'Audit & Tax' },
  { title: 'Sales Executive', type: 'Full-Time', location: 'Multiple Cities', dept: 'Sales' },
  { title: 'Business Consultant', type: 'Full-Time', location: 'Aurangabad, MH', dept: 'Consultancy' },
  { title: 'Web Developer (React)', type: 'Full-Time', location: 'Remote / Aurangabad', dept: 'Technology' },
  { title: 'Marketing Executive', type: 'Full-Time', location: 'Aurangabad, MH', dept: 'Marketing' },
  { title: 'Operations Executive', type: 'Full-Time', location: 'Aurangabad, MH', dept: 'Operations' },
];

const whyJoin = [
  { icon: TrendingUp, title: 'Professional Growth', desc: 'Continuous learning and career advancement opportunities' },
  { icon: Users, title: 'Collaborative Team', desc: 'Work with 200+ experts across India' },
  { icon: GraduationCap, title: 'Learning Programs', desc: 'Regular training on latest tax laws and business practices' },
  { icon: Heart, title: 'Flexible Environment', desc: 'Supportive, flexible work culture' },
];

export default function CareersPage() {
  return (
    <>
      <SEO title="Careers - Join ETaxwala" description="Join ETaxwala - 200+ team members, 120+ franchises. We're hiring CAs, sales, consultants, developers, and more. Grow your career with India's trusted business doctor." url="/careers" />
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-800 py-20 text-white">
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="container-etaxwala relative z-10">
          <h1 className="text-4xl font-bold lg:text-5xl">We're Hiring Talented Professionals</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            At ETaxwala, we empower individuals and foster innovation. Be part of something impactful.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-12">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {whyJoin.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                    <Icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-etaxwala max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900">Open Positions</h2>
          <p className="mt-2 text-sm text-slate-600">We review all applications and will contact shortlisted candidates within 7 working days.</p>
          <div className="mt-8 space-y-4">
            {jobOpenings.map((job) => (
              <div key={job.title} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-accent hover:shadow-md">
                <div>
                  <h3 className="font-semibold text-slate-900">{job.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.type}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.dept}</span>
                  </div>
                </div>
                <a href="mailto:support@etaxwala.com" className="btn-primary text-sm">
                  Apply <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}