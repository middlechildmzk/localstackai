import type { AnalyticsEventType } from "@/types";

// ─── Client-side analytics (PostHog) ─────────────────────────────────────────
export function trackEvent(
  event: AnalyticsEventType,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  try {
    // PostHog
    if ((window as any).posthog) {
      (window as any).posthog.capture(event, properties);
    }
  } catch {
    // noop
  }
}

// ─── Server-side analytics event logger ──────────────────────────────────────
export async function logAnalyticsEvent({
  event_type,
  entity_id,
  entity_type,
  user_id,
  session_id,
  metadata,
}: {
  event_type: AnalyticsEventType;
  entity_id?: string;
  entity_type?: string;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { createServerClient } = await import("./supabase");
    const supabase = createServerClient();
    await supabase.from("analytics_events").insert({
      event_type,
      entity_id: entity_id ?? null,
      entity_type: entity_type ?? null,
      user_id: user_id ?? null,
      session_id: session_id ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    // analytics errors must never break page loads
  }
}
