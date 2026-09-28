import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Calendar, ArrowRight } from 'lucide-react';

export default function MobileBottomBar() {
  const location = useLocation();

  // Hide on portal and crm pages
  if (location.pathname.startsWith('/portal') || location.pathname.startsWith('/crm')) {
    return null;
  }

  return (
    <aside
      aria-label="Mobile quick actions"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6DD] px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* 1. Phone Call Action */}
        <a
          href="tel:08069029999"
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-slate-800 active:scale-95 transition-all text-center"
        >
          <Phone className="w-4 h-4 text-[#0084D1] mb-0.5" />
          <span className="text-[10px] font-extrabold tracking-tight">Call CA</span>
        </a>

        {/* 2. WhatsApp Direct Action */}
        <a
          href="https://wa.me/917071070707?text=Hi%20ETaxwala%2C%20I%20need%20expert%20assistance%20regarding%20business%20registration%20%26%20tax%20compliance."
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-slate-800 active:scale-95 transition-all text-center"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span className="text-[10px] font-extrabold tracking-tight">WhatsApp</span>
        </a>

        {/* 3. Book Appointment Primary CTA */}
        <Link
          to="/appointment"
          className="flex-[1.6] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl btn-multicolor text-white shadow-xs active:scale-95 transition-all text-center"
        >
          <span className="relative z-10 flex items-center gap-1 text-[11px] font-extrabold tracking-tight">
            <Calendar className="w-3.5 h-3.5" />
            <span>Book CA Slot</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </aside>
  );
}
