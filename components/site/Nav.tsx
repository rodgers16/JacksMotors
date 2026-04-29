"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const links = [
  { href: "/inventory", label: "Inventory" },
  { href: "/financing", label: "Financing" },
  { href: "/trade-in", label: "Trade-In" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "bg-background/95 backdrop-blur-md border-b border-[hsl(var(--border))]" : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:h-[72px] lg:px-12">
        {/* Left — MENU */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="cap-label inline-flex items-center gap-3 text-foreground hover:text-foreground/70 transition-colors"
          >
            {open ? (
              <X size={14} aria-hidden strokeWidth={1.75} />
            ) : (
              <span aria-hidden className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-4 bg-current" />
              </span>
            )}
            <span>{open ? "Close" : "Menu"}</span>
          </button>
        </div>

        {/* Center — logo */}
        <div className="flex items-center justify-center">
          <Logo />
        </div>

        {/* Right — INVENTORY */}
        <div className="flex items-center justify-end">
          <Link
            href="/inventory"
            className="cap-label inline-flex items-center gap-3 text-foreground hover:text-foreground/70 transition-colors"
          >
            <span>Inventory</span>
            <ShoppingBag size={15} aria-hidden strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Full-screen overlay menu */}
      <div
        className={cn(
          "fixed inset-0 top-16 lg:top-[72px] z-40 bg-background transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div className="mx-auto flex h-full max-w-[1600px] flex-col px-5 pb-10 pt-8 sm:px-8 lg:px-12">
          <p className="eyebrow">Navigate</p>
          <ul className="mt-8 flex flex-col">
            {links.map((l, i) => (
              <li key={l.href} className="border-b border-[hsl(var(--border))]">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-display group flex items-center justify-between py-5 text-3xl text-foreground transition-colors hover:text-muted-foreground sm:text-5xl"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="cap-label text-muted-foreground/60 w-8 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {l.label}
                  </span>
                  <span aria-hidden className="text-muted-foreground/60 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8 flex flex-wrap items-end justify-between gap-6 text-sm">
            <div>
              <p className="eyebrow mb-2">Visit</p>
              <p className="text-foreground">{site.address.street}</p>
              <p className="text-muted-foreground">{site.address.city}, {site.address.region}</p>
            </div>
            <div>
              <p className="eyebrow mb-2">Call</p>
              <a href={site.phoneHref} className="text-foreground hover:text-muted-foreground transition-colors">{site.phone}</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
