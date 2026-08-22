import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <section className="bg-primary-700 py-20 text-white">
        <div className="container-etaxwala">
          <h1 className="text-4xl font-bold lg:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Have questions? We're here to help. Reach out to us through any of these channels.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-etaxwala">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, title: 'Call Us', value: '+91 70710 70707', href: 'tel:+917071070707' },
              { icon: Mail, title: 'Email Us', value: 'support@etaxwala.com', href: 'mailto:support@etaxwala.com' },
              { icon: MapPin, title: 'Visit Us', value: 'Aurangabad, Maharashtra', href: '#offices' },
              { icon: Clock, title: 'Working Hours', value: 'Mon-Sat: 10am - 7pm', href: '#' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.title} href={item.href} className="card p-6 text-center hover:border-accent">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                </a>
              );
            })}
          </div>

          <div id="offices" className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              { name: 'Chhatrapati Sambhaji Nagar (Aurangabad)', address: '3rd Floor, Infront of Reliance Digital, Ashoka\'s Residency, Beed Bypass Rd, Deolai Parisar, Chhatrapati Sambhaji Nagar, Maharashtra 431001' },
              { name: 'Ambad Office, Jalna', address: '150, Jalna Road, beside Bhagwati Traders, Ambad, Maharashtra 431204' },
            ].map((office) => (
              <div key={office.name} className="card p-6">
                <h3 className="text-lg font-semibold text-primary">{office.name}</h3>
                <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  {office.address}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}