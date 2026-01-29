"use client";

import { Badge } from "@/components/ui";
import type { StartupWithTags } from "@/types";

interface BubbleTooltipProps {
  startup: StartupWithTags;
  position: { x: number; y: number };
}

export function BubbleTooltip({ startup, position }: BubbleTooltipProps) {
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 16,
        top: position.y - 10,
        transform: "translateY(-50%)",
      }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 max-w-xs animate-in fade-in-0 zoom-in-95 duration-150">
        <h3 className="font-semibold text-slate-900 mb-1">{startup.name}</h3>
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{startup.goal}</p>
        <div className="flex flex-wrap gap-1">
          {startup.fieldTags.map((tag) => (
            <Badge key={tag.id} color={tag.color} size="sm">
              {tag.name}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Click to view details</p>
      </div>
    </div>
  );
}
