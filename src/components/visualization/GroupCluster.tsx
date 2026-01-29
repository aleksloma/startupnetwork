"use client";

import type { FieldCluster } from "@/types";

interface GroupClusterProps {
  cluster: FieldCluster;
  clusterRadius: number;
}

export function GroupCluster({ cluster, clusterRadius }: GroupClusterProps) {
  return (
    <g>
      {/* Cluster background */}
      <circle
        cx={cluster.x}
        cy={cluster.y}
        r={clusterRadius}
        fill={cluster.color}
        fillOpacity={0.08}
        stroke={cluster.color}
        strokeOpacity={0.2}
        strokeWidth={2}
        strokeDasharray="8,4"
      />

      {/* Label */}
      <text
        x={cluster.x}
        y={cluster.y - clusterRadius - 12}
        textAnchor="middle"
        fill={cluster.color}
        fontSize={13}
        fontWeight="600"
        className="select-none"
      >
        {cluster.name}
      </text>
    </g>
  );
}
