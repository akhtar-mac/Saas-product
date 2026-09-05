import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  onComplete?: () => void;
  fullScreen?: boolean;
}

// ─── Clean Enterprise Corporate Page Loader ─────────────────────────
export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading, please wait...',
  subMessage,
  showProgress = true,
  onComplete,
  fullScreen = true,
}) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          onComplete?.();
          return 100;
        }
        const increment = prev < 45 ? 6 : prev < 80 ? 4 : prev < 95 ? 2 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 70);

    return () => {
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF9F5] overflow-hidden select-none'
    : 'relative w-full min-h-[460px] flex flex-col items-center justify-center bg-[#FAF9F5] rounded-3xl border border-[#EAE6DD] overflow-hidden select-none p-8';

  return (
    <div className={containerClasses}>
      {/* ── Top Multicolor Accent Strip ── */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] animate-pulse" />

      {/* ── Ambient Soft Color Orbs ── */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0084D1]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-[#E11D48]/8 rounded-full blur-[90px] pointer-events-none" />

      {/* ── Subtle Technical Hairline Grid ── */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#CBD5E1 1px, transparent 1px), radial-gradient(#CBD5E1 1px, #FAF9F5 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      {/* ── Main Central Console ── */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        
        {/* Brand Emblem with Orbital Rings */}
        <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
          
          {/* Outer Multi-color Rotating Ring */}
          <div
            className="absolute inset-0 rounded-full border-[3.5px] border-transparent animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, #0084D1, #7C3AED, #E11D48, #F97316, #0084D1)',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3.5px), #fff calc(100% - 3px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3.5px), #fff calc(100% - 3px))',
              animationDuration: '3.5s',
            }}
          />

          {/* Reverse Rotating High-Tech Dashed Ring */}
          <div
            className="absolute inset-2 rounded-full border border-dashed border-slate-300 animate-spin"
            style={{
              animationDirection: 'reverse',
              animationDuration: '9s',
            }}
          />

          {/* Glowing Satellite Beacons */}
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0084D1] shadow-[0_0_14px_#0084D1]"
          />
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#E11D48] shadow-[0_0_12px_#E11D48]"
          />

          {/* Inner Frosted Shield with Official Logo */}
          <div className="relative w-24 h-24 rounded-full bg-white/95 backdrop-blur-md border border-[#EAE6DD] shadow-xl flex items-center justify-center p-3.5">
            <img
              src="/logo_black.png"
              alt="ETaxwala Business Solution Pvt Ltd"
              className="w-full h-auto object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* Company Legal Name */}
        <div className="space-y-1 mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ETaxwala{' '}
            <span className="bg-gradient-to-r from-[#0084D1] via-[#7C3AED] to-[#E11D48] bg-clip-text text-transparent">
              Business Solution
            </span>
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            Pvt Ltd
          </p>
        </div>

        {/* Normal Clean Loading Indicator */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
              <span>{message}</span>
            </span>
            {showProgress && (
              <span className="font-mono font-bold text-xs text-[#7C3AED]">
                {progress}%
              </span>
            )}
          </div>

          {/* Glowing Gradient Progress Bar */}
          {showProgress && (
            <div className="relative h-2 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#0084D1] via-[#7C3AED] via-[#E11D48] to-[#F97316] relative"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeInOut', duration: 0.15 }}
              >
                {/* Subtle Laser Head Flare */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#FFFFFF] transform translate-x-1" />
              </motion.div>
            </div>
          )}

          {subMessage && (
            <p className="text-[11px] text-slate-400 font-medium">
              {subMessage}
            </p>
          )}

          {/* Clean Subtle Activity Dots */}
          <div className="flex items-center justify-center gap-1 pt-3">
            {[35, 65, 30, 85, 55, 95, 45, 75, 40, 60].map((height, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-slate-300 to-[#7C3AED] rounded-full animate-pulse"
                style={{
                  height: `${Math.max(5, (height * 14) / 100)}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.9s',
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Section Loader (inline) ──────────────────────────────────────────────────
export const SectionLoader: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="w-full space-y-3 py-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3 animate-pulse">
        <div className="h-4 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded flex-1" />
        <div className="h-4 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded w-1/3" />
        <div className="h-4 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded w-1/4" />
      </div>
    ))}
  </div>
);

// ─── Card Grid Skeleton with Multicolor Accent ────────────────────────────────
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-[#EAE6DD] p-5 animate-pulse shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0084D1]/20 via-[#7C3AED]/20 to-[#E11D48]/20 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded w-3/4" />
            <div className="h-3 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded" />
          <div className="h-3 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded w-5/6" />
        </div>
        <div className="mt-4 h-9 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded-lg" />
      </div>
    ))}
  </div>
);

// ─── Stats Cards Skeleton with Multicolor ─────────────────────────────────────
export const StatsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-[#EAE6DD] p-5 animate-pulse shadow-sm">
        <div className="h-8 w-8 bg-gradient-to-br from-[#0084D1]/20 via-[#7C3AED]/20 to-[#E11D48]/20 rounded-lg mb-3" />
        <div className="h-7 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded w-2/3 mb-2" />
        <div className="h-3 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded w-1/2" />
      </div>
    ))}
  </div>
);

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
export const TableRowSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 8,
  cols = 5,
}) => (
  <div className="space-y-0 divide-y divide-[#F5F3EC]">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 animate-pulse">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="h-4 bg-gradient-to-r from-[#EAE6DD] via-[#F5F3EC] to-[#EAE6DD] rounded flex-1"
            style={{ maxWidth: j === 0 ? '180px' : undefined }}
          />
        ))}
      </div>
    ))}
  </div>
);

// ─── Inline text skeleton ─────────────────────────────────────────────────────
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-slate-200 dark:bg-slate-700 rounded"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

// ─── Dashboard Skeleton ───────────────────────────────────────────────────────
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 max-w-6xl mx-auto">
    <div className="h-32 bg-gradient-to-r from-brand-navy via-[#00487C] to-brand-navy-dark rounded-2xl animate-pulse" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 p-5 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      ))}
    </div>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        ))}
      </div>
    </div>
  </div>
);

export default PageLoader;
