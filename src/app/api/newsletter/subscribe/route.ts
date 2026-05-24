import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { z } from "zod";
import { logAnalyticsEvent } from "@/lib/analytics";

const Schema = z.object({
  email: z.string().email(),
  source: z.string().max(100).optional(),
  interests: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  }

  const supabase = createServerClient();
  const { email, source, interests } = parsed.data;

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, source, interests }, { onConflict: "email" });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Already subscribed!" });
    }
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }

  await logAnalyticsEvent({ event_type: "newsletter_signup", metadata: { source } });

  // TODO: trigger welcome email via Resend
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: ..., to: email, subject: "Welcome to StackBuilder AI", ... })

  return NextResponse.json({ message: "Subscribed!" });
}
