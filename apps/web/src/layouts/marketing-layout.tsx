import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import FloatingCTA from '@/components/layout/floating-cta';
import ScrollToTop from '@/components/layout/scroll-to-top';

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      {/* No top padding — header is transparent/fixed over hero */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}