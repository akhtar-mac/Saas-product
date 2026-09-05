import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/seo';
import { ShieldCheck, FileText, Lock, RefreshCw, Mail, CheckCircle2, HelpCircle } from 'lucide-react';

interface LegalSection {
  title: string;
  badge: string;
  icon: typeof ShieldCheck;
  lastUpdated: string;
  sections: {
    heading: string;
    content: string[];
  }[];
}

const legalDocs: Record<string, LegalSection> = {
  terms: {
    title: 'Terms of Service',
    badge: 'Legal Agreement',
    icon: FileText,
    lastUpdated: 'April 1, 2024',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: [
          'Welcome to ETaxwala. These Terms of Service constitute a legally binding agreement between you and ETaxwala Business Solution Pvt Ltd.',
          'By accessing our website (etaxwala.com), engaging our professional services, or signing up on our client portal, you confirm that you have read, understood, and agree to be bound by these terms.',
        ],
      },
      {
        heading: '2. Scope of Advisory & Regulatory Services',
        content: [
          'ETaxwala provides chartered accountancy, company secretarial, legal advisory, and regulatory compliance facilitation across India.',
          'We act as an authorized intermediary and filing agent on government portals including MCA (Ministry of Corporate Affairs), Income Tax Department, GSTN, and Controller General of Patents, Designs and Trade Marks.',
          'Official government fees are disbursed on behalf of clients strictly per applicable government tariff schedules.',
        ],
      },
      {
        heading: '3. Client Responsibilities & Data Accuracy',
        content: [
          'You warrant that all information, identity documents, bank statements, and business records provided to our practitioners are authentic, complete, and legally valid.',
          'Delays or rejections stemming from incorrect information, expired DSCs (Digital Signature Certificates), or unresponsive statutory verification calls remain the sole responsibility of the client.',
        ],
      },
      {
        heading: '4. Service Timelines & Government SLAs',
        content: [
          'Service turnaround times quoted on our portal are operational benchmarks based on standard government processing cycles.',
          'Statutory backlogs, server downtime on government portals (e.g. MCA V3 or GST portal), and queries raised by Registrar of Companies (RoC) or Tax Officers are external to ETaxwala and do not constitute service deficiency.',
        ],
      },
      {
        heading: '5. Intellectual Property & Confidentiality',
        content: [
          'All software, calculation engines, proprietary workflow tracking tools, and educational guides on this platform remain exclusive intellectual property of ETaxwala.',
          'We maintain strict professional attorney-client and accountant-client confidentiality regarding your trade secrets, financial records, and proprietary business models.',
        ],
      },
      {
        heading: '6. Jurisdiction & Dispute Resolution',
        content: [
          'These terms are governed by and construed in accordance with the Laws of India.',
          'Any unresolved disputes shall be subject to the exclusive jurisdiction of the competent courts in Chhatrapati Sambhajinagar (Aurangabad), Maharashtra, India.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    badge: 'Data Protection',
    icon: Lock,
    lastUpdated: 'April 1, 2024',
    sections: [
      {
        heading: '1. Information We Collect',
        content: [
          'Identity Data: Full legal name, date of birth, PAN, Aadhaar number, DIN, and government photo identity proofs necessary for statutory filings.',
          'Contact & Business Data: Email address, phone number, registered office address, company constitution documents, and director details.',
          'Financial & Compliance Data: Bank statements, GST credentials, ITR computation records, invoices, and accounting books uploaded via our secure client vault.',
        ],
      },
      {
        heading: '2. How We Safeguard Your Information',
        content: [
          'Institutional Encryption: All data in transit is protected by 256-bit TLS encryption, and documents stored on our cloud repository are encrypted at rest with AES-256.',
          'Role-Based Staff Access: Only the designated CA, CS, or legal practitioner assigned to your filing has authorized access to your sensitive documentation.',
          'Zero Data Monetization: We never sell, lease, or monetize your personal or business data with third-party advertisers or marketing aggregators.',
        ],
      },
      {
        heading: '3. Lawful Disclosure to Government Regulators',
        content: [
          'Your compliance records are submitted exclusively to designated government statutory bodies (MCA, Income Tax Department, CBIC/GSTN, DGFT, MSME) to fulfill statutory filings contracted by you.',
          'We cooperate with lawful court orders or regulatory mandates issued by competent Indian judicial authorities.',
        ],
      },
      {
        heading: '4. Data Retention & Deletion Rights',
        content: [
          'We retain client statutory filing documents for the statutory period mandated under the Companies Act, 2013 and Income Tax Act, 1961.',
          'You may request a copy of your filing dossier or request permanent deletion of non-statutory records at any time by emailing privacy@etaxwala.com.',
        ],
      },
    ],
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    badge: 'Fair Billing',
    icon: RefreshCw,
    lastUpdated: 'April 1, 2024',
    sections: [
      {
        heading: '1. Refund Eligibility Prior to Commencement',
        content: [
          '100% Professional Fee Refund: If you submit a formal cancellation request in writing within 48 hours of payment and before our compliance team has initiated document drafting or name reservation filings.',
          'Duplicate or Erroneous Transactions: Any duplicate payments detected via our payment gateway will be automatically reversed to your original source within 3–5 banking days.',
        ],
      },
      {
        heading: '2. Non-Refundable Statutory Charges',
        content: [
          'Government Fees: All fees already remitted to the Ministry of Corporate Affairs, Income Tax Department, Trademark Registry, or state stamp duty portals are strictly non-refundable by government rule.',
          'Digital Signature Certificates (DSC): Once DSC tokens are generated and issued with your cryptographic identity, fees cannot be reversed.',
          'Work In Progress: In cases where substantial drafting, drafting of legal deeds, or tax computations have been completed, professional fees will be pro-rated accordingly.',
        ],
      },
      {
        heading: '3. Refund Claim Procedure',
        content: [
          'To initiate a review, send an email to support@etaxwala.com with subject line: "Refund Claim - [Your Order / Service ID]".',
          'Please detail your reason for cancellation along with your registered phone number and original payment receipt.',
          'Approved claims are credited back to your original source bank account or credit card within 7–10 business days.',
        ],
      },
    ],
  },
};

export default function LegalPage() {
  const { type = 'terms' } = useParams<{ type: string }>();
  const activeKey = ['terms', 'privacy', 'refund'].includes(type) ? type : 'terms';
  const doc = legalDocs[activeKey];
  const IconComponent = doc.icon;

  return (
    <>
      <SEO
        title={`${doc.title} | ETaxwala Legal & Compliance`}
        description={`Read the official ${doc.title} for ETaxwala Business Solution Pvt Ltd. Understand your consumer rights, data privacy protections, and statutory guidelines.`}
        url={`/legal/${activeKey}`}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-[#FAF9F5] border-b border-[#EAE6DD]">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-br from-[#0084D1]/10 via-[#7C3AED]/10 to-[#F97316]/10 blur-3xl rounded-full" />
        </div>

        <div className="container-etaxwala relative text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] shadow-xs mb-4">
            <ShieldCheck className="w-4 h-4 text-[#0084D1]" />
            <span className="text-xs font-bold text-slate-700">{doc.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            {doc.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Last updated on <span className="font-semibold text-slate-700">{doc.lastUpdated}</span> • Applies to all users, corporate clients, and platform visitors.
          </p>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              to="/legal/terms"
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeKey === 'terms'
                  ? 'btn-multicolor shadow-sm'
                  : 'bg-white border border-[#EAE6DD] text-slate-600 hover:text-slate-900 hover:bg-[#FAF9F5]'
              }`}
            >
              <span>Terms of Service</span>
            </Link>
            <Link
              to="/legal/privacy"
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeKey === 'privacy'
                  ? 'btn-multicolor shadow-sm'
                  : 'bg-white border border-[#EAE6DD] text-slate-600 hover:text-slate-900 hover:bg-[#FAF9F5]'
              }`}
            >
              <span>Privacy Policy</span>
            </Link>
            <Link
              to="/legal/refund"
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeKey === 'refund'
                  ? 'btn-multicolor shadow-sm'
                  : 'bg-white border border-[#EAE6DD] text-slate-600 hover:text-slate-900 hover:bg-[#FAF9F5]'
              }`}
            >
              <span>Refund &amp; Cancellation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-14 bg-[#FAF9F5]">
        <div className="container-etaxwala max-w-4xl">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#EAE6DD] p-6 sm:p-12 shadow-xs space-y-10">
            {/* Header intro callout */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DD]">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE6DD] text-[#0084D1] flex items-center justify-center shrink-0 shadow-xs">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Notice of Binding Terms</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please read this document carefully. By utilizing ETaxwala's digital portal or hiring our chartered accountants, lawyers, and compliance managers, you are entering into a legally enforceable understanding.
                </p>
              </div>
            </div>

            {/* Document Sections */}
            <div className="space-y-8">
              {doc.sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0084D1]" />
                    {section.heading}
                  </h2>
                  <div className="space-y-2.5 pl-4 border-l-2 border-[#EAE6DD]">
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust and Compliance Footer within Reader */}
            <div className="pt-6 border-t border-[#EAE6DD] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Compliant with IT Act, 2000 &amp; Digital Personal Data Protection Act</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0084D1]" />
                <span>Legal queries: legal@etaxwala.com</span>
              </div>
            </div>
          </div>

          {/* Need help box */}
          <div className="mt-8 p-6 rounded-3xl bg-white border border-[#EAE6DD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Have questions about our legal policies?</h4>
                <p className="text-xs text-slate-500">Our customer grievance officer is available Monday to Saturday, 9am - 7pm.</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="btn-multicolor px-5 py-2.5 rounded-xl text-xs font-bold shrink-0"
            >
              <span>Contact Compliance Team</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}