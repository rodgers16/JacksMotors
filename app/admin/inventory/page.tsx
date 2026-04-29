import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { listAllVehicles, getVehicleStatusCounts, type AdminListFilters } from "@/lib/db/queries";
import { formatPrice, formatMileage } from "@/lib/inventory";
import { AdminLinkButton, AdminBanner, AdminPill } from "@/components/admin/AdminUI";
import { InventoryRowMenu } from "@/components/admin/InventoryRowMenu";
import { InventoryRowLink } from "@/components/admin/InventoryRowLink";
import { InventorySearch } from "@/components/admin/InventorySearch";
import { cn } from "@/lib/cn";

type SearchParams = Promise<{ status?: string; q?: string }>;

const STATUS_FILTERS: Array<{ value: AdminListFilters["status"] | undefined; label: string; key: string }> = [
  { value: undefined,    label: "All",       key: "all" },
  { value: "available",  label: "Available", key: "available" },
  { value: "pending",    label: "Pending",   key: "pending" },
  { value: "draft",      label: "Draft",     key: "draft" },
  { value: "hidden",     label: "Hidden",    key: "hidden" },
  { value: "sold",       label: "Sold",      key: "sold" },
];

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const statusParam = sp.status as AdminListFilters["status"] | undefined;
  const validStatus = STATUS_FILTERS.some((f) => f.value === statusParam) ? statusParam : undefined;
  const q = sp.q?.trim() || undefined;

  let vehicles: Awaited<ReturnType<typeof listAllVehicles>> = [];
  let counts: Awaited<ReturnType<typeof getVehicleStatusCounts>> = {
    all: 0, available: 0, pending: 0, sold: 0, hidden: 0, draft: 0,
  };
  let dbError: string | null = null;
  try {
    [vehicles, counts] = await Promise.all([
      listAllVehicles({ status: validStatus, q }),
      getVehicleStatusCounts(),
    ]);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database not available";
  }

  const buildHref = (status: AdminListFilters["status"] | undefined) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/admin/inventory${qs ? `?${qs}` : ""}`;
  };

  const hasFilter = !!validStatus || !!q;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Inventory</h1>
          {!dbError && (
            <p className="mt-1 text-sm text-muted-foreground">
              {vehicles.length} of {counts.all} {counts.all === 1 ? "vehicle" : "vehicles"}
              {hasFilter && " (filtered)"}
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

      {!dbError && (
        <div className="mt-6 flex flex-col gap-3">
          {/* Status chips — horizontal scroll on small screens */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {STATUS_FILTERS.map((f) => {
                const active = (f.value ?? undefined) === validStatus;
                const count = counts[f.key as keyof typeof counts];
                return (
                  <Link
                    key={f.key}
                    href={buildHref(f.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                      active
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                    )}
                  >
                    {f.label}
                    <span className={cn("text-xs", active ? "text-background/70" : "text-muted-foreground")}>
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search box */}
          <InventorySearch />
        </div>
      )}

      {!dbError && vehicles.length === 0 && counts.all === 0 && (
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

      {!dbError && vehicles.length === 0 && counts.all > 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-card p-10 text-center">
          <p className="text-base font-medium text-foreground">No matches</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different filter or search term.</p>
          <div className="mt-4">
            <Link href="/admin/inventory" className="text-sm font-medium text-accent hover:underline">
              Clear filters
            </Link>
          </div>
        </div>
      )}

      {!dbError && vehicles.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-card">
          <ul className="divide-y divide-[hsl(var(--border))]">
            {vehicles.map((v) => {
              const title = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;
              return (
                <li
                  key={v.id}
                  className="relative grid grid-cols-[64px_1fr_auto_44px] items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors sm:grid-cols-[96px_1fr_auto_auto_44px] sm:gap-4 sm:px-4 sm:py-4"
                >
                  <InventoryRowLink
                    href={
                      v.status === "draft"
                        ? `/admin/inventory/${v.id}/review`
                        : `/admin/inventory/${v.id}/edit`
                    }
                    ariaLabel={v.status === "draft" ? `Review ${title}` : `Edit ${title}`}
                  />
                  <div className="relative z-[1] aspect-square overflow-hidden rounded-lg bg-secondary pointer-events-none">
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
                  <div className="relative z-[1] min-w-0 pointer-events-none">
                    <p className="font-semibold text-foreground truncate text-base">
                      {v.year} {v.make} {v.model}
                      {v.trim && <span className="font-normal text-muted-foreground"> {v.trim}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm truncate">
                      {formatMileage(v.mileage)} · {v.body} · {v.drivetrain} · {v.fuel}
                    </p>
                    <div className="mt-1.5 sm:hidden">
                      <StatusPill status={v.status} />
                    </div>
                  </div>
                  <div className="relative z-[1] text-right shrink-0 pointer-events-none">
                    <p className="font-semibold text-foreground">{formatPrice(Math.round(v.priceCents / 100))}</p>
                  </div>
                  <div className="relative z-[1] hidden sm:block pointer-events-none">
                    <StatusPill status={v.status} />
                  </div>
                  <div className="relative z-[2]">
                    <InventoryRowMenu
                      vehicleId={v.id}
                      slug={v.slug}
                      status={v.status}
                      title={title}
                    />
                  </div>
                </li>
              );
            })}
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
