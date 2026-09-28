import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Phone, MessageCircle } from 'lucide-react';
import SEO from '@/components/seo';
import { staggerContainer, staggerItem } from '@/lib/animations';

const quickLinks = [
  { label: 'Home', href: '/', desc: 'Go back to main page' },
  { label: 'All Services', href: '/services', desc: 'Browse 250+ business services' },
  { label: 'ITR Filing', href: '/itr-filing', desc: 'File your income tax return' },
  { label: 'Book Appointment', href: '/appointment', desc: 'Free 1-on-1 consultation' },
  { label: 'Contact Us', href: '/contact', desc: 'Reach our expert support desk' },
  { label: 'Knowledge Hub', href: '/blog', desc: 'Read guides by verified CAs' },
];

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="404 — Page Not Found | ETaxwala"
        description="The page you're looking for doesn't exist. Explore our tax, legal & compliance services."
        url="/404"
      />

      <div className="min-h-[90vh] bg-[#FAF9F5] flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Soft luxury ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-br from-[#0084D1]/10 via-[#7C3AED]/10 to-[#F97316]/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl w-full text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* 404 Watermark Number */}
          <motion.div variants={staggerItem} className="mb-2">
            <span className="text-[9rem] md:text-[13rem] font-black leading-none bg-gradient-to-b from-slate-300/40 via-slate-200/20 to-transparent bg-clip-text text-transparent select-none">
              404
            </span>
          </motion.div>

          {/* Search Glass Badge */}
          <motion.div variants={staggerItem} className="flex justify-center mb-6 -mt-12 sm:-mt-16">
            <div className="w-18 h-18 rounded-3xl bg-[#FFFDF9] border border-[#EAE6DD] flex items-center justify-center shadow-lg text-[#0084D1]">
              <Search size={32} />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={staggerItem} className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Oops! Page Not Found
          </motion.h1>
          <motion.p variants={staggerItem} className="text-slate-600 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            The link you followed may be broken, outdated, or the page has moved. Let's get you back on track with our verified compliance services.
          </motion.p>

          {/* Action Buttons (Galaxy Primary & Galaxy Outline) */}
          <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              onClick={() => navigate(-1)}
              className="btn-outline-multicolor inline-flex items-center gap-2 px-6 py-3 rounded-xl text-slate-700 font-bold text-sm cursor-pointer"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
            <Link
              to="/"
              className="btn-multicolor inline-flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-sm shadow-md"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home size={16} /> Back to Home
              </span>
            </Link>
          </motion.div>

          {/* Quick Links in luxury cards */}
          <motion.div variants={staggerItem}>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-extrabold mb-4">
              Explore Popular Hubs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group text-left p-4 rounded-2xl border border-[#EAE6DD] bg-[#FFFDF9] hover:border-[#7C3AED]/40 hover:shadow-md transition-all duration-200"
                >
                  <p className="text-slate-900 font-bold text-sm group-hover:text-[#0084D1] transition-colors">
                    {link.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-1">{link.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Immediate Assistance row */}
          <motion.div variants={staggerItem} className="mt-10 flex items-center justify-center gap-6 text-slate-500 text-xs font-semibold">
            <a
              href="tel:+917071070707"
              className="inline-flex items-center gap-2 hover:text-[#0084D1] transition-colors"
            >
              <Phone size={14} className="text-[#0084D1]" /> +91 70710 70707
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <a
              href="https://wa.me/917071070707"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-emerald-600 transition-colors"
            >
              <MessageCircle size={14} className="text-emerald-600" /> WhatsApp Direct Desk
            </a>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}