import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { listAllVehicles } from "@/lib/db/queries";
import { formatPrice, formatMileage } from "@/lib/inventory";
import { AdminLinkButton, AdminBanner, AdminPill } from "@/components/admin/AdminUI";

export default async function AdminInventoryPage() {
  let vehicles: Awaited<ReturnType<typeof listAllVehicles>> = [];
  let dbError: string | null = null;
  try {
    vehicles = await listAllVehicles();
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database not available";
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Inventory</h1>
          {!dbError && (
            <p className="mt-1 text-sm text-muted-foreground">
              {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"} total
            </p>
          )}
        </div>
        <AdminLinkButton href="/admin/inventory/new" size="lg">
          <Plus size={16} aria-hidden /> New car
        </AdminLinkButton>
      </div>

      {dbError && (
        <AdminBanner tone="warn" className="mt-6">
          <p className="font-semibold">Database not configured</p>
          <p className="mt-1 text-sm">{dbError}</p>
        </AdminBanner>
      )}

      {!dbError && vehicles.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-card p-12 text-center">
          <p className="text-xl font-semibold text-foreground">No vehicles yet</p>
          <p className="mt-2 text-muted-foreground">Add your first car to get started.</p>
          <div className="mt-6">
            <AdminLinkButton href="/admin/inventory/new">
              <Plus size={15} aria-hidden /> Add a vehicle
            </AdminLinkButton>
          </div>
        </div>
      )}

      {!dbError && vehicles.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-card">
          <ul className="divide-y divide-[hsl(var(--border))]">
            {vehicles.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/admin/inventory/${v.id}/edit`}
                  className="grid grid-cols-[64px_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-secondary transition-colors sm:grid-cols-[96px_1fr_auto_auto] sm:gap-4 sm:px-4 sm:py-4"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
                    {v.photos[0] ? (
                      <Image
                        src={v.photos[0].url}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                        placeholder={v.photos[0].blur ? "blur" : "empty"}
                        blurDataURL={v.photos[0].blur ?? undefined}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No photo</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate text-base">
                      {v.year} {v.make} {v.model}
                      {v.trim && <span className="font-normal text-muted-foreground"> {v.trim}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                      {formatMileage(v.mileage)} · {v.body} · {v.drivetrain} · {v.fuel}
                    </p>
                    <div className="mt-1.5 sm:hidden">
                      <StatusPill status={v.status} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-foreground">{formatPrice(Math.round(v.priceCents / 100))}</p>
                  </div>
                  <div className="hidden sm:block">
                    <StatusPill status={v.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "available" ? "success" :
    status === "pending"   ? "info" :
    status === "sold"      ? "neutral" :
    status === "hidden"    ? "neutral" :
    /* draft */              "warn";
  return <AdminPill tone={tone}>{status}</AdminPill>;
}
