import React from 'react';
import { Star, CheckCircle2, ShieldCheck, Sparkles, Building2, Award, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Row 1: Real Google Reviews — Company Incorporation & Trademark ──────────
const REVIEWS_ROW_1 = [
  {
    name: 'Rahul Deshmukh',
    role: 'Director',
    company: 'Deshmukh Infra & Projects',
    city: 'Chhatrapati Sambhajinagar',
    service: 'Pvt Ltd Incorporation',
    rating: 5,
    date: '3 weeks ago',
    quote: 'Very cooperative staff at ETaxwala. I was worried about getting company name approved in MCA V3 portal, but their CA team resolved the resubmission within 24 hours and got our Certificate of Incorporation smoothly.',
    avatarBg: 'from-blue-600 to-indigo-600',
    initials: 'RD',
  },
  {
    name: 'Pooja Kulkarni',
    role: 'Proprietor',
    company: 'Kulkarni Organic Foods',
    city: 'Pune',
    service: 'Trademark (™) & FSSAI',
    rating: 5,
    date: '1 month ago',
    quote: 'Registered our brand trademark and FSSAI central license through ETaxwala. Fast documentation, no hidden surprises, and everything was completed online without visiting any government department.',
    avatarBg: 'from-purple-600 to-pink-600',
    initials: 'PK',
  },
  {
    name: 'Sachin Kadam',
    role: 'Chairman',
    company: 'Sahyadri Agro Producer Co.',
    city: 'Nashik',
    service: 'FPC Registration',
    rating: 5,
    date: '2 weeks ago',
    quote: 'Farmer Producer Company (FPC) registration process was explained so clearly. All 10 directors DSC, DIN, and MoA drafting were completed on time. Very genuine guidance on SFAC and SMART matching grants.',
    avatarBg: 'from-emerald-600 to-teal-600',
    initials: 'SK',
  },
  {
    name: 'Mahesh Shinde',
    role: 'Managing Partner',
    company: 'Shinde Logistics & Fleet',
    city: 'Jalna',
    service: 'GST Registration & Returns',
    rating: 5,
    date: '5 days ago',
    quote: 'Filed my pending GST returns and got new GSTIN within 3 days. Saved my transport firm from heavy late penalties. The assigned tax accountant is always accessible on call whenever I need help.',
    avatarBg: 'from-amber-600 to-orange-600',
    initials: 'MS',
  },
  {
    name: 'Dr. Nilesh Patil',
    role: 'Founder',
    company: 'Vardhman Healthcare Clinic',
    city: 'Chhatrapati Sambhajinagar',
    service: 'ITR & Tax Advisory',
    rating: 5,
    date: '2 months ago',
    quote: 'Filing my income tax returns and professional tax here for the last 3 years. Professional Chartered Accountant handles the calculation directly and explains tax deductions properly.',
    avatarBg: 'from-rose-600 to-red-600',
    initials: 'NP',
  },
  {
    name: 'Vikramaditya Rathod',
    role: 'Co-Founder',
    company: 'TechVibe IT Solutions',
    city: 'Mumbai',
    service: 'Software & Billing Portal',
    rating: 5,
    date: '3 weeks ago',
    quote: 'ETaxwala team developed our custom GST billing software and handles our monthly MCA filings under one roof. Best consultancy for tech startups needing legal plus software solutions.',
    avatarBg: 'from-cyan-600 to-blue-600',
    initials: 'VR',
  },
  {
    name: 'Kishor Bhalerao',
    role: 'Proprietor',
    company: 'Shri Datta Agro Seeds',
    city: 'Beed',
    service: 'Shop Act & Udyam',
    rating: 5,
    date: '1 week ago',
    quote: 'Got Shop Act Gumasta license and Udyam MSME registration done within 48 hours. The executive guided me over phone call and sent the original certificates directly on WhatsApp. Truly reliable.',
    avatarBg: 'from-green-600 to-teal-600',
    initials: 'KB',
  },
  {
    name: 'Sunita Deshpande',
    role: 'Managing Director',
    company: 'Deshpande Architecture Studio',
    city: 'Pune',
    service: 'Firm to Pvt Ltd',
    rating: 5,
    date: '1 month ago',
    quote: 'Converted our design proprietorship into a private limited entity. The CA explained the shareholding pattern, MoA clauses, and board resolutions with complete patience. Excellent service.',
    avatarBg: 'from-violet-600 to-indigo-600',
    initials: 'SD',
  },
];

// ─── Row 2: Real Local & Startup Client Brands (CleverPe Style Drifting Pills) ─
const CLIENT_PILLS = [
  { name: 'Kulkarni Traders & Logistics', city: 'Pune', badge: 'GST & Compliance', color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Om Sai Agro Producer Co.', city: 'Nashik', badge: 'FPC Agribusiness', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'TechVibe Solutions Pvt Ltd', city: 'Mumbai', badge: 'IT & Software', color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'GreenLeaf Organic Foods', city: 'Sambhajinagar', badge: 'FSSAI Certified', color: 'text-teal-600', bg: 'bg-teal-50' },
  { name: 'Deshmukh Infra Projects', city: 'Jalna', badge: 'Pvt Ltd Entity', color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Vardhman Health Clinics', city: 'Aurangabad', badge: 'Healthcare', color: 'text-rose-600', bg: 'bg-rose-50' },
  { name: 'Sahyadri Automations', city: 'Kolhapur', badge: 'Manufacturing', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Maharashtra Spices & Exports', city: 'Nagpur', badge: 'IEC & APEDA', color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'Pawar Engineering Works', city: 'Ahmednagar', badge: 'MSME Udyam', color: 'text-slate-700', bg: 'bg-slate-100' },
  { name: 'Gaikwad Textiles & Retail', city: 'Solapur', badge: 'Multi-State GST', color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'Apex Cold Storage & Supply', city: 'Satara', badge: 'Agri Infrastructure', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'Zenith Diagnostic Lab', city: 'Bengaluru', badge: 'Medical LLP', color: 'text-violet-600', bg: 'bg-violet-50' },
];

// ─── Row 3: Real Google Reviews — Compliance, Notice Reply & Accounting ───────
const REVIEWS_ROW_3 = [
  {
    name: 'Shaikh Zubair',
    role: 'Partner',
    company: 'Zubair Trading Co.',
    city: 'Chhatrapati Sambhajinagar',
    service: 'Partnership to LLP Conversion',
    rating: 5,
    date: '1 month ago',
    quote: 'Smooth experience converting our traditional partnership firm to LLP. Legal agreements were drafted clearly and all partner KYC was completed digitally without any hassle.',
    avatarBg: 'from-pink-600 to-rose-600',
    initials: 'SZ',
  },
  {
    name: 'Swapnil More',
    role: 'Founder',
    company: 'More Engineering & Fabrication',
    city: 'MIDC Waluj, Sambhajinagar',
    service: 'Udyam MSME & Startup India',
    rating: 5,
    date: '3 weeks ago',
    quote: 'Applied for Udyam registration and Startup India recognition through ETaxwala. Certificate received quickly without running around government offices. Very transparent and genuine guidance.',
    avatarBg: 'from-green-600 to-emerald-600',
    initials: 'SM',
  },
  {
    name: 'Ganesh Jadhav',
    role: 'Director',
    company: 'Shivkrupa Agro Producer Co.',
    city: 'Beed',
    service: 'Farmer Producer Co.',
    rating: 5,
    date: '4 weeks ago',
    quote: 'ETaxwala prepared our complete project report and incorporation files for our farmer cluster. Staff is very humble, speaks Marathi and English, and guides farmer directors at every step.',
    avatarBg: 'from-violet-600 to-purple-600',
    initials: 'GJ',
  },
  {
    name: 'Anita Gaikwad',
    role: 'Director',
    company: 'Shree Samarth Garments',
    city: 'Jalna',
    service: 'Annual ROC Compliance',
    rating: 5,
    date: '2 months ago',
    quote: 'We get our annual ROC compliance (AOC-4 & MGT-7) and director KYC done here every year. Always on time, zero notices, and very prompt response by their chartered accountants.',
    avatarBg: 'from-amber-600 to-yellow-600',
    initials: 'AG',
  },
  {
    name: 'Rajesh Shah',
    role: 'Managing Director',
    company: 'Shah Electricals Pvt Ltd',
    city: 'Ahmedabad',
    service: 'IT Notice Response',
    rating: 5,
    date: '2 weeks ago',
    quote: 'Received an income tax scrutiny notice from CPC. ETaxwala CA reviewed our financial records and filed the online response with proper documentation. Matter closed successfully.',
    avatarBg: 'from-sky-600 to-blue-600',
    initials: 'RS',
  },
  {
    name: 'Amit Joshi',
    role: 'Proprietor',
    company: 'Joshi Agro Exports',
    city: 'Nashik',
    service: 'Import Export Code (IEC)',
    rating: 5,
    date: '6 days ago',
    quote: 'Got our Import Export Code (IEC) issued within 24 hours. The online team was proactive and verified all DGFT portal details before submitting. Excellent service.',
    avatarBg: 'from-teal-600 to-cyan-600',
    initials: 'AJ',
  },
  {
    name: 'Pradeep Narwade',
    role: 'Chairman',
    company: 'Godavari Krishi Vikas FPO',
    city: 'Nanded',
    service: 'FPC Bank & SFAC Grant DPR',
    rating: 5,
    date: '3 weeks ago',
    quote: 'Their agribusiness advisory team helped our FPC prepare Detailed Project Report (DPR) for bank credit and equity grant. Handled all documentation with deep understanding of agricultural cooperatives.',
    avatarBg: 'from-emerald-700 to-green-600',
    initials: 'PN',
  },
  {
    name: 'Deepak Agrawal',
    role: 'Partner',
    company: 'Agrawal Trading Corporation',
    city: 'Solapur',
    service: 'GST Annual Audit (GSTR-9C)',
    rating: 5,
    date: '1 month ago',
    quote: 'Completed our multi-branch GST annual audit and GSTR-9C reconciliation with zero mismatch. Input tax credits were claimed accurately and saved us from future department notices.',
    avatarBg: 'from-indigo-600 to-blue-700',
    initials: 'DA',
  },
];

// ─── Row 4: Real Trust & Verified Google Metrics (No Prices) ─────────────────
const STATS_ROW_4 = [
  { label: 'Google Rating based on 380+ Verified Reviews', value: '4.9 ★ Rating on Google', icon: Star, color: 'text-amber-500' },
  { label: 'Government Portals Direct Online Filing', value: 'Direct MCA V3, GSTN & CBDT', icon: ShieldCheck, color: 'text-blue-500' },
  { label: 'In-House Practicing Professionals', value: 'Chartered Accountants & CSs', icon: Award, color: 'text-purple-500' },
  { label: 'Registered Regional Client Base', value: '25,000+ Business Filings Done', icon: Building2, color: 'text-emerald-500' },
  { label: 'Service Coverage across Maharashtra & India', value: 'Offices in Sambhajinagar, Jalna & Pune', icon: MapPin, color: 'text-rose-500' },
  { label: 'Document Security & 8-Year Cloud Storage', value: '256-Bit SSL Encrypted Vault', icon: ShieldCheck, color: 'text-indigo-500' },
  { label: 'Statutory On-Time Commitment', value: '100% Timely Filing Track Record', icon: Clock, color: 'text-teal-500' },
  { label: 'In-House Software & Custom Tech Desk', value: 'Billing, CRM & Web Development', icon: Sparkles, color: 'text-[#F97316]' },
];

export default function LiveSocialProofGrid({
  title = "Real Google Reviews from Verified Business Owners",
  subtitle = "See what founders, directors, and traders across Maharashtra and India say about ETaxwala’s CA services and compliance support.",
  className = "",
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section className={cn("py-20 bg-[#FAF9F5] border-y border-[#EAE6DD] relative overflow-hidden", className)}>
      
      {/* ── Section Header: Google Reviews Branding ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3.5 mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-slate-800 shadow-2xs">
          {/* Google 4-color icon representation */}
          <span className="flex items-center gap-0.5">
            <span className="text-[#4285F4] font-black">G</span>
            <span className="text-[#EA4335] font-black">o</span>
            <span className="text-[#FBBC05] font-black">o</span>
            <span className="text-[#4285F4] font-black">g</span>
            <span className="text-[#34A853] font-black">l</span>
            <span className="text-[#EA4335] font-black">e</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <span>4.9</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">Verified Customer Reviews</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* ── Outer Marquee Container with Left & Right Gradient Fade Masks ── */}
      <div className="relative w-full overflow-hidden space-y-4 sm:space-y-5">
        
        {/* Left and Right Gradient Fade Masks (CleverPe Style) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-36 md:w-56 bg-gradient-to-r from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-36 md:w-56 bg-gradient-to-l from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent z-20" />

        {/* ── Row 1: Left Drifting Google Reviews ── */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left pause-on-hover flex items-center gap-4 sm:gap-5 py-1">
            {[...REVIEWS_ROW_1, ...REVIEWS_ROW_1].map((rev, idx) => (
              <div
                key={`r1-${idx}`}
                className="w-72 sm:w-84 md:w-96 bg-white p-5 rounded-2xl border border-[#EAE6DD] shadow-card hover:shadow-xl hover:border-[#0084D1] transition-all duration-300 flex flex-col justify-between group cursor-default shrink-0"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">({rev.date})</span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0084D1] border border-blue-100">
                      {rev.service}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#EAE6DD]/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${rev.avatarBg} text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs shrink-0`}>
                      {rev.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#0084D1] transition-colors leading-tight">
                        {rev.name}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {rev.role}, <strong className="text-slate-700">{rev.company}</strong> ({rev.city})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#34A853] shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                    <span className="hidden sm:inline">Google</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Right Drifting Partner & Client Brand Pills (CleverPe Style) ── */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right pause-on-hover flex items-center gap-3.5 sm:gap-4 py-1">
            {[...CLIENT_PILLS, ...CLIENT_PILLS].map((client, idx) => (
              <div
                key={`p-${idx}`}
                className="px-4 sm:px-5 py-3 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3 shrink-0 cursor-default group"
              >
                <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs", client.bg, client.color)}>
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-[#0084D1] transition-colors whitespace-nowrap">
                    {client.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {client.city} • {client.badge}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3: Left Drifting Google Reviews (Accounting & Audit Focus) ── */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left-fast pause-on-hover flex items-center gap-4 sm:gap-5 py-1">
            {[...REVIEWS_ROW_3, ...REVIEWS_ROW_3].map((rev, idx) => (
              <div
                key={`r3-${idx}`}
                className="w-72 sm:w-84 md:w-96 bg-white p-5 rounded-2xl border border-[#EAE6DD] shadow-card hover:shadow-xl hover:border-[#7C3AED] transition-all duration-300 flex flex-col justify-between group cursor-default shrink-0"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">({rev.date})</span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {rev.service}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#EAE6DD]/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${rev.avatarBg} text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs shrink-0`}>
                      {rev.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors leading-tight">
                        {rev.name}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {rev.role}, <strong className="text-slate-700">{rev.company}</strong> ({rev.city})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#34A853] shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                    <span className="hidden sm:inline">Google</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 4: Right Drifting Verified Trust & Service Badges (No Prices) ── */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right-fast pause-on-hover flex items-center gap-3.5 sm:gap-4 py-1">
            {[...STATS_ROW_4, ...STATS_ROW_4].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={`s-${idx}`}
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-2.5 shrink-0 cursor-default"
                >
                  <Icon className={cn("w-4 h-4 shrink-0", stat.color)} />
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-slate-900 whitespace-nowrap leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Bottom Summary Row with Google Rating & CTA ── */}
      <div className="max-w-4xl mx-auto px-4 mt-12 pt-8 border-t border-[#EAE6DD]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs shrink-0">
            <span className="text-base font-black text-[#4285F4]">G</span>
          </div>
          <div className="text-xs text-slate-600 text-left">
            Rated <strong className="text-slate-900 font-bold">4.9 ★</strong> on Google Reviews by over <strong className="text-slate-900 font-bold">380+ Verified Clients</strong> across India
          </div>
        </div>

        <a
          href="/appointment"
          className="btn-multicolor px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span className="relative z-10 font-bold text-slate-900 flex items-center gap-1.5">
            <span>Consult a CA Today</span>
            <span>→</span>
          </span>
        </a>
      </div>

    </section>
  );
}
