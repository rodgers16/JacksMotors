import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { listAllVehicles } from "@/lib/db/queries";
import { formatPrice, formatMileage } from "@/lib/inventory";

export default async function AdminInventoryPage() {
  let vehicles: Awaited<ReturnType<typeof listAllVehicles>> = [];
  let dbError: string | null = null;
  try {
    vehicles = await listAllVehicles();
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database not available";
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="font-display mt-3 text-balance text-4xl leading-[0.95] sm:text-6xl">
            All vehicles
          </h1>
          {!dbError && (
            <p className="mt-3 cap-label text-muted-foreground">
              <span className="text-foreground">{vehicles.length}</span> total
            </p>
          )}
        </div>
        <Link
          href="/admin/inventory/new"
          className="cap-label inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-background hover:bg-foreground/90 transition-colors self-start"
        >
          <Plus size={14} aria-hidden /> New Car
        </Link>
      </div>

      {dbError && (
        <div className="mt-10 border border-destructive/40 bg-destructive/10 p-6">
          <p className="cap-label text-destructive">Database error</p>
          <p className="mt-2 text-foreground text-sm">{dbError}</p>
        </div>
      )}

      {!dbError && vehicles.length === 0 && (
        <div className="mt-12 border border-[hsl(var(--border))] py-20 text-center">
          <p className="font-display text-3xl">No vehicles yet.</p>
          <p className="mt-3 text-muted-foreground">Add the first one to get started.</p>
          <Link
            href="/admin/inventory/new"
            className="cap-label mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-background hover:bg-foreground/90 transition-colors"
          >
            <Plus size={14} aria-hidden /> New Car
          </Link>
        </div>
      )}

      {!dbError && vehicles.length > 0 && (
        <ul className="mt-10 divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
          {vehicles.map((v) => (
            <li key={v.id}>
              <Link
                href={`/admin/inventory/${v.id}/edit`}
                className="grid grid-cols-[80px_1fr_auto] items-center gap-4 py-4 hover:bg-foreground/[0.02] transition-colors sm:grid-cols-[120px_1fr_auto_auto] sm:gap-6 sm:py-5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-card">
                  {v.photos[0] ? (
                    <Image
                      src={v.photos[0].url}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                      placeholder={v.photos[0].blur ? "blur" : "empty"}
                      blurDataURL={v.photos[0].blur ?? undefined}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="cap-label text-muted-foreground/60">{v.year} · {v.body}</p>
                  <p className="font-display mt-1 text-lg text-foreground truncate sm:text-xl">
                    {v.make} {v.model} {v.trim ? <span className="text-muted-foreground font-sans normal-case tracking-normal text-base">{v.trim}</span> : null}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatMileage(v.mileageKm)} · {v.drivetrain} · {v.fuel}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-foreground sm:text-xl">{formatPrice(Math.round(v.priceCents / 100))}</p>
                  <StatusBadge status={v.status} />
                </div>
                <span aria-hidden className="cap-label text-muted-foreground hidden sm:inline">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    available: "text-foreground border-foreground/40",
    pending: "text-foreground border-foreground/40",
    draft: "text-muted-foreground border-muted-foreground/40",
    sold: "text-muted-foreground border-muted-foreground/40 line-through",
    hidden: "text-muted-foreground/60 border-muted-foreground/30",
  };
  return (
    <span className={`cap-label mt-1 inline-block border px-2 py-0.5 ${palette[status] ?? palette.draft}`}>
      {status}
    </span>
  );
}
