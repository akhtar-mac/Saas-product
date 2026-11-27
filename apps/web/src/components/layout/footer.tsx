import { Link } from 'react-router-dom';
import { BrandMark, useBrand } from '@/lib/branding';
import { Phone, Mail, MapPin, Shield, Clock, Globe, Lock } from 'lucide-react';

const footerColumns = {
  incorporation: [
    { label: 'Private Limited Company', to: '/services/registration/private-limited' },
    { label: 'Limited Liability Partnership', to: '/services/registration/llp' },
    { label: 'One Person Company (OPC)', to: '/services/registration/opc' },
    { label: 'Section 8 Non-Profit', to: '/services/registration/section-8-ngo' },
    { label: 'Farmer Producer Co. (FPC)', to: '/fpc-training' },
  ],
  taxCompliance: [
    { label: 'Income Tax Return (ITR)', to: '/itr-filing' },
    { label: 'GST Registration', to: '/services/other/gst' },
    { label: 'Monthly GST Returns', to: '/services/taxation/gst-return' },
    { label: 'Tax Audit (Section 44AB)', to: '/services/taxation/tax-audit' },
    { label: 'Annual ROC Retainer', to: '/services/compliance/pvt-ltd' },
  ],
  ipRegulatory: [
    { label: 'Trademark Registration (™)', to: '/services/ip/trademark' },
    { label: 'Copyright Protection', to: '/services/ip/copyright' },
    { label: 'FSSAI Food License', to: '/services/other/fssai' },
    { label: 'MSME / Udyam Certificate', to: '/services/other/msme' },
    { label: 'Import Export Code (IEC)', to: '/services/other/import-export' },
  ],
  company: [
    { label: 'About', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Official Bank Accounts & UPI', to: '/pay' },
    { label: 'Knowledge Hub & Blog', to: '/blog' },
    { label: 'Legal Hubs & Offices', to: '/contact' },
    { label: 'Book CA Consultation', to: '/appointment' },
  ],
  legal: [
    { label: 'Terms of Service', to: '/legal/terms' },
    { label: 'Privacy Policy', to: '/legal/privacy' },
    { label: 'Refund Policy', to: '/legal/refund' },
    { label: 'Legal Disclaimer', to: '/legal/disclaimer' },
  ],
};

export default function Footer() {
  const brand = useBrand();
  return (
    <footer className="bg-[#FAF9F5] text-slate-700 font-sans border-t border-[#EAE6DD]">
      {/* ── Top Trust & Credential Banner (Light Cream) ── */}
      <div className="border-b border-[#EAE6DD] py-8 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE6DD] flex items-center justify-center text-[#0084D1] shrink-0 shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">MCA &amp; GSTN Certified</p>
                <p className="text-[11px] text-slate-500">100% Statutory Compliance Standing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE6DD] flex items-center justify-center text-[#7C3AED] shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">ISO 27001 Security</p>
                <p className="text-[11px] text-slate-500">256-Bit Encrypted Client Vault</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE6DD] flex items-center justify-center text-[#E11D48] shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Guaranteed SLAs</p>
                <p className="text-[11px] text-slate-500">5-Min Callbacks &amp; On-Time Filing</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE6DD] flex items-center justify-center text-[#F97316] shrink-0 shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">120+ Offline Centers</p>
                <p className="text-[11px] text-slate-500">Serving 500+ Cities in 28 States</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Categorical Links ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Info with Official Logo */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <BrandMark className="h-10" />
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {brand.legalName} — {brand.tagline}
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Phone className="w-3.5 h-3.5 text-[#0084D1] shrink-0" />
                <span>{brand.supportPhone || 'Phone not configured'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                <span>{brand.supportEmail}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-500 text-[11px] leading-snug">
                <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0 mt-0.5" />
                <span>
                  {[brand.address, brand.city, brand.state].filter(Boolean).join(', ') ||
                    'Address not configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 1: Incorporation */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Incorporation
            </p>
            <ul className="space-y-2 text-xs">
              {footerColumns.incorporation.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Taxation */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tax &amp; Audit
            </p>
            <ul className="space-y-2 text-xs">
              {footerColumns.taxCompliance.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: IP & Licenses */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              IP &amp; Regulatory
            </p>
            <ul className="space-y-2 text-xs">
              {footerColumns.ipRegulatory.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Company</p>
            <ul className="space-y-2 text-xs">
              {footerColumns.company.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              {footerColumns.legal.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-500 hover:text-slate-800 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Copyright & Statutory Disclaimer ── */}
      <div className="border-t border-[#EAE6DD] py-6 bg-[#FAF9F5] text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
          </p>
          <p className="text-slate-400 text-center sm:text-right max-w-xl">
            Disclaimer: {brand.companyName} connects businesses with independent advisors.
            Government approval is not guaranteed.
          </p>
        </div>
      </div>
    </footer>
  );
}
