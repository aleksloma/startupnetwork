import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import type { StartupWithTags } from "@/types";

interface StartupCardProps {
  startup: StartupWithTags;
}

export function StartupCard({ startup }: StartupCardProps) {
  return (
    <Link href={`/startup/${startup.id}`}>
      <Card hover className="h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{
              backgroundColor: startup.fieldTags[0]?.color || "#6366F1",
            }}
          >
            {startup.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{startup.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-1">{startup.goal}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">{startup.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {startup.fieldTags.map((tag) => (
            <Badge key={tag.id} color={tag.color} size="sm">
              {tag.name}
            </Badge>
          ))}
        </div>

        {/* Founders */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {startup.founders.slice(0, 2).map((founder, idx) => (
                <div
                  key={idx}
                  className="h-7 w-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center"
                  title={founder.name}
                >
                  <span className="text-xs font-medium text-slate-600">
                    {founder.name.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {startup.founders.map((f) => f.name.split(" ")[0]).join(", ")}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
