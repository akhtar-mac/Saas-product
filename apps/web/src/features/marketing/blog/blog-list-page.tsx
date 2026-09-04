import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/seo';
import { Calendar, Clock, ArrowRight, Search, Tag, User, Sparkles } from 'lucide-react';

const categories = ['All', 'Company Registration', 'GST & Taxation', 'ITR Filing', 'Trademark & IP', 'Business Tips', 'Compliance', 'Digital Services'];

const posts = [
  {
    id: 1, slug: 'how-to-register-private-limited-company-india',
    title: 'How to Register a Private Limited Company in India (2024 Guide)',
    excerpt: 'A complete step-by-step guide to registering your Pvt Ltd company — from DSC to Incorporation Certificate. Includes timelines, documents, and costs.',
    category: 'Company Registration', author: 'CA Ravan', date: '2024-08-15',
    readTime: '8 min', img: '/service-1.jpg', featured: true,
  },
  {
    id: 2, slug: 'gst-return-filing-guide-2024',
    title: 'GST Return Filing: GSTR-1, GSTR-3B & GSTR-9 Explained',
    excerpt: 'Understanding which GST returns to file, due dates, late fees, and how to avoid common mistakes that lead to penalties.',
    category: 'GST & Taxation', author: 'CA Meena', date: '2024-08-10',
    readTime: '6 min', img: '/2.jpg', featured: true,
  },
  {
    id: 3, slug: 'itr-1-vs-itr-2-which-to-file',
    title: 'ITR-1 vs ITR-2 vs ITR-3: Which Income Tax Return Form Should You File?',
    excerpt: 'Don\'t file the wrong ITR form! We break down which form is right for salaried employees, business owners, and professionals.',
    category: 'ITR Filing', author: 'CA Ravan', date: '2024-08-05',
    readTime: '5 min', img: '/eligibility.jpg', featured: false,
  },
  {
    id: 4, slug: 'trademark-registration-india-complete-guide',
    title: 'Trademark Registration in India: Complete Guide (Cost, Process & Timeline)',
    excerpt: 'Protect your brand with a trademark. Learn the registration process, class selection, government fees, and how long it takes.',
    category: 'Trademark & IP', author: 'Adv. Priya', date: '2024-07-28',
    readTime: '7 min', img: '/3.jpg', featured: false,
  },
  {
    id: 5, slug: 'msme-udyam-registration-benefits',
    title: 'MSME / Udyam Registration: 15 Benefits Every Business Should Know',
    excerpt: 'Udyam registration unlocks bank loans at lower rates, government subsidies, priority sector benefits and more. Here\'s everything you need.',
    category: 'Business Tips', author: 'Adv. Priya', date: '2024-07-20',
    readTime: '5 min', img: '/service-1.jpg', featured: false,
  },
  {
    id: 6, slug: 'startup-india-tax-exemption-80iac',
    title: 'Section 80-IAC: How Startups Get 3-Year 100% Tax Holiday in India',
    excerpt: 'Eligibility criteria, DPIIT recognition process, Inter-Ministerial Board approval, and key documents needed for the 3-year tax exemption.',
    category: 'GST & Taxation', author: 'CA Meena', date: '2024-07-15',
    readTime: '6 min', img: '/2.jpg', featured: false,
  },
];

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = posts.filter(post => {
    const matchCat = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch = !search ||
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
            Expert articles from our practicing CAs, CS, Advocates and Financial Analysts to empower your business decisions.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-sm text-slate-800 border border-[#EAE6DD] shadow-xs outline-none focus:ring-2 focus:ring-[#0084D1]/30 transition-all"
              placeholder="Search guides, regulations, tax tips..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 bg-[#FAF9F5]">
        <div className="container-etaxwala">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2.5 mb-10 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(cat => (
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

          {/* Featured 2-col */}
          {activeCategory === 'All' && !search && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filtered.filter(p => p.featured).map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="bg-[#FFFDF9] rounded-3xl border border-[#EAE6DD] shadow-xs hover:border-[#7C3AED]/30 hover:shadow-md transition-all group overflow-hidden block">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = 'linear-gradient(135deg,#0084D1,#7C3AED)'; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="absolute top-3 left-3 badge badge-navy">{post.category}</span>
                  </div>
                  <div className="p-6">
                    <h2 className="font-bold text-slate-900 mb-2 group-hover:text-[#0084D1] transition-colors line-clamp-2 text-lg">
                      {post.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-[#0084D1]" />{post.author}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#7C3AED]" />{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#F97316]" />{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.filter(p => !(activeCategory === 'All' && !search && p.featured)).map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="bg-[#FFFDF9] rounded-2xl border border-[#EAE6DD] shadow-xs hover:border-[#7C3AED]/30 hover:shadow-md transition-all group overflow-hidden block">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = '#FAF9F5'; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="p-5">
                  <span className="badge badge-gold mb-3">{post.category}</span>
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-sm group-hover:text-[#0084D1] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
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
        </div>
      </section>
    </>
  );
}