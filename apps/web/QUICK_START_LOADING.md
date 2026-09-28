# Quick Start: Adding Loading States to Your Pages

## Example 1: Simple Page with Loading State

```tsx
import React, { useEffect, useState } from 'react';
import { LoadingPage, SkeletonGrid } from '@/components';

export default function MyPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  return (
    <LoadingPage
      isLoading={isLoading}
      fallback={<SkeletonGrid count={6} columns={3} />}
    >
      <div className="grid grid-cols-3 gap-4">
        {data.map((item) => (
          <Card key={item.id} {...item} />
        ))}
      </div>
    </LoadingPage>
  );
}
```

## Example 2: Using React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { LoadingPage, SkeletonTable } from '@/components';

export default function LeadsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  return (
    <LoadingPage
      isLoading={isLoading}
      fallback={<SkeletonTable rows={8} columns={5} />}
    >
      {error ? (
        <ErrorState error={error} />
      ) : (
        <LeadsTable data={data} />
      )}
    </LoadingPage>
  );
}
```

## Example 3: Lazy Loading Images

```tsx
import { LazyImage } from '@/components/ui/lazy-image';

export default function Gallery() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((img) => (
        <LazyImage
          key={img.id}
          src={img.url}
          alt={img.alt}
          className="h-48 rounded-lg"
          blur={true}
        />
      ))}
    </div>
  );
}
```

## Example 4: Paginated List with Load More

```tsx
import { PaginatedList } from '@/components/loading-page';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const { data, isLoading } = useProducts();

  return (
    <PaginatedList
      items={data.products}
      isLoading={isLoading}
      initialPageSize={9}
      skeletonItem={<SkeletonCard showImage={true} />}
    >
      {(product) => (
        <ProductCard key={product.id} product={product} />
      )}
    </PaginatedList>
  );
}
```

## Example 5: Infinite Scroll

```tsx
import { InfiniteScroll } from '@/components/loading-page';

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(...);

  const allItems = data.pages.flatMap(page => page.items);

  return (
    <InfiniteScroll
      isLoading={isLoading}
      hasMore={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    >
      {allItems.map(item => (
        <FeedItem key={item.id} item={item} />
      ))}
    </InfiniteScroll>
  );
}
```

## Example 6: Using the useLoading Hook

```tsx
import { useLoading, LoadingPage } from '@/components';

export default function Dashboard() {
  const { isLoading, startLoading, stopLoading } = useLoading({
    minLoadingTime: 500, // Prevents flickering
  });

  const handleRefresh = async () => {
    startLoading();
    await fetchData();
    stopLoading();
  };

  return (
    <LoadingPage isLoading={isLoading}>
      <button onClick={handleRefresh}>Refresh</button>
      <DashboardContent />
    </LoadingPage>
  );
}
```

## Example 7: Dashboard with Multiple Skeleton Types

```tsx
import { 
  SkeletonStats, 
  SkeletonGrid,
  SkeletonTable 
} from '@/components';

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStats count={4} />
        <SkeletonGrid count={6} columns={3} />
        <SkeletonTable rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsGrid data={data.stats} />
      <CardsGrid data={data.cards} />
      <DataTable data={data.table} />
    </div>
  );
}
```

## Example 8: Route-level Loading

```tsx
// App.tsx
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

## Common Patterns

### Pattern 1: Card Grid
```tsx
<LoadingPage isLoading={loading} fallback={<SkeletonGrid count={6} columns={3} cardType="image" />}>
  <CardGrid data={data} />
</LoadingPage>
```

### Pattern 2: Stats Dashboard
```tsx
<LoadingPage isLoading={loading} fallback={<SkeletonStats count={4} />}>
  <StatsCards data={stats} />
</LoadingPage>
```

### Pattern 3: Data Table
```tsx
<LoadingPage isLoading={loading} fallback={<SkeletonTable rows={10} columns={6} />}>
  <DataTable data={data} />
</LoadingPage>
```

### Pattern 4: List with Items
```tsx
<PaginatedList
  items={items}
  isLoading={loading}
  skeletonItem={<div className="h-20 bg-slate-100 rounded animate-pulse" />}
>
  {(item) => <ListItem key={item.id} item={item} />}
</PaginatedList>
```

## Tips

1. **Choose the right skeleton**: Match your skeleton to your content structure
2. **Use minLoadingTime**: Prevents loading state flicker (300-500ms recommended)
3. **Lazy load images**: Use `LazyImage` for images below the fold
4. **Combine skeletons**: Stack multiple skeleton types for complex pages
5. **Handle errors**: Always provide error states alongside loading states

## Demo

Visit `/demo/loading` in your browser to see all components in action!
