import { Skeleton } from "@/components/ui/skeleton";

export const CategoryCircleSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full" />
      <Skeleton className="h-3 w-12 sm:w-16" />
    </div>
  );
};

export const CategoryGridSkeleton = () => {
  return (
    <div className="grid grid-cols-4 gap-3 sm:flex sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <CategoryCircleSkeleton key={i} />
      ))}
    </div>
  );
};