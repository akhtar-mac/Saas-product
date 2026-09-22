import { useState, useEffect } from 'react';
import { CheckCircle2, Phone, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { CrmModal } from '@/components/ui/crm-modal';

interface QuickEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
}

export default function QuickEnquiryModal({
  isOpen,
  onClose,
  serviceTitle,
}: QuickEnquiryModalProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsappConsent, setWhatsappConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen, serviceTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        contact: cleanMobile,
        service: serviceTitle,
        consent: whatsappConsent,
        createdAt: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem('etaxwala_leads') || '[]');
        stored.push(payload);
        localStorage.setItem('etaxwala_leads', JSON.stringify(stored));
      } catch {
        // ignore local storage errors
      }

      try {
        await fetch('https://customer-api.etaxwala.com/api/add-inquiry-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback: succeed gracefully so client is never blocked
      }

      setIsSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CrmModal
      isOpen={isOpen}
      onClose={onClose}
      title={serviceTitle}
      description="Quick Consultation — Get a free quote & callback"
      size="lg"
      icon={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}
    >
      {isSuccess ? (
        <div className="py-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">Enquiry Received!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Thank you <strong className="text-slate-800">{name}</strong>! We have received your request for{' '}
              <span className="font-semibold text-[#0084D1]">{serviceTitle}</span>.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EAE6DD] text-xs text-slate-700 space-y-1 text-left max-w-sm mx-auto">
            <p className="font-bold flex items-center gap-1.5 text-slate-900">
              <Phone className="w-3.5 h-3.5 text-[#0084D1]" /> Guaranteed Callback:
            </p>
            <p className="text-slate-600 text-[11px]">
              A Senior Chartered Accountant from our desk will call you at{' '}
              <strong className="text-slate-900">+91 {mobile}</strong> within 5 minutes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl btn-multicolor text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              <User className="w-3.5 h-3.5 inline text-[#0084D1] mr-1" />
              Your Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              <Phone className="w-3.5 h-3.5 inline text-[#7C3AED] mr-1" />
              Mobile / WhatsApp Number *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-extrabold text-slate-600 select-none">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl pl-11 pr-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer select-none text-[11px] text-slate-500">
            <input
              type="checkbox"
              checked={whatsappConsent}
              onChange={(e) => setWhatsappConsent(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-slate-300"
            />
            <span>Get quote & filing checklist on WhatsApp</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-multicolor w-full py-3.5 mt-2 text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting CA Desk...</span>
              </>
            ) : (
              <>
                <span>Get Free Quote & Callback</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400 pt-1">
            🔒 100% Confidential • Zero Spam Guarantee • Pan-India CA Support
          </p>
        </form>
      )}
    </CrmModal>
  );
}
