"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, FileText, FolderOpen, Tag, LayoutDashboard } from "lucide-react";
import { getHealth } from "@/lib/api/health";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prompts", label: "Prompts", icon: FileText },
  { href: "/collections", label: "Collections", icon: FolderOpen },
  { href: "/tags", label: "Tags", icon: Tag },
];

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const base = mobile
    ? "flex flex-col gap-2 py-4"
    : "hidden md:flex items-center gap-1";

  return (
    <nav className={base} aria-label="Main navigation">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] md:min-w-0 justify-center md:justify-start ${
              isActive
                ? "text-indigo-600 bg-indigo-50 md:bg-transparent md:border-b-2 md:border-indigo-600"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    getHealth()
      .then(() => setApiHealthy(true))
      .catch(() => setApiHealthy(false));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-bold text-xl text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              PromptLab
            </Link>
            {apiHealthy !== null && (
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  apiHealthy ? "bg-emerald-500" : "bg-red-500"
                }`}
                title={apiHealthy ? "API connected" : "API disconnected"}
                aria-hidden
              />
            )}
          </div>

          <NavLinks />

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t border-slate-200 bg-white"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <NavLinks mobile />
        </div>
      )}
    </header>
  );
}
