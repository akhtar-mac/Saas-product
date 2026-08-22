import { Link } from 'react-router-dom';
import { CheckCircle2, Video, FileText, Award, Users } from 'lucide-react';

export default function FPCTrainingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 py-20 text-white">
        <div className="container-etaxwala">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase text-accent">FPC Business Training</span>
            <h1 className="mt-2 text-4xl font-bold lg:text-5xl">
              Farmer to Founder — FPC Business Training Program
            </h1>
            <p className="mt-6 text-lg text-white/80">
              Learn how to run, grow, and profit from your Farmer Producer Company. Live online
              training in Marathi.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-etaxwala max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">What You Get</h2>
              <div className="mt-6 space-y-3">
                {[
                  { icon: Video, text: '10-Day Live Training' },
                  { icon: FileText, text: 'All Videos & Recordings' },
                  { icon: CheckCircle2, text: 'Practical Worksheets' },
                  { icon: Award, text: 'Certificate of Completion' },
                  { icon: Users, text: 'Post-Training Support' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-accent" />
                      <span className="text-sm text-slate-700">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-lg border-2 border-accent p-6 text-center">
              <p className="text-sm text-slate-500">Special Offer (First 25 registrations)</p>
              <p className="mt-2 text-5xl font-bold text-primary">₹3,999</p>
              <p className="mt-1 text-sm text-slate-400 line-through">₹4,999</p>
              <Link to="/appointment" className="btn-accent mt-6 w-full">Register Now</Link>
              <p className="mt-4 text-xs text-slate-500">Live Online (Zoom) | Marathi</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}