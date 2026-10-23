import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Loader2,
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import { analytics } from '@/lib/analytics';

const offices = [
  {
    name: 'Corporate Head Office — Chhatrapati Sambhaji Nagar',
    address:
      "3rd Floor, Infront of Reliance Digital, Ashoka's Residency, Beed Bypass Rd, Deolai Parisar, CSN, Maharashtra 431001",
    phone: '+91 70710 70707',
    email: 'support@etaxwala.com',
    hours: 'Mon–Sat: 9:30 AM – 7:00 PM IST',
    isHead: true,
    mapUrl:
      'https://maps.google.com/maps?q=Ashoka%27s+Residency+Beed+Bypass+Road+Aurangabad&t=&z=14&ie=UTF8&iwloc=&output=embed',
  },
  {
    name: 'Ambad Commercial Branch — Jalna',
    address: '150, Jalna Road, beside Bhagwati Traders, Ambad, Maharashtra 431204',
    phone: '+91 70710 70707',
    email: 'jalna@etaxwala.com',
    hours: 'Mon–Sat: 9:30 AM – 6:00 PM IST',
    isHead: false,
    mapUrl:
      'https://maps.google.com/maps?q=150+Jalna+Road+Ambad+Maharashtra&t=&z=14&ie=UTF8&iwloc=&output=embed',
  },
];

const quickLinks = [
  { q: 'Company Registration', href: '/services/registration/private-limited' },
  { q: 'GST Registration & Returns', href: '/services/tax/gst' },
  { q: 'ITR Filing Plans', href: '/itr-filing' },
  { q: 'Trademark Protection', href: '/services/ip/trademark' },
  { q: 'FPC Business Training', href: '/fpc-training' },
  { q: 'Book Free Consultation', href: '/appointment' },
];

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, '10-digit phone number is required'),
  email: z.string().email('Valid email address is required'),
  service: z.string().min(1, 'Please select a service'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const CUSTOMER_API = `${API_BASE}/api`;

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await fetch(`${CUSTOMER_API}/add-inquiry-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          contact: data.phone,
          service: data.service,
          city: 'Website Contact Page',
          state: 'Maharashtra',
          message: data.message || 'Direct inquiry from contact page',
          consent: true,
        }),
      });

      if (res.ok) {
        setStatus('success');
        analytics.trackInquirySubmitted(data.service, 'Contact Page');
        reset();
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
        title="Contact Us — Talk to Senior CA & Legal Advisors"
        description="Reach ETaxwala corporate headquarters or 120+ legal hubs across India. Helpline: +91 70710 70707. Instant 5-minute callback guaranteed."
        url="/contact"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'ETaxwala Corporate Headquarters',
          image: 'https://etaxwala.com/ofc2.jpg',
          telephone: '+91-7071070707',
          email: 'support@etaxwala.com',
          address: {
            '@type': 'PostalAddress',
            streetAddress: "3rd Floor, Ashoka's Residency, Beed Bypass Rd",
            addressLocality: 'Chhatrapati Sambhaji Nagar',
            addressRegion: 'MH',
            postalCode: '431001',
            addressCountry: 'IN',
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              opens: '09:30',
              closes: '19:00',
            },
          ],
        }}
      />

      {/* Hero Banner with Signature Multicolour Accent Strip */}
      <section className="relative bg-[#FFFDF9] py-14 lg:py-20 border-b border-[#EAE6DD] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'Contact Us' }]} />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> 5-Minute Guaranteed Response SLA
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Connect With Our <span className="text-multicolor">Legal &amp; Tax Advisors</span>
          </h1>
          <p className="mt-3.5 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            Call our direct lines, email our corporate operations desk, or visit our physical legal
            hubs across India.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section bg-[#FAF9F5] py-12">
        <div className="container-etaxwala max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
                    Get In Touch
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    Send Us an Inquiry
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Fill out the form below. An assigned Chartered Accountant will call you back
                    within 5 minutes during desk hours.
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-[#7C3AED] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Inquiry Received Successfully
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Thank you! A practicing Chartered Accountant from our legal desk has received
                      your request and will call you shortly.
                    </p>
                    <div className="inline-block p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-xs font-bold text-slate-800">
                      Direct Helpline: +91 70710 70707
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          {...register('name')}
                          placeholder="e.g. Vikramaditya Rao"
                          className="w-full rounded-xl border border-[#EAE6DD] bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          {...register('phone')}
                          placeholder="10-digit mobile"
                          className="w-full rounded-xl border border-[#EAE6DD] bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                        />
                        {errors.phone && (
                          <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="you@domain.com"
                          className="w-full rounded-xl border border-[#EAE6DD] bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Service Required *
                        </label>
                        <select
                          {...register('service')}
                          className="w-full rounded-xl border border-[#EAE6DD] bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                        >
                          <option value="">Select a service category...</option>
                          <option value="Private Limited Company">
                            Company Registration (Pvt Ltd / LLP)
                          </option>
                          <option value="GST Registration & Filing">
                            GST Registration &amp; Monthly Returns
                          </option>
                          <option value="Income Tax Return Filing">
                            Income Tax Return (ITR) Filing
                          </option>
                          <option value="Trademark & IP Protection">
                            Trademark, Copyright &amp; Patent
                          </option>
                          <option value="FPC & PACS Training">
                            FPC Training &amp; Agriculture Advisory
                          </option>
                          <option value="Statutory & Tax Audit">
                            Statutory Tax &amp; MCA Audits
                          </option>
                          <option value="Franchise Partnership">
                            Franchise Partnership Inquiry
                          </option>
                          <option value="General Consultation">General Corporate Advisory</option>
                        </select>
                        {errors.service && (
                          <p className="mt-1 text-xs text-rose-500">{errors.service.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Describe Your Query (Optional)
                      </label>
                      <textarea
                        {...register('message')}
                        rows={4}
                        placeholder="Tell us about your business, turnover, or specific compliance questions..."
                        className="w-full rounded-xl border border-[#EAE6DD] bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-3.5 rounded-xl btn-multicolor cursor-pointer disabled:opacity-60"
                    >
                      <span className="btn-galaxy__stars" aria-hidden="true" />
                      <span className="relative z-[2] inline-flex items-center justify-center gap-2 font-bold text-xs">
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting with Senior CA...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Free Consultation &amp; Callback</span>
                            <ArrowRight className="btn-galaxy__icon w-4 h-4" />
                          </>
                        )}
                      </span>
                    </button>

                    {status === 'error' && (
                      <p className="text-center text-xs text-rose-500">
                        Unable to submit form. Please call our direct helpline: +91 70710 70707
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Quick Services Links */}
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Popular Services
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {quickLinks.map((ql) => (
                    <Link
                      key={ql.q}
                      to={ql.href}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-between"
                    >
                      <span>{ql.q}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Offices & Google Maps Embed (1.5.4) */}
            <div className="lg:col-span-5 space-y-6">
              {/* WhatsApp Direct Help */}
              <a
                href="https://wa.me/917071070707"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                    Instant WhatsApp Helpdesk
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chat directly with CA support team
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 ml-auto" />
              </a>

              {/* Office Locations with Maps */}
              {offices.map((o) => (
                <div
                  key={o.name}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        o.isHead
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {o.isHead ? 'Corporate Headquarters' : 'Commercial Branch'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {o.name}
                  </h3>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{o.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a href={`tel:${o.phone}`} className="hover:text-blue-600 font-semibold">
                        {o.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <a href={`mailto:${o.email}`} className="hover:text-blue-600 font-semibold">
                        {o.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{o.hours}</span>
                    </div>
                  </div>

                  {/* Google Maps Embed (1.5.4) */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 w-full bg-slate-100">
                    <iframe
                      title={`${o.name} Map`}
                      src={o.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
