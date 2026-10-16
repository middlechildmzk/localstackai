import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createServerClient } from "@/lib/supabase";
import { Mail, Share2, CheckCircle2, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Digests & Social Drafts | StackBuilder AI" };

type DraftStatus = "draft" | "approved" | "sent" | "posted";

/** Require an admin user for mutating actions; returns the user id. */
async function requireAdmin(): Promise<string> {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Admin access required.");
  return user.id;
}

async function approveDigest(id: string) {
  "use server";
  const adminId = await requireAdmin();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("digest_drafts")
    .update({ status: "approved", approved_by: adminId, approved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "draft");
  if (error) throw new Error("Approve failed.");
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action: "digest_approved",
    entity_type: "digest",
    entity_id: id,
    notes: "Digest draft approved for send (manual send only — no auto-send).",
  });
  revalidatePath("/admin/digests");
}

async function approveSocial(id: string) {
  "use server";
  const adminId = await requireAdmin();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("social_drafts")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("status", "draft");
  if (error) throw new Error("Approve failed.");
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action: "social_approved",
    entity_type: "social_draft",
    entity_id: id,
    notes: "Social draft approved (manual posting only — no auto-post).",
  });
  revalidatePath("/admin/digests");
}

function statusBadge(status: DraftStatus) {
  const styles: Record<DraftStatus, string> = {
    draft: "bg-zinc-500/15 text-zinc-300",
    approved: "bg-blue-500/15 text-blue-300",
    sent: "bg-green-500/15 text-green-300",
    posted: "bg-green-500/15 text-green-300",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

export default async function AdminDigestsPage() {
  const supabase = createServerClient();

  const [{ data: digests }, { data: socials }] = await Promise.all([
    supabase.from("digest_drafts").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("social_drafts").select("*").order("created_at", { ascending: false }).limit(60),
  ]);

  const pendingDigests = (digests ?? []).filter((d: any) => d.status === "draft").length;
  const pendingSocials = (socials ?? []).filter((s: any) => s.status === "draft").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Admin</p>
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Digest &amp; Social Drafts
        </h1>
        <p className="text-zinc-400 mt-2 max-w-2xl">
          Loop 5 compiles a daily digest draft and social drafts from trending + newly verified
          tools. Nothing here publishes, posts, or sends anything on its own.
        </p>
      </div>

      {/* Boundary banner */}
      <div className="glass p-5 border-l-4 border-l-amber-500/60">
        <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
          <ShieldAlert size={16} /> Approval is not a send
        </div>
        <p className="text-sm text-zinc-400">
          <strong className="text-zinc-200">Approved ≠ sent.</strong> There is no automatic send
          path in this codebase — the cron route and the compose module contain no email-send or
          social-post call. Sending the digest and posting socials are Dan&apos;s manual actions
          after approval.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4">
          <div className="text-2xl font-bold text-white">{pendingDigests}</div>
          <div className="text-xs text-zinc-500">Digest drafts pending</div>
        </div>
        <div className="glass p-4">
          <div className="text-2xl font-bold text-white">{pendingSocials}</div>
          <div className="text-xs text-zinc-500">Social drafts pending</div>
        </div>
        <div className="glass p-4">
          <div className="text-2xl font-bold text-white">{digests?.length ?? 0}</div>
          <div className="text-xs text-zinc-500">Digests total (30 recent)</div>
        </div>
        <div className="glass p-4">
          <div className="text-2xl font-bold text-white">{socials?.length ?? 0}</div>
          <div className="text-xs text-zinc-500">Social drafts total (60 recent)</div>
        </div>
      </div>

      {/* Digest drafts */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Mail size={14} /> Email digest drafts
        </h2>
        <div className="space-y-4">
          {(digests ?? []).map((d: any) => (
            <div key={d.id} className="glass p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-semibold text-white">{d.subject}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Created {new Date(d.created_at).toLocaleString()} ·{" "}
                    {d.tool_ids?.length ?? 0} tools · {d.id.slice(0, 8)}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {statusBadge(d.status)}
                  {d.status === "draft" && (
                    <form
                      action={async () => {
                        "use server";
                        await approveDigest(d.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 text-sm font-semibold bg-brand-500/20 text-brand-200 hover:bg-brand-500/30 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-zinc-400 hover:text-white">
                  Preview email body
                </summary>
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-white">
                  <iframe
                    title={`Preview: ${d.subject}`}
                    srcDoc={d.body_html}
                    className="w-full h-[480px] bg-white"
                    sandbox=""
                  />
                </div>
              </details>
            </div>
          ))}
          {(digests ?? []).length === 0 && (
            <p className="text-sm text-zinc-500">
              No digest drafts yet. They appear here after /api/cron/digest runs.
            </p>
          )}
        </div>
      </section>

      {/* Social drafts */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Share2 size={14} /> Social post drafts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(socials ?? []).map((s: any) => (
            <div key={s.id} className="glass p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  {s.platform}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(s.status)}
                  {s.status === "draft" && (
                    <form
                      action={async () => {
                        "use server";
                        await approveSocial(s.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs font-semibold bg-brand-500/20 text-brand-200 hover:bg-brand-500/30 px-2.5 py-1 rounded-lg transition-all"
                      >
                        <CheckCircle2 size={12} /> Approve
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{s.body}</p>
              <div className="text-xs text-zinc-600 mt-3">
                {new Date(s.created_at).toLocaleString()}
                {s.tool_id ? ` · tool ${s.tool_id.slice(0, 8)}` : ""}
              </div>
            </div>
          ))}
        </div>
        {(socials ?? []).length === 0 && (
          <p className="text-sm text-zinc-500">
            No social drafts yet. They appear here after /api/cron/digest runs.
          </p>
        )}
      </section>
    </div>
  );
}
