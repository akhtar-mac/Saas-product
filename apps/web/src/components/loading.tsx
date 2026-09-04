import React from 'react';

// ─── Page Loading Spinner with ETaxwala Multicolor Theme ─────────────────────
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#EAE6DD]" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#0084D1] border-r-[#7C3AED] border-b-[#E11D48] border-l-[#F97316] animate-spin" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#0084D1]/10 via-[#7C3AED]/10 to-[#E11D48]/10 animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-bold bg-gradient-to-r from-[#0084D1] via-[#7C3AED] to-[#E11D48] bg-clip-text text-transparent">
          ETaxwala
        </h2>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
      </div>
    </div>
  </div>
);

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
