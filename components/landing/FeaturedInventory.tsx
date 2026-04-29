import Link from "next/link";
import { getFeaturedPublic } from "@/lib/db/publicReads";
import { VehicleCard } from "./VehicleCard";

export async function FeaturedInventory() {
  const featured = await getFeaturedPublic(6);

  return (
    <section aria-labelledby="featured-heading" className="border-t border-[hsl(var(--border))] bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">The Collection</p>
            <h2 id="featured-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Hand-picked, this week
            </h2>
          </div>
          <Link href="/inventory" className="cap-label group inline-flex items-center gap-3 text-foreground hover:text-muted-foreground self-start sm:self-end">
            <span className="inline-block h-px w-10 bg-foreground transition-all duration-300 group-hover:w-16" aria-hidden />
            View All Inventory
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px bg-[hsl(var(--border))] sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
