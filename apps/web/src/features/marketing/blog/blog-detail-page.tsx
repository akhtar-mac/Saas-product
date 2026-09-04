import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar, Clock, User, ArrowLeft, ArrowRight, Share2,
  CheckCircle2, MessageSquare, Send, Bookmark, ThumbsUp, ShieldCheck
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';

// Sample blog database with full content
const BLOG_POSTS: Record<string, {
  title: string;
  category: string;
  author: string;
  authorRole: string;
  authorBio: string;
  date: string;
  readTime: string;
  img: string;
  excerpt: string;
  content: {
    intro: string;
    sections: { heading: string; body: string[]; list?: string[] }[];
    conclusion: string;
  };
}> = {
  'how-to-register-private-limited-company-india': {
    title: 'How to Register a Private Limited Company in India (2024–2025 Guide)',
    category: 'Company Registration',
    author: 'CA Ravan',
    authorRole: 'Senior Partner & Corporate Law Specialist',
    authorBio: '15+ years experience in corporate restructuring, MCA filings, and statutory compliance across 10,000+ startups.',
    date: 'August 15, 2024',
    readTime: '8 min read',
    img: '/service-1.jpg',
    excerpt: 'A complete step-by-step statutory guide to incorporating your Private Limited company in India via MCA SPICe+ portal.',
    content: {
      intro: 'Starting a Private Limited Company is the gold standard for entrepreneurs looking to build high-growth, venture-funded businesses in India. In this comprehensive guide, our legal and CA team explains the entire step-by-step process under the MCA V3 portal.',
      sections: [
        {
          heading: '1. Basic Pre-Requisites for Incorporation',
          body: [
            'Before starting the filing process on the Ministry of Corporate Affairs (MCA) portal, ensure you satisfy the statutory minimums:',
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
            'The SPICe+ (SPICe Plus) integrated web form has significantly reduced incorporation turnaround time.',
            'Step A (Name Reservation): Submit RUN (Reserve Unique Name) or use SPICe+ Part A to propose up to 2 unique names.',
            'Step B (Incorporation & Allied Services): Draft the Memorandum of Association (e-MoA INC-33) and Articles of Association (e-AoA INC-34), alongside mandatory AGILE-PRO-S declarations for EPFO, ESIC, Professional Tax, GSTIN, and corporate bank account creation.',
          ],
        },
        {
          heading: '3. Documents Required Checklist',
          body: [
            'Keep high-resolution scanned copies of the following documents ready before initiating verification:',
          ],
          list: [
            'PAN Card & Aadhaar Card of all Indian Directors / Passport for foreign nationals',
            'Proof of Address: Bank Statement or Electricity Bill (less than 2 months old)',
            'Passport-sized photographs of all directors',
            'Registered Office Electricity Bill / Water Bill with Landlord NOC',
          ],
        },
        {
          heading: '4. Post-Incorporation Mandatory Compliances',
          body: [
            'Filing does not end at Certificate of Incorporation (COI). Within 180 days, you must file Form INC-20A (Commencement of Business) after depositing initial share capital in the newly opened corporate bank account.',
            'You must also appoint a statutory auditor within 30 days of incorporation by filing Form ADT-1.',
          ],
        },
      ],
      conclusion: 'Registering a company is simple when done with experts who understand MCA scrutiny patterns. At ETaxwala, our senior CAs ensure your application is approved in 7–10 days with zero rejection risk.',
    },
  },
  'gst-return-filing-guide-2024': {
    title: 'GST Return Filing: GSTR-1, GSTR-3B & GSTR-9 Explained',
    category: 'GST & Taxation',
    author: 'CA Meena',
    authorRole: 'Indirect Taxation Consultant',
    authorBio: 'Specialist in GST audits, ITC reconciliation, and departmental appeals for manufacturing and service sector SMEs.',
    date: 'August 10, 2024',
    readTime: '6 min read',
    img: '/2.jpg',
    excerpt: 'Understanding which GST returns to file, due dates, late fees, and how to avoid common mistakes that lead to notices.',
    content: {
      intro: 'Filing GST returns accurately and on time is essential for preserving Input Tax Credit (ITC) and maintaining a clean GST compliance score. Here is our complete practitioner guide.',
      sections: [
        {
          heading: '1. GSTR-1 vs GSTR-3B: The Core Difference',
          body: [
            'GSTR-1 is the statement of outward supplies (sales). It lists all B2B invoices, B2C summaries, debit/credit notes, and export invoices. It must be filed by the 11th of every month (or quarterly under QRMP scheme).',
            'GSTR-3B is the monthly self-assessed summary return where you declare summary turnover, claim eligible ITC reflected in GSTR-2B, and pay net tax liability by the 20th of each month.',
          ],
        },
        {
          heading: '2. Rule 36(4) & GSTR-2B ITC Matching',
          body: [
            'You cannot claim ITC unless it appears in your auto-populated GSTR-2B statement. Ensure your vendors file their GSTR-1 on time to avoid blocking your working capital.',
          ],
        },
      ],
      conclusion: 'Automated GST reconciliation ensures you never pay double tax or lose valuable input credits. Contact ETaxwala GST advisory desk for hassle-free monthly filings.',
    },
  },
};

const DEFAULT_POST = BLOG_POSTS['how-to-register-private-limited-company-india'];

export default function BlogDetailPage() {
  const { slug } = useParams();
  const post = (slug && BLOG_POSTS[slug]) ? BLOG_POSTS[slug] : DEFAULT_POST;

  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([
    { name: 'Sanjay Verma', date: '2 days ago', text: 'Very clear explanation of SPICe+ Part A and Part B. Saved me hours of research!' },
    { name: 'Anita Patil', date: '1 week ago', text: 'Does ETaxwala assist with the corporate bank account and INC-20A filing as well?' },
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
        url={`/blog/${slug || 'how-to-register-private-limited-company-india'}`}
        type="article"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          author: { '@type': 'Person', name: post.author },
          datePublished: post.date,
          publisher: { '@type': 'Organization', name: 'ETaxwala' },
        }}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-16 text-white relative">
        <div className="container-etaxwala max-w-4xl">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: 'Blog', href: '/blog' },
                { label: post.category },
              ]}
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
                {post.author.slice(0, 2)}
              </div>
              <span className="font-bold text-white">{post.author}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400" /> {post.date}</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {post.readTime}</span>
          </div>
        </div>
      </section>

      {/* Article Content Layout */}
      <section className="section bg-[#FAF9F5] py-14">
        <div className="container-etaxwala max-w-4xl">
          <div className="grid gap-12 lg:grid-cols-12">
            
            {/* Main Article Body */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Introduction Callout */}
              <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-700 text-sm sm:text-base leading-relaxed italic shadow-xs">
                "{post.content.intro}"
              </div>

              {/* Sections */}
              {post.content.sections.map((sec, i) => (
                <div key={i} className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {sec.heading}
                  </h2>
                  {sec.body.map((p, j) => (
                    <p key={j} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {sec.list && (
                    <ul className="space-y-2.5 pl-2">
                      {sec.list.map((item, k) => (
                        <li key={k} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#0084D1] shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Conclusion */}
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EAE6DD] shadow-xs space-y-2">
                <h3 className="font-bold text-base text-slate-900">Key Takeaway</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {post.content.conclusion}
                </p>
              </div>

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
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    aria-label="Share on WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Author Bio Card */}
              <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EAE6DD] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0084D1] to-[#7C3AED] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                  {post.author.slice(0, 2)}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="font-bold text-base text-slate-900">{post.author}</h4>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Verified Author
                    </span>
                  </div>
                  <p className="text-xs text-[#0084D1] font-semibold">{post.authorRole}</p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {post.authorBio}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#0084D1]" />
                  <h3 className="font-bold text-lg text-slate-900">
                    Discussion ({comments.length})
                  </h3>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-3 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EAE6DD] shadow-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      placeholder="Your Name *"
                      value={newComment.name}
                      onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                      required
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Ask a question or leave your thoughts..."
                    value={newComment.text}
                    onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="btn-multicolor px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Post Comment
                      </span>
                    </button>
                    {commentSuccess && (
                      <span className="text-xs font-semibold text-emerald-600">Comment posted!</span>
                    )}
                  </div>
                </form>

                {/* Comment List */}
                <div className="space-y-3">
                  {comments.map((c, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EAE6DD] space-y-1 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{c.name}</span>
                        <span className="text-[11px] text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar: CTA & Related Posts */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Service CTA Card */}
              <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EAE6DD] shadow-xs space-y-4 relative overflow-hidden">
                <div className="h-0.5 w-12 bg-multicolor rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-[#EAE6DD] text-[#7C3AED]">
                  Ready to Incorporate?
                </span>
                <h3 className="font-bold text-lg text-slate-900">Private Limited Incorporation in 7 Days</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Get 2 DSC, 2 DIN, SPICe+ MCA filing, MoA, AoA, PAN, TAN and corporate bank account @ ₹16,499.
                </p>
                <Link
                  to="/services/registration/private-limited"
                  className="w-full py-3.5 px-4 rounded-xl btn-multicolor font-bold text-xs flex items-center justify-center gap-2"
                >
                  <span>Start Incorporation</span> <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Consultation Card */}
              <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EAE6DD] shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Need Custom Legal Advisory?</h4>
                <p className="text-xs text-slate-600">
                  Book a free 1-on-1 consultation with our senior corporate attorneys.
                </p>
                <Link
                  to="/appointment"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084D1] hover:underline"
                >
                  <span>Book Free Consultation</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>
    </>
  );
}