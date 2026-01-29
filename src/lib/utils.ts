import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function normalizeTagName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function generateTagColor(): string {
  const colors = [
    "#8B5CF6", "#3B82F6", "#F97316", "#10B981", "#EF4444",
    "#6366F1", "#22C55E", "#EC4899", "#14B8A6", "#A855F7",
    "#F59E0B", "#06B6D4", "#84CC16", "#F43F5E", "#0EA5E9",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function isValidLinkedInUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("linkedin.com");
  } catch {
    return false;
  }
}
