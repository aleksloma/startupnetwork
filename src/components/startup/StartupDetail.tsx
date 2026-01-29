"use client";

import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import type { StartupWithRelations } from "@/types";

interface StartupDetailProps {
  startup: StartupWithRelations;
  isOwner?: boolean;
}

export function StartupDetail({ startup, isOwner }: StartupDetailProps) {
  return (
    <Card padding="lg" className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{startup.name}</h1>
          <p className="text-lg text-slate-600 mt-1">{startup.goal}</p>
        </div>
        {isOwner && (
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {startup.startupFields.map((sf) => (
          <Badge key={sf.id} color={sf.fieldTag.color} size="md">
            {sf.fieldTag.name}
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
          {startup.founders.map((founder) => (
            <div
              key={founder.id}
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
          Note: LinkedIn doesn&apos;t allow automated connect requests - clicking
          &quot;Connect&quot; will open their profile in a new tab.
        </p>
      </div>
    </Card>
  );
}
