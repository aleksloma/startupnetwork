// Simple types for JSON-based data

export interface Founder {
  name: string;
  linkedInUrl: string;
  isPrimary: boolean;
}

export interface FieldTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface Startup {
  id: string;
  name: string;
  goal: string;
  description: string;
  websiteUrl?: string;
  tags: string[]; // tag slugs
  founders: Founder[];
}

// Startup with resolved field tags
export interface StartupWithTags extends Startup {
  fieldTags: FieldTag[];
}

// Visualization types
export interface SimulationNode {
  id: string;
  name: string;
  goal: string;
  fieldTags: FieldTag[];
  size: number;
  original: StartupWithTags;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  targetX: number;
  targetY: number;
  radius: number;
}

export interface FieldCluster {
  id: string;
  name: string;
  slug: string;
  color: string;
  x: number;
  y: number;
}
