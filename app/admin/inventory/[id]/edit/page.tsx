import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getVehicleById } from "@/lib/db/queries";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { AdminBanner } from "@/components/admin/AdminUI";
import type { VehicleInput } from "@/lib/validation/vehicle";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ created?: string }>;

export default async function EditVehiclePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const v = await getVehicleById(id).catch(() => null);
  if (!v) notFound();

  const initial: Partial<VehicleInput> = {
    vin: v.vin ?? "",
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim ?? "",
    body: v.body,
    transmission: v.transmission,
    drivetrain: v.drivetrain,
    fuel: v.fuel,
    exteriorColor: v.exteriorColor ?? "",
    interiorColor: v.interiorColor ?? "",
    price: Math.round(v.priceCents / 100),
    mileage: v.mileage,
    description: v.description ?? "",
    badges: v.badges ?? [],
    carfaxUrl: v.carfaxUrl ?? "",
    status: v.status,
  };

  const photos = v.photos.map((p) => ({
    id: p.id,
    url: p.url,
    blur: p.blur,
    width: p.width,
    height: p.height,
    position: p.position,
  }));

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {v.year} {v.make} {v.model}
          </h1>
          {v.trim && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{v.trim}</p>}
        </div>
        {v.status === "draft" ? (
          <Link
            href={`/admin/inventory/${v.id}/review`}
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:underline"
          >
            Review & publish <ExternalLink size={13} aria-hidden />
          </Link>
        ) : (v.status === "available" || v.status === "pending") && (
          <Link
            href={`/inventory/${v.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            View live <ExternalLink size={13} aria-hidden />
          </Link>
        )}
      </div>

      {created && (
        <AdminBanner tone="success" className="mb-5">
          Saved. Now upload photos below — drag to reorder.
        </AdminBanner>
      )}

      <VehicleForm mode="edit" vehicleId={v.id} initial={initial} initialPhotos={photos} />
    </div>
  );
}
