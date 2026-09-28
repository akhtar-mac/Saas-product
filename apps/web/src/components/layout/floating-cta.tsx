import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import McqChatbot from '@/components/chat/mcq-chatbot';

const WHATSAPP_NUMBER = '918069029999'; // ETaxwala WhatsApp number
const WHATSAPP_MSG = encodeURIComponent(
  'Hi ETaxwala! I need help with tax/company compliance. Please guide me.'
);

export default function FloatingCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating CTA Container */}
      <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2.5 select-none max-w-[calc(100vw-1.5rem)]">
        {/* WhatsApp Floating Button */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          title="Chat with us on WhatsApp"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl btn-multicolor shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] cursor-pointer group"
        >
          {/* WhatsApp Icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div className="text-left pr-0.5">
            <p className="text-xs font-extrabold tracking-tight leading-tight text-slate-900 group-hover:text-[#0084D1] transition-colors">
              WhatsApp Us
            </p>
            <p className="text-[10px] text-emerald-600 font-bold leading-none mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Reply in &lt; 2 mins</span>
            </p>
          </div>
        </a>
        {/* Executive MCQ Advisory Chatbot Popover */}
        {open && <McqChatbot onClose={() => setOpen(false)} />}

        {/* Sleek Executive Floating Pill Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl btn-multicolor shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer group"
          aria-label={open ? 'Close advisory desk' : 'Consult Chartered Accountant'}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0084D1] via-[#7C3AED] to-[#E11D48] flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-500/30 transition-transform group-hover:scale-105">
              {open ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <MessageSquare className="w-4 h-4 text-white" />
              )}
            </div>
            {!open && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white" />
              </span>
            )}
          </div>

          <div className="text-left pr-1">
            <p className="text-xs font-extrabold tracking-tight leading-tight text-slate-900 group-hover:text-[#7C3AED] transition-colors">
              {open ? 'Close Advisory' : 'Consult a CA'}
            </p>
            {!open && (
              <p className="text-[10px] text-slate-600 font-bold leading-none mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-emerald-700 font-bold">Online</span>
                <span className="text-slate-400">•</span>
                <span>Free Advice</span>
              </p>
            )}
          </div>
        </button>
      </div>
    </>
  );
}
