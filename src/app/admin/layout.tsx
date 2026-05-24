import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { DemoModeBanner } from "@/components/ui/DemoModeBanner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  // Note: in production use session from cookies; service role used here for simplicity
  // Production: replace with cookie-based session check
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r border-white/5 bg-[#111118] p-4 shrink-0">
        <div className="mb-6">
          <span
            className="text-xs font-semibold text-zinc-600 uppercase tracking-widest"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin
          </span>
        </div>
        <nav className="space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto"><DemoModeBanner admin />{children}</main>
    </div>
  );
}

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/freshness", label: "Freshness Queue" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/analytics", label: "Analytics" },
];
