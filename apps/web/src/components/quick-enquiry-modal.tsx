import { useState, useEffect } from 'react';
import { X, CheckCircle2, Phone, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen, serviceTitle]);

  if (!isOpen) return null;

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
      // Send to API
      const payload = {
        name: name.trim(),
        contact: cleanMobile,
        service: serviceTitle,
        consent: whatsappConsent,
        createdAt: new Date().toISOString(),
      };

      // Store in localStorage lead queue
      try {
        const stored = JSON.parse(localStorage.getItem('etaxwala_leads') || '[]');
        stored.push(payload);
        localStorage.setItem('etaxwala_leads', JSON.stringify(stored));
      } catch {
        // ignore local storage errors
      }

      // Try external API
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md itchy-modal-dialog overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white border border-[#EAE6DD]/80 shadow-xs transition-all cursor-pointer z-10"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Enquiry Received!
                </h3>
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
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-2 mb-5 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#EAE6DD] text-[11px] font-bold text-slate-800 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#7C3AED]" /> Quick Consultation
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {serviceTitle}
                </h3>

                <p className="text-xs text-slate-500">
                  Enter your name and number. Our CA will contact you with exact quotation &amp; deliverables.
                </p>
              </div>

              {error && (
                <div className="p-2.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Minimal Form with itchy-squid-77 input cards */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="input__container">
                  <label className="input__label">
                    <User className="w-3.5 h-3.5 text-[#0084D1]" />
                    <span>Your Full Name</span>
                    <span className="text-[#E11D48]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="itchy-input"
                    autoFocus
                  />
                  <p className="input__description">
                    Senior CA will address you by this name
                  </p>
                </div>

                <div className="input__container">
                  <label className="input__label">
                    <Phone className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Mobile / WhatsApp Number</span>
                    <span className="text-[#E11D48]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-extrabold text-slate-600 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="itchy-input !pl-11"
                    />
                  </div>
                  <p className="input__description">
                    Confidential callback from practicing CA within 5 mins
                  </p>
                </div>

                {/* Consent */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none text-[11px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={whatsappConsent}
                    onChange={(e) => setWhatsappConsent(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-slate-300"
                  />
                  <span>Get quote &amp; filing checklist on WhatsApp</span>
                </label>

                {/* Moving Gradient Panda Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-panda w-full py-3 mt-2 text-xs font-extrabold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting CA Desk...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Free Quote &amp; Callback</span>
                      <ArrowRight className="w-4 h-4 btn-panda-icon" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 pt-1">
                  🔒 100% Confidential • Zero Spam Guarantee • Pan-India CA Support
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
