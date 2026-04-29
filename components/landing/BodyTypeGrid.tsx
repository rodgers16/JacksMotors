import Link from "next/link";
import Image from "next/image";
import { bodyTypeImages } from "@/lib/inventory";

const types = [
  { slug: "suv", label: "SUV", count: "32 in stock" },
  { slug: "sedan", label: "Sedan", count: "28 in stock" },
  { slug: "coupe", label: "Coupe", count: "14 in stock" },
  { slug: "truck", label: "Truck", count: "11 in stock" },
  { slug: "ev", label: "Electric", count: "9 in stock" },
  { slug: "convertible", label: "Convertible", count: "6 in stock" },
];

export function BodyTypeGrid() {
  return (
    <section aria-labelledby="body-heading" className="border-t border-[hsl(var(--border))] bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">By Body Type</p>
            <h2 id="body-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Whatever you drive looks like
            </h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-px bg-[hsl(var(--border))] sm:grid-cols-3">
          {types.map((t) => (
            <Link
              key={t.slug}
              href={`/inventory?body=${t.slug}`}
              className="group relative flex aspect-[4/5] items-end overflow-hidden bg-card"
            >
              <Image
                src={bodyTypeImages[t.slug]}
                alt={`${t.label} inventory`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 35%, rgba(0,0,0,0.9) 100%)" }} />
              <div className="relative w-full p-6 sm:p-8 flex items-end justify-between">
                <div>
                  <p className="cap-label text-muted-foreground">{t.count}</p>
                  <p className="font-display mt-2 text-3xl text-foreground leading-none sm:text-4xl">{t.label}</p>
                </div>
                <span className="cap-label text-foreground/80 group-hover:text-foreground transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
