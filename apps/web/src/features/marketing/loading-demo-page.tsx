import React, { useState, useEffect } from 'react';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonCard, SkeletonGrid, SkeletonStats, SkeletonTable } from '@/components/ui/skeleton';
import { LazyImage } from '@/components/ui/lazy-image';
import { LoadingPage, PaginatedList, InfiniteScroll } from '@/components/loading-page';
import { PageLoader, DashboardSkeleton } from '@/components/loading';

export default function LoadingDemoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        { id: 1, title: 'Item 1', description: 'Description 1' },
        { id: 2, title: 'Item 2', description: 'Description 2' },
        { id: 3, title: 'Item 3', description: 'Description 3' },
        { id: 4, title: 'Item 4', description: 'Description 4' },
        { id: 5, title: 'Item 5', description: 'Description 5' },
      ]);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] p-6 sm:p-10 space-y-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-slate-700 mb-3">
            Developer Tooling &amp; Design System
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Loading &amp; Skeleton States</h1>
          <p className="text-slate-500 text-sm">Comprehensive preview of all UX loading states and animated skeletons</p>
        </div>

        {/* 1. Page Loader Demo */}
        <section className="bg-[#FFFDF9] p-6 sm:p-8 rounded-3xl border border-[#EAE6DD] shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-4">1. Page Loader with LoadingPage Wrapper</h2>
          <LoadingPage isLoading={isLoading}>
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-medium">
              ✓ Content loaded successfully!
            </div>
          </LoadingPage>
          <button
            onClick={() => setIsLoading(true)}
            className="mt-4 px-5 py-2.5 btn-multicolor text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <span className="relative z-10">Reload Demo</span>
          </button>
        </section>

        {/* 2. Basic Skeleton Components */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">2. Basic Skeleton Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3">Skeleton Text</h3>
              <SkeletonText lines={4} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3">Skeleton Circle</h3>
              <div className="flex items-center gap-4">
                <SkeletonCircle size={40} />
                <SkeletonCircle size={60} />
                <SkeletonCircle size={80} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3">Custom Skeleton</h3>
              <div className="space-y-2">
                <Skeleton width="100%" height="20px" />
                <Skeleton width="80%" height="16px" />
                <Skeleton width="60%" height="12px" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3">Shine Animation</h3>
              <Skeleton width="100%" height="40px" animation="shine" />
            </div>
          </div>
        </section>

        {/* 3. Card Skeletons */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">3. Card Skeleton Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SkeletonCard showImage={true} />
            <SkeletonCard showAvatar={true} showImage={false} />
            <SkeletonCard showFooter={true} showImage={false} />
          </div>
        </section>

        {/* 4. Grid & Stats Skeletons */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">4. Grid & Stats Skeletons</h2>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">Stats Grid</h3>
            <SkeletonStats count={4} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-3">Card Grid</h3>
            <SkeletonGrid count={6} columns={3} cardType="image" />
          </div>
        </section>

        {/* 5. Table Skeleton */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">5. Table Skeleton</h2>
          <SkeletonTable rows={5} columns={5} />
        </section>

        {/* 6. Lazy Loading Images */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">6. Lazy Loading Images with Blur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LazyImage
              src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400"
              alt="Demo 1"
              className="h-48 rounded-lg"
              blur={true}
            />
            <LazyImage
              src="https://images.unsplash.com/photo-1682695796984-7a8a3b780b79?w=400"
              alt="Demo 2"
              className="h-48 rounded-lg"
              blur={true}
            />
            <LazyImage
              src="https://images.unsplash.com/photo-1682687981970-7a8a3b780c85?w=400"
              alt="Demo 3"
              className="h-48 rounded-lg"
              blur={true}
            />
          </div>
        </section>

        {/* 7. Paginated List */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">7. Paginated List with Load More</h2>
          <PaginatedList
            items={data}
            isLoading={isLoading}
            initialPageSize={3}
            skeletonItem={<div className="h-16 bg-slate-100 rounded-lg animate-pulse" />}
          >
            {(item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            )}
          </PaginatedList>
        </section>

        {/* 8. Dashboard Skeleton */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">8. Complete Dashboard Skeleton</h2>
          <DashboardSkeleton />
        </section>

        {/* 9. Existing Loaders */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-4">9. Existing Loading Components</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3">PageLoader (Full Screen)</h3>
              <div className="relative h-64 border border-slate-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-white/90">
                  <PageLoader message="Loading dashboard..." />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
