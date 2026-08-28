import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Phone, MessageCircle } from 'lucide-react';
import SEO from '@/components/seo';
import { staggerContainer, staggerItem } from '@/lib/animations';

const quickLinks = [
  { label: 'Home', href: '/', desc: 'Go back to main page' },
  { label: 'Services', href: '/services', desc: 'Browse all 250+ services' },
  { label: 'ITR Filing', href: '/itr-filing', desc: 'File your income tax return' },
  { label: 'Book Appointment', href: '/appointment', desc: 'Schedule a free consultation' },
  { label: 'Contact Us', href: '/contact', desc: 'Reach our support team' },
  { label: 'Blog', href: '/blog', desc: 'Read expert articles' },
];

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="404 — Page Not Found | ETaxwala"
        description="The page you're looking for doesn't exist. Explore our tax & compliance services."
        url="/404"
      />

      <div className="min-h-[90vh] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl w-full text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* 404 Number */}
          <motion.div variants={staggerItem} className="mb-6">
            <span className="text-[10rem] md:text-[14rem] font-black leading-none bg-gradient-to-br from-white/20 via-white/10 to-transparent bg-clip-text text-transparent select-none">
              404
            </span>
          </motion.div>

          {/* Icon */}
          <motion.div variants={staggerItem} className="flex justify-center mb-6 -mt-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-2xl shadow-blue-900/50">
              <Search size={36} className="text-white" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={staggerItem} className="text-3xl md:text-5xl font-bold text-white mb-4">
            Oops! Page Not Found
          </motion.h1>
          <motion.p variants={staggerItem} className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            The page you're looking for has moved, been removed, or never existed. Let's get you back on track.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-200"
            >
              <ArrowLeft size={18} /> Go Back
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-blue-600 transition-all duration-200"
            >
              <Home size={18} /> Back to Home
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={staggerItem}>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold mb-5">
              Popular Pages
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                    {link.label}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Help row */}
          <motion.div variants={staggerItem} className="mt-10 flex items-center justify-center gap-6 text-slate-500 text-sm">
            <a
              href="tel:+917071070707"
              className="inline-flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone size={14} /> +91 70710 70707
            </a>
            <span className="w-px h-4 bg-white/10" />
            <a
              href="https://wa.me/917071070707"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle size={14} /> WhatsApp Us
            </a>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}