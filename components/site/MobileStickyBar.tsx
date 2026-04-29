"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { site } from "@/lib/site";
import { openCreditApp } from "@/components/credit/CreditApplicationTrigger";
import { cn } from "@/lib/cn";

export function MobileStickyBar() {
  const [hidden, setHidden] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y > 320);
      setHidden(y > lastY && y - lastY > 4);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden transition-transform duration-300 border-t border-[hsl(var(--border))] bg-background/95 backdrop-blur-md",
        visible && !hidden ? "translate-y-0" : "translate-y-full pointer-events-none"
      )}
      aria-hidden={!visible || hidden}
    >
      <div className="flex">
        <a
          href={site.phoneHref}
          className="flex flex-1 items-center justify-center gap-2 h-14 cap-label text-foreground border-r border-[hsl(var(--border))]"
        >
          <Phone size={13} aria-hidden /> Call
        </a>
        <button
          type="button"
          onClick={() => openCreditApp()}
          className="flex flex-1 items-center justify-center h-14 cap-label text-background bg-foreground"
        >
          Get Pre-Approved
        </button>
      </div>
    </div>
  );
}
