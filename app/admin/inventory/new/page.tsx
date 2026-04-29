import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/admin/VehicleForm";

export default function NewVehiclePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <Link
        href="/admin/inventory"
        className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} /> All vehicles
      </Link>
      <div className="mt-6">
        <p className="eyebrow">New car</p>
        <h1 className="font-display mt-3 text-balance text-4xl leading-[0.95] sm:text-5xl">
          Add a vehicle
        </h1>
      </div>
      <div className="mt-10">
        <VehicleForm mode="new" />
      </div>
    </div>
  );
}
