import type { FallbackTool } from "./fallback-tools-types";
import { FB_PART_0 } from "./fallback-parts/fb-0";
import { FB_PART_1 } from "./fallback-parts/fb-1";
import { FB_PART_2 } from "./fallback-parts/fb-2";
import { FB_PART_3 } from "./fallback-parts/fb-3";
import { FB_PART_4 } from "./fallback-parts/fb-4";
import { FB_PART_5 } from "./fallback-parts/fb-5";
import { FB_PART_6 } from "./fallback-parts/fb-6";
import { FB_PART_7 } from "./fallback-parts/fb-7";

export type { FallbackTool } from "./fallback-tools-types";

export const FALLBACK_TOOLS: FallbackTool[] = [
  ...FB_PART_0,
  ...FB_PART_1,
  ...FB_PART_2,
  ...FB_PART_3,
  ...FB_PART_4,
  ...FB_PART_5,
  ...FB_PART_6,
  ...FB_PART_7,
];

export function getFallbackTool(slug: string): FallbackTool | null {
  return FALLBACK_TOOLS.find((tool) => tool.slug === slug) ?? null;
}
