import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { services } from '@/lib/constants/services';
import { CrmModal } from '@/components/ui/crm-modal';

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

const CUSTOMER_API = 'https://customer-api.etaxwala.com/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export default function InquiryModal({ isOpen, onClose, defaultService }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { service: defaultService || '' },
  });

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
        setTimeout(() => { reset(); setStatus('idle'); onClose(); }, 2500);
      } else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <CrmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Inquiry Now"
      description="Fill the form and our team will contact you within 24 hours"
      size="lg"
      icon={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}
    >
      {status === 'success' ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#7C3AED]" />
          <p className="mt-4 text-lg font-semibold text-slate-900">Inquiry Submitted!</p>
          <p className="mt-1 text-sm text-slate-600">We'll contact you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
              <input {...register('name')} placeholder="Full Name" className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email *</label>
              <input {...register('email')} type="email" placeholder="Email" className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone *</label>
              <input {...register('contact')} placeholder="Phone" className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
              {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service *</label>
              <select {...register('service')} className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all">
                <option value="">Select Service</option>
                {services.slice(0, 100).map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">State *</label>
              <input {...register('state')} placeholder="State" className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
              {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">City *</label>
              <input {...register('city')} placeholder="City" className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
          </div>
          <label className="flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" {...register('consent')} className="mt-0.5" />
            <span>I consent to receiving WhatsApp, Email or SMS from ETaxwala & I agree to Terms & Privacy Policy.</span>
          </label>
          {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}

          <button type="submit" disabled={status === 'loading'} className="btn-accent w-full">
            {status === 'loading' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Inquiry'}
          </button>
          {status === 'error' && <p className="text-center text-sm text-red-500">Failed. Call +91 70710 70707.</p>}
        </form>
      )}
    </CrmModal>
  );
}
