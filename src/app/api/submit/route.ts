import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";
import { logAnalyticsEvent } from "@/lib/analytics";

const SubmissionSchema = z.object({
  submitter_email: z.string().email(),
  tool_name: z.string().min(1).max(100),
  tool_url: z.string().url(),
  tagline: z.string().max(160).optional(),
  description: z.string().max(1000).optional(),
  pricing_notes: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = SubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("submissions")
    .insert({ ...parsed.data, status: "pending" });

  if (error) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }

  await logAnalyticsEvent({
    event_type: "submit_tool",
    metadata: { tool_name: parsed.data.tool_name },
  });

  return NextResponse.json({ message: "Submission received. We'll review it soon." });
}
