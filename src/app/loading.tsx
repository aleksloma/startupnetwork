import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero skeleton */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
            <Skeleton className="h-12 w-48 mx-auto mt-8" />
          </div>
        </Container>
      </section>

      {/* Map skeleton */}
      <section className="py-12">
        <Container size="xl">
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        </Container>
      </section>
    </div>
  );
}
