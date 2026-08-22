import { Routes, Route } from 'react-router-dom';
import MarketingLayout from '@/layouts/marketing-layout';
import HomePage from '@/features/marketing/home/home-page';
import AboutPage from '@/features/marketing/about/about-page';
import ContactPage from '@/features/marketing/contact/contact-page';
import CareersPage from '@/features/marketing/careers/careers-page';
import ServicesHubPage from '@/features/marketing/services/services-hub-page';
import ServiceDetailPage from '@/features/marketing/services/service-detail-page';
import BlogListPage from '@/features/marketing/blog/blog-list-page';
import BlogDetailPage from '@/features/marketing/blog/blog-detail-page';
import AppointmentPage from '@/features/marketing/appointment/appointment-page';
import ITRFilingPage from '@/features/marketing/funnels/itr-filing-page';
import FPCTrainingPage from '@/features/marketing/funnels/fpc-training-page';
import LegalPage from '@/features/marketing/legal/legal-page';
import NotFoundPage from '@/features/marketing/not-found/not-found-page';

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/services" element={<ServicesHubPage />} />
        <Route path="/services/:categorySlug" element={<ServicesHubPage />} />
        <Route path="/services/:categorySlug/:serviceSlug" element={<ServiceDetailPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/itr-filing" element={<ITRFilingPage />} />
        <Route path="/fpc-training" element={<FPCTrainingPage />} />
        <Route path="/legal/:type" element={<LegalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}