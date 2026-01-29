import { notFound } from "next/navigation";
import { getStartupById, getStartups } from "@/lib/data";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

interface StartupPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const startups = getStartups();
  return startups.map((startup) => ({
    id: startup.id,
  }));
}

export async function generateMetadata({ params }: StartupPageProps): Promise<Metadata> {
  const startup = getStartupById(params.id);

  if (!startup) {
    return { title: "Startup Not Found | StartupNetwork" };
  }

  return {
    title: `${startup.name} | StartupNetwork`,
    description: startup.goal,
  };
}

export default function StartupPage({ params }: StartupPageProps) {
  const startup = getStartupById(params.id);

  if (!startup) {
    notFound();
  }

  return (
    <div className="py-8">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-6"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Map
          </Link>

          <div className="bg-white rounded-xl border border-slate-200 p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">{startup.name}</h1>
              <p className="text-lg text-slate-600 mt-1">{startup.goal}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {startup.fieldTags.map((tag) => (
                <Badge key={tag.id} color={tag.color} size="md">
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
                About
              </h2>
              <p className="text-slate-700 whitespace-pre-wrap">{startup.description}</p>
            </div>

            {/* Website */}
            {startup.websiteUrl && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Website
                </h2>
                <a
                  href={startup.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {startup.websiteUrl}
                </a>
              </div>
            )}

            {/* Founders */}
            <div>
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                {startup.founders.length > 1 ? "Founders" : "Founder"}
              </h2>
              <div className="space-y-4">
                {startup.founders.map((founder, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {founder.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{founder.name}</p>
                        <p className="text-sm text-slate-500">
                          {founder.isPrimary ? "Founder" : "Co-Founder"}
                        </p>
                      </div>
                    </div>
                    <a
                      href={founder.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5] text-white text-sm font-medium hover:bg-[#006097] transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      Connect
                    </a>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Note: Clicking &quot;Connect&quot; will open their LinkedIn profile in a new tab.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
