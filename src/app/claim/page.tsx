import Link from "next/link";
import { createServerClient, hasSupabaseServiceConfig } from "@/lib/supabase";

export const metadata = { title: "Claim a Tool" };
export const dynamic = "force-dynamic";

export default async function ClaimHubPage() {
  if (!hasSupabaseServiceConfig()) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Claim a tool profile</h1>
        <p className="text-zinc-400 mb-8">Tool claiming is temporarily unavailable while the live StackBuilder data service is offline. Public comparison pages can continue in continuity mode, but ownership and profile changes require the live database.</p>
        <Link href="/compare" className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Browse comparisons →</Link>
      </div>
    );
  }

  const supabase = createServerClient();
  const { data: tools } = await supabase.from("tools").select("slug,name,tagline,is_claimed").eq("is_published", true).order("name");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Claim a tool profile</h1>
      <p className="text-zinc-400 mb-8">Makers can claim profiles to update tool info, improve freshness, and add trust signals.</p>
      <div className="space-y-3">
        {(tools ?? []).map((tool: any) => (
          <Link key={tool.slug} href={`/claim/${tool.slug}`} className="glass p-4 flex items-center justify-between hover:border-white/10 transition-all">
            <span><strong className="text-white">{tool.name}</strong><span className="block text-sm text-zinc-500">{tool.tagline}</span></span>
            <span className="text-sm text-brand-400">Claim →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
