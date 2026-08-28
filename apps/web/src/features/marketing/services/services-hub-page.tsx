import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Building2, FileBadge, Receipt, ClipboardCheck,
  Lightbulb, Sparkles, FileText, ArrowRight, TrendingUp,
  Filter, SlidersHorizontal, Check, Clock, ShieldCheck
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import { services, categories, formatPrice, getFeaturedServices } from '@/lib/constants/services';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices' },
  { id: 'under-2k', label: 'Under ₹2,000', min: 0, max: 2000 },
  { id: '2k-10k', label: '₹2,000 – ₹10,000', min: 2000, max: 10000 },
  { id: 'above-10k', label: 'Above ₹10,000', min: 10000, max: Infinity },
];

export default function ServicesHubPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high'>('recommended');

  const featured = getFeaturedServices();

  const filtered = useMemo(() => {
    return services
      .filter((s) => {
        const matchSearch =
          !search ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.inclusions.some((i) => i.toLowerCase().includes(search.toLowerCase())) ||
          s.category.toLowerCase().includes(search.toLowerCase());

        const matchCat = activeCategory === 'all' || s.category === activeCategory;

        let matchPrice = true;
        const selectedRange = PRICE_RANGES.find((p) => p.id === priceRange);
        if (selectedRange && selectedRange.id !== 'all') {
          matchPrice = s.price >= (selectedRange.min || 0) && s.price <= (selectedRange.max || Infinity);
        }

        return matchSearch && matchCat && matchPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0;
      });
  }, [search, activeCategory, priceRange, sortBy]);

  return (
    <>
      <SEO
        title="Explore 250+ Legal, Tax, Registration & Compliance Services"
        description="Browse India's most comprehensive catalog of business services: Company Registration, GST Returns, ITR Filing, Trademark, Audits & Web Solutions."
        keywords="business services, company registration, ITR filing, GST returns, audit compliance, trademark, web development, marketing"
        url="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'ETaxwala Business Services Catalog',
          description: 'Full catalog of 250+ statutory business registration, taxation, and legal services.',
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-16 text-white relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'Services' }]} className="text-slate-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 250+ Professional Practice Solutions
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Comprehensive Corporate &amp; Tax Solutions
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-slate-300">
            From single-day name approvals to multi-crore audit representation. Transparent pricing with end-to-end digital tracking.
          </p>

          {/* Search bar inside hero */}
          <div className="mt-8 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service name (e.g. Pvt Ltd, GST, Trademark, ITR)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Featured Services Quick Row */}
      {featured.length > 0 && !search && activeCategory === 'all' && priceRange === 'all' && (
        <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10">
          <div className="container-etaxwala">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Most Popular Practice Verticals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map((s) => (
                <Link
                  key={s.id}
                  to={`/services/${s.category}/${s.slug}`}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {s.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors mt-1 line-clamp-1">
                    {s.name}
                  </h3>
                  <p className="mt-3 text-sm font-extrabold text-slate-900 dark:text-slate-100">{formatPrice(s.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog with Filters */}
      <section className="section bg-slate-50 dark:bg-slate-950 py-12">
        <div className="container-etaxwala">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar Filter Controls (1.6.5, 1.6.6) */}
            <aside className="lg:w-64 shrink-0 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" /> Filters
                  </span>
                  {(activeCategory !== 'all' || priceRange !== 'all' || search) && (
                    <button
                      onClick={() => { setActiveCategory('all'); setPriceRange('all'); setSearch(''); }}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* 1. Category Filter Dropdown / List (1.6.6) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Category
                  </label>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        activeCategory === 'all'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>All Categories</span>
                      <span className="text-[10px] text-slate-400">{services.length}</span>
                    </button>
                    {categories.map((c) => {
                      const count = services.filter((s) => s.category === c.id).length;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveCategory(c.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                            activeCategory === c.id
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate pr-2">{c.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Price Range Filter (1.6.5) */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Price Range
                  </label>
                  <div className="space-y-1.5">
                    {PRICE_RANGES.map((pr) => (
                      <label
                        key={pr.id}
                        className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <input
                          type="radio"
                          name="price-filter"
                          checked={priceRange === pr.id}
                          onChange={() => setPriceRange(pr.id)}
                          className="text-blue-600 focus:ring-blue-500 rounded-full"
                        />
                        <span>{pr.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Sort Filter */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

              </div>
            </aside>

            {/* Right: Service Cards Grid */}
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold text-slate-500">
                  Showing <strong className="text-slate-900 dark:text-slate-100">{filtered.length}</strong> services
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-300">No matching services found</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing your search query or selecting a different price range filter.
                  </p>
                  <button
                    onClick={() => { setActiveCategory('all'); setPriceRange('all'); setSearch(''); }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {s.category}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" /> 7-10 Days
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {s.name}
                        </h3>

                        <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          {s.inclusions.slice(0, 2).map((inc, i) => (
                            <li key={i} className="flex items-start gap-1.5 truncate">
                              <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                              <span className="truncate">{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">All-Inclusive</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">{formatPrice(s.price)}</span>
                        </div>

                        <Link
                          to={`/services/${s.category}/${s.slug}`}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 text-slate-700 dark:text-slate-300 group-hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <span>Details</span> <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>

          </div>
        </div>
      </section>
    </>
  );
}