import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Phone, ChevronDown, Building2,
  Receipt, ClipboardCheck, FileBadge, ArrowRight,
  Shield, Award, Clock, Search, User, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const servicesMega = [
  {
    category: 'Incorporation & Startup',
    icon: Building2,
    items: [
      { label: 'Private Limited Company', to: '/services/registration/private-limited', badge: 'Popular' },
      { label: 'Limited Liability Partnership (LLP)', to: '/services/registration/llp' },
      { label: 'One Person Company (OPC)', to: '/services/registration/opc' },
      { label: 'Section 8 Non-Profit (NGO)', to: '/services/registration/section-8-ngo' },
      { label: 'Farmer Producer Co. (FPC)', to: '/fpc-training' },
    ],
  },
  {
    category: 'Taxation & Regulatory',
    icon: Receipt,
    items: [
      { label: 'Income Tax Return (ITR)', to: '/itr-filing', badge: 'Fast Track' },
      { label: 'GST Registration (New)', to: '/services/other/gst' },
      { label: 'Monthly GSTR-1 & 3B Returns', to: '/services/taxation/gst-return' },
      { label: 'Tax Audit (Section 44AB)', to: '/services/taxation/tax-audit' },
      { label: 'TDS & TCS Reconciliation', to: '/services/taxation/tds' },
    ],
  },
  {
    category: 'Corporate Governance',
    icon: ClipboardCheck,
    items: [
      { label: 'Annual ROC Compliance Retainer', to: '/services/compliance/pvt-ltd' },
      { label: 'Director KYC (DIR-3 KYC)', to: '/services/compliance/pvt-ltd' },
      { label: 'FSSAI Food Hygiene License', to: '/services/other/fssai' },
      { label: 'Udyam / MSME Certificate', to: '/services/other/msme' },
      { label: 'Import Export Code (IEC)', to: '/services/other/import-export' },
    ],
  },
  {
    category: 'Intellectual Property',
    icon: FileBadge,
    items: [
      { label: 'Trademark Registration (TM)', to: '/services/ip/trademark', badge: '24 Hours' },
      { label: 'Copyright Filing', to: '/services/ip/copyright' },
      { label: 'Patent Specification Drafting', to: '/services/ip/patent' },
      { label: 'ISO 9001:2015 Audit', to: '/services/ip/iso' },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-200">
      
      {/* ── Top Micro Utility Bar (Light Cream) ── */}
      <div className="bg-[#FAF9F5] text-slate-600 text-xs py-1.5 px-4 hidden lg:block border-b border-[#EAE6DD]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
              <Shield className="w-3.5 h-3.5 text-[#0084D1]" /> MCA &amp; GST Certified Practice
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">120+ Offline Legal Hubs across 28 States</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#E11D48]" /> Mon–Sat, 9:30 AM – 6:30 PM
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a href="tel:08069029999" className="text-slate-900 hover:text-[#0084D1] font-bold flex items-center gap-1.5 transition-colors">
              <Phone className="w-3 h-3 text-[#F97316]" /> 080-6902-9999
            </a>
            <span className="text-slate-300">|</span>
            <Link to="/portal/login" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
              Client Portal
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/crm/login" className="text-slate-500 hover:text-slate-800 font-medium transition-colors">
              Staff CRM
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar (Clean White / Light Cream) ── */}
      <div className={cn(
        "bg-white/95 backdrop-blur-md transition-all duration-200 border-b",
        scrolled ? "border-[#EAE6DD] shadow-xs" : "border-slate-100"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left: Official ETaxwala Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/logo_black.png"
                  alt="ETaxwala"
                  className="h-10 sm:h-12 w-auto object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/brand-logo.png';
                  }}
                />
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1" ref={megaRef}>
                
                {/* Services Mega Menu Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setMegaOpen(!megaOpen)}
                    className={cn(
                      "px-3.5 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer",
                      megaOpen ? "bg-[#FAF9F5] text-slate-900" : "text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F5]"
                    )}
                  >
                    <span>Services</span>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", megaOpen && "rotate-180 text-slate-800")} />
                  </button>

                  {/* Mega Menu Dropdown */}
                  {megaOpen && (
                    <div className="absolute left-0 top-full mt-2 w-[720px] bg-white rounded-2xl border border-[#EAE6DD] shadow-xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="grid grid-cols-12 gap-5">
                        
                        {/* Categories Sidebar */}
                        <div className="col-span-4 border-r border-[#EAE6DD] pr-3 space-y-1">
                          {servicesMega.map((cat, idx) => {
                            const Icon = cat.icon;
                            const isSelected = activeMegaCategory === idx;
                            return (
                              <button
                                key={cat.category}
                                onMouseEnter={() => setActiveMegaCategory(idx)}
                                className={cn(
                                  "w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer",
                                  isSelected ? "bg-[#FAF9F5] text-slate-900 font-bold border border-[#EAE6DD]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                              >
                                <Icon className={cn("w-4 h-4", isSelected ? "text-[#7C3AED]" : "text-slate-400")} />
                                <span>{cat.category}</span>
                              </button>
                            );
                          })}
                          
                          <div className="pt-3 border-t border-[#EAE6DD] mt-2">
                            <Link
                              to="/services"
                              className="text-xs font-bold text-slate-900 hover:text-[#0084D1] flex items-center gap-1 px-3 py-1"
                            >
                              <span>View All 250+ Services</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>

                        {/* Selected Category Items */}
                        <div className="col-span-8 space-y-1 pl-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {servicesMega[activeMegaCategory].category}
                          </p>
                          <div className="grid grid-cols-1 gap-1">
                            {servicesMega[activeMegaCategory].items.map((item) => (
                              <Link
                                key={item.label}
                                to={item.to}
                                className="p-2.5 rounded-xl hover:bg-[#FAF9F5] flex items-center justify-between group transition-colors"
                              >
                                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF9F5] text-slate-700 border border-[#EAE6DD]">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                <NavLink
                  to="/itr-filing"
                  className={({ isActive }) => cn(
                    "px-3.5 py-2 text-sm font-bold rounded-lg transition-colors",
                    isActive ? "text-slate-900 bg-[#FAF9F5]" : "text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F5]"
                  )}
                >
                  ITR Filing
                </NavLink>

                <NavLink
                  to="/fpc-training"
                  className={({ isActive }) => cn(
                    "px-3.5 py-2 text-sm font-bold rounded-lg transition-colors",
                    isActive ? "text-slate-900 bg-[#FAF9F5]" : "text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F5]"
                  )}
                >
                  FPC Academy
                </NavLink>

                <NavLink
                  to="/appointment"
                  className={({ isActive }) => cn(
                    "px-3.5 py-2 text-sm font-bold rounded-lg transition-colors",
                    isActive ? "text-slate-900 bg-[#FAF9F5]" : "text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F5]"
                  )}
                >
                  CA Consultation
                </NavLink>

                <NavLink
                  to="/about"
                  className={({ isActive }) => cn(
                    "px-3.5 py-2 text-sm font-bold rounded-lg transition-colors",
                    isActive ? "text-slate-900 bg-[#FAF9F5]" : "text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F5]"
                  )}
                >
                  About
                </NavLink>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              
              <Link
                to="/portal/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F5] rounded-xl border border-transparent hover:border-[#EAE6DD] transition-all"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Client Login</span>
              </Link>

              {/* Signature Multicolour CTA Button */}
              <Link
                to="/appointment"
                className="px-4 py-2 sm:py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 btn-multicolor"
              >
                <span>Talk to a CA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-[#FAF9F5] rounded-lg"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#EAE6DD] bg-white px-4 py-6 space-y-4 shadow-lg">
            <div className="space-y-1">
              <Link to="/services" className="block px-3 py-2 text-sm font-bold text-slate-900 rounded-lg hover:bg-[#FAF9F5]">
                All 250+ Services
              </Link>
              <Link to="/itr-filing" className="block px-3 py-2 text-sm font-bold text-slate-900 rounded-lg hover:bg-[#FAF9F5]">
                ITR Return Filing
              </Link>
              <Link to="/fpc-training" className="block px-3 py-2 text-sm font-bold text-slate-900 rounded-lg hover:bg-[#FAF9F5]">
                FPC Agri Training
              </Link>
              <Link to="/appointment" className="block px-3 py-2 text-sm font-bold text-slate-900 rounded-lg hover:bg-[#FAF9F5]">
                Book CA Appointment
              </Link>
              <Link to="/about" className="block px-3 py-2 text-sm font-bold text-slate-900 rounded-lg hover:bg-[#FAF9F5]">
                About ETaxwala
              </Link>
              <Link to="/contact" className="block px-3 py-2 text-sm font-bold text-slate-900 rounded-lg hover:bg-[#FAF9F5]">
                Contact &amp; Legal Hubs
              </Link>
            </div>

            <div className="pt-4 border-t border-[#EAE6DD] space-y-2">
              <Link
                to="/portal/login"
                className="w-full py-2.5 text-center block text-xs font-bold text-slate-800 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl"
              >
                Client Portal Login
              </Link>
              <Link
                to="/crm/login"
                className="w-full py-2.5 text-center block text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl"
              >
                Staff CRM Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}