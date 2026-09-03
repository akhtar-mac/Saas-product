import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, ArrowRight, Phone, MessageCircle, FileBadge,
  ChevronRight, Star, Clock, ShieldCheck, FileCheck, HelpCircle,
  Sparkles, Lock, Building2, UserCheck, AlertCircle
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';
import QuickEnquiryModal from '@/components/quick-enquiry-modal';
import { getServiceBySlug, getCategoryById, services, formatPrice } from '@/lib/constants/services';

const processSteps = [
  { step: 1, title: 'Document Upload', desc: 'Upload scanned KYC & basic details on our secure portal.' },
  { step: 2, title: 'Senior CA Audit', desc: 'Our practicing Chartered Accountant validates compliance & eligibility.' },
  { step: 3, title: 'Government Portal Filing', desc: 'We execute e-filing with MCA, GSTN, or Income Tax Department.' },
  { step: 4, title: 'Certificate Delivery', desc: 'Receive your verified government registration certificate & documents.' },
];

const documentsRequiredList: Record<string, string[]> = {
  registration: [
    'PAN Card of all Directors / Partners / Proprietor',
    'Aadhaar Card or Passport / Voter ID for Identity Proof',
    'Latest Bank Statement or Electricity Bill (Address Proof < 2 months old)',
    'Passport size photographs of all applicants',
    'Registered Office Electricity Bill with Landlord NOC & Rent Agreement',
  ],
  tax: [
    'PAN Card & Aadhaar Card of Entity and Authorized Signatory',
    'Bank Account Details with cancelled cheque or bank statement',
    'Proof of Principal Place of Business (Electricity Bill + NOC / Ownership Proof)',
    'Form 16 / 16A or Sales & Purchase ledgers (for return filing)',
    'Digital Signature Certificate (DSC Class 3) where applicable',
  ],
  ip: [
    'Applicant Identity & Address Proof (PAN, Aadhaar)',
    'Brand Logo / Trademark artwork in high resolution (JPEG/PNG)',
    'Form TM-48 (Power of Attorney) signed by the applicant',
    'Date of first use in India with documentary proof or "Proposed to be used"',
    'MSME / Udyam Certificate (to claim 50% government fee concession)',
  ],
  default: [
    'PAN Card of Business / Proprietor / Directors',
    'Identity & Address Proof of Authorized Signatories',
    'Proof of Business Operating Address (Utility bill less than 2 months old)',
    'Valid Mobile Number & Email ID for OTP verification',
  ],
};

const serviceFaqs = [
  { q: 'What is the turnaround time for this service?', a: 'Standard execution takes between 3 to 10 working days, subject to government department approval timelines.' },
  { q: 'Are all government fees included in the displayed price?', a: 'Yes, standard government statutory fees and our professional CA drafting fees are bundled in the all-inclusive quote.' },
  { q: 'Will I get an official invoice with GST credit?', a: 'Yes! You will receive a GST tax invoice so you can claim 18% Input Tax Credit (ITC) on our professional charges.' },
  { q: 'Can I track the progress of my filing online?', a: 'Yes, our automated client self-service portal provides step-by-step milestone tracking, real-time status updates, and digital document download.' },
];

export default function ServiceDetailPage() {
  const { serviceSlug, categorySlug } = useParams();
  const service = getServiceBySlug(serviceSlug || '');
  const category = service ? getCategoryById(service.category) : null;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  if (!service) {
    const formattedTitle = serviceSlug
      ? serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Custom CA Consultation';

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-etax-puma-soft">
        <SEO title="Consult CA — ETaxwala" url="/services" />
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#EAE6DD] shadow-card space-y-5">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-[#7C3AED] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Need Help with {formattedTitle}?
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our practicing Chartered Accountants handle all custom legal incorporations, registrations, and tax appeals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowEnquiryModal(true)}
            className="btn-panda w-full py-3 text-xs"
          >
            <span>Request Instant CA Callback</span>
            <ArrowRight className="w-3.5 h-3.5 btn-panda-icon" />
          </button>

          <Link
            to="/services"
            className="block text-xs font-bold text-[#0084D1] hover:underline pt-2"
          >
            ← Browse All 250+ Services Catalog
          </Link>
        </div>

        <QuickEnquiryModal
          isOpen={showEnquiryModal}
          onClose={() => setShowEnquiryModal(false)}
          serviceTitle={formattedTitle}
        />
      </div>
    );
  }

  // Determine required documents list (1.7.10)
  const docsList = documentsRequiredList[service.category] || documentsRequiredList.default;

  // Related services in same category
  const related = services.filter((s) => s.category === service.category && s.id !== service.id).slice(0, 3);

  return (
    <>
      {/* 1.7.11 & 1.7.12: Meta tags + schema.org Service schema */}
      <SEO
        title={`${service.name} — Expert CA Service @ ${formatPrice(service.price)}`}
        description={`${service.name} statutory filing and consultation in India. ${service.inclusions.slice(0, 3).join(', ')}. 100% on-time guarantee.`}
        keywords={`${service.name}, ${category?.name}, CA service India, ETaxwala compliance`}
        url={`/services/${service.category}/${service.slug}`}
        type="product"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.name,
          description: service.inclusions.join(', '),
          category: category?.name || service.category,
          provider: {
            '@type': 'Organization',
            name: 'ETaxwala Business Solutions Pvt Ltd',
            url: 'https://etaxwala.com',
            telephone: '+91-7071070707',
          },
          offers: {
            '@type': 'Offer',
            price: service.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
          areaServed: 'IN',
        }}
        faqs={serviceFaqs.map((f) => ({ question: f.q, answer: f.a }))}
      />

      {/* Hero / Breadcrumb */}
      <section className="relative bg-[#FFFDF9] py-14 border-b border-[#EAE6DD]">
        {/* Multicolour accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-multicolor" />
        <div className="container-etaxwala">
          <div className="mb-4">
            <Breadcrumbs
              items={[
                { label: 'Services', href: '/services' },
                { label: category?.name || service.category, href: `/services` },
                { label: service.name },
              ]}
              className="text-slate-500"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> CA &amp; Legal Specialist Practice
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                {service.name}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Complete statutory execution, documentation drafting, and compliance verification led by experienced Chartered Accountants.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-2">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /> 7–10 Business Days</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Approval Guarantee</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9/5 Rating (1.2k+ Reviews)</span>
              </div>
            </div>

            {/* Quick Price Booking Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-xl space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custom Quote</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="price-masked text-3xl">₹ ★ ★ ★</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Contact us to get your personalised quote</p>
                </div>

                <Link
                  to="/appointment"
                  className="w-full py-3.5 rounded-xl btn-multicolor font-bold text-sm shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Get a Free Quote</span> <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="tel:+917071070707"
                  className="w-full py-3 rounded-xl border border-[#EAE6DD] hover:bg-[#FAF9F5] text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0084D1]" /> Call Direct: +91 70710 70707
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section bg-slate-50 dark:bg-slate-950 py-16">
        <div className="container-etaxwala max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12">
            
            {/* Left: What is Included + Documents Required + Process */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Inclusions Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  What is Included in This Service Package?
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {service.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.7.10: Documents Required Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Documents Required Checklist
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Keep digital or scanned copies of these documents ready. You can easily upload them via client portal after booking.
                </p>
                <div className="space-y-2.5">
                  {docsList.map((doc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4-Step Process */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  How ETaxwala Executes Your Filing
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {processSteps.map((s) => (
                    <div key={s.step} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">Step {s.step}</span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Frequently Asked Questions</h3>
                <div className="space-y-2.5">
                  {serviceFaqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600"
                        >
                          <span>{faq.q}</span>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90 text-blue-600' : 'text-slate-400'}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right: Guarantee + Related Services */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Trust Box */}
              <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-3xl p-6 shadow-xs space-y-4">
                {/* Multicolour top accent */}
                <div className="h-0.5 w-12 bg-multicolor rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-[#EAE6DD] text-[#7C3AED]">
                  ETaxwala Guarantee
                </span>
                <h3 className="font-bold text-base text-slate-900">Why 1 Lakh+ Businesses Choose Us</h3>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0084D1] shrink-0 mt-0.5" />
                    <span>Every filing personally signed &amp; audited by practicing CAs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                    <span>100% transparent fee structure with zero hidden charges.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                    <span>On-time milestone delivery backed by institutional SLA.</span>
                  </li>
                </ul>
              </div>

              {/* Related Services */}
              {related.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Related Services in this Category</h4>
                  <div className="space-y-2.5">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/services/${rel.category}/${rel.slug}`}
                        className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all block group"
                      >
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {rel.name}
                        </h5>
                        <p className="text-xs font-bold price-masked mt-1">₹ ★ ★ ★</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>
    </>
  );
}