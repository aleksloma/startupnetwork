"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterChips } from "@/components/search/FilterChips";
import { StartupCard } from "@/components/startup/StartupCard";
import type { StartupWithTags, FieldTag } from "@/types";

interface ExploreClientProps {
  startups: StartupWithTags[];
  fieldTags: FieldTag[];
}

export function ExploreClient({ startups, fieldTags }: ExploreClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 200);

  // Filter startups
  const filteredStartups = startups.filter((startup) => {
    const matchesSearch =
      !debouncedSearch ||
      startup.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      startup.goal.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      startup.description.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      startup.tags.some((slug) => selectedTags.includes(slug));

    return matchesSearch && matchesTags;
  });

  const handleTagToggle = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search startups..."
          className="max-w-md"
        />
        <FilterChips
          tags={fieldTags}
          selectedSlugs={selectedTags}
          onToggle={handleTagToggle}
          onClear={() => setSelectedTags([])}
        />
      </div>

      {/* Results */}
      {filteredStartups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No startups found</p>
          {(searchQuery || selectedTags.length > 0) && (
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {filteredStartups.length} startup{filteredStartups.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStartups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
