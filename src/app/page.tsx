import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HomeClient } from "@/components/home/HomeClient";
import { getStartups, getFieldTags } from "@/lib/data";

export default function HomePage() {
  const startups = getStartups();
  const fieldTags = getFieldTags();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Explore Startups, Connect with Founders
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Discover innovative startups from the Startupbootcamp network.
              Find potential partners, customers, or your next adventure.
            </p>
            <Link
              href="/startup/new"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              Add Your Startup
            </Link>
          </div>
        </Container>
      </section>

      {/* Visualization Section */}
      <section className="py-12">
        <Container size="xl">
          <HomeClient startups={startups} fieldTags={fieldTags} />
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50">
        <Container>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary-600">{startups.length}</p>
              <p className="text-slate-600">Startups</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">
                {startups.reduce((acc, s) => acc + s.founders.length, 0)}
              </p>
              <p className="text-slate-600">Founders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">{fieldTags.length}</p>
              <p className="text-slate-600">Industries</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
