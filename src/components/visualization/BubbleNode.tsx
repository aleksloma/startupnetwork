"use client";

import { memo } from "react";
import type { SimulationNode } from "@/types";

interface BubbleNodeProps {
  node: SimulationNode;
  onMouseEnter: (e: React.MouseEvent<SVGGElement>) => void;
  onMouseLeave: () => void;
  onClick: () => void;
  isSelected?: boolean;
}

export const BubbleNode = memo(function BubbleNode({
  node,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isSelected,
}: BubbleNodeProps) {
  const primaryColor = node.fieldTags[0]?.color || "#6366F1";
  const secondaryColor = node.fieldTags[1]?.color;
  const gradientId = `grad-${node.id}`;

  const x = node.x ?? 0;
  const y = node.y ?? 0;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="cursor-pointer"
      style={{ transition: "transform 0.1s ease-out" }}
    >
      {/* Gradient definition for dual-tag startups */}
      {secondaryColor && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
      )}

      {/* Selection ring */}
      {isSelected && (
        <circle
          r={node.radius + 6}
          fill="none"
          stroke={primaryColor}
          strokeWidth={3}
          strokeOpacity={0.5}
        />
      )}

      {/* Main bubble */}
      <circle
        r={node.radius}
        fill={secondaryColor ? `url(#${gradientId})` : primaryColor}
        fillOpacity={0.85}
        stroke="white"
        strokeWidth={2}
        className="drop-shadow-md hover:drop-shadow-lg"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
        }}
      />

      {/* Logo initial */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={node.radius * 0.45}
        fontWeight="bold"
        className="select-none pointer-events-none"
      >
        {node.name.charAt(0).toUpperCase()}
      </text>
    </g>
  );
});
