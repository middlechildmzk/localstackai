import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content Drafts | StackBuilder AI" };

const KINDS = ["compare", "alternatives", "learn"] as const;
const STATUSES = ["draft", "approved", "published", "rejected"] as const;

/**
 * Loop 4 review queue. Drafts are written by the content agent from graph
 * data only. A human must approve before anything happens further — approving
 * here sets status='approved'. Rendering approved drafts as live pages is a
 * separate follow-up; this page deliberately has no publish button.
 */
export default async function ContentDraftsPage({
  searchParams,
}: {
  searchParams: { kind?: string; status?: string };
}) {
  const supabase = createServerClient();

  const kind = searchParams.kind && KINDS.includes(searchParams.kind as any)
    ? searchParams.kind
    : null;
  const status = searchParams.status && STATUSES.includes(searchParams.status as any)
    ? searchParams.status
    : "draft";

  let query = supabase
    .from("content_drafts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (kind) query = query.eq("kind", kind);
  if (status) query = query.eq("status", status);

  const { data: drafts } = await query;

  async function setStatus(id: string, next: "approved" | "rejected") {
    "use server";
    const supabase = createServerClient();
    const { error } = await supabase
      .from("content_drafts")
      .update({ status: next })
      .eq("id", id);
    if (error) console.error("[admin/drafts] status update failed", error);
    revalidatePath("/admin/drafts");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Admin</p>
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Content Drafts
        </h1>
        <p className="text-zinc-400 mt-2 max-w-2xl">
          Drafts written by the Loop 4 content agent from directory graph data only.
          Review each draft, then approve or reject. Approved drafts are <em>not</em> live —
          rendering them as public pages is a follow-up task.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin/drafts?status=${s}${kind ? `&kind=${kind}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              status === s
                ? "bg-brand-500/20 text-brand-200 border border-brand-500/40"
                : "text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            {s}
          </a>
        ))}
        <span className="w-px bg-white/10 mx-1" />
        {KINDS.map((k) => (
          <a
            key={k}
            href={`/admin/drafts?status=${status}&kind=${kind === k ? "" : k}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              kind === k
                ? "bg-brand-500/20 text-brand-200 border border-brand-500/40"
                : "text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            {k}
          </a>
        ))}
      </div>

      {/* Draft list */}
      <div className="space-y-3">
        {(!drafts || drafts.length === 0) && (
          <p className="text-zinc-600 text-sm">
            No drafts match this filter. The cron generates up to 3 drafts per run.
          </p>
        )}
        {drafts?.map((d: any) => {
          const facts = d.source_data?.facts ?? [];
          return (
            <article key={d.id} className="glass p-5">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 uppercase tracking-wide">
                  {d.kind}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    d.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : d.status === "rejected"
                      ? "bg-red-500/15 text-red-300"
                      : d.status === "published"
                      ? "bg-brand-500/15 text-brand-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {d.status}
                </span>
                <span className="text-xs text-zinc-600 font-mono">{d.slug}</span>
                <span className="text-xs text-zinc-600 ml-auto">{timeAgo(d.created_at)}</span>
              </div>

              <h2 className="text-lg font-semibold text-white mb-3">{d.title}</h2>

              <details className="mb-3">
                <summary className="text-sm text-brand-300 cursor-pointer hover:text-brand-200">
                  Preview body
                </summary>
                <div className="mt-3 p-4 rounded-lg bg-black/40 border border-white/5 text-sm text-zinc-300 whitespace-pre-wrap max-h-96 overflow-auto">
                  {d.body_markdown}
                </div>
              </details>

              <details className="mb-4">
                <summary className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-200">
                  Source data ({facts.length} traced facts)
                </summary>
                <pre className="mt-3 p-4 rounded-lg bg-black/40 border border-white/5 text-xs text-zinc-400 max-h-64 overflow-auto">
                  {JSON.stringify(d.source_data, null, 2)}
                </pre>
                <p className="text-xs text-zinc-600 mt-2">
                  Every factual claim in the body must trace to one of these
                  DB fields. A draft that can't prove its claims is rejected by
                  the generator before insert.
                </p>
              </details>

              <div className="flex gap-2">
                <form action={setStatus.bind(null, d.id, "approved")}>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
                  >
                    Approve
                  </button>
                </form>
                <form action={setStatus.bind(null, d.id, "rejected")}>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 transition-all"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
