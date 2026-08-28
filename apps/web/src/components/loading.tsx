import React from 'react';

// ─── Page Loading Spinner ─────────────────────────────────────────────────────
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  </div>
);

// ─── Section Loader (inline) ──────────────────────────────────────────────────
export const SectionLoader: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="w-full animate-pulse space-y-3 py-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
      </div>
    ))}
  </div>
);

// ─── Card Grid Skeleton ───────────────────────────────────────────────────────
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
        </div>
        <div className="mt-4 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    ))}
  </div>
);

// ─── Stats Cards Skeleton ─────────────────────────────────────────────────────
export const StatsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3" />
        <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      </div>
    ))}
  </div>
);

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
export const TableRowSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 8,
  cols = 5,
}) => (
  <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 animate-pulse">
        {Array.from({ length: cols }).map((_, j) => (
          <div
            key={j}
            className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1"
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

export default PageLoader;
