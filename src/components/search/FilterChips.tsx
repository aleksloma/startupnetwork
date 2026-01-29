"use client";

import { cn } from "@/lib/utils";
import type { FieldTag } from "@/types";

interface FilterChipsProps {
  tags: FieldTag[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  onClear: () => void;
}

export function FilterChips({ tags, selectedSlugs, onToggle, onClear }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => {
        const isSelected = selectedSlugs.includes(tag.slug);
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.slug)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-all",
              isSelected
                ? "text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            )}
            style={{
              backgroundColor: isSelected ? tag.color : undefined,
            }}
          >
            {tag.name}
          </button>
        );
      })}
      {selectedSlugs.length > 0 && (
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
