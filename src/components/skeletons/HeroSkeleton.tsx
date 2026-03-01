import { Skeleton } from "@/components/ui/skeleton";

export const HeroSkeleton = () => {
  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[80vh]">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <Skeleton className="h-8 sm:h-12 lg:h-16 w-48 sm:w-72 lg:w-96 mx-auto" />
          <Skeleton className="h-4 sm:h-6 w-64 sm:w-96 mx-auto" />
          <div className="flex gap-3 justify-center">
            <Skeleton className="h-10 sm:h-12 w-28 sm:w-36 rounded-lg" />
            <Skeleton className="h-10 sm:h-12 w-28 sm:w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};