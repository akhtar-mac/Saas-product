import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  animation?: 'pulse' | 'shine' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius = 'rounded',
  animation = 'pulse',
}) => {
  const widthStyle = width ? (typeof width === 'number' ? `${width}px` : width) : '100%';
  const heightStyle = height ? (typeof height === 'number' ? `${height}px` : height) : '1rem';

  const animationClass = animation === 'none' ? '' : animation === 'shine' ? 'animate-shine' : 'animate-pulse';

  return (
    <div
      className={`bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 ${borderRadius} ${animationClass} ${className}`}
      style={{ width: widthStyle, height: heightStyle }}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineHeight?: string;
  gap?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  lineHeight = 'h-4',
  gap = 'space-y-2',
  lastLineWidth = '60%',
}) => {
  return (
    <div className={`${className} ${gap}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          className={`${lineHeight}`}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

interface SkeletonCircleProps {
  size?: number | string;
  className?: string;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size = 40,
  className = '',
}) => {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;
  return (
    <Skeleton
      width={sizeStyle}
      height={sizeStyle}
      borderRadius="rounded-full"
      className={className}
    />
  );
};

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showFooter?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showImage = true,
  showAvatar = false,
  showTitle = true,
  showDescription = true,
  showFooter = false,
}) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm ${className}`}>
      {showImage && (
        <Skeleton height="160px" className="mb-4 rounded-lg" />
      )}
      
      {showAvatar && (
        <div className="flex items-center gap-3 mb-3">
          <SkeletonCircle size={40} />
          <div className="flex-1">
            <SkeletonText lines={1} lineHeight="h-3" gap="space-y-1" lastLineWidth="70%" />
          </div>
        </div>
      )}

      {showTitle && (
        <SkeletonText lines={1} lineHeight="h-5" className="mb-2" lastLineWidth="80%" />
      )}

      {showDescription && (
        <SkeletonText lines={2} lineHeight="h-3" gap="space-y-1.5" className="mb-3" />
      )}

      {showFooter && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Skeleton width="80px" height="24px" />
          <Skeleton width="60px" height="24px" />
        </div>
      )}
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="grid gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1rem" width={`${100 / columns}%`} />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} height="1rem" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

interface SkeletonGridProps {
  count?: number;
  columns?: number;
  className?: string;
  cardType?: 'default' | 'image' | 'avatar';
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 6,
  columns = 3,
  className = '',
  cardType = 'default',
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={`grid ${columnClasses[columns as keyof typeof columnClasses]} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
          key={i}
          showImage={cardType === 'image'}
          showAvatar={cardType === 'avatar'}
          showFooter={cardType === 'default'}
        />
      ))}
    </div>
  );
};

interface SkeletonStatsProps {
  count?: number;
  className?: string;
}

export const SkeletonStats: React.FC<SkeletonStatsProps> = ({
  count = 4,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <SkeletonCircle size={32} />
            <Skeleton width="40px" height="24px" />
          </div>
          <Skeleton height="32px" width="80px" className="mb-2" />
          <Skeleton height="16px" width="60%" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
