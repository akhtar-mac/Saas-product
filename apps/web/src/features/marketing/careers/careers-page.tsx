import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  ArrowRight,
  TrendingUp,
  Users,
  GraduationCap,
  Heart,
  CheckCircle2,
  UploadCloud,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import { API_BASE_URL } from '@/lib/api-base';

const defaultJobOpenings = [
  {
    id: 'ca-audit',
    title: 'Chartered Accountant (Audit & Direct Tax)',
    type: 'Full-Time',
    location: 'Aurangabad, MH / Hybrid',
    dept: 'Audit & Tax',
    exp: '2-5 Years',
  },
  {
    id: 'sales-exec',
    title: 'Senior Corporate Sales Executive',
    type: 'Full-Time',
    location: 'Multiple Cities (Pan-India)',
    dept: 'Sales',
    exp: '1-3 Years',
  },
  {
    id: 'cs-legal',
    title: 'Company Secretary & Legal Compliance Officer',
    type: 'Full-Time',
    location: 'Aurangabad, MH',
    dept: 'Legal & ROC',
    exp: '2-4 Years',
  },
  {
    id: 'react-dev',
    title: 'Full Stack React & Node.js Developer',
    type: 'Full-Time',
    location: 'Remote / Hybrid',
    dept: 'Technology',
    exp: '2-4 Years',
  },
  {
    id: 'mkt-growth',
    title: 'Digital Growth & Performance Marketer',
    type: 'Full-Time',
    location: 'Aurangabad, MH / Remote',
    dept: 'Marketing',
    exp: '1-3 Years',
  },
  {
    id: 'ops-exec',
    title: 'Operations & Workflow Coordinator',
    type: 'Full-Time',
    location: 'Aurangabad, MH',
    dept: 'Operations',
    exp: '1-2 Years',
  },
];

const whyJoin = [
  {
    icon: TrendingUp,
    title: 'High-Impact Work',
    desc: 'Shape the corporate compliance backbone for 1,00,000+ Indian businesses and startups.',
  },
  {
    icon: Users,
    title: '200+ Expert Network',
    desc: 'Collaborate daily with top Chartered Accountants, CSs, and corporate advocates.',
  },
  {
    icon: GraduationCap,
    title: 'Continuous Upskilling',
    desc: 'Regular masterclasses on changes in GST, MCA V3, and modern tech tooling.',
  },
  {
    icon: Heart,
    title: 'Growth & Meritocracy',
    desc: 'Transparent incentives, fast promotions, and a healthy work-life balance.',
  },
];

const schema = z.object({
  name: z.string().min(1, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, '10-digit phone number required'),
  role: z.string().min(1, 'Please select a position'),
  experience: z.string().min(1, 'Select your experience level'),
  linkedin: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const API_BASE = API_BASE_URL;

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>(defaultJobOpenings);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      try {
        const res = await fetch(`${API_BASE}/v1/careers/jobs`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          if (isMounted) setJobs(json.data);
        }
      } catch (err) {
        console.error('Failed to load live jobs:', err);
      }
    }
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleOpenApply = (jobTitle: string) => {
    setValue('role', jobTitle);
    setSelectedJob(jobTitle);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('role', data.role);
      formData.append('experience', data.experience);
      if (data.linkedin) formData.append('linkedin', data.linkedin);
      if (data.message) formData.append('message', data.message);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await fetch(`${API_BASE}/v1/careers/apply`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          reset();
          setStatus('idle');
          setIsModalOpen(false);
          setFileName('');
          setResumeFile(null);
        }, 2200);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <SEO
        title="Careers at ETaxwala — Join India's Leading Tax & Compliance Team"
        description="Build your career at ETaxwala. 200+ team members, 120+ legal hubs. Hiring Chartered Accountants, Sales, Software Engineers, and Operations managers."
        url="/careers"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FFFDF9] py-20 border-b border-[#EAE6DD]">
        {/* Multicolour accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'Careers' }]} className="text-slate-500" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> We are expanding our team
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Build the Future of Indian Corporate Advisory
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
            Join 200+ verified Chartered Accountants, Legal Counselors, Engineers, and Growth
            Strategists delivering institutional excellence across India.
          </p>
        </div>
      </section>

      {/* Why Join */}
      <section className="border-b border-[#EAE6DD] bg-white py-16">
        <div className="container-etaxwala">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
              Culture &amp; Benefits
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Why Build Your Career at ETaxwala?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyJoin.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#EAE6DD] text-[#7C3AED]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="section bg-[#FAF9F5] py-16">
        <div className="container-etaxwala max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                Current Open Positions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                We review applications on a rolling basis. Shortlisted candidates are contacted
                within 3–5 business days.
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold whitespace-nowrap">
              {jobs.length} Active Roles
            </span>
          </div>

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#EAE6DD] bg-white p-6 shadow-xs hover:border-[#7C3AED]/30 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-600">
                      {job.dept}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">• Exp: {job.exp}</span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-[#0084D1]" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#0084D1]" /> {job.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenApply(job.title)}
                  className="px-5 py-2.5 rounded-xl btn-multicolor text-xs sm:text-sm flex items-center gap-1.5 shrink-0"
                >
                  <span>Apply Now</span> <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Modal (1.14.3) */}
      {/* Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-3xl bg-[#FFFDF9] p-6 sm:p-8 shadow-2xl border border-[#EAE6DD] max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-5">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Job Application
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">Apply for {selectedJob}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill out your profile details and attach your resume.
                </p>
              </div>

              {status === 'success' ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Thank you for applying. Our talent acquisition team will review your profile and
                    contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      {...register('name')}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="you@domain.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        {...register('phone')}
                        placeholder="10-digit mobile"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Position *
                      </label>
                      <input
                        {...register('role')}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Experience *
                      </label>
                      <select
                        {...register('experience')}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                      >
                        <option value="Fresher / 0-1 Year">Fresher / 0-1 Year</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      LinkedIn / Portfolio URL
                    </label>
                    <input
                      {...register('linkedin')}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                    />
                  </div>

                  {/* Resume Upload Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Upload Resume (PDF / DOCX)
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-[#0084D1] transition-colors bg-[#FAF9F5]">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFileName(file.name);
                            setResumeFile(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                      {fileName ? (
                        <p className="text-xs font-bold text-[#0084D1] truncate">{fileName}</p>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-slate-700">
                            Click to upload or drag &amp; drop
                          </p>
                          <p className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-multicolor w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </span>
                  </button>

                  {status === 'error' && (
                    <p className="text-center text-xs text-rose-500">
                      Failed to submit application. Please email your CV directly to
                      support@etaxwala.com
                    </p>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
