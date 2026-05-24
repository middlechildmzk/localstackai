import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} StackBuilder AI. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Sponsored listings are clearly labeled. Rankings are never for sale.
          </p>
        </div>
      </div>
    </footer>
  );
}

const footerSections = [
  {
    title: "Discover",
    links: [
      { href: "/tools", label: "All Tools" },
      { href: "/workflows", label: "Workflows" },
      { href: "/stacks", label: "Public Stacks" },
      { href: "/trending", label: "Trending" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/compare/chatgpt-vs-claude", label: "ChatGPT vs Claude" },
      { href: "/compare/runway-vs-pika", label: "Runway vs Pika" },
      { href: "/alternatives/chatgpt", label: "ChatGPT Alternatives" },
      { href: "/alternatives/runway", label: "Runway Alternatives" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/stacks/new", label: "Build a Stack" },
      { href: "/stacks/faceless-youtube-production-stack", label: "Faceless YouTube Stack" },
      { href: "/stacks/solo-founder-marketing-stack", label: "Solo Founder Stack" },
      { href: "/newsletter", label: "Newsletter" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/methodology", label: "Methodology" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/contact", label: "Contact" },
    ],
  },
];
