"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3-force";
import type { SimulationNode, FieldCluster, StartupWithTags, FieldTag } from "@/types";

interface UseBubbleSimulationProps {
  startups: StartupWithTags[];
  fieldTags: FieldTag[];
  width: number;
  height: number;
}

export function useBubbleSimulation({
  startups,
  fieldTags,
  width,
  height,
}: UseBubbleSimulationProps) {
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);
  const [nodes, setNodes] = useState<SimulationNode[]>([]);
  const [clusters, setClusters] = useState<FieldCluster[]>([]);

  const calculateClusters = useCallback(() => {
    if (!width || !height || !fieldTags.length) return new Map<string, FieldCluster>();

    const tagPositions = new Map<string, FieldCluster>();
    const activeTagSlugs = new Set<string>();

    // Find which tags are actually used by startups
    startups.forEach((startup) => {
      startup.tags.forEach((slug) => {
        activeTagSlugs.add(slug);
      });
    });

    const activeTags = fieldTags.filter((tag) => activeTagSlugs.has(tag.slug));
    const angleStep = (2 * Math.PI) / Math.max(activeTags.length, 1);
    const radius = Math.min(width, height) * 0.32;
    const centerX = width / 2;
    const centerY = height / 2;

    activeTags.forEach((tag, i) => {
      const angle = i * angleStep - Math.PI / 2;
      tagPositions.set(tag.slug, {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    return tagPositions;
  }, [startups, fieldTags, width, height]);

  useEffect(() => {
    if (!startups.length || !width || !height) {
      setNodes([]);
      setClusters([]);
      return;
    }

    const tagPositions = calculateClusters();
    setClusters(Array.from(tagPositions.values()));

    const centerX = width / 2;
    const centerY = height / 2;

    // Create simulation nodes
    const simNodes: SimulationNode[] = startups.map((startup) => {
      let targetX = centerX;
      let targetY = centerY;

      if (startup.tags.length === 1) {
        const pos = tagPositions.get(startup.tags[0]);
        if (pos) {
          targetX = pos.x;
          targetY = pos.y;
        }
      } else if (startup.tags.length === 2) {
        const pos1 = tagPositions.get(startup.tags[0]);
        const pos2 = tagPositions.get(startup.tags[1]);
        if (pos1 && pos2) {
          targetX = (pos1.x + pos2.x) / 2;
          targetY = (pos1.y + pos2.y) / 2;
        }
      }

      // Add some initial randomness
      const jitterX = (Math.random() - 0.5) * 40;
      const jitterY = (Math.random() - 0.5) * 40;

      return {
        id: startup.id,
        name: startup.name,
        goal: startup.goal,
        fieldTags: startup.fieldTags,
        size: 1,
        original: startup,
        x: targetX + jitterX,
        y: targetY + jitterY,
        targetX,
        targetY,
        radius: 28,
      };
    });

    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create force simulation
    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "charge",
        d3.forceManyBody<SimulationNode>().strength(8)
      )
      .force(
        "collision",
        d3
          .forceCollide<SimulationNode>()
          .radius((d) => d.radius + 4)
          .strength(0.9)
      )
      .force(
        "x",
        d3.forceX<SimulationNode>((d) => d.targetX).strength(0.08)
      )
      .force(
        "y",
        d3.forceY<SimulationNode>((d) => d.targetY).strength(0.08)
      )
      .force(
        "center",
        d3.forceCenter(centerX, centerY).strength(0.01)
      )
      .alphaDecay(0.02)
      .velocityDecay(0.3)
      .on("tick", () => {
        // Keep nodes within bounds
        simNodes.forEach((node) => {
          const padding = node.radius + 10;
          node.x = Math.max(padding, Math.min(width - padding, node.x!));
          node.y = Math.max(padding, Math.min(height - padding, node.y!));
        });
        setNodes([...simNodes]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [startups, fieldTags, width, height, calculateClusters]);

  const reheat = useCallback(() => {
    simulationRef.current?.alpha(0.5).restart();
  }, []);

  return { nodes, clusters, reheat };
}
