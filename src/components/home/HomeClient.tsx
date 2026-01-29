"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { BubbleMap } from "@/components/visualization/BubbleMap";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterChips } from "@/components/search/FilterChips";
import type { StartupWithTags, FieldTag } from "@/types";
import Link from "next/link";

interface HomeClientProps {
  startups: StartupWithTags[];
  fieldTags: FieldTag[];
}

export function HomeClient({ startups, fieldTags }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 200);

  const handleTagToggle = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or description..."
          />
        </div>
        <Link
          href="/explore"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View as list
        </Link>
      </div>

      {/* Filter chips */}
      <FilterChips
        tags={fieldTags}
        selectedSlugs={selectedTags}
        onToggle={handleTagToggle}
        onClear={() => setSelectedTags([])}
      />

      {/* Bubble Map Visualization */}
      <BubbleMap
        startups={startups}
        fieldTags={fieldTags}
        selectedTags={selectedTags}
        searchQuery={debouncedSearch}
      />

      {/* Instructions */}
      <p className="text-center text-sm text-slate-500">
        Click on any bubble to view startup details. Hover to preview.
      </p>
    </div>
  );
}
