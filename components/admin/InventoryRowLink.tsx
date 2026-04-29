"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Props = {
  href: string;
  ariaLabel: string;
};

/**
 * Absolute-cover link for an inventory list row. Shows a subtle loading
 * spinner overlay after the dealer taps it, since route transitions to
 * the review/edit page can take a moment on first load.
 */
export function InventoryRowLink({ href, ariaLabel }: Props) {
  const [navigating, setNavigating] = React.useState(false);

  return (
    <>
      <Link
        href={href}
        aria-label={ariaLabel}
        onClick={() => setNavigating(true)}
        className="absolute inset-0 z-0"
      />
      {navigating && (
        <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center bg-card/60 backdrop-blur-[1px]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card shadow">
            <Loader2 size={16} className="animate-spin text-foreground" aria-hidden />
          </span>
        </div>
      )}
    </>
  );
}
