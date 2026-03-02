import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailSkeleton = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12">
      {/* Image Gallery Skeleton */}
      <div className="flex flex-col-reverse md:flex-row gap-2 sm:gap-4">
        <div className="flex md:flex-col gap-1.5 sm:gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="flex-1 aspect-square rounded-lg sm:rounded-xl" />
      </div>

      {/* Product Info Skeleton */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <Skeleton className="h-6 sm:h-8 w-3/4" />
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>

        <Skeleton className="h-11 sm:h-14 w-full rounded-lg" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="grid grid-cols-2 sm:flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full sm:w-28 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <Skeleton className="flex-1 h-11 sm:h-14 rounded-lg" />
          <Skeleton className="flex-1 h-11 sm:h-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
};