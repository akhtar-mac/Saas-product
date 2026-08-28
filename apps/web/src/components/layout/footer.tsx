import { Link } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Facebook, Twitter, Instagram,
  Linkedin, Youtube, ArrowRight, Shield, Award, Star,
} from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'About Us',          to: '/about' },
    { label: 'Our Team',          to: '/about#team' },
    { label: 'Careers',           to: '/careers' },
    { label: 'Blog',              to: '/blog' },
    { label: 'Contact Us',        to: '/contact' },
    { label: 'Partner With Us',   to: '/franchise' },
  ],
  services: [
    { label: 'Private Limited Co.',   to: '/services/registration/private-limited' },
    { label: 'LLP Registration',      to: '/services/registration/llp' },
    { label: 'GST Registration',      to: '/services/other/gst' },
    { label: 'ITR Filing',            to: '/itr-filing' },
    { label: 'Trademark Registration',to: '/services/ip/trademark' },
    { label: 'FSSAI License',         to: '/services/other/fssai' },
    { label: 'MSME Registration',     to: '/services/other/msme' },
    { label: 'Import Export Code',    to: '/services/other/import-export' },
  ],
  legal: [
    { label: 'Terms of Service',   to: '/legal/terms' },
    { label: 'Privacy Policy',     to: '/legal/privacy' },
    { label: 'Refund Policy',      to: '/legal/refund' },
    { label: 'Disclaimer',         to: '/legal/disclaimer' },
  ],
};

const socialLinks = [
  { icon: Facebook,  href: 'https://facebook.com/etaxwala',  label: 'Facebook'  },
  { icon: Instagram, href: 'https://instagram.com/etaxwala', label: 'Instagram' },
  { icon: Twitter,   href: 'https://twitter.com/etaxwala',   label: 'Twitter'   },
  { icon: Linkedin,  href: 'https://linkedin.com/company/etaxwala', label: 'LinkedIn' },
  { icon: Youtube,   href: 'https://youtube.com/@etaxwala',  label: 'YouTube'   },
];

const trustBadges = [
  { icon: Shield, label: 'SSL Secured',       sub: '256-bit Encryption' },
  { icon: Award,  label: 'ISO Certified',      sub: 'Quality Assured' },
  { icon: Star,   label: '4.9★ Rated',         sub: '10,000+ Reviews' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">

      {/* ── Trust Bar ── */}
      <div className="border-b border-white/10">
        <div className="container-etaxwala py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trustBadges.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-brand-gold-light" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">{label}</p>
                  <p className="text-white/50 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="container-etaxwala py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-5">
              <img
                src="/logo_white.png"
                alt="ETaxwala"
                className="h-12 w-auto"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = 'none';
                  const next = el.nextElementSibling as HTMLElement;
                  if (next) next.style.display = 'block';
                }}
              />
              <span className="hidden text-2xl font-display font-bold text-white">ETaxwala</span>
            </Link>

            <p className="text-white/65 text-sm leading-relaxed max-w-sm mb-6">
              India's trusted platform for business registration, GST filing, ITR, compliance,
              trademark, and all government-related services — handled by expert CAs, CSs, and Lawyers.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <a href="tel:+917071070707" className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center shrink-0 group-hover:bg-brand-gold/30 transition-colors">
                  <Phone className="h-4 w-4 text-brand-gold-light" />
                </div>
                +91 70710 70707
              </a>
              <a href="mailto:support@etaxwala.com" className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center shrink-0 group-hover:bg-brand-gold/30 transition-colors">
                  <Mail className="h-4 w-4 text-brand-gold-light" />
                </div>
                support@etaxwala.com
              </a>
              <div className="flex items-start gap-3 text-sm text-white/70">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-brand-gold-light" />
                </div>
                <span>Lucknow, Uttar Pradesh, India</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-brand-gold hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/65 hover:text-white hover:pl-1 transition-all duration-150 flex items-center gap-1 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/65 hover:text-white hover:pl-1 transition-all duration-150 flex items-center gap-1 group">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA / Newsletter column */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Get Started Today
            </h4>
            <div className="space-y-3 mb-6">
              <Link to="/appointment" className="btn btn-multicolor w-full text-center text-sm py-3 font-bold">
                📅 Book Free Consultation
              </Link>
              <Link to="/portal/login" className="btn btn-outline-white w-full text-center text-sm py-3 font-semibold">
                Client Portal Login
              </Link>
              <Link to="/itr-filing" className="block text-center text-xs text-white/60 hover:text-white transition-colors">
                File Your ITR Online →
              </Link>
            </div>

            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-white/50 mb-2 font-semibold">📱 Download Our App</p>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img src="/logo_white.png" alt="Google Play" className="h-8 opacity-0" />
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-xs text-white/50 leading-none">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="container-etaxwala py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} ETaxwala. All rights reserved. CIN: U74999UP2020PTC000000</p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map(({ label, to }) => (
              <Link key={label} to={to} className="hover:text-white/70 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}