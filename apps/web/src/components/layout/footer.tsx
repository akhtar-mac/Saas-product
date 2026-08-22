import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Youtube, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-700 text-white/80">
      <div className="container-etaxwala py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">ETaxwala</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Your Business Doctor. We diagnose root causes and prescribe solutions that help
              your business flourish. Expert Chartered Accountants and business consultants at
              your service.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="https://facebook.com/etaxwala.official" className="rounded-full bg-white/10 p-2 hover:bg-accent" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://youtube.com/@etaxwala" className="rounded-full bg-white/10 p-2 hover:bg-accent" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="https://instagram.com/etaxwala.official" className="rounded-full bg-white/10 p-2 hover:bg-accent" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com/company/etaxwala" className="rounded-full bg-white/10 p-2 hover:bg-accent" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-white">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services/registration/private-limited" className="hover:text-accent">Business Registration</Link></li>
              <li><Link to="/services/taxation/itr" className="hover:text-accent">Taxation & Returns</Link></li>
              <li><Link to="/services" className="hover:text-accent">Audit & Compliances</Link></li>
              <li><Link to="/services/consultancy/business" className="hover:text-accent">Business Consultancy</Link></li>
              <li><Link to="/services/consultancy/marketing" className="hover:text-accent">Marketing & Branding</Link></li>
            </ul>
          </div>

          {/* Others */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-white">Others</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog" className="hover:text-accent">Blogs</Link></li>
              <li><Link to="/fpc-training" className="hover:text-accent">Webinar</Link></li>
              <li><a href="/careers" className="hover:text-accent">Career</a></li>
              <li><Link to="/legal/refund" className="hover:text-accent">Refund Policy</Link></li>
              <li><Link to="/legal/terms" className="hover:text-accent">Terms & Conditions</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-accent">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase text-white">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <span>3rd Floor, Infront of Reliance Digital, Ashoka's Residency, Beed Bypass Rd, Chhatrapati Sambhaji Nagar, Maharashtra 431001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-accent" />
                <a href="mailto:support@etaxwala.com" className="hover:text-accent">support@etaxwala.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-accent" />
                <a href="tel:+917071070707" className="hover:text-accent">+91 70710 70707</a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <div>
                  <p>Mon - Saturday: 10:00 am to 07:00 pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm">
          <p>ETaxwala Business Solutions Pvt Ltd. All rights reserved.</p>
          <p className="mt-1 text-xs text-white/60">
            Designed &amp; Developed by Team ETaxwala
          </p>
        </div>
      </div>
    </footer>
  );
}