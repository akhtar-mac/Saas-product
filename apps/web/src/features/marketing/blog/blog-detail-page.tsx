import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  MessageSquare,
  Send,
  ThumbsUp,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const FALLBACK_POSTS: Record<string, any> = {
  'how-to-register-private-limited-company-india': {
    title: 'How to Register a Private Limited Company in India (2026 Guide)',
    category: 'Company Registration',
    author: 'CA Corporate Desk',
    authorRole: 'Senior Partner & Corporate Law Specialist',
    authorBio:
      '15+ years experience in corporate restructuring, MCA filings, and statutory compliance across 10,000+ startups.',
    date: 'August 15, 2026',
    readTime: '8 min read',
    img: '/service-1.jpg',
    excerpt:
      'A complete step-by-step statutory guide to incorporating your Private Limited company in India via MCA SPICe+ portal.',
    contentHtml: null,
    content: {
      intro:
        'Starting a Private Limited Company is the gold standard for entrepreneurs looking to build high-growth, venture-funded businesses in India. In this comprehensive guide, our legal and CA team explains the entire step-by-step process under the MCA V3 portal.',
      sections: [
        {
          heading: '1. Basic Pre-Requisites for Incorporation',
          body: [
            'Before starting the filing process on the Ministry of Corporate Affairs (MCA) portal, ensure you satisfy statutory minimums:',
          ],
          list: [
            'Minimum 2 Directors (at least 1 must be an Indian Resident who stayed 182+ days in India)',
            'Minimum 2 Shareholders (can be the same as the Directors)',
            'Digital Signature Certificates (DSC Class 3) for all proposed directors',
            'Registered Office Address in India with valid utility bill and NOC from property owner',
          ],
        },
        {
          heading: '2. Step-by-Step Filing Workflow (SPICe+ Part A & B)',
          body: [
            'The SPICe+ integrated web form has significantly reduced incorporation turnaround time.',
            'Step A (Name Reservation): Submit RUN (Reserve Unique Name) or use SPICe+ Part A to propose up to 2 unique names.',
            'Step B (Incorporation & Allied Services): Draft the Memorandum of Association (e-MoA INC-33) and Articles of Association (e-AoA INC-34), alongside mandatory AGILE-PRO-S declarations.',
          ],
        },
      ],
      conclusion:
        'Registering a company is simple when done with experts who understand MCA scrutiny patterns. At ETaxwala, our senior CAs ensure your application is approved in 7–10 days with zero rejection risk.',
    },
  },
};

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [dbPost, setDbPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fallback =
    slug && FALLBACK_POSTS[slug]
      ? FALLBACK_POSTS[slug]
      : FALLBACK_POSTS['how-to-register-private-limited-company-india'];

  useEffect(() => {
    let isMounted = true;
    async function fetchBlogDetail() {
      if (!slug) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/v1/marketing/blogs/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          if (isMounted) setDbPost(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch blog details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchBlogDetail();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const post = dbPost
    ? {
        title: dbPost.title,
        category: dbPost.category || 'Compliance',
        author: 'CA Taxwala Editorial Desk',
        authorRole: 'Senior Taxation & Statutory Advisory Team',
        authorBio:
          'Specialist practicing team of Chartered Accountants, CSs, and Corporate Advocates.',
        date: dbPost.date
          ? new Date(dbPost.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent Update',
        readTime: '6 min read',
        excerpt:
          dbPost.meta_description ||
          'Expert statutory advisory guide and regulatory compliance steps.',
        contentHtml: dbPost.content,
        content: null,
      }
    : fallback;

  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([
    {
      name: 'Sanjay Verma',
      date: '2 days ago',
      text: 'Very clear explanation of compliance requirements. Saved me hours of research!',
    },
    {
      name: 'Anita Patil',
      date: '1 week ago',
      text: 'Does ETaxwala assist with the corporate bank account and statutory filings as well?',
    },
  ]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });
  const [commentSuccess, setCommentSuccess] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((l) => l + 1);
      setHasLiked(true);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.text.trim()) return;
    setComments((prev) => [
      { name: newComment.name, date: 'Just now', text: newComment.text },
      ...prev,
    ]);
    setNewComment({ name: '', text: '' });
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  return (
    <>
      <SEO
        title={`${post.title} | ETaxwala Insights`}
        description={post.excerpt}
        url={`/blog/${slug || 'article'}`}
        type="article"
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-16 text-white relative">
        <div className="container-etaxwala max-w-4xl">
          <div className="mb-4">
            <Breadcrumbs
              items={[{ label: 'Blog', href: '/blog' }, { label: post.category }]}
              className="text-slate-400"
            />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
            {post.category}
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Author & Meta Row */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                CA
              </div>
              <span className="font-bold text-white">{post.author}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" /> {post.date}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" /> {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content Layout */}
      <section className="section bg-[#FAF9F5] py-14">
        <div className="container-etaxwala max-w-4xl">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Main Article Body */}
            <div className="lg:col-span-8 space-y-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0084D1]" />
                  <span className="ml-3 text-sm font-semibold text-slate-600">
                    Loading article content...
                  </span>
                </div>
              ) : post.contentHtml ? (
                <div
                  className="bg-white p-8 rounded-2xl border border-[#EAE6DD] shadow-xs text-slate-800 leading-relaxed space-y-4 article-content"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />
              ) : post.content ? (
                <>
                  <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-700 text-sm sm:text-base leading-relaxed italic shadow-xs">
                    "{post.content.intro}"
                  </div>

                  {post.content.sections.map((sec: any, i: number) => (
                    <div key={i} className="space-y-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {sec.heading}
                      </h2>
                      {sec.body.map((p: string, j: number) => (
                        <p key={j} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                          {p}
                        </p>
                      ))}
                      {sec.list && (
                        <ul className="space-y-2.5 pl-2">
                          {sec.list.map((item: string, k: number) => (
                            <li key={k} className="flex items-start gap-2.5 text-sm text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-[#0084D1] shrink-0 mt-1" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EAE6DD] shadow-xs space-y-2">
                    <h3 className="font-bold text-base text-slate-900">Key Takeaway</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {post.content.conclusion}
                    </p>
                  </div>
                </>
              ) : null}

              {/* Action / Like Bar */}
              <div className="flex items-center justify-between py-4 border-y border-[#EAE6DD]">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    hasLiked
                      ? 'bg-blue-50 text-[#0084D1] border border-blue-200'
                      : 'hover:bg-white text-slate-700 border border-transparent'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({likes})</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Share:</span>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: post.title, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Author Bio Card */}
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EAE6DD] flex items-start gap-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#0084D1] text-white flex items-center justify-center font-bold text-xl shrink-0">
                  CA
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{post.author}</h4>
                  <p className="text-xs text-[#0084D1] font-semibold mb-2">{post.authorRole}</p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {post.authorBio}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0084D1]" />
                    Discussion ({comments.length})
                  </h3>
                </div>

                {/* Comment Form */}
                <form
                  onSubmit={handleCommentSubmit}
                  className="p-5 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ask a Question or Leave a Remark
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={newComment.name}
                      onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                      required
                      className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0084D1]"
                    />
                  </div>
                  <textarea
                    placeholder="Write your query or insights here..."
                    rows={3}
                    value={newComment.text}
                    onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0084D1]"
                  />
                  <div className="flex items-center justify-between pt-1">
                    {commentSuccess && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Posted successfully!
                      </span>
                    )}
                    <button
                      type="submit"
                      className="btn-multicolor btn-sm ml-auto text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Post Comment
                    </button>
                  </div>
                </form>

                {/* Comment List */}
                <div className="space-y-3">
                  {comments.map((c, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white border border-[#EAE6DD] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar CTA & Consultation */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Consultation Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-[#0084D1]/20 rounded-full blur-xl pointer-events-none" />

                  <span className="badge badge-gold mb-4">Dedicated CA Support</span>
                  <h3 className="text-lg font-bold mb-2">Need Expert Help With Your Business?</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    Connect with our corporate advisors today for end-to-end guidance, guaranteed
                    compliance, and zero penalties.
                  </p>

                  <Link
                    to="/contact"
                    className="btn-multicolor w-full justify-center text-xs py-2.5"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Schedule Free Consultation <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% Confidentiality &amp; MCA Verified Process</span>
                  </div>
                </div>

                {/* Back to Knowledge Hub */}
                <Link
                  to="/blog"
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0084D1] transition-colors p-4 rounded-2xl bg-white border border-[#EAE6DD] justify-center shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Knowledge Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
