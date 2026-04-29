"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Loader2 } from "lucide-react";

type Props = {
  vehicleId: string;
  slug: string;
  title: string;
};

export function PublishBar({ vehicleId, slug, title }: Props) {
  const router = useRouter();
  const [publishing, setPublishing] = React.useState(false);
  const [navigating, setNavigating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const publish = async () => {
    if (publishing || navigating) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "available" }),
      });
      if (!res.ok) throw new Error(`Couldn't publish (${res.status})`);
      router.push(`/inventory/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
      setPublishing(false);
    }
  };

  const goEdit = () => {
    if (publishing || navigating) return;
    setNavigating(true);
    router.push(`/admin/inventory/${vehicleId}/edit`);
  };

  return (
    <>
      {error && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+76px)] z-30 mx-auto max-w-[1280px] px-4 sm:bottom-[calc(env(safe-area-inset-bottom)+88px)] sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-900 shadow-md">
            {error}
          </div>
        </div>
      )}

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[hsl(var(--border))] bg-card/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
          <div className="hidden sm:block min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-700">Draft — not live yet</p>
            <p className="mt-0.5 text-sm text-foreground truncate">{title}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={goEdit}
              disabled={publishing || navigating}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-card px-4 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50 transition-colors sm:h-11 sm:flex-none sm:px-5"
            >
              {navigating ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Pencil size={15} aria-hidden />}
              {navigating ? "Opening editor…" : "Keep editing"}
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={publishing || navigating}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors sm:h-11 sm:flex-none sm:px-6"
            >
              {publishing ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <CheckCircle2 size={16} aria-hidden />}
              {publishing ? "Publishing — going live…" : "Publish & make live"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
