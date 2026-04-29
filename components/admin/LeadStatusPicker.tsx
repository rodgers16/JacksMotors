"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const STATUSES = ["new", "contacted", "approved", "sold", "lost"] as const;
type Status = typeof STATUSES[number];

export function LeadStatusPicker({ leadId, status }: { leadId: string; status: Status }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const update = (next: Status) => {
    start(async () => {
      try {
        const res = await fetch(`/api/admin/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        if (!res.ok) throw new Error("Update failed");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      }
    });
  };

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5">
      <span className="text-xs text-muted-foreground">Pipeline</span>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => update(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 capitalize",
              s === status
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground hover:bg-secondary/70"
            )}
          >
            {pending && s === status && <Loader2 size={12} className="inline mr-1 animate-spin" />}
            {s}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
