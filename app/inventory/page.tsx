import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { CreditApplicationTrigger } from "@/components/credit/CreditApplicationTrigger";
import { VehicleCard } from "@/components/landing/VehicleCard";
import { Filters } from "@/components/inventory/Filters";
import { parseFilters } from "@/lib/inventory";
import { listVehiclesPublic } from "@/lib/db/publicReads";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse the full Jacks Motors collection of hand-picked premium pre-owned vehicles. Filter by make, body, price, fuel, and more.",
  alternates: { canonical: "/inventory" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const sorted = await listVehiclesPublic(filters);

  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        {/* Page header */}
        <section className="border-b border-[hsl(var(--border))] bg-background py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">The Collection</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              Inventory
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              Every vehicle hand-picked, inspected, and detailed. New arrivals
              every week — what you see is what's on the lot today.
            </p>
          </div>
        </section>

        {/* Filters */}
        <Suspense fallback={<FiltersSkeleton resultCount={sorted.length} />}>
          <Filters resultCount={sorted.length} />
        </Suspense>

        {/* Grid */}
        <section className="bg-background pb-24 pt-10 sm:pt-14">
          <div className="mx-auto max-w-[1600px] px-0 sm:px-8 lg:px-12">
            {sorted.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="grid grid-cols-1 gap-px bg-[hsl(var(--border))] sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((v) => (
                  <li key={v.id} className="contents">
                    <VehicleCard v={v} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
    </>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <p className="eyebrow">No matches</p>
      <p className="font-display mt-4 text-3xl text-balance leading-tight sm:text-4xl">
        Nothing fits those filters today.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        New stock lands every week. Get pre-approved now and we'll call you the
        moment something matches.
      </p>
      <div className="mt-8">
        <CreditApplicationTrigger size="md" variant="outline">
          Get Pre-Approved
        </CreditApplicationTrigger>
      </div>
    </div>
  );
}

function FiltersSkeleton({ resultCount }: { resultCount: number }) {
  return (
    <div className="border-b border-[hsl(var(--border))] bg-background sticky top-[72px] z-30">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 py-4">
        <p className="cap-label text-muted-foreground">
          <span className="text-foreground">{resultCount}</span> vehicles
        </p>
      </div>
    </div>
  );
}
