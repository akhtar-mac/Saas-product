import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, CheckCircle2, Loader2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  mobile: z.string().min(10, 'Valid mobile number required'),
  city: z.string().min(1, 'City is required'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CUSTOMER_API = 'https://customer-api.etaxwala.com/api';

export default function AppointmentPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      // Posts to existing customer-api (writes to old CRM's appointments table)
      const res = await fetch(`${CUSTOMER_API}/book-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          city: data.city,
          message: data.message || '',
          ap_mode: 'Telephonic',
        }),
      });
      if (res.ok) {
        setStatus('success');
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
      <section className="bg-primary-700 py-20 text-white">
        <div className="container-etaxwala">
          <h1 className="text-4xl font-bold lg:text-5xl">Book an Appointment</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Fill out the form and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-etaxwala max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4">
              <a href="tel:+917071070707" className="flex items-center gap-3 text-sm text-slate-700 hover:text-primary">
                <Phone className="h-5 w-5 text-accent" /> +91 7071 070707
              </a>
              <a href="mailto:support@etaxwala.com" className="flex items-center gap-3 text-sm text-slate-700 hover:text-primary">
                <Mail className="h-5 w-5 text-accent" /> support@etaxwala.com
              </a>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                <span>150 Jalna Road, beside Bhagwati Traders, Ambad, Maharashtra 431204</span>
              </div>
            </div>

            <div className="md:col-span-2">
              {status === 'success' ? (
                <div className="card p-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
                  <h3 className="mt-4 text-xl font-bold">Appointment Booked!</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    We'll contact you within 24 hours to confirm your appointment.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Full Name *</label>
                    <input {...register('name')} className="input mt-1" placeholder="Enter your name" />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Email *</label>
                      <input {...register('email')} type="email" className="input mt-1" placeholder="E-mail" />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Mobile *</label>
                      <input {...register('mobile')} className="input mt-1" placeholder="Phone No" />
                      {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">City *</label>
                    <input {...register('city')} className="input mt-1" placeholder="City" />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Your Query</label>
                    <textarea {...register('message')} className="input mt-1" rows={4} placeholder="Enter your query" />
                  </div>
                  <button type="submit" disabled={status === 'loading'} className="btn-accent w-full">
                    {status === 'loading' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</>
                    ) : 'Book Now'}
                  </button>
                  {status === 'error' && (
                    <p className="text-center text-sm text-red-500">
                      Something went wrong. Please call us at +91 70710 70707.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}