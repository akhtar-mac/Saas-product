import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/seo';
import { Calendar, Clock, ArrowRight, Search, Tag, User } from 'lucide-react';

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
    category: 'Compliance', author: 'CS Rahul', date: '2024-07-20',
    readTime: '6 min', img: '/4.jpg', featured: false,
  },
  {
    id: 6, slug: 'pvt-ltd-vs-llp-vs-opc-comparison',
    title: 'Pvt Ltd vs LLP vs OPC: Which Business Structure is Right for You?',
    excerpt: 'Comparing India\'s three most popular business structures on compliance, taxation, liability, cost and scalability.',
    category: 'Company Registration', author: 'CA Ravan', date: '2024-07-15',
    readTime: '10 min', img: '/5.jpg', featured: false,
  },
];

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
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
      <section className="relative pt-32 pb-16 overflow-hidden" style={{ background: 'var(--navy)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="container-etaxwala relative text-center text-white">
          <p className="section-tag mx-auto" style={{ color: 'var(--gold-light)' }}>Knowledge Hub</p>
          <h1 className="section-title text-white mb-4">Business & Tax Insights</h1>
          <p className="section-subtitle mx-auto text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Expert articles from our CAs, Lawyers and Consultants to help you make better business decisions.
          </p>
          {/* Search */}
          <div className="max-w-lg mx-auto mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-800 outline-none"
              style={{ border: '1px solid var(--border)' }}
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Content */}
      <section className="section-white">
        <div className="container-etaxwala">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap"
                style={activeCategory === cat
                  ? { background: 'var(--navy)', color: 'white' }
                  : { background: 'var(--off-white)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured 2-col */}
          {activeCategory === 'All' && !search && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filtered.filter(p => p.featured).map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card group overflow-hidden">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = 'linear-gradient(135deg,#003A66,#004d87)'; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="absolute top-3 left-3 badge badge-navy">{post.category}</span>
                  </div>
                  <div className="p-5">
                    <h2 className="font-poppins font-bold text-slate-800 mb-2 group-hover:text-brand-navy transition-colors line-clamp-2" style={{ fontSize: '1rem' }}>
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.filter(p => !(activeCategory === 'All' && !search && p.featured)).map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card-flat group overflow-hidden rounded-2xl">
                <div className="relative h-44 overflow-hidden rounded-t-2xl">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.background = 'var(--off-white)'; (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="p-5">
                  <span className="badge badge-gold mb-3">{post.category}</span>
                  <h3 className="font-poppins font-semibold text-slate-800 mb-2 line-clamp-2 text-sm group-hover:text-brand-navy transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--gold-dark)' }}>
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