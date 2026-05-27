import Link from "next/link";

export const metadata = {
  title: "SourcingOS Sourcers Vault",
  description:
    "SourcingOS Sourcers Vault: recruiting tools, sourcing methods, cleared sourcing playbooks, prompt bench, and ROI workflows.",
};

export default function SourcersVaultPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <div className="border-b border-white/10 bg-[#0c1220] px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
              SourcingOS Module
            </p>
            <h1 className="text-xl font-bold text-white">Sourcers Vault</h1>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-sky-400/40 hover:text-white"
          >
            Back to SourcingOS
          </Link>
        </div>
      </div>

      <iframe
        src="/sourcers-vault.html"
        title="SourcingOS Sourcers Vault"
        className="h-[calc(100vh-73px)] w-full border-0"
      />
    </div>
  );
}
