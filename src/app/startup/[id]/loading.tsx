import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui";

export default function StartupLoading() {
  return (
    <div className="py-8">
      <Container>
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
            </div>
            <Skeleton className="h-10 w-20" />
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          {/* Description */}
          <div className="mb-8 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Founders */}
          <div>
            <Skeleton className="h-4 w-16 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
