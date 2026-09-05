import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Play, RotateCcw, ExternalLink, ShieldCheck,
  Cpu, Eye, Layers, CheckCircle2, ArrowRight
} from 'lucide-react';
import SEO from '@/components/seo';
import { PageLoader } from '@/components/loading';
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonCard, SkeletonGrid, SkeletonStats, SkeletonTable } from '@/components/ui/skeleton';
import { LazyImage } from '@/components/ui/lazy-image';
import { LoadingPage, PaginatedList, InfiniteScroll } from '@/components/loading-page';
import { DashboardSkeleton } from '@/components/loading';

export default function LoadingDemoPage() {
  const [showFullscreenLoader, setShowFullscreenLoader] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [key, setKey] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData([
        { id: 1, title: 'Private Limited SPICe+ Filing', description: 'MCA V3 Gateway verified' },
        { id: 2, title: 'GST Return GSTR-3B Auto-Reconciled', description: 'Input Tax Credit calculated' },
        { id: 3, title: 'Tax Audit 44AB Report', description: 'Senior CA digital signature attached' },
      ]);
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [key]);

  return (
    <>
      <SEO
        title="MNC Enterprise Loading Experience — ETaxwala Business Solution Pvt Ltd"
        description="State-of-the-art corporate loading screen with orbital particle rings, multi-stage compliance telemetry, and 256-bit encryption handshakes."
      />

      {/* Fullscreen Loader Triggered State */}
      <AnimatePresence>
        {showFullscreenLoader && (
          <div className="fixed inset-0 z-[9999]">
            <PageLoader
              message={customMessage || undefined}
              onComplete={() => {
                // Auto-close after completion after a brief pause
                setTimeout(() => setShowFullscreenLoader(false), 1200);
              }}
              fullScreen={true}
            />
            <button
              onClick={() => setShowFullscreenLoader(false)}
              className="fixed top-6 right-6 z-[10000] px-4 py-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full text-xs font-bold backdrop-blur-md shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>✕ Close Preview</span>
            </button>
          </div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#FAF9F5] pt-28 pb-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6DD] text-xs font-bold text-[#7C3AED] shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MNC Legal-Tech UI Standard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Corporate Loading System
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl">
              Engineered for <strong>ETaxwala Business Solution Pvt Ltd</strong> with dual-ring orbital motion, multi-stage statutory telemetry, dynamic laser progress tracking, and bank-grade SSL trust compliance.
            </p>
          </div>

          {/* 1. Live Interactive MNC Loading Console */}
          <section className="bg-white rounded-3xl border border-[#EAE6DD] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAE6DD]">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>1. Live MNC Enterprise Loading Console</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Embedded preview matching the official site theme.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setKey((k) => k + 1)}
                  className="px-4 py-2.5 rounded-xl border border-[#EAE6DD] bg-[#FAF9F5] hover:bg-white text-xs font-bold text-slate-700 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Replay Animation</span>
                </button>

                <button
                  onClick={() => setShowFullscreenLoader(true)}
                  className="px-5 py-2.5 rounded-xl btn-multicolor text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Fullscreen Preview</span>
                </button>
              </div>
            </div>

            {/* Embedded Live Loader View */}
            <div className="relative rounded-2xl overflow-hidden border border-[#EAE6DD] shadow-inner">
              <PageLoader
                key={key}
                message={customMessage || undefined}
                fullScreen={false}
              />
            </div>

            {/* Interactive Controller */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Test Custom Loading Message (Optional):
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Generating SPICe+ Incorporation Certificate..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-white border border-[#EAE6DD] rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                />
                {customMessage && (
                  <button
                    onClick={() => setCustomMessage('')}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
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
    </>
  );
}
