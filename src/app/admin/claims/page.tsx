export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";
import { ClaimReviewTable } from "@/components/admin/ClaimReviewTable";

export default async function AdminClaimsPage() {
  const supabase = createServerClient();
  const { data: claims } = await supabase
    .from("claims")
    .select(`*, tool:tools(id,slug,name), claimant:profiles(id,display_name)`)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Tool Claims
      </h1>
      <ClaimReviewTable claims={claims ?? []} />
    </div>
  );
}
