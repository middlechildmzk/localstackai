import type { FallbackTool } from "./fallback-tools-types";
import { FB_PART_0 } from "./fallback-parts/fb-0";
import { FB_PART_1 } from "./fallback-parts/fb-1";
import { FB_PART_2 } from "./fallback-parts/fb-2";
import { FB_PART_3 } from "./fallback-parts/fb-3";
import { FB_PART_4 } from "./fallback-parts/fb-4";
import { FB_PART_5 } from "./fallback-parts/fb-5";
import { FB_PART_6 } from "./fallback-parts/fb-6";
import { FB_PART_7 } from "./fallback-parts/fb-7";
import { FB_PART_8 } from "./fallback-parts/fb-8";
import { FB_PART_9 } from "./fallback-parts/fb-9";
import { FB_PART_10 } from "./fallback-parts/fb-10";
import { FB_PART_11 } from "./fallback-parts/fb-11";
import { FB_PART_12 } from "./fallback-parts/fb-12";
import { FB_PART_13 } from "./fallback-parts/fb-13";
import { FB_PART_14 } from "./fallback-parts/fb-14";
import { FB_PART_15 } from "./fallback-parts/fb-15";
import { FB_PART_16 } from "./fallback-parts/fb-16";
import { FB_PART_17 } from "./fallback-parts/fb-17";
import { FB_PART_18 } from "./fallback-parts/fb-18";
import { FB_PART_19 } from "./fallback-parts/fb-19";
import { FB_PART_20 } from "./fallback-parts/fb-20";
import { FB_PART_21 } from "./fallback-parts/fb-21";

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
  ...FB_PART_8,
  ...FB_PART_9,
  ...FB_PART_10,
  ...FB_PART_11,
  ...FB_PART_12,
  ...FB_PART_13,
  ...FB_PART_14,
  ...FB_PART_15,
  ...FB_PART_16,
  ...FB_PART_17,
  ...FB_PART_18,
  ...FB_PART_19,
  ...FB_PART_20,
  ...FB_PART_21,
];

export function getFallbackTool(slug: string): FallbackTool | null {
  return FALLBACK_TOOLS.find((tool) => tool.slug === slug) ?? null;
}
