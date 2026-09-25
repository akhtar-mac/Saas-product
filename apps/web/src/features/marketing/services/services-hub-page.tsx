import { useState, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  Search,
  Building2,
  FileBadge,
  Receipt,
  ClipboardCheck,
  Lightbulb,
  Sparkles,
  FileText,
  ArrowRight,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  Check,
  Clock,
  ShieldCheck,
  X,
  HelpCircle,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import CtaBanner from '@/components/cta-banner';
import QuickEnquiryModal from '@/components/quick-enquiry-modal';
import {
  services,
  categories,
  formatPrice,
  getFeaturedServices,
  getServiceBySlug,
} from '@/lib/constants/services';

export default function ServicesHubPage() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  // If the param is actually a direct service slug, route directly to its detail page
  const directService = useMemo(
    () => (categorySlug ? getServiceBySlug(categorySlug) : null),
    [categorySlug]
  );
  if (directService) {
    const catSlug = directService.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return <Navigate to={`/services/${catSlug}/${directService.slug}`} replace />;
  }

  const [selectedEnquiryService, setSelectedEnquiryService] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(categorySlug || 'all');
  const [sortBy, setSortBy] = useState<'recommended' | 'name-asc' | 'name-desc'>('recommended');

  const featured = getFeaturedServices();

  const filtered = useMemo(() => {
    return services
      .filter((s) => {
        const matchSearch =
          !search ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.inclusions.some((i) => i.toLowerCase().includes(search.toLowerCase())) ||
          s.category.toLowerCase().includes(search.toLowerCase());

        const matchCat =
          activeCategory === 'all' || s.category.toLowerCase() === activeCategory.toLowerCase();

        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [search, activeCategory, sortBy]);

  return (
    <>
      <SEO
        title="Explore 250+ Legal, Tax, Registration & Compliance Services — ETaxwala"
        description="Browse India's most comprehensive catalog of business services: Company Registration, GST Returns, ITR Filing, Trademark, Audits & Web Solutions."
        keywords="business services, company registration, ITR filing, GST returns, audit compliance, trademark, web development, marketing"
        url="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'ETaxwala Business Services Catalog',
          description:
            'Full catalog of 250+ statutory business registration, taxation, and legal services.',
        }}
      />

      {/* Hero Section with Multicolour Accent & Signature Grid Pattern */}
      <section className="relative bg-etax-puma-soft py-14 lg:py-20 border-b border-[#EAE6DD] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />

        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'All Services' }]} />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> 250+ Professional Practice
              Solutions
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Comprehensive <span className="text-multicolor">Corporate &amp; Tax Solutions</span>
            </h1>
            <p className="mt-3.5 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
              From same-day private limited name approvals to multi-crore tax audit defense. 100%
              CA-reviewed workflows with guaranteed statutory compliance.
            </p>

            {/* Quick Search Bar */}
            <div className="mt-8 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services (e.g. Pvt Ltd, GST, Trademark, ITR, Audit)..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[#EAE6DD] text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] shadow-xs transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Quick Filter Pills */}
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  activeCategory === 'all'
                    ? 'bg-white border-[#7C3AED]/40 text-multicolor shadow-sm'
                    : 'bg-white border border-[#EAE6DD] text-slate-600 hover:bg-[#FAF9F5]'
                }`}
              >
                All Categories ({services.length})
              </button>
              {categories.slice(0, 5).map((c) => {
                const isSelected = activeCategory.toLowerCase() === c.id.toLowerCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white border-[#7C3AED]/40 text-multicolor shadow-sm'
                        : 'bg-white border-[#EAE6DD] text-slate-600 hover:bg-[#FAF9F5] hover:border-[#7C3AED]/30'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Popular Practices Row */}
      {featured.length > 0 && !search && activeCategory === 'all' && (
        <section className="border-b border-[#EAE6DD] bg-white py-10">
          <div className="container-etaxwala">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#7C3AED]" />
                <h2 className="text-base font-extrabold text-slate-900">Featured Practice Areas</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Most Requested by Startups</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedEnquiryService(s.name)}
                  className="p-5 rounded-2xl border border-[#EAE6DD] bg-[#FAF9F5] hover:bg-white hover:border-[#7C3AED]/40 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#EAE6DD] text-[#7C3AED]">
                      {s.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#0084D1] transition-colors mt-2.5 line-clamp-1">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {s.inclusions[0] || 'Complete legal drafting and statutory portal filing'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EAE6DD] flex items-center justify-between text-xs font-bold text-[#0084D1]">
                    <span>Explore Service</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog with Filters */}
      <section className="section bg-[#FAF9F5] py-12 lg:py-16">
        <div className="container-etaxwala">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar Filter Controls */}
            <aside className="lg:w-64 shrink-0 space-y-6">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DD] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-3.5">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#7C3AED]" /> Practice Filters
                  </span>
                  {(activeCategory !== 'all' || search) && (
                    <button
                      onClick={() => {
                        setActiveCategory('all');
                        setSearch('');
                      }}
                      className="text-[11px] font-bold text-[#0084D1] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Category Filter List */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Categories
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        activeCategory === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <span>All Verticals</span>
                      <span
                        className={`text-[10px] ${activeCategory === 'all' ? 'text-slate-300' : 'text-slate-400'}`}
                      >
                        {services.length}
                      </span>
                    </button>
                    {categories.map((c) => {
                      const count = services.filter(
                        (s) => s.category.toLowerCase() === c.id.toLowerCase()
                      ).length;
                      const isSelected = activeCategory.toLowerCase() === c.id.toLowerCase();
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveCategory(c.id)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-[#FAF9F5]'
                          }`}
                        >
                          <span className="truncate pr-2">{c.name}</span>
                          <span
                            className={`text-[10px] shrink-0 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="border-t border-[#EAE6DD] pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-xl border border-[#EAE6DD] bg-[#FAF9F5] text-xs px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                  >
                    <option value="recommended">Recommended Order</option>
                    <option value="name-asc">Name (A – Z)</option>
                    <option value="name-desc">Name (Z – A)</option>
                  </select>
                </div>

                {/* Direct Consultation Helpdesk Box */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD] text-center space-y-2">
                  <p className="text-xs font-bold text-slate-900">Need Custom Advisory?</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Speak directly with a Senior CA for bespoke corporate structuring.
                  </p>
                  <Link
                    to="/appointment"
                    className="mt-2 block w-full py-2 rounded-lg btn-multicolor text-xs font-bold shadow-xs"
                  >
                    Book CA Call
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right: Service Cards Grid */}
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold text-slate-500">
                  Showing <strong className="text-slate-900">{filtered.length}</strong> available
                  services
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE6DD] space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No matching services found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching for broader terms like "Company", "Tax", "GST", "Trademark" or
                    reset your category filter.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearch('');
                    }}
                    className="px-5 py-2.5 rounded-xl btn-multicolor text-white font-bold text-xs shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-3xl p-6 border border-[#EAE6DD] shadow-xs hover:border-[#7C3AED]/40 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-[#7C3AED]">
                            {s.category}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" /> SLA Guaranteed
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0084D1] transition-colors line-clamp-1">
                          {s.name}
                        </h3>

                        <ul className="space-y-1.5 text-xs text-slate-500">
                          {s.inclusions.slice(0, 3).map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                              <span className="truncate">{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#EAE6DD] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Pricing
                          </span>
                          <span className="text-xs font-bold text-slate-800">Custom Quote</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedEnquiryService(s.name)}
                          className="btn-panda"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5 btn-panda-icon" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Signature Multicolour Outline CTA Banner */}
      <CtaBanner
        title="Can't find the exact service you're looking for?"
        subtitle="Speak directly with our senior Chartered Accountants and Legal Consultants. We handle customized corporate and taxation cases nationwide."
        primaryButtonText="Book Free Consultation"
        primaryButtonLink="/appointment"
        secondaryButtonText="Call Helpline: 080-6902-9999"
        secondaryIsPhone={true}
        phoneNumber="080-6902-9999"
      />

      <QuickEnquiryModal
        isOpen={!!selectedEnquiryService}
        onClose={() => setSelectedEnquiryService(null)}
        serviceTitle={selectedEnquiryService || ''}
      />
    </>
  );
}
