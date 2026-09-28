/**
 * Lightweight Google Analytics 4 (GA4) & Custom Event Tracking Helper
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-ETAXWALA20';

/**
 * Initialize Google Analytics 4 script tag dynamically if ID provided
 */
export function initGA(measurementId: string = GA_MEASUREMENT_ID) {
  if (typeof window === 'undefined' || !measurementId || window.gtag) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
  });
}

/**
 * Track page view in GA4
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: url,
    });
  }
}

/**
 * Track custom event (lead submission, button click, etc.)
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/** Shorthand helpers for key conversion goals */
export const analytics = {
  trackInquirySubmitted: (service: string, city?: string) =>
    trackEvent('generate_lead', { event_category: 'Inquiry', service, city }),
  trackAppointmentBooked: (service?: string, mode?: string) =>
    trackEvent('book_appointment', { event_category: 'Consultation', service, mode }),
  trackCallInitiated: (number: string) =>
    trackEvent('click_to_call', { event_category: 'Contact', phone: number }),
  trackWhatsAppClicked: () =>
    trackEvent('click_to_whatsapp', { event_category: 'Contact' }),
};

export default analytics;
