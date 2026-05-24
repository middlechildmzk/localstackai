import { hasSupabaseConfig } from "@/lib/supabase";

export function DemoModeBanner({ admin = false }: { admin?: boolean }) {
  if (hasSupabaseConfig()) return null;
  return (
    <div className={admin ? "mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100" : "rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-100"}>
      <strong>{admin ? "Demo Admin Preview" : "Public Demo Mode"}</strong>
      <span className="ml-2 text-zinc-300">
        {admin
          ? "This admin UI is visible for preview only. Add authentication, RLS, and deployment protection before production."
          : "Saving and persistence are simulated until Supabase environment variables are connected."}
      </span>
    </div>
  );
}
