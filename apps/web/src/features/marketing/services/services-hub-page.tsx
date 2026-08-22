import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, FileBadge, Receipt, ClipboardCheck, Lightbulb, Sparkles, FileText, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import SEO from '@/components/seo';
import { services, categories, formatPrice, getFeaturedServices } from '@/lib/constants/services';

const iconMap: Record<string, any> = {
  Building2, FileBadge, Receipt, ClipboardCheck, Lightbulb, Sparkles, FileText,
};

export default function ServicesHubPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const featured = getFeaturedServices();

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.inclusions.some((i) => i.toLowerCase().includes(search.toLowerCase()));
      const matchCat = activeCategory === 'all' || s.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  return (
    <>
      <SEO
        title="All Services - Business Registration, Tax, Audit, Marketing"
        description="Browse 250+ business services with transparent pricing. Company registration, ITR filing, GST returns, audit, trademark, web development, marketing & more."
        keywords="business services, company registration, ITR filing, GST returns, audit compliance, trademark, web development, marketing"
        url="/services"
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-800 py-16 text-white">
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="container-etaxwala relative z-10">
          <h1 className="text-4xl font-bold lg:text-5xl">Our Services</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            250+ services to start, manage, and grow your business. Transparent pricing, expert execution, real-time tracking.
          </p>
        </div>
      </section>

      {/* Featured services */}
      {featured.length > 0 && !search && activeCategory === 'all' && (
        <section className="border-b border-slate-200 bg-slate-50 py-12">
          <div className="container-etaxwala">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-slate-900">Popular Services</h2>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.slice(0, 8).map((s) => (
                <Link key={s.id} to={`/services/${s.category}/${s.slug}`} className="card group p-5 hover:border-accent">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary">{s.name}</h3>
                  <p className="mt-2 text-lg font-bold text-primary">{formatPrice(s.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search + Categories */}
      <section className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 py-4 backdrop-blur">
        <div className="container-etaxwala">
          {/* Search bar */}
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 250+ services... (e.g. GST, ITR, Trademark, Website)"
              className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Category pills */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              All Services ({services.length})
            </button>
            {categories.map((cat) => {
              const count = services.filter((s) => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${activeCategory === cat.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section">
        <div className="container-etaxwala">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-slate-500">No services found for "{search}"</p>
              <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="btn-outline mt-4">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-slate-500">Showing {filtered.length} services</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s) => {
                  const cat = categories.find((c) => c.id === s.category);
                  return (
                    <Link
                      key={s.id}
                      to={`/services/${s.category}/${s.slug}`}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg"
                    >
                      {s.isFeatured && (
                        <span className="mb-2 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Popular</span>
                      )}
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary">{s.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{cat?.name}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-500">Starting from</span>
                          <p className="text-lg font-bold text-primary">{formatPrice(s.price)}</p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-accent group-hover:text-white">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-12">
        <div className="container-etaxwala text-center">
          <h2 className="text-2xl font-bold text-white">Can't find what you're looking for?</h2>
          <p className="mt-2 text-white/90">We offer 250+ services. Talk to our experts.</p>
          <Link to="/appointment" className="mt-6 inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-accent shadow-lg hover:bg-slate-50">
            Book Free Consultation
          </Link>
        </div>
      </section>
    </>
  );
}