import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getVehicleById } from "@/lib/db/queries";
import { VehicleForm } from "@/components/admin/VehicleForm";
import type { VehicleInput } from "@/lib/validation/vehicle";

type Params = Promise<{ id: string }>;

export default async function EditVehiclePage({ params }: { params: Params }) {
  const { id } = await params;
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
    mileage: v.mileageKm,
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
    <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <Link
        href="/admin/inventory"
        className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} /> All vehicles
      </Link>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Editing</p>
          <h1 className="font-display mt-3 text-balance text-3xl leading-[0.95] sm:text-5xl">
            {v.year} {v.make} {v.model}
          </h1>
        </div>
        {(v.status === "available" || v.status === "pending") && (
          <Link
            href={`/inventory/${v.slug}`}
            target="_blank"
            className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            View live <ExternalLink size={12} aria-hidden />
          </Link>
        )}
      </div>

      <div className="mt-10">
        <VehicleForm mode="edit" vehicleId={v.id} initial={initial} initialPhotos={photos} />
      </div>
    </div>
  );
}
