import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Phone, ChevronDown, Building2,
  Receipt, ClipboardCheck, FileBadge, ArrowRight,
  Zap, Shield, Award, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const servicesMenu = [
  {
    category: 'Business Incorporation', icon: Building2,
    items: [
      { label: 'Private Limited Company',    to: '/services/registration/private-limited' },
      { label: 'LLP Registration',           to: '/services/registration/llp' },
      { label: 'One Person Company (OPC)',   to: '/services/registration/opc' },
      { label: 'Section 8 NGO',              to: '/services/registration/section-8-ngo' },
      { label: 'Farmer Producer Co (FPC)',  to: '/fpc-training' },
    ],
  },
  {
    category: 'Tax & Regulatory', icon: Receipt,
    items: [
      { label: 'Income Tax Return (ITR)',    to: '/itr-filing' },
      { label: 'GST Registration',           to: '/services/other/gst' },
      { label: 'GST Monthly Returns',        to: '/services/taxation/gst-return' },
      { label: 'Tax Audit (Sec 44AB)',       to: '/services/taxation/tax-audit' },
      { label: 'TDS Return Filing',          to: '/services/taxation/tds' },
    ],
  },
  {
    category: 'Corporate Governance', icon: ClipboardCheck,
    items: [
      { label: 'Annual ROC Compliance',      to: '/services/compliance/pvt-ltd' },
      { label: 'Director KYC (DIR-3)',       to: '/services/compliance/pvt-ltd' },
      { label: 'FSSAI Food License',         to: '/services/other/fssai' },
      { label: 'MSME / Udyam Registration',  to: '/services/other/msme' },
      { label: 'Import Export Code (IEC)',   to: '/services/other/import-export' },
    ],
  },
  {
    category: 'Intellectual Property', icon: FileBadge,
    items: [
      { label: 'Trademark Registration (TM)', to: '/services/ip/trademark' },
      { label: 'Copyright Registration',      to: '/services/ip/copyright' },
      { label: 'Patent Drafting & Filing',   to: '/services/ip/patent' },
      { label: 'ISO 9001 Certification',     to: '/services/ip/iso' },
    ],
  },
];

const topNav = [
  { label: 'About Us',  to: '/about' },
  { label: 'Services',  to: '/services' },
  { label: 'Articles',  to: '/blog' },
  { label: 'Contact',   to: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const megaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const ActiveCat = servicesMenu[activeCat];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-200">
      
      {/* ── Top Micro-Bar with 10am-7pm Timings ── */}
      <div className="bg-[#FAFBFD]/95 backdrop-blur-md border-b border-slate-200/50 py-1.5 px-4 hidden lg:block text-[11px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-500" /> ISO 9001:2015 Certified
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-[#0084D1]" /> Desk Timings: <strong>10:00 AM – 7:00 PM (Mon–Sat)</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Guaranteed 5-Min Callback
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a
              href="tel:18008890128"
              className="text-slate-700 hover:text-[#0084D1] transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#E11D48]" /> 1800-889-0128
            </a>
            <span className="text-slate-200">|</span>
            <Link to="/portal/login" className="text-slate-500 hover:text-slate-800 transition-colors">
              Client Portal
            </Link>
            <span className="text-slate-200">|</span>
            <Link to="/crm/login" className="text-[#7C3AED] hover:text-[#0084D1] font-bold transition-colors">
              Staff CRM →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Clean Glass Navbar ── */}
      <div className={cn(
        'transition-all duration-200 border-b',
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
          : 'bg-[#FAFBFD]/80 backdrop-blur-lg border-slate-200/40'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <img
                src="/logo_black.png"
                alt="ETaxwala"
                className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>

            {/* Minimal Desktop Nav Links */}
            <nav className="hidden items-center gap-1 lg:flex" ref={megaRef}>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setMegaOpen(true)}
                  onClick={() => setMegaOpen(!megaOpen)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all text-slate-700 hover:text-slate-900 hover:bg-white/80',
                    megaOpen && 'bg-white text-[#0084D1] shadow-sm'
                  )}
                >
                  <span>Services</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', megaOpen && 'rotate-180 text-[#0084D1]')} />
                </button>
              </div>

              {topNav.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide text-slate-700 hover:text-slate-900 hover:bg-white/80 transition-all',
                      isActive && 'text-[#0084D1] font-bold bg-white/90 shadow-sm'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Action Button with Multi-Color Hover */}
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                to="/appointment"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white/90 hover:bg-white border border-slate-200/90 hover:border-purple-300 shadow-sm hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="group-hover:bg-gradient-to-r group-hover:from-[#0084D1] group-hover:via-[#7C3AED] group-hover:to-[#F97316] group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  Request 5-Min Callback
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* ── Mega Menu (Minimal Glassy Dropdown) ── */}
      {megaOpen && (
        <div
          ref={megaRef}
          onMouseLeave={() => setMegaOpen(false)}
          className="hidden lg:block absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-2xl animate-fade-in"
        >
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              
              <div className="col-span-4 border-r border-slate-100 pr-6 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  Practice Verticals
                </p>
                {servicesMenu.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isSelected = activeCat === idx;
                  return (
                    <button
                      key={cat.category}
                      onMouseEnter={() => setActiveCat(idx)}
                      onClick={() => setActiveCat(idx)}
                      className={cn(
                        'w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer',
                        isSelected
                          ? 'bg-slate-100/90 text-[#0084D1] shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                          isSelected ? 'bg-[#0084D1] text-white' : 'bg-slate-100 text-slate-500'
                        )}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="group-hover:bg-gradient-to-r group-hover:from-[#0084D1] group-hover:via-[#7C3AED] group-hover:to-[#F97316] group-hover:bg-clip-text group-hover:text-transparent">
                          {cat.category}
                        </span>
                      </div>
                      <ArrowRight className={cn('w-3.5 h-3.5 transition-transform', isSelected ? 'text-[#0084D1] translate-x-0.5' : 'opacity-0')} />
                    </button>
                  );
                })}
              </div>

              <div className="col-span-8 pl-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{ActiveCat.category}</h3>
                    <p className="text-[11px] text-slate-400">Handled by certified Chartered Accountants & Senior Attorneys</p>
                  </div>
                  <Link
                    to="/services"
                    className="text-xs font-bold text-[#0084D1] hover:underline flex items-center gap-1"
                  >
                    View All Services <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {ActiveCat.items.map((svc) => (
                    <Link
                      key={svc.label}
                      to={svc.to}
                      onClick={() => setMegaOpen(false)}
                      className="p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all group"
                    >
                      <p className="text-xs font-bold text-slate-800 group-hover:bg-gradient-to-r group-hover:from-[#0084D1] group-hover:via-[#7C3AED] group-hover:to-[#F97316] group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {svc.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">MCA & ROC Verified · Fast Turnaround</p>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Navigation Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-2xl border-b border-slate-200 px-6 py-6 space-y-6 animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0084D1]" /> 10:00 AM – 7:00 PM (Mon–Sat)
            </p>
            <p className="text-[11px] text-slate-500">Guaranteed 5-minute expert callback during desk hours</p>
          </div>

          <div className="space-y-1">
            {topNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-semibold text-slate-800 hover:text-[#0084D1] border-b border-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/appointment"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-slate-900 shadow-md"
            >
              Request 5-Min Callback
            </Link>
            <a
              href="tel:18008890128"
              className="w-full py-3 rounded-xl text-center text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#E11D48]" /> 1800-889-0128 (Toll-Free)
            </a>
          </div>
        </div>
      )}

    </header>
  );
}