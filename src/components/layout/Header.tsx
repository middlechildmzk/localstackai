import Link from "next/link";
import { Layers } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
            <Layers className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span
            className="font-display font-bold text-white text-lg tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            StackBuilder
            <span className="text-brand-400 ml-0.5">AI</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-sm text-zinc-300 border border-white/10 hover:border-white/20 rounded-lg transition-all hover:bg-white/5"
          >
            Submit Tool
          </Link>
          <Link
            href="/stacks/new"
            className="inline-flex items-center px-3.5 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"
          >
            Build Stack
          </Link>
        </div>
      </div>
    </header>
  );
}

const navLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/workflows", label: "Workflows" },
  { href: "/stacks", label: "Stacks" },
  { href: "/trending", label: "Trending" },
  { href: "/compare", label: "Compare" },
];
