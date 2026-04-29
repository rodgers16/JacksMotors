"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  if (pathname?.startsWith("/admin/login")) return null;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[hsl(var(--border))] bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2 text-foreground font-semibold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-sm">JM</span>
            <span className="hidden sm:inline">Jacks Motors</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1" aria-label="Admin">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(l.href)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden md:inline-flex h-9 items-center px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            View site
          </Link>
          <form action="/api/auth/signout" method="POST" className="hidden md:block">
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut size={14} aria-hidden /> Sign out
            </button>
          </form>
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-card text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[hsl(var(--border))] bg-card" aria-label="Admin (mobile)">
          <ul className="px-4 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-lg text-base font-medium",
                    isActive(l.href) ? "bg-secondary text-foreground" : "text-muted-foreground"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-[hsl(var(--border))] mt-2 pt-2">
              <Link href="/" onClick={() => setOpen(false)} className="block px-3 py-3 rounded-lg text-base text-muted-foreground">
                View site
              </Link>
            </li>
            <li>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full text-left px-3 py-3 rounded-lg text-base text-muted-foreground inline-flex items-center gap-2"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </form>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
