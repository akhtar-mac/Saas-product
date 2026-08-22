import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Phone, MessageCircle, FileBadge, ChevronRight, Star, Clock, ShieldCheck } from 'lucide-react';
import SEO from '@/components/seo';
import { getServiceBySlug, getCategoryById, services, formatPrice } from '@/lib/constants/services';

const processSteps = [
  { step: 1, title: 'Submit Documents', desc: 'Share required documents through our secure client portal.' },
  { step: 2, title: 'Expert Review', desc: 'Our CA/legal team reviews and verifies your documents.' },
  { step: 3, title: 'Filing & Processing', desc: 'We file with the concerned authority and track progress.' },
  { step: 4, title: 'Delivery', desc: 'Receive your certificate/document digitally.' },
];

const genericFaqs = [
  { q: 'How long does this process take?', a: 'Typically 15-25 working days from document submission. Timelines depend on government processing.' },
  { q: 'What documents are required?', a: 'Our team will provide a customized checklist after your initial consultation. Generally includes PAN, Aadhaar, address proof, and business details.' },
  { q: 'Is the price all-inclusive?', a: 'Yes, the price shown is all-inclusive. No hidden charges. Government fees may apply extra in certain states.' },
  { q: 'Can I track progress online?', a: 'Absolutely. Once you register, you get a client portal login to track real-time status, chat with your CA, and upload documents.' },
];

export default function ServiceDetailPage() {
  const { serviceSlug, categorySlug } = useParams();
  const service = getServiceBySlug(serviceSlug || '');
  const category = service ? getCategoryById(service.category) : null;

  if (!service) {
    return (
      <div className="py-32 text-center">
        <SEO title="Service Not Found" url="/services" />
        <p className="text-lg text-slate-500">Service not found.</p>
        <Link to="/services" className="btn-primary mt-4">Browse All Services</Link>
      </div>
    );
  }

  // Related services (same category, excluding current)
  const related = services.filter((s) => s.category === service.category && s.id !== service.id).slice(0, 4);

  return (
    <>
      <SEO
        title={`${service.name} - ${formatPrice(service.price)}`}
        description={`${service.name} starting from ${formatPrice(service.price)}. ${service.inclusions.slice(0, 3).join(', ')}. Expert CA-led service with real-time tracking. 98.9% success rate.`}
        keywords={`${service.name}, ${category?.name}, ETaxwala, business services`}
        url={`/services/${service.category}/${service.slug}`}
        type="product"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.name,
          description: service.inclusions.join(', '),
          provider: {
            '@type': 'Organization',
            name: 'ETaxwala Business Solutions Pvt Ltd',
            url: 'https://etaxwala.com',
          },
          offers: service.price > 0 ? {
            '@type': 'Offer',
            price: service.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          } : undefined,
          areaServed: 'IN',
        }}
      />
      {/* Hero / Breadcrumb */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 py-12 text-white">
        <div className="container-etaxwala">
          <nav className="flex items-center gap-1 text-sm text-white/60">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/services" className="hover:text-white">Services</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/services/${category?.slug}`} className="hover:text-white">{category?.name}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{service.name}</span>
          </nav>
          <div className="mt-6 flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {service.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                    <Star className="h-3 w-3 fill-accent" /> Popular
                  </span>
                )}
                <span className="text-xs text-white/60">{category?.name}</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold lg:text-4xl">{service.name}</h1>
              <p className="mt-2 text-2xl font-bold text-accent">{formatPrice(service.price)}</p>
            </div>
            <div className="hidden flex-shrink-0 md:block">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <FileBadge className="h-8 w-8 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Left: Details */}
            <div className="lg:col-span-2">
              {/* Inclusions */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">What's Included</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {service.inclusions.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
                <div className="mt-6 space-y-4">
                  {processSteps.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {step.step}
                      </div>
                      <div className="pt-1">
                        <h3 className="font-semibold text-slate-900">{step.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why ETaxwala */}
              <div className="mt-12 rounded-2xl bg-slate-50 p-8">
                <h2 className="text-2xl font-bold text-slate-900">Why Choose ETaxwala?</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: ShieldCheck, title: 'CA-Led Expertise', desc: 'Every service handled by licensed Chartered Accountants' },
                    { icon: Clock, title: 'Fast Turnaround', desc: '15-25 days average completion time' },
                    { icon: CheckCircle2, title: '98.9% Success Rate', desc: '1 Lakh+ happy customers across India' },
                    { icon: MessageCircle, title: 'Real-time Support', desc: 'Chat with your assigned expert anytime' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                          <Icon className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">{item.title}</h3>
                          <p className="text-xs text-slate-600">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FAQ */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
                <div className="mt-6 space-y-3">
                  {genericFaqs.map((faq, i) => (
                    <details key={i} className="group rounded-xl border border-slate-200 bg-white p-5">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-900 list-none">
                        {faq.q}
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Pricing card */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 rounded-2xl border-2 border-accent/20 bg-white p-6 shadow-lg">
                <p className="text-sm text-slate-500">Total Price</p>
                <p className="mt-1 text-4xl font-bold text-primary">{formatPrice(service.price)}</p>
                <p className="mt-1 text-xs text-slate-500">All Inclusive • No Hidden Charges</p>

                <div className="mt-6 space-y-3">
                  <Link to="/appointment" className="btn-accent w-full">
                    Buy Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/contact" className="btn-outline w-full">
                    Inquiry Now
                  </Link>
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-100 pt-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> Expert Consultation Included
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> Real-time Status Tracking
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> Dedicated CA Support
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> 100% Data Security
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-700">Need help? Talk to an expert</p>
                  <a href="tel:+917071070707" className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary">
                    <Phone className="h-4 w-4" /> +91 70710 70707
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related services */}
          {related.length > 0 && (
            <div className="mt-16 border-t border-slate-200 pt-12">
              <h2 className="text-2xl font-bold text-slate-900">Related Services</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((r) => (
                  <Link key={r.id} to={`/services/${r.category}/${r.slug}`} className="card group p-4 hover:border-accent">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary">{r.name}</h3>
                    <p className="mt-1 text-sm font-bold text-primary">{formatPrice(r.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}