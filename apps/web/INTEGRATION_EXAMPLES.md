# Integration Examples for Existing Pages

## Example 1: Client Dashboard Page

### Before (Current State)
```tsx
export default function ClientDashboardPage() {
  const { customer } = useAuthStore();
  
  // Static data for now
  const activeService = { ... };
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Content */}
    </div>
  );
}
```

### After (With Loading States)
```tsx
import { LoadingPage, DashboardSkeleton } from '@/components';
import { useQuery } from '@tanstack/react-query';

export default function ClientDashboardPage() {
  const { customer } = useAuthStore();
  
  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-dashboard', customer?.id],
    queryFn: fetchCustomerDashboard,
  });
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  return (
    <LoadingPage
      isLoading={isLoading}
      fallback={<DashboardSkeleton />}
      loadingTimeout={300}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-navy via-[#00487C] to-brand-navy-dark rounded-2xl p-6 sm:p-8 text-white">
          {/* ... existing content */}
        </div>
        
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.stats.map((kpi) => (
            <StatCard key={kpi.id} {...kpi} />
          ))}
        </div>
        
        {/* ... rest of content */}
      </div>
    </LoadingPage>
  );
}
```

## Example 2: CRM Leads Page

### Before
```tsx
export default function CrmLeadsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  
  useEffect(() => {
    fetchLeads().then(data => {
      setLeads(data);
      setIsLoading(false);
    });
  }, []);
  
  if (isLoading) {
    return <div className="animate-pulse">...</div>;
  }
  
  return <LeadsTable data={leads} />;
}
```

### After
```tsx
import { LoadingPage, SkeletonTable } from '@/components';
import { useQuery } from '@tanstack/react-query';

export default function CrmLeadsPage() {
  const { data: leads, isLoading } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: fetchLeads,
  });
  
  return (
    <LoadingPage
      isLoading={isLoading}
      fallback={<SkeletonTable rows={8} columns={6} />}
    >
      <LeadsTable data={leads} />
    </LoadingPage>
  );
}
```

## Example 3: Services Page with Images

### Before
```tsx
export default function ServicesPage() {
  const { services } = useServices();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {services.map(service => (
        <img key={service.id} src={service.image} alt={service.name} />
      ))}
    </div>
  );
}
```

### After
```tsx
import { LazyImage } from '@/components/ui/lazy-image';
import { SkeletonGrid } from '@/components/ui/skeleton';
import { LoadingPage } from '@/components';

export default function ServicesPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  });
  
  return (
    <LoadingPage
      isLoading={isLoading}
      fallback={<SkeletonGrid count={6} columns={3} cardType="image" />}
    >
      <div className="grid grid-cols-3 gap-4">
        {services.map(service => (
          <ServiceCard key={service.id}>
            <LazyImage
              src={service.image}
              alt={service.name}
              className="h-48 rounded-lg"
              blur={true}
              placeholderColor="#EAE6DD"
            />
            <h3>{service.name}</h3>
            <p>{service.description}</p>
          </ServiceCard>
        ))}
      </div>
    </LoadingPage>
  );
}
```

## Example 4: Documents Page with Pagination

### Before
```tsx
export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const loadDocuments = async () => {
    setLoading(true);
    const data = await fetchDocuments(page);
    setDocuments(data);
    setLoading(false);
  };
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        documents.map(doc => <DocumentItem key={doc.id} {...doc} />)
      )}
      <button onClick={() => setPage(p => p + 1)}>Load More</button>
    </div>
  );
}
```

### After
```tsx
import { PaginatedList, usePagination } from '@/components';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function DocumentsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage } = useDocuments();
  const { paginatedItems } = usePagination({ pageSize: 9 });
  
  const documents = paginatedItems(data || []);
  
  return (
    <PaginatedList
      items={documents}
      isLoading={isLoading}
      initialPageSize={9}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
      skeletonItem={<SkeletonCard showImage={true} showFooter={true} />}
      emptyState={
        <div className="text-center py-8">
          <p className="text-slate-500">No documents found</p>
        </div>
      }
    >
      {(doc, index) => (
        <DocumentItem key={doc.id} document={doc} />
      )}
    </PaginatedList>
  );
}
```

## Example 5: Blog Page with Infinite Scroll

### Before
```tsx
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadPosts(page);
  }, [page]);
  
  const loadPosts = async (pageNum) => {
    setLoading(true);
    const data = await fetchPosts(pageNum);
    setPosts(prev => [...prev, ...data]);
    setLoading(false);
  };
  
  return (
    <div>
      {posts.map(post => <BlogPost key={post.id} {...post} />)}
      {loading && <div>Loading more...</div>}
    </div>
  );
}
```

### After
```tsx
import { InfiniteScroll } from '@/components/loading-page';
import { SkeletonCard } from '@/components/ui/skeleton';

export default function BlogPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['blog-posts'],
    queryFn: fetchBlogPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  
  const allPosts = data?.pages.flatMap(page => page.posts) || [];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      
      <InfiniteScroll
        isLoading={false}
        hasMore={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        threshold={200}
        loader={
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          </div>
        }
        endMessage={
          <p className="text-center text-slate-500 py-8">
            No more blog posts
          </p>
        }
      >
        <div className="space-y-6">
          {allPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
```

## Example 6: Portal Layout with Suspense

### Before
```tsx
// Already using lazy loading in App.tsx
const PortalLayout = lazy(() => import('@/features/portal/portal-layout'));

<Route path="/portal" element={
  <ClientProtectedRoute>
    <PortalLayout />
  </ClientProtectedRoute>
} />
```

### After (Enhanced with better loading)
```tsx
// In App.tsx
import { PageLoader } from '@/components/loading';

<Suspense fallback={<PageLoader message="Loading portal..." />}>
  <Route path="/portal" element={
    <ClientProtectedRoute>
      <PortalLayout />
    </ClientProtectedRoute>
  } />
</Suspense>

// In portal-layout.tsx
import { LoadingPage } from '@/components';

export default function PortalLayout() {
  const { customer, isLoading } = useCustomerData();
  
  return (
    <LoadingPage
      isLoading={isLoading}
      fallback={<DashboardSkeleton />}
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </LoadingPage>
  );
}
```

## Migration Checklist

### Phase 1: Quick Wins (1-2 hours)
- [ ] Add `LoadingPage` wrapper to all dashboard pages
- [ ] Replace manual loading states with `SkeletonGrid`
- [ ] Add `LazyImage` to all image components

### Phase 2: Data Pages (2-4 hours)
- [ ] Update CRM pages with `SkeletonTable`
- [ ] Add `PaginatedList` to list views
- [ ] Implement `InfiniteScroll` for feeds

### Phase 3: Polish (1-2 hours)
- [ ] Add custom loading messages
- [ ] Tune loading timeouts (300-500ms)
- [ ] Test dark mode
- [ ] Verify error states

### Phase 4: Advanced (Optional)
- [ ] Create page-specific skeletons
- [ ] Add transition animations
- [ ] Implement optimistic updates
- [ ] Add loading state analytics

## Common Issues & Solutions

### Issue: Loading state flickers
**Solution**: Use `minLoadingTime` option
```tsx
const { isLoading } = useLoading({ minLoadingTime: 500 });
```

### Issue: Skeleton doesn't match content
**Solution**: Create custom skeleton
```tsx
<SkeletonCard showImage={true} showAvatar={true} showFooter={true} />
```

### Issue: Images load slowly
**Solution**: Use `LazyImage` with blur
```tsx
<LazyImage src={src} blur={true} placeholderColor="#EAE6DD" />
```

### Issue: Too many re-renders
**Solution**: Use `React.memo` with loading components
```tsx
const MemoizedCard = React.memo(Card);
```

## Testing Checklist

- [ ] Test loading states on slow connections
- [ ] Verify error states work
- [ ] Check dark mode compatibility
- [ ] Test keyboard navigation
- [ ] Verify screen reader support
- [ ] Test on mobile devices
- [ ] Check animation smoothness
- [ ] Verify no layout shifts

## Performance Tips

1. **Use appropriate skeleton complexity**
   - Simple pages → Simple skeletons
   - Complex pages → Match layout

2. **Optimize image loading**
   - Use `LazyImage` for below-fold images
   - Set appropriate blur amount
   - Use correct image sizes

3. **Minimize loading time**
   - Set `minLoadingTime: 300-500ms`
   - Use `loadingTimeout` for fallbacks
   - Cache data with React Query

4. **Reduce bundle size**
   - Import only needed components
   - Use tree-shaking friendly imports
   - Lazy load heavy components

## Summary

You can now:
✅ Replace all manual loading states
✅ Use consistent skeleton designs
✅ Lazy load images efficiently
✅ Handle pagination elegantly
✅ Implement infinite scroll
✅ Support dark mode
✅ Improve perceived performance

Start with the demo page at `/demo/loading` and gradually integrate into your existing pages!
