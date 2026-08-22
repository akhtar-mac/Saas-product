import { useParams, Link } from 'react-router-dom';
import { Building2, FileText, Calculator, ShieldCheck, Lightbulb, Sparkles, Search } from 'lucide-react';

const categories = [
  { slug: 'registration', name: 'Business Registration', icon: Building2, count: 9, desc: 'Partnership, Pvt Ltd, LLP, OPC, Section 8, and more' },
  { slug: 'other-registrations', name: 'Other Registrations', icon: FileText, count: 10, desc: 'MSME, GST, FSSAI, Import Export, Professional Tax, DSC' },
  { slug: 'taxation', name: 'Taxation & Returns', icon: Calculator, count: 6, desc: 'ITR filing, GST returns, EPFO/ESIC, tax audit, CMA, DPR' },
  { slug: 'audit', name: 'Audit & Compliances', icon: ShieldCheck, count: 9, desc: 'Company audits for all types: Pvt Ltd, LLP, OPC, Public, Section 8' },
  { slug: 'consultancy', name: 'Business Consultancy', icon: Lightbulb, count: 13, desc: 'CFO services, HR/payroll, funding, automation, growth strategy' },
  { slug: 'marketing', name: 'Marketing & Branding', icon: Sparkles, count: 20, desc: 'Logo, website, SEO, social media, influencer, content marketing' },
];

export default function ServicesHubPage() {
  const { categorySlug } = useParams();

  return (
    <>
      <section className="bg-primary-700 py-20 text-white">
        <div className="container-etaxwala">
          <h1 className="text-4xl font-bold lg:text-5xl">Our Services</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            200+ services to start, manage, and grow your business. Search by category or explore all.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-etaxwala">
          {/* Search bar */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  to={`/services/${cat.slug}`}
                  className="card group p-6 hover:border-accent hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-accent group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="badge bg-accent/10 text-accent">{cat.count} services</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{cat.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{cat.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}