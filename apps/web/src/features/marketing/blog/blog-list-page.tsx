import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/seo';
import { Calendar, Clock, ArrowRight, Search, User, Sparkles, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const categories = [
  'All',
  'Company Registration',
  'Finance Business',
  'GST & Taxation',
  'ITR Filing',
  'Trademark & IP',
  'Compliance',
  'Digital Services',
];

const fallbackPosts = [
  {
    id: 1,
    slug: 'how-to-register-private-limited-company-india',
    title: 'How to Register a Private Limited Company in India (2026 Guide)',
    excerpt:
      'A complete step-by-step guide to registering your Pvt Ltd company — from DSC to Incorporation Certificate. Includes timelines, documents, and costs.',
    category: 'Company Registration',
    author: 'CA Corporate Desk',
    date: '2026-08-15',
    readTime: '8 min',
    img: '/service-1.jpg',
    featured: true,
  },
  {
    id: 2,
    slug: 'gst-return-filing-guide-2024',
    title: 'GST Return Filing: GSTR-1, GSTR-3B & GSTR-9 Explained',
    excerpt:
      'Understanding which GST returns to file, due dates, late fees, and how to avoid common mistakes that lead to penalties.',
    category: 'GST & Taxation',
    author: 'Tax Team',
    date: '2026-08-10',
    readTime: '6 min',
    img: '/2.jpg',
    featured: true,
  },
];

export default function BlogListPage() {
  const [posts, setPosts] = useState<any[]>(fallbackPosts);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchBlogs() {
      try {
        const res = await fetch(`${API_BASE}/v1/marketing/blogs?limit=50`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((b: any, index: number) => ({
            id: b.id,
            slug: b.slug || `article-${b.id}`,
            title: b.title,
            excerpt:
              b.meta_description ||
              'Expert statutory analysis, regulatory updates, and corporate compliance walkthrough.',
            category: b.category || 'Compliance',
            author: 'CA Taxwala Desk',
            date: b.date || b.created_at || new Date().toISOString(),
            readTime: '6 min',
            img: b.thumbnail
              ? b.thumbnail.startsWith('http')
                ? b.thumbnail
                : `${API_BASE}${b.thumbnail}`
              : `/service-1.jpg`,
            featured: index < 2,
          }));
          if (isMounted) {
            setPosts(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load live blogs:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = posts.filter((post) => {
    const matchCat =
      activeCategory === 'All' ||
      (post.category && post.category.toLowerCase().includes(activeCategory.toLowerCase()));
    const matchSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <SEO
        title="ETaxwala Blog | Business, Tax & Compliance Insights"
        description="Expert articles on company registration, GST, ITR filing, trademark, compliance, and business growth tips from India's top CAs and lawyers."
        url="/blog"
      />

      {/* Hero */}
      <section className="relative pt-28 pb-14 overflow-hidden bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-br from-[#0084D1]/10 via-[#7C3AED]/10 to-[#F97316]/10 blur-3xl rounded-full" />
        </div>

        <div className="container-etaxwala relative text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] shadow-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#0084D1]" />
            <span className="text-xs font-bold text-slate-700">Knowledge Hub &amp; Insights</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Business, Tax &amp; Legal <span className="text-multicolor">Insights</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Expert articles from our practicing CAs, CS, Advocates and Financial Analysts to empower
            your business decisions.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-sm text-slate-800 border border-[#EAE6DD] shadow-xs outline-none focus:ring-2 focus:ring-[#0084D1]/30 transition-all"
              placeholder="Search guides, regulations, tax tips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 bg-[#FAF9F5]">
        <div className="container-etaxwala">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2.5 mb-10 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'btn-multicolor shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-[#FAF9F5] border border-[#EAE6DD]'
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#0084D1]" />
              <span className="ml-3 text-sm font-semibold text-slate-600">
                Loading live articles...
              </span>
            </div>
          ) : (
            <>
              {/* Featured 2-col */}
              {activeCategory === 'All' && !search && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {filtered
                    .filter((p) => p.featured)
                    .map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="bg-[#FFFDF9] rounded-3xl border border-[#EAE6DD] shadow-xs hover:border-[#7C3AED]/30 hover:shadow-md transition-all group overflow-hidden block"
                      >
                        <div className="relative h-52 overflow-hidden bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-900 flex items-center justify-center p-6 text-white text-center">
                          <span className="font-bold text-lg opacity-80">{post.title}</span>
                          <span className="absolute top-3 left-3 badge badge-navy">
                            {post.category}
                          </span>
                        </div>
                        <div className="p-6">
                          <h2 className="font-bold text-slate-900 mb-2 group-hover:text-[#0084D1] transition-colors line-clamp-2 text-lg">
                            {post.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-[#0084D1]" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-[#7C3AED]" />
                              {new Date(post.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#F97316]" />
                              {post.readTime}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered
                  .filter((p) => !(activeCategory === 'All' && !search && p.featured))
                  .map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="bg-[#FFFDF9] rounded-2xl border border-[#EAE6DD] shadow-xs hover:border-[#7C3AED]/30 hover:shadow-md transition-all group overflow-hidden block"
                    >
                      <div className="p-5">
                        <span className="badge badge-gold mb-3">{post.category}</span>
                        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-sm group-hover:text-[#0084D1] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-3 border-t border-slate-100">
                          <span>
                            {new Date(post.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-[#0084D1] group-hover:translate-x-1 transition-transform">
                            Read <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-lg mb-2">No articles found</p>
                  <p className="text-sm">Try a different category or search term</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
