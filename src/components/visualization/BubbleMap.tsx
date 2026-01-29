"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useBubbleSimulation } from "@/hooks/useBubbleSimulation";
import { BubbleNode } from "./BubbleNode";
import { GroupCluster } from "./GroupCluster";
import { BubbleTooltip } from "./BubbleTooltip";
import { Modal, Badge, Button } from "@/components/ui";
import type { StartupWithTags, FieldTag } from "@/types";
import Link from "next/link";

interface BubbleMapProps {
  startups: StartupWithTags[];
  fieldTags: FieldTag[];
  selectedTags?: string[];
  searchQuery?: string;
}

export function BubbleMap({
  startups,
  fieldTags,
  selectedTags = [],
  searchQuery = "",
}: BubbleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredStartup, setHoveredStartup] = useState<StartupWithTags | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedStartup, setSelectedStartup] = useState<StartupWithTags | null>(null);

  // Filter startups based on search and tags
  const filteredStartups = startups.filter((startup) => {
    const matchesSearch =
      !searchQuery ||
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.goal.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      startup.tags.some((slug) => selectedTags.includes(slug));

    return matchesSearch && matchesTags;
  });

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.max(500, Math.min(rect.width * 0.6, 700)),
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const { nodes, clusters } = useBubbleSimulation({
    startups: filteredStartups,
    fieldTags,
    width: dimensions.width,
    height: dimensions.height,
  });

  const handleMouseEnter = useCallback(
    (startup: StartupWithTags, event: React.MouseEvent<SVGGElement>) => {
      setHoveredStartup(startup);
      setTooltipPos({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredStartup(null);
  }, []);

  const handleClick = useCallback((startup: StartupWithTags) => {
    setSelectedStartup(startup);
    setHoveredStartup(null);
  }, []);

  const clusterRadius = Math.min(dimensions.width, dimensions.height) * 0.18;

  if (filteredStartups.length === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full bg-slate-50 rounded-xl flex items-center justify-center"
        style={{ height: 500 }}
      >
        <div className="text-center">
          <p className="text-slate-500">No startups found</p>
          {(searchQuery || selectedTags.length > 0) && (
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="w-full bg-gradient-to-b from-slate-50 to-white rounded-xl overflow-hidden relative border border-slate-200"
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="block"
        >
          {/* Cluster backgrounds */}
          {clusters.map((cluster) => (
            <GroupCluster
              key={cluster.id}
              cluster={cluster}
              clusterRadius={clusterRadius}
            />
          ))}

          {/* Startup bubbles */}
          {nodes.map((node) => (
            <BubbleNode
              key={node.id}
              node={node}
              onMouseEnter={(e) => handleMouseEnter(node.original, e)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(node.original)}
              isSelected={selectedStartup?.id === node.id}
            />
          ))}
        </svg>

        {/* Startup count */}
        <div className="absolute bottom-4 right-4 text-sm text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
          {filteredStartups.length} startup{filteredStartups.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredStartup && !selectedStartup && (
        <BubbleTooltip startup={hoveredStartup} position={tooltipPos} />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedStartup}
        onClose={() => setSelectedStartup(null)}
        title={selectedStartup?.name}
        size="lg"
      >
        {selectedStartup && (
          <div className="space-y-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {selectedStartup.fieldTags.map((tag) => (
                <Badge key={tag.id} color={tag.color} size="md">
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Goal */}
            <p className="text-lg text-slate-700">{selectedStartup.goal}</p>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
                About
              </h4>
              <p className="text-slate-700 whitespace-pre-wrap">
                {selectedStartup.description}
              </p>
            </div>

            {/* Website */}
            {selectedStartup.websiteUrl && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Website
                </h4>
                <a
                  href={selectedStartup.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  {selectedStartup.websiteUrl}
                </a>
              </div>
            )}

            {/* Founders */}
            <div>
              <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                {selectedStartup.founders.length > 1 ? "Founders" : "Founder"}
              </h4>
              <div className="space-y-3">
                {selectedStartup.founders.map((founder, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
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
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0077B5] text-white text-sm font-medium hover:bg-[#006097] transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      Connect
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-400">
                Opens LinkedIn profile in new tab
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
