import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: media skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-video w-full rounded-md" />
          <div className="flex gap-3">
            <Skeleton className="h-16 w-16 rounded-md" />
            <Skeleton className="h-16 w-16 rounded-md" />
            <Skeleton className="h-16 w-16 rounded-md" />
          </div>
        </div>

        {/* Right: info skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
          <Skeleton className="h-6 w-1/4 mt-4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
