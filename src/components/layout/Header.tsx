import Link from "next/link";
import { Layers } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
            <Layers className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            StackBuilder AI
          </span>
        </Link>
      </div>
    </header>
  );
}
