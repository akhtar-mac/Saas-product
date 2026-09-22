import React, { useState, useEffect } from 'react';
import { PageLoader } from '@/components/loading';

interface LoadingPageProps {
  isLoading: boolean;
  loadingTimeout?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  isLoading,
  loadingTimeout = 300,
  fallback,
  children,
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [shouldShowFallback, setShouldShowFallback] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      
      const timeoutId = setTimeout(() => {
        setShouldShowFallback(true);
      }, loadingTimeout);

      return () => clearTimeout(timeoutId);
    } else {
      const timeoutId = setTimeout(() => {
        setShowLoading(false);
        setShouldShowFallback(false);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, loadingTimeout]);

  if (!showLoading) {
    return <>{children}</>;
  }

  if (shouldShowFallback && fallback) {
    return <>{fallback}</>;
  }

  return <PageLoader />;
};

interface PaginatedListProps<T> {
  items: T[];
  isLoading: boolean;
  initialPageSize?: number;
  loadMoreThreshold?: number;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  error?: Error | null;
  onLoadMore?: () => void;
  children: (item: T, index: number) => React.ReactNode;
  skeletonItem?: React.ReactNode;
}

export function PaginatedList<T>({
  items,
  isLoading,
  initialPageSize = 10,
  loadMoreThreshold = 100,
  emptyState,
  errorState,
  error,
  onLoadMore,
  children,
  skeletonItem,
}: PaginatedListProps<T>) {
  const [displayCount, setDisplayCount] = useState(initialPageSize);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setDisplayCount(initialPageSize);
    setHasMore(items.length > initialPageSize);
  }, [items, initialPageSize]);

  const handleLoadMore = () => {
    const newCount = Math.min(displayCount + initialPageSize, items.length);
    setDisplayCount(newCount);
    setHasMore(newCount < items.length);
    onLoadMore?.();
  };

  const displayedItems = items.slice(0, displayCount);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: initialPageSize }).map((_, i) => (
          <React.Fragment key={i}>
            {skeletonItem || (
              <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (error) {
    return errorState || (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        <p className="font-semibold">Failed to load data</p>
        <p className="text-sm mt-2 text-slate-500">{error.message}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return emptyState || (
      <div className="p-8 text-center text-slate-500">
        <p>No items found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {displayedItems.map((item, index) => children(item, index))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 btn-multicolor rounded-lg transition-colors font-medium text-sm"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}

interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  threshold?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  isLoading,
  hasMore,
  isFetchingNextPage,
  onLoadMore,
  children,
  loader,
  endMessage,
  threshold = 100,
}) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref || isLoading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, isLoading, hasMore, isFetchingNextPage, onLoadMore, threshold]);

  return (
    <>
      {children}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          {loader || <div className="w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />}
        </div>
      )}

      {!hasMore && endMessage && (
        <div className="text-center py-4 text-slate-500 text-sm">
          {endMessage}
        </div>
      )}

      {hasMore && (
        <div ref={setRef} className="h-1" />
      )}
    </>
  );
};

export default LoadingPage;
