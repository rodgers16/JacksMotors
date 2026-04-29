"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
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

  // Hide on the login page
  if (pathname?.startsWith("/admin/login")) return null;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[hsl(var(--border))] bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6" aria-label="Admin">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "cap-label transition-colors",
                  isActive(l.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form action="/api/auth/signout" method="POST" className="hidden md:block">
            <button
              type="submit"
              className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut size={13} aria-hidden /> Sign out
            </button>
          </form>
          <button
            type="button"
            className="md:hidden cap-label inline-flex items-center gap-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={14} aria-hidden /> : <Menu size={14} aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[hsl(var(--border))] bg-background" aria-label="Admin (mobile)">
          <ul className="px-5 py-2">
            {links.map((l) => (
              <li key={l.href} className="border-b border-[hsl(var(--border))] last:border-b-0">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block py-4 cap-label",
                    isActive(l.href) ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="cap-label inline-flex items-center gap-2 text-muted-foreground"
                >
                  <LogOut size={13} aria-hidden /> Sign out
                </button>
              </form>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
