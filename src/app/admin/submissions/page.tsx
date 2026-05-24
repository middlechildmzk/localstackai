export const dynamic = "force-dynamic";
import { createServerClient } from "@/lib/supabase";
import { SubmissionReviewTable } from "@/components/admin/SubmissionReviewTable";

export default async function AdminSubmissionsPage() {
  const supabase = createServerClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Tool Submissions
      </h1>
      <SubmissionReviewTable submissions={submissions ?? []} />
    </div>
  );
}
