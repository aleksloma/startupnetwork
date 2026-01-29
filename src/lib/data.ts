import startupsData from "@/data/startups.json";
import type { Startup, FieldTag, StartupWithTags } from "@/types";

// Get all field tags
export function getFieldTags(): FieldTag[] {
  return startupsData.fieldTags;
}

// Get all startups with their resolved field tags
export function getStartups(): StartupWithTags[] {
  const tags = getFieldTags();

  return startupsData.startups.map((startup) => ({
    ...startup,
    fieldTags: startup.tags
      .map((slug) => tags.find((t) => t.slug === slug))
      .filter((t): t is FieldTag => t !== undefined),
  }));
}

// Get a single startup by ID
export function getStartupById(id: string): StartupWithTags | undefined {
  const startups = getStartups();
  return startups.find((s) => s.id === id);
}

// Search startups
export function searchStartups(query: string, tagSlugs: string[] = []): StartupWithTags[] {
  let results = getStartups();

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.goal.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }

  if (tagSlugs.length > 0) {
    results = results.filter((s) =>
      tagSlugs.some((slug) => s.tags.includes(slug))
    );
  }

  return results;
}
