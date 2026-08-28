import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MapPin, CheckCircle2, Loader2,
  Calendar, Clock, Video, Building, Sparkles, ShieldCheck
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import { analytics } from '@/lib/analytics';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations';

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
];

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email address required'),
  mobile: z.string().min(10, 'Valid 10-digit mobile number required').regex(/^[0-9+ ]{10,14}$/, 'Invalid phone number format'),
  city: z.string().min(1, 'City is required'),
  ap_mode: z.enum(['Telephonic', 'Office Visit', 'Video Call']),
  preferred_date: z.string().min(1, 'Please select a preferred date'),
  preferred_time: z.string().min(1, 'Please select a time slot'),
  message: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, 'You must agree to the Terms & Privacy Policy to proceed'),
});

type FormData = z.infer<typeof schema>;

const CUSTOMER_API = 'https://customer-api.etaxwala.com/api';

// Minimum date is today, maximum 30 days ahead
const today = new Date().toISOString().split('T')[0];
const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function AppointmentPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ap_mode: 'Telephonic',
      preferred_date: today,
      preferred_time: TIME_SLOTS[0],
      consent: true,
    },
  });

  const selectedMode = watch('ap_mode');
  const selectedTime = watch('preferred_time');

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const payload = {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        city: data.city,
        message: `${data.message || ''} [Preferred Slot: ${data.preferred_date} @ ${data.preferred_time}]`,
        ap_mode: data.ap_mode,
        ap_date: data.preferred_date,
        ap_time: data.preferred_time,
      };

      const res = await fetch(`${CUSTOMER_API}/book-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('success');
        analytics.trackAppointmentBooked(data.city, data.ap_mode);
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
        title="Book CA Consultation & Free Appointment"
        description="Book a 1-on-1 consultation with practicing Chartered Accountants, CSs & Lawyers. Choose phone, video call or offline center visit."
        url="/appointment"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'CA Consultation Appointment',
          provider: {
            '@type': 'Organization',
            name: 'ETaxwala Business Solutions',
            telephone: '+91-7071070707',
          },
        }}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'Book Appointment' }]} className="text-slate-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 100% Confidential CA Advisory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Schedule Your Expert Consultation
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-slate-300">
            Connect directly with certified Chartered Accountants, Company Secretaries, and Legal Consultants. Guaranteed 5-minute initial triage.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="section bg-slate-50 dark:bg-slate-950 py-12">
        <div className="container-etaxwala max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Left Contact & Trust Column */}
            <motion.div
              className="lg:col-span-4 space-y-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Quick Contact Card */}
              <motion.div variants={staggerItem} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  <ShieldCheck className="text-emerald-500 w-5 h-5" /> Direct CA Helpdesk
                </h3>
                <div className="space-y-3.5 text-sm">
                  <a
                    href="tel:+917071070707"
                    className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-400 uppercase">Toll Free / Helpline</p>
                      <p className="font-bold text-sm">+91 70710 70707</p>
                    </div>
                  </a>

                  <a
                    href="mailto:support@etaxwala.com"
                    className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-400 uppercase">Support Email</p>
                      <p className="font-bold text-sm">support@etaxwala.com</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-3 p-2.5 text-slate-700 dark:text-slate-300">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-400 uppercase">Corporate Center</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                        150 Jalna Road, beside Bhagwati Traders, Ambad, Maharashtra 431204
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Consultation Guarantee */}
              <motion.div variants={staggerItem} className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3">
                <h4 className="font-bold text-sm text-blue-200">What Happens Next?</h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>An assigned CA reviews your business or taxation requirement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span>You receive a calendar invite + SMS/WhatsApp confirmation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span>Detailed checklist & action plan shared post-call.</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Right Booking Form */}
            <motion.div
              className="lg:col-span-8"
              variants={slideUp}
              initial="initial"
              animate="animate"
            >
              {status === 'success' ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center shadow-lg space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Appointment Requested!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Your appointment has been registered with our advisory team. You will receive an SMS and WhatsApp confirmation shortly.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                  >
                    Book Another Slot
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Consultation Details</h2>
                    <p className="text-xs text-slate-500 mt-1">Select your preferred consultation mode and schedule.</p>
                  </div>

                  {/* 1. Appointment Mode Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                      1. Choose Consultation Mode *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { mode: 'Telephonic' as const, label: 'Phone Call', icon: Phone, desc: 'Direct audio call with CA' },
                        { mode: 'Video Call' as const, label: 'Video Meeting', icon: Video, desc: 'Google Meet / Zoom' },
                        { mode: 'Office Visit' as const, label: 'Office Visit', icon: Building, desc: 'Visit nearest legal center' },
                      ].map((item) => {
                        const isSelected = selectedMode === item.mode;
                        const Icon = item.icon;
                        return (
                          <button
                            type="button"
                            key={item.mode}
                            onClick={() => setValue('ap_mode', item.mode)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 mb-1">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                              <span className="font-bold text-sm">{item.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Date & Time Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                      2. Select Date &amp; Time Slot *
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2 mb-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Preferred Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            min={today}
                            max={maxDate}
                            {...register('preferred_date')}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                        </div>
                        {errors.preferred_date && (
                          <p className="mt-1 text-xs text-rose-500">{errors.preferred_date.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Time Slot</label>
                        <select
                          {...register('preferred_time')}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                        {errors.preferred_time && (
                          <p className="mt-1 text-xs text-rose-500">{errors.preferred_time.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Personal Contact Information */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                      3. Your Contact Details *
                    </label>
                    <div className="space-y-3.5">
                      <div>
                        <input
                          {...register('name')}
                          placeholder="Full Name *"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                      </div>

                      <div className="grid gap-3.5 sm:grid-cols-2">
                        <div>
                          <input
                            {...register('email')}
                            type="email"
                            placeholder="Work / Personal Email *"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                          {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
                        </div>
                        <div>
                          <input
                            {...register('mobile')}
                            placeholder="Mobile / WhatsApp No. *"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          />
                          {errors.mobile && <p className="mt-1 text-xs text-rose-500">{errors.mobile.message}</p>}
                        </div>
                      </div>

                      <div>
                        <input
                          {...register('city')}
                          placeholder="City / State *"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city.message}</p>}
                      </div>

                      <div>
                        <textarea
                          {...register('message')}
                          rows={3}
                          placeholder="Brief description of your business / tax query (Optional)"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consent Checkbox (1.9.11) */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('consent')}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        I consent to receive consultation calls, WhatsApp &amp; SMS from ETaxwala experts. I agree to the{' '}
                        <a href="/legal/terms" target="_blank" className="text-blue-600 hover:underline">Terms &amp; Conditions</a>
                        {' '}and{' '}
                        <a href="/legal/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                    {errors.consent && (
                      <p className="mt-1 text-xs text-rose-500">{errors.consent.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Confirming Appointment...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" /> Confirm Free Consultation
                      </>
                    )}
                  </button>

                  {status === 'error' && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                        Unable to connect to booking server. Please call direct helpline:{' '}
                        <a href="tel:+917071070707" className="underline font-bold">+91 70710 70707</a>
                      </p>
                    </div>
                  )}
                </form>
              )}
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}