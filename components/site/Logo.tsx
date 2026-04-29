import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Jacks Motors home"
      className={cn(
        "font-display inline-flex items-baseline gap-1 text-[20px] tracking-[0.22em] text-foreground hover:text-foreground",
        className
      )}
    >
      <span>JACKS</span>
      <span className="text-foreground" aria-hidden>·</span>
      <span>MOTORS</span>
      {!compact && null}
    </Link>
  );
}
