import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Phone, ChevronDown, ArrowRight,
  Search, User, Sparkles, Building2, Receipt,
  ClipboardCheck, FileBadge, Code, LayoutDashboard,
  Smartphone, Layers, CheckCircle2, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { services } from '@/lib/constants/services';

interface NavItem {
  id: string;
  label: string;
  to?: string;
  badge?: string;
  items?: { label: string; to: string; badge?: string }[];
}

// Clean horizontal categories matching IndiaFilings style
// 4 Clean Master Navigation Categories (Single-line, generous breathing room)
const navDropdowns: NavItem[] = [
  {
    id: 'startup',
    label: 'Startup',
    items: [
      { label: 'Private Limited Company', to: '/services/registration/private-limited', badge: 'Popular' },
      { label: 'Limited Liability Partnership (LLP)', to: '/services/registration/llp' },
      { label: 'One Person Company (OPC)', to: '/services/registration/opc' },
      { label: 'Section 8 NGO Company', to: '/services/registration/section-8-ngo' },
      { label: 'Partnership Firm Registration', to: '/services/registration/partnership-firm' },
      { label: 'Public Limited Company', to: '/services/registration/public-limited' },
      { label: 'Indian Subsidiary Company', to: '/services/registration/indian-subsidiary' },
    ],
  },
  {
    id: 'registrations',
    label: 'Registrations & IP',
    items: [
      { label: 'GST Registration (Regular)', to: '/services/other-registrations/gst-regular', badge: 'Fast' },
      { label: 'Udyam / MSME Registration', to: '/services/other-registrations/msme' },
      { label: 'Trademark Application Filing', to: '/services/ip/trademark-application', badge: '24 Hours' },
      { label: 'FSSAI Food License (Basic/State)', to: '/services/other-registrations/fssai-basic', badge: 'Popular' },
      { label: 'Import Export Code (IEC)', to: '/services/other-registrations/import-export-code' },
      { label: 'ISO 9001:2015 Certification', to: '/services/other-registrations/iso-certification' },
      { label: 'Digital Signature (DSC Class 3)', to: '/services/other-registrations/dsc-signing-encryption' },
      { label: '12A & 80G NGO Registration', to: '/services/other-registrations/80g-12a' },
    ],
  },
  {
    id: 'tax-compliance',
    label: 'Tax & Compliance',
    items: [
      { label: 'GST Return Filing (GSTR-1 & 3B)', to: '/services/taxation/gst-return', badge: '100% ITC' },
      { label: 'Income Tax Return (ITR) Filing', to: '/itr-filing', badge: 'Fast Track' },
      { label: 'Pvt Ltd Annual ROC Compliance', to: '/services/audit/audit-pvt-ltd', badge: 'Annual' },
      { label: 'LLP Annual Return Form-11', to: '/services/taxation/llp-form-11' },
      { label: 'Tax Audit (Section 44AB)', to: '/services/taxation/tax-audit-with-acct' },
      { label: 'TDS & TCS Return Filing', to: '/services/taxation/tds-return' },
      { label: 'Director KYC (DIR-3 KYC)', to: '/services/taxation/director-kyc' },
      { label: 'Income Tax & GST Notice Reply', to: '/services/taxation/it-notice-response' },
    ],
  },
  {
    id: 'software',
    label: 'Software & Tech',
    badge: 'Dev',
    items: [
      { label: 'Custom Web Applications & SaaS', to: '/software-solutions#web-apps', badge: 'Full-Stack' },
      { label: 'Enterprise Business Dashboards', to: '/software-solutions#dashboards', badge: 'Analytics' },
      { label: 'iOS & Android Mobile App Dev', to: '/software-solutions#mobile-apps', badge: 'Mobile' },
      { label: 'Fintech, Invoicing & GST Engines', to: '/software-solutions#invoicing-tools', badge: 'Automated' },
      { label: 'Core Banking Software for Societies', to: '/services/consultancy/banking-software' },
    ],
  },
  {
    id: 'consultation',
    label: 'Consultation',
    items: [
      { label: '1-on-1 Chartered Accountant Meeting', to: '/appointment', badge: 'Online' },
      { label: 'Virtual CFO Services', to: '/services/consultancy/cfo-services' },
      { label: 'FPC Farmer Producer Training', to: '/fpc-training', badge: '🌾 Agri' },
      { label: 'Detailed Project Report (DPR)', to: '/services/taxation/dpr' },
      { label: 'All 250+ Services Catalog', to: '/services' },
    ],
  },
];

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>('startup');
  const [scrolled, setScrolled] = useState(false);

  // Expanding search state (opens smoothly from right to left)
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
    setSearchExpanded(false);
    setSearchQuery('');
  }, [location]);

  // Scroll detection for subtle shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns & search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchExpanded(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchExpanded(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when expanded
  useEffect(() => {
    if (searchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchExpanded]);

  // Filter services for search
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return services
      .filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.slug.includes(q))
      .slice(0, 6);
  }, [searchQuery]);

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 transition-all duration-200 bg-white border-b',
        scrolled ? 'border-[#EAE6DD] shadow-sm' : 'border-[#EAE6DD]/80'
      )}
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16" ref={navRef}>
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-3 xl:gap-5 min-w-0">
            {/* Official Brand Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 mr-1 xl:mr-2">
              <img
                src="/logo_black.png"
                alt="ETaxwala"
                className="h-7 sm:h-8 md:h-8.5 w-auto object-contain max-w-[135px]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/brand-logo.png';
                }}
              />
            </Link>

            {/* Horizontal Nav Links: Minimalist, spacious, strictly single line */}
            <nav className={cn(
              "hidden lg:flex items-center gap-1.5 xl:gap-2.5 text-[13px] font-medium text-slate-700 transition-opacity duration-200",
              searchExpanded ? "opacity-40 xl:opacity-100" : "opacity-100"
            )}>
              {navDropdowns.map((nav) => {
                const isOpen = activeDropdown === nav.id;

                return (
                  <div
                    key={nav.id}
                    className="relative shrink-0"
                    onMouseEnter={() => setActiveDropdown(nav.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isOpen ? null : nav.id)}
                      className={cn(
                        'px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer group hover:text-[#0084D1] hover:bg-[#FAF9F5]',
                        isOpen ? 'text-[#0084D1] bg-[#FAF9F5] font-semibold' : 'text-slate-700'
                      )}
                    >
                      <span className="whitespace-nowrap">{nav.label}</span>
                      {nav.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                          {nav.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 text-slate-400 group-hover:text-[#0084D1] transition-transform duration-150 shrink-0',
                          isOpen && 'rotate-180 text-[#0084D1]'
                        )}
                      />
                    </button>

                    {/* Smooth Dropdown Card */}
                    {isOpen && (
                      <div className="absolute left-0 top-full pt-1.5 w-64 xl:w-72 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="bg-white rounded-2xl border border-[#EAE6DD] shadow-2xl p-2 space-y-0.5 backdrop-blur-xl">
                          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-[#EAE6DD]/60 mb-1 flex items-center justify-between">
                            <span>{nav.label} Services</span>
                            <Sparkles className="w-3 h-3 text-[#F97316]" />
                          </div>

                          {nav.items?.map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => setActiveDropdown(null)}
                              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-[#0084D1] hover:bg-[#FAF9F5] flex items-center justify-between group transition-colors"
                            >
                              <span className="line-clamp-1">{item.label}</span>
                              {item.badge ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#7C3AED] border border-[#EAE6DD] shrink-0 ml-2 whitespace-nowrap">
                                  {item.badge}
                                </span>
                              ) : (
                                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0084D1] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right: Expandable Search (Right-to-Left), Portal, & Talk to CA CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-4 relative">
            
            {/* ── Expandable Search Bar (Slides smoothly Right-to-Left in 60fps) ── */}
            <div ref={searchContainerRef} className="relative flex items-center">
              <motion.div
                initial={false}
                animate={{
                  width: searchExpanded
                    ? (isMobile ? Math.min(window.innerWidth - 32, 280) : (window.innerWidth < 1280 ? 270 : 320))
                    : 38,
                  borderColor: searchExpanded ? '#0084D1' : '#EAE6DD',
                  backgroundColor: searchExpanded ? '#ffffff' : '#FAF9F5',
                  boxShadow: searchExpanded
                    ? '0 10px 30px -5px rgba(0, 132, 209, 0.18), 0 4px 6px -4px rgba(0, 132, 209, 0.08)'
                    : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 30,
                  mass: 0.8,
                }}
                className={cn(
                  'relative flex items-center h-[38px] rounded-full border overflow-hidden transition-colors',
                  searchExpanded
                    ? 'ring-2 ring-[#0084D1]/20'
                    : 'hover:border-slate-300 hover:bg-slate-100'
                )}
              >
                {/* Search Icon / Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!searchExpanded) {
                      setSearchExpanded(true);
                      setTimeout(() => searchInputRef.current?.focus(), 120);
                    } else {
                      searchInputRef.current?.focus();
                    }
                  }}
                  className="w-[38px] h-[38px] flex items-center justify-center text-slate-600 hover:text-[#0084D1] shrink-0 cursor-pointer transition-colors focus:outline-none"
                  title={searchExpanded ? 'Search' : 'Search Services (Ctrl+K)'}
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-slate-600 hover:text-[#0084D1] transition-colors" />
                </button>

                {/* Smoothly expanded input field */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 250+ services (e.g. GST, Pvt Ltd)..."
                  tabIndex={searchExpanded ? 0 : -1}
                  className={cn(
                    'w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none pr-1 transition-opacity duration-200',
                    searchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  )}
                />

                {/* Close Button: Pops in smoothly on right side when open */}
                <AnimatePresence>
                  {searchExpanded && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchExpanded(false);
                        setSearchQuery('');
                      }}
                      className="w-7 h-7 mr-1.5 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer shrink-0 transition-colors"
                      title="Close Search (Esc)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Instant Search Dropdown Attached Underneath the Expanded Bar */}
              <AnimatePresence>
                {searchExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-2xl border border-[#EAE6DD] shadow-2xl p-2.5 z-50 origin-top-right"
                  >
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-[#EAE6DD]/60 mb-1">
                      <span>{searchQuery ? 'Matching Results' : 'Popular Searches'}</span>
                      <span>{filteredServices.length} Items</span>
                    </div>

                    {filteredServices.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No service matching "{searchQuery}"
                      </div>
                    ) : (
                      <div className="space-y-0.5 max-h-72 overflow-y-auto">
                        {filteredServices.map((srv) => (
                          <button
                            key={srv.slug}
                            type="button"
                            onClick={() => {
                              setSearchExpanded(false);
                              setSearchQuery('');
                              navigate(`/services/${srv.category}/${srv.slug}`);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9F5] flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-slate-800 group-hover:text-[#0084D1] transition-colors line-clamp-1">
                                {srv.name}
                              </p>
                              <p className="text-[10px] text-slate-400 capitalize">
                                {srv.category.replace(/-/g, ' ')}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-[#0084D1] tracking-widest font-mono shrink-0 ml-2">
                              ₹ * * * *
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#EAE6DD] mt-1 text-center">
                      <Link
                        to="/services"
                        onClick={() => {
                          setSearchExpanded(false);
                          setSearchQuery('');
                        }}
                        className="text-[11px] font-bold text-[#0084D1] hover:underline"
                      >
                        Browse Full 250+ Services Catalog →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Client Portal Link */}
            <Link
              to="/portal/login"
              className="hidden md:inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#FAF9F5] rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Portal</span>
            </Link>

            {/* Primary Action Button */}
            <Link
              to="/appointment"
              className="px-3.5 sm:px-4 py-2 text-xs rounded-xl btn-multicolor font-bold shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Talk to a CA</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>

            {/* Mobile Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-[#FAF9F5] rounded-xl shrink-0 cursor-pointer ml-0.5"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#EAE6DD] bg-white px-4 py-4 space-y-3 shadow-2xl max-h-[calc(100vh-3.5rem)] overflow-y-auto animate-in slide-in-from-top-3 duration-150">
          {/* Mobile Search Trigger */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setSearchExpanded(true);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-500 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search 250+ services...</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Mobile Categorical Accordions */}
          <div className="divide-y divide-[#EAE6DD]/60">
            {navDropdowns.map((nav) => {
              const isExpanded = mobileExpandedCat === nav.id;

              return (
                <div key={nav.id} className="py-1">
                  <button
                    type="button"
                    onClick={() => setMobileExpandedCat(isExpanded ? null : nav.id)}
                    className="w-full flex items-center justify-between py-2 px-2 text-xs font-bold text-slate-800 hover:text-[#0084D1] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      {nav.label}
                      {nav.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700">
                          {nav.badge}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-slate-400 transition-transform duration-150',
                        isExpanded && 'rotate-180 text-[#0084D1]'
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pl-3 pr-1 py-1 space-y-1 bg-[#FAF9F5]/70 rounded-xl mb-1">
                      {nav.items?.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 hover:text-[#0084D1] font-medium"
                        >
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-[#EAE6DD]">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Contact & Portal Footers */}
          <div className="pt-2 border-t border-[#EAE6DD] grid grid-cols-2 gap-2">
            <a
              href="tel:08069029999"
              className="py-2 px-3 text-center text-xs font-bold text-slate-800 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Call CA</span>
            </a>
            <a
              href="https://wa.me/918069029999?text=Hello%20ETaxwala%20Team"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 text-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/portal/login"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-center block text-xs font-bold text-slate-800 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl"
            >
              Client Portal
            </Link>
            <Link
              to="/crm/login"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-center block text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl"
            >
              Staff CRM
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}