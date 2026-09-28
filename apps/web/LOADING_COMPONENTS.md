# Loading & Skeleton Components Guide

## Overview

This project includes a comprehensive set of loading and skeleton components for better UX during data fetching and page transitions.

## Components

### 1. **PageLoader** - Full Page Loading
```tsx
import { PageLoader } from '@/components/loading';

// Full screen loading with brand colors
<PageLoader message="Loading..." />
```

### 2. **LoadingPage** - Smart Loading Wrapper
```tsx
import { LoadingPage } from '@/components/loading-page';

function MyPage() {
  const { data, isLoading } = useQuery(...);
  
  return (
    <LoadingPage 
      isLoading={isLoading}
      loadingTimeout={300}
      fallback={<DashboardSkeleton />}
    >
      <Content data={data} />
    </LoadingPage>
  );
}
```

### 3. **Skeleton Components**

#### Basic Skeleton
```tsx
import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton';

// Custom skeleton
<Skeleton width="200px" height="40px" borderRadius="rounded-lg" />

// Text lines
<SkeletonText lines={3} lineHeight="h-4" gap="space-y-2" />

// Avatar/Circle
<SkeletonCircle size={40} />
```

#### Complex Skeletons
```tsx
import { 
  SkeletonCard, 
  SkeletonGrid, 
  SkeletonStats, 
  SkeletonTable 
} from '@/components/ui/skeleton';

// Card with image placeholder
<SkeletonCard showImage={true} showFooter={true} />

// Grid of cards
<SkeletonGrid count={6} columns={3} cardType="image" />

// Stats dashboard
<SkeletonStats count={4} />

// Data table
<SkeletonTable rows={5} columns={5} />
```

### 4. **LazyImage** - Progressive Image Loading
```tsx
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
  src="https://example.com/image.jpg"
  alt="Product image"
  className="h-48 w-full"
  blur={true}
  placeholderColor="#E2E8F0"
  onLoad={() => console.log('Image loaded')}
/>
```

Features:
- Intersection Observer for lazy loading
- Blur-up effect on load
- Error handling with fallback UI
- Custom placeholder colors

### 5. **PaginatedList** - Load More Pagination
```tsx
import { PaginatedList } from '@/components/loading-page';

<PaginatedList
  items={data}
  isLoading={isLoading}
  initialPageSize={10}
  error={error}
  emptyState={<EmptyState />}
  errorState={<ErrorState />}
  skeletonItem={<SkeletonCard />}
  onLoadMore={() => console.log('Loading more...')}
>
  {(item, index) => (
    <div key={item.id}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
</PaginatedList>
```

### 6. **InfiniteScroll** - Scroll-based Loading
```tsx
import { InfiniteScroll } from '@/components/loading-page';

<InfiniteScroll
  isLoading={isLoading}
  hasMore={hasMore}
  isFetchingNextPage={isFetchingNextPage}
  onLoadMore={fetchNextPage}
  threshold={100}
  loader={<PageLoader />}
  endMessage={<p>No more items</p>}
>
  <div>{items.map(item => <Item key={item.id} {...item} />)}</div>
</InfiniteScroll>
```

### 7. **DashboardSkeleton** - Complete Dashboard Placeholder
```tsx
import { DashboardSkeleton } from '@/components/loading';

<DashboardSkeleton />
```

## Usage with React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { LoadingPage, SkeletonGrid } from '@/components';

function ServicesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  });

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <LoadingPage
      isLoading={isLoading}
      fallback={<SkeletonGrid count={6} columns={3} />}
    >
      <div className="grid grid-cols-3 gap-4">
        {data.services.map(service => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>
    </LoadingPage>
  );
}
```

## Usage with Lazy Loading Routes

```tsx
import { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/loading';

const DashboardPage = lazy(() => import('@/features/dashboard'));

function App() {
  return (
    <Suspense fallback={<PageLoader message="Loading dashboard..." />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
```

## Animation Variants

### Pulse (default)
```tsx
<Skeleton animation="pulse" />
```

### Shine
```tsx
<Skeleton animation="shine" />
```

### None
```tsx
<Skeleton animation="none" />
```

## Best Practices

1. **Match skeleton to content**: Use skeleton shapes that match your actual content layout
2. **Use appropriate timeouts**: Set loading timeout between 200-500ms to avoid flash
3. **Provide context**: Always include meaningful loading messages
4. **Graceful degradation**: Handle loading, error, and empty states
5. **Performance**: Use LazyImage for images below the fold
6. **Accessibility**: Include alt text for images and ARIA labels where needed

## Customization

### Custom Skeleton Colors
Edit `globals.css` to customize skeleton gradient:
```css
.animate-shine {
  background: linear-gradient(
    90deg,
    rgba(226, 232, 240, 0.5) 0%,
    rgba(241, 245, 249, 1) 50%,
    rgba(226, 232, 240, 0.5) 100%
  );
}
```

### Custom Loading Message
```tsx
<PageLoader message="Preparing your dashboard..." />
```

### Custom Placeholder
```tsx
<LoadingPage
  isLoading={isLoading}
  fallback={<CustomSkeleton />}
>
  <Content />
</LoadingPage>
```

## Demo Page

Visit `/demo/loading` to see all components in action with live examples.

## File Structure

```
src/components/
├── loading.tsx              # PageLoader, SectionLoader, CardGridSkeleton, etc.
├── loading-page.tsx         # LoadingPage, PaginatedList, InfiniteScroll
└── ui/
    ├── skeleton.tsx         # Skeleton, SkeletonText, SkeletonCircle, etc.
    └── lazy-image.tsx       # LazyImage, LazyComponent
```

## Migration Guide

### From old loaders to new system:

**Before:**
```tsx
if (loading) return <div>Loading...</div>;
```

**After:**
```tsx
<LoadingPage isLoading={loading} fallback={<SkeletonGrid />}>
  <Content />
</LoadingPage>
```

**Before:**
```tsx
{loading ? (
  <div className="animate-pulse">...</div>
) : (
  <Content />
)}
```

**After:**
```tsx
<SkeletonCard showImage={true} />
// or
<PaginatedList items={data} isLoading={loading}>...</PaginatedList>
```
