import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { generateStackSlug } from "@/lib/utils";
import { logAnalyticsEvent } from "@/lib/analytics";

const StackSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).default("public"),
  monthly_cost: z.number().optional(),
  workflow_id: z.string().uuid().optional(),
  forked_from_id: z.string().uuid().optional(),
  tools: z.array(
    z.object({
      tool_id: z.string().uuid(),
      role_in_stack: z.string().max(100).optional(),
      step_order: z.number().int().min(0),
      monthly_cost: z.number().optional(),
      data_flow_type: z
        .enum(["native_api", "webhook", "zapier", "make", "manual_export", "unknown"])
        .default("unknown"),
      notes: z.string().max(300).optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = StackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { tools, ...stackData } = parsed.data;
  const slug = generateStackSlug(stackData.title);

  const { data: stack, error } = await supabase
    .from("stacks")
    .insert({ ...stackData, slug, owner_id: user.id })
    .select()
    .single();

  if (error || !stack) {
    return NextResponse.json({ error: "Failed to create stack" }, { status: 500 });
  }

  if (tools.length > 0) {
    await supabase.from("stack_tools").insert(
      tools.map((t) => ({ ...t, stack_id: stack.id }))
    );
  }

  // Analytics
  await logAnalyticsEvent({
    event_type: "stack_create",
    entity_id: stack.id,
    entity_type: "stack",
    user_id: user.id,
  });

  return NextResponse.json({ id: stack.id, slug: stack.slug }, { status: 201 });
}
