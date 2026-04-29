import { VehicleForm } from "@/components/admin/VehicleForm";

export default function NewVehiclePage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Add a vehicle</h1>
        <p className="mt-1 text-muted-foreground">Fill in the basics, save, then add photos.</p>
      </div>
      <VehicleForm mode="new" />
    </div>
  );
}
