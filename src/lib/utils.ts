import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(price: number | null, model: string): string {
  if (!price) {
    if (model === "free" || model === "open_source") return "Free";
    if (model === "freemium") return "Free plan available";
    return "See site";
  }
  return `From $${price}/mo`;
}

export function freshnessLabel(status: string): string {
  switch (status) {
    case "verified":
      return "✓ Verified";
    case "fresh":
      return "↻ Fresh";
    case "stale":
      return "⚠ Stale";
    default:
      return "? Unverified";
  }
}

export function freshnessColor(status: string): string {
  switch (status) {
    case "verified":
      return "text-brand-400";
    case "fresh":
      return "text-blue-400";
    case "stale":
      return "text-yellow-400";
    default:
      return "text-zinc-500";
  }
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function generateStackSlug(title: string): string {
  return `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}
