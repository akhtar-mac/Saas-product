import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLoadingOptions {
  initialLoading?: boolean;
  delay?: number;
  minLoadingTime?: number;
}

interface UseLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  toggleLoading: () => void;
}

/**
 * Hook to manage loading states with optional minimum loading time
 * to prevent flickering
 */
export function useLoading({
  initialLoading = false,
  delay = 0,
  minLoadingTime = 300,
}: UseLoadingOptions = {}): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startLoading = useCallback(() => {
    setStartTime(Date.now());
    if (delay > 0) {
      setTimeout(() => setIsLoading(true), delay);
    } else {
      setIsLoading(true);
    }
  }, [delay]);

  const stopLoading = useCallback(() => {
    if (startTime === null) {
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadingTime - elapsed);

    if (remaining > 0) {
      setTimeout(() => {
        setIsLoading(false);
        setStartTime(null);
      }, remaining);
    } else {
      setIsLoading(false);
      setStartTime(null);
    }
  }, [startTime, minLoadingTime]);

  const toggleLoading = useCallback(() => {
    if (isLoading) {
      stopLoading();
    } else {
      startLoading();
    }
  }, [isLoading, startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  };
}

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

interface UseLazyLoadReturn {
  ref: React.RefObject<HTMLDivElement>;
  isInView: boolean;
  hasLoaded: boolean;
}

/**
 * Hook to detect when an element is in viewport using Intersection Observer
 */
export function useLazyLoad({
  rootMargin = '50px',
  threshold = 0.01,
  triggerOnce = true,
}: UseLazyLoadOptions = {}): UseLazyLoadReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasLoaded(true);

          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, triggerOnce]);

  return {
    ref: ref as React.RefObject<HTMLDivElement>,
    isInView,
    hasLoaded,
  };
}

interface UseImageLoadingReturn {
  isLoaded: boolean;
  hasError: boolean;
  handleLoad: () => void;
  handleError: () => void;
}

/**
 * Hook to manage image loading states
 */
export function useImageLoading(): UseImageLoadingReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return {
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  };
}

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  paginatedItems: <T>(items: T[]) => T[];
}

/**
 * Hook to manage pagination state
 */
export function usePagination({
  initialPage = 1,
  pageSize = 10,
  totalItems,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Infinity;
  const hasMore = totalItems ? currentPage < totalPages : true;

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const paginatedItems = useCallback(
    <T>(items: T[]): T[] => {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      return items.slice(start, end);
    },
    [currentPage, pageSize]
  );

  return {
    currentPage,
    pageSize,
    totalPages,
    hasMore,
    goToPage,
    nextPage,
    prevPage,
    reset,
    paginatedItems,
  };
}

export default useLoading;
