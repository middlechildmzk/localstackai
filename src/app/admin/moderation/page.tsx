import { AlertTriangle, ShieldCheck } from "lucide-react";

export const metadata = { title: "Moderation | StackBuilder AI" };

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Admin</p>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
          Moderation Queue
        </h1>
        <p className="text-zinc-400 mt-2">
          Review duplicate reports, spam flags, correction requests, and trust issues before anything changes on public pages.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-5">
          <div className="flex items-center gap-2 text-amber-300 mb-2"><AlertTriangle size={16} /> Open flags</div>
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-zinc-500 mt-2">Demo mode has no unresolved moderation flags.</p>
        </div>
        <div className="glass p-5">
          <div className="flex items-center gap-2 text-brand-300 mb-2"><ShieldCheck size={16} /> Review policy</div>
          <p className="text-sm text-zinc-400">No auto-publish for pricing changes, claim approvals, sponsored placements, or duplicate merges.</p>
        </div>
      </div>
    </div>
  );
}
