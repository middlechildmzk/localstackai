export const metadata = { title: "Maker Dashboard | StackBuilder AI" };

export default function MakerDashboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>Maker Dashboard</h1>
      <div className="glass p-5 text-zinc-400">
        Maker analytics, verified profile updates, and launch tools will live here after auth is connected. For now, use the claim flow to request a profile update.
      </div>
    </div>
  );
}
