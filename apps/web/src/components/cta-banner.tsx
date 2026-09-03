import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';

interface CtaBannerProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryIsPhone?: boolean;
  phoneNumber?: string;
  className?: string;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({
  title = "Ready to Work with India's Best?",
  subtitle = 'Book a free consultation and discover how ETaxwala can transform your business compliance experience.',
  primaryButtonText = 'Book Free Consultation',
  primaryButtonLink = '/appointment',
  secondaryButtonText = 'Explore Services',
  secondaryButtonLink = '/services',
  secondaryIsPhone = false,
  phoneNumber = '080-6902-9999',
  className = '',
}) => {
  return (
    <section className={`py-14 bg-white ${className}`}>
      <div className="container-etaxwala">
        {/* Card with Multicolour Gradient Outline */}
        <div className="group relative p-[1.5px] rounded-3xl bg-multicolor shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="rounded-[22.5px] bg-[#FFFDF9] p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Subtle soft ambient glow in the corners */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-[#7C3AED]/8 via-transparent to-transparent blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-radial from-[#0084D1]/8 via-transparent to-transparent blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
                {subtitle}
              </p>
              <div className="flex flex-wrap gap-3.5 justify-center items-center">
                {/* Primary: Galaxy dark button */}
                <Link
                  to={primaryButtonLink}
                  className="px-6 py-3.5 rounded-xl btn-multicolor text-white"
                >
                  <span className="btn-galaxy__stars" aria-hidden="true" />
                  <span className="relative z-[2] inline-flex items-center gap-2 font-bold text-sm">
                    <span>{primaryButtonText}</span>
                    <ArrowRight className="btn-galaxy__icon w-4 h-4 text-white" />
                  </span>
                </Link>

                {secondaryIsPhone ? (
                  <a
                    href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
                    className="px-6 py-3.5 rounded-xl btn-outline-multicolor text-sm"
                  >
                    <span className="btn-galaxy__stars" aria-hidden="true" />
                    <span className="relative z-[2] inline-flex items-center gap-2 font-bold">
                      <Phone className="w-4 h-4 text-[#F97316]" />
                      <span>{secondaryButtonText || `Call: ${phoneNumber}`}</span>
                    </span>
                  </a>
                ) : (
                  <Link
                    to={secondaryButtonLink}
                    className="px-6 py-3.5 rounded-xl btn-outline-multicolor text-sm"
                  >
                    <span className="btn-galaxy__stars" aria-hidden="true" />
                    <span className="relative z-[2] inline-flex items-center gap-2 font-bold">
                      <span>{secondaryButtonText}</span>
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
