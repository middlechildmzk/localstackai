import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { generateStackSlug } from "@/lib/utils";
import { logAnalyticsEvent } from "@/lib/analytics";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: original } = await supabase
    .from("stacks")
    .select(`*, stack_tools(*)`)
    .eq("slug", slug)
    .eq("visibility", "public")
    .single();

  if (!original) return NextResponse.json({ error: "Stack not found" }, { status: 404 });

  const newSlug = generateStackSlug(`${original.title} fork`);
  const { data: fork, error } = await supabase
    .from("stacks")
    .insert({
      title: `${original.title} (fork)`,
      description: original.description,
      visibility: "private",
      owner_id: user.id,
      forked_from_id: original.id,
      workflow_id: original.workflow_id,
      monthly_cost: original.monthly_cost,
      slug: newSlug,
    })
    .select()
    .single();

  if (error || !fork) {
    return NextResponse.json({ error: "Fork failed" }, { status: 500 });
  }

  if (original.stack_tools?.length > 0) {
    await supabase.from("stack_tools").insert(
      original.stack_tools.map(({ id: _id, stack_id: _sid, created_at: _ca, ...t }: any) => ({
        ...t,
        stack_id: fork.id,
      }))
    );
  }

  // Increment fork count
  await supabase.rpc("increment" as any, { table: "stacks", column: "fork_count", id: original.id });

  await logAnalyticsEvent({
    event_type: "stack_fork",
    entity_id: fork.id,
    entity_type: "stack",
    user_id: user.id,
    metadata: { forked_from: original.id },
  });

  return NextResponse.json({ slug: fork.slug }, { status: 201 });
}
