"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function InventorySearch() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [value, setValue] = React.useState(initial);
  const debounce = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  const push = React.useCallback(
    (next: string) => {
      const sp = new URLSearchParams(Array.from(params.entries()));
      if (next.trim()) sp.set("q", next.trim());
      else sp.delete("q");
      router.replace(`/admin/inventory${sp.toString() ? `?${sp}` : ""}`);
    },
    [params, router]
  );

  const onChange = (next: string) => {
    setValue(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => push(next), 350);
  };

  const clear = () => {
    setValue("");
    if (debounce.current) clearTimeout(debounce.current);
    push("");
  };

  return (
    <div className="relative">
      <Search
        size={15}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search VIN, make, model, year…"
        className="h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <X size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}
