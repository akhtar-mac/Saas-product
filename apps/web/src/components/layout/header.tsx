import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Phone, Mail, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', to: '/' },
  {
    label: 'Registration',
    children: [
      { label: 'Partnership Firm', to: '/services/registration/partnership-firm' },
      { label: 'One Person Company', to: '/services/registration/opc' },
      { label: 'Private Limited', to: '/services/registration/private-limited' },
      { label: 'LLP', to: '/services/registration/llp' },
      { label: 'Section 8 NGO', to: '/services/registration/section-8-ngo' },
      { label: 'Producer Company', to: '/services/registration/producer-company' },
      { label: 'Public Limited', to: '/services/registration/public-limited' },
      { label: 'Indian Subsidiary', to: '/services/registration/indian-subsidiary' },
    ],
  },
  {
    label: 'Other Registrations',
    children: [
      { label: 'MSME', to: '/services/other/msme' },
      { label: 'GST Registration', to: '/services/other/gst' },
      { label: 'FSSAI', to: '/services/other/fssai' },
      { label: 'Import Export Code', to: '/services/other/import-export' },
      { label: '80G 12A', to: '/services/other/80g-12a' },
      { label: 'Professional Tax', to: '/services/other/professional-tax' },
      { label: 'TAN', to: '/services/other/tan' },
      { label: 'Digital Signature', to: '/services/other/dsc' },
      { label: 'Trade License', to: '/services/other/trade-license' },
    ],
  },
  {
    label: 'Taxation',
    children: [
      { label: 'ITR Filing', to: '/itr-filing' },
      { label: 'GST Return', to: '/services/taxation/gst-return' },
      { label: 'EPFO ESIC Return', to: '/services/taxation/epfo-esic' },
      { label: 'Tax Audit', to: '/services/taxation/tax-audit' },
      { label: 'CMA Report', to: '/services/taxation/cma-report' },
      { label: 'DPR', to: '/services/taxation/dpr' },
    ],
  },
  {
    label: 'Consultancy',
    children: [
      { label: 'Business Consultancy', to: '/services/consultancy/business' },
      { label: 'CFO Services', to: '/services/consultancy/cfo' },
      { label: 'HR & Payroll', to: '/services/consultancy/hr-payroll' },
      { label: 'Startup Funding', to: '/services/consultancy/startup-funding' },
      { label: 'Business Automation', to: '/services/consultancy/automation' },
      { label: 'Marketing & Branding', to: '/services/consultancy/marketing' },
    ],
  },
  { label: 'Blog', to: '/blog' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      {/* Top bar */}
      <div className="hidden bg-primary lg:block">
        <div className="container-etaxwala flex items-center justify-between py-2 text-sm text-white/90">
          <div className="flex items-center gap-6">
            <a href="tel:+917071070707" className="flex items-center gap-2 hover:text-white">
              <Phone className="h-3.5 w-3.5" /> +91 70710 70707
            </a>
            <a href="mailto:support@etaxwala.com" className="flex items-center gap-2 hover:text-white">
              <Mail className="h-3.5 w-3.5" /> support@etaxwala.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/itr-filing" className="hover:text-white">File Your ITR</Link>
            <span>|</span>
            <Link to="/fpc-training" className="hover:text-white">FPC Training</Link>
            <span>|</span>
            <a href="https://etaxwala.com/user_login" className="hover:text-white">Staff Login</a>
            <span>|</span>
            <a href="https://etaxwala.com/customer-login-form" className="hover:text-white">Client Login</a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-etaxwala">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-primary">ETaxwala</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary">
                      {item.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute left-0 top-full w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.to}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition',
                      isActive ? 'text-primary' : 'text-slate-700 hover:text-primary'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/appointment" className="btn-accent text-sm">
              Book Appointment
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="rounded-md p-2 text-slate-700 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="container-etaxwala py-4">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="py-2">
                    <p className="px-3 py-1 text-xs font-semibold uppercase text-slate-400">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.to}
                        className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/appointment"
              className="btn-accent mt-4 w-full"
              onClick={() => setMobileOpen(false)}
            >
              Book Appointment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}