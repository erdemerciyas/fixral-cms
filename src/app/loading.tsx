import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-accent/30">
      {/* Header Skeleton */}
      <div className="bg-card border-b border-border">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="hidden md:flex space-x-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container-main py-20">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-20">
          <Skeleton className="h-5 w-3/5 mx-auto mb-4" />
          <Skeleton className="h-5 w-4/5 mx-auto mb-6" />
          <Skeleton className="h-5 w-2/5 mx-auto mb-8" />
          <div className="flex justify-center space-x-4">
            <Skeleton className="h-11 w-32 rounded-lg" />
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-card rounded-full p-4 shadow-lg">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
