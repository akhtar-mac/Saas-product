import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import McqChatbot from '@/components/chat/mcq-chatbot';

export default function FloatingCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating CTA Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5 select-none">
        {/* Executive MCQ Advisory Chatbot Popover */}
        {open && <McqChatbot onClose={() => setOpen(false)} />}

        {/* Sleek Executive Floating Pill Button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-slate-700/60 cursor-pointer group"
          aria-label={open ? 'Close advisory desk' : 'Consult Chartered Accountant'}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
              {open ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <MessageSquare className="w-4 h-4 text-white" />
              )}
            </div>
            {!open && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-900" />
              </span>
            )}
          </div>

          <div className="text-left pr-1">
            <p className="text-xs font-extrabold tracking-tight leading-tight text-white">
              {open ? 'Close Advisory' : 'Consult a CA'}
            </p>
            {!open && (
              <p className="text-[10px] text-slate-300 font-medium leading-none mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Online • Free Advice</span>
              </p>
            )}
          </div>
        </button>
      </div>
    </>
  );
}