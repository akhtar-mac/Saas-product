import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { services } from '@/lib/constants/services';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  contact: z.string().min(10, 'Valid phone required'),
  service: z.string().min(1, 'Select a service'),
  state: z.string().min(1, 'State required'),
  city: z.string().min(1, 'City required'),
  consent: z.boolean().refine((v) => v, 'You must agree'),
});

type FormData = z.infer<typeof schema>;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const CUSTOMER_API = `${API_BASE}/api`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export default function InquiryModal({ isOpen, onClose, defaultService }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { service: defaultService || '' },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await fetch(`${CUSTOMER_API}/add-inquiry-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          reset();
          setStatus('idle');
          onClose();
        }, 2500);
      } else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Inquiry Now</h3>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Fill the form and our team will contact you within 24 hours.
        </p>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <p className="mt-4 text-lg font-semibold">Inquiry Submitted!</p>
            <p className="mt-1 text-sm text-slate-600">We'll contact you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input {...register('name')} placeholder="Full Name *" className="input" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Email *"
                  className="input"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input {...register('contact')} placeholder="Phone *" className="input" />
                {errors.contact && (
                  <p className="mt-1 text-xs text-red-500">{errors.contact.message}</p>
                )}
              </div>
              <div>
                <select {...register('service')} className="input">
                  <option value="">Select Service *</option>
                  {services.slice(0, 100).map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <p className="mt-1 text-xs text-red-500">{errors.service.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input {...register('state')} placeholder="State *" className="input" />
                {errors.state && (
                  <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
                )}
              </div>
              <div>
                <input {...register('city')} placeholder="City *" className="input" />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input type="checkbox" {...register('consent')} className="mt-0.5" />
              <span>
                I consent to receiving WhatsApp, Email or SMS from ETaxwala & I agree to Terms &
                Privacy Policy.
              </span>
            </label>
            {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}

            <button type="submit" disabled={status === 'loading'} className="btn-accent w-full">
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Inquiry'
              )}
            </button>
            {status === 'error' && (
              <p className="text-center text-sm text-red-500">Failed. Call +91 70710 70707.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
