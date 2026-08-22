import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Phone, MessageCircle, FileText } from 'lucide-react';

const sampleServices: Record<string, { name: string; price: number; inclusions: string[]; process: { step: number; title: string; desc: string }[]; faqs: { q: string; a: string }[] }> = {
  'private-limited': {
    name: 'Private Limited Company Registration',
    price: 16499,
    inclusions: [
      'Free Company Name Search & 1 Name approval',
      'Free Experts Advice',
      'Up to 1 lakh authorized capital',
      '2 DSC for Directors',
      'DIN for 2 Directors + Incorporation fees',
      'Stamp duty*',
      'Incorporation Certificate',
      'MOA & AOA',
      'Company PAN card',
      'Company TAN Number',
      'Shares Certificate',
      'Bank Account Opening Document support',
      'Continuous Legal Support',
    ],
    process: [
      { step: 1, title: 'DSC & DIN Application', desc: 'Each director applies for Digital Signature and Director Identification Number.' },
      { step: 2, title: 'Name Approval', desc: 'Provide 3 name options to MCA, ensuring uniqueness and relevance.' },
      { step: 3, title: 'MoA & AoA Submission', desc: 'Draft Memorandum and Articles of Association upon name approval.' },
      { step: 4, title: 'Incorporation Certificate', desc: 'Obtain certificate with CIN in 15-25 days.' },
      { step: 5, title: 'PAN, TAN & Bank Account', desc: 'Apply for PAN, TAN, and open bank account with certificates.' },
    ],
    faqs: [
      { q: 'Is it mandatory to deposit Share capital at the time of Incorporation?', a: 'No, share capital can be deposited within two months after registration and bank account opening.' },
      { q: 'Does a Private Limited Company require yearly renewal?', a: 'No, a Pvt Ltd Company continues until officially closed down by its owners.' },
      { q: 'Can the company address be changed after Incorporation?', a: 'Yes, the company address can be changed post Incorporation.' },
    ],
  },
};

export default function ServiceDetailPage() {
  const { serviceSlug, categorySlug } = useParams();
  const service = sampleServices[serviceSlug || ''] || {
    name: serviceSlug?.replace(/-/g, ' ') || 'Service',
    price: 0,
    inclusions: ['Contact us for details'],
    process: [],
    faqs: [],
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-primary-700 py-16 text-white">
        <div className="container-etaxwala">
          <nav className="text-sm text-white/60">
            <Link to="/">Home</Link> <span className="mx-2">/</span>
            <Link to="/services">Services</Link> <span className="mx-2">/</span>
            <span className="text-white">{service.name}</span>
          </nav>
          <div className="mt-6 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold lg:text-4xl">{service.name}</h1>
              {service.price > 0 && (
                <p className="mt-3 text-2xl font-bold text-accent">
                  Starting from ₹{service.price.toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <div className="hidden flex-shrink-0 md:block">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10">
                <FileText className="h-8 w-8 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inclusions */}
      <section className="section">
        <div className="container-etaxwala">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">What's Included</h2>
              <div className="mt-6 space-y-3">
                {service.inclusions.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              {service.price > 0 && (
                <div className="mt-8 rounded-lg border border-accent/20 bg-accent/5 p-6">
                  <p className="text-sm text-slate-600">Total Price (All Inclusive)</p>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    ₹{service.price.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to="/appointment" className="btn-accent">Buy Now</Link>
                    <Link to="/contact" className="btn-outline">Inquiry Now</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Process */}
            {service.process.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold">Registration Process</h2>
                <div className="mt-6 space-y-6">
                  {service.process.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FAQ */}
          {service.faqs.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <div className="mt-6 space-y-4">
                {service.faqs.map((faq, i) => (
                  <div key={i} className="card p-6">
                    <h3 className="font-semibold text-slate-900">{faq.q}</h3>
                    <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-lg bg-primary-700 p-8 text-center text-white">
            <h3 className="text-xl font-bold">Ready to get started?</h3>
            <p className="mt-2 text-white/80">Our experts will guide you through the entire process.</p>
            <div className="mt-6 flex justify-center gap-4">
              <Link to="/appointment" className="btn-accent">Book Appointment</Link>
              <a href="https://wa.me/917071070707" className="btn-outline border-white/30 text-white">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}