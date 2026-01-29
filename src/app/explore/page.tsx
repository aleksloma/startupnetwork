import { getStartups, getFieldTags } from "@/lib/data";
import { Container } from "@/components/layout/Container";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const metadata = {
  title: "Explore Startups | StartupNetwork",
  description: "Browse and discover innovative startups in the Startupbootcamp network.",
};

export default function ExplorePage() {
  const startups = getStartups();
  const fieldTags = getFieldTags();

  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Explore Startups</h1>
          <p className="mt-2 text-slate-600">
            Browse and discover innovative startups in our network
          </p>
        </div>

        <ExploreClient startups={startups} fieldTags={fieldTags} />
      </Container>
    </div>
  );
}
