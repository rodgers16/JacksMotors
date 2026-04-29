"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => update(s)}
            className={`cap-label border px-3 py-1.5 transition-colors ${
              s === status
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/30 text-foreground hover:border-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {error && <p className="cap-label text-destructive">{error}</p>}
    </div>
  );
}
