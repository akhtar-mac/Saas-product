import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import FloatingCTA from '@/components/layout/floating-cta';
import MobileBottomBar from '@/components/layout/mobile-bottom-bar';
import ScrollToTop from '@/components/layout/scroll-to-top';

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      {/* Safe bottom padding on mobile for the sticky bottom bar */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <FloatingCTA />
      <MobileBottomBar />
    </div>
  );
}