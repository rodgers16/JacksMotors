import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { formatPrice, formatMileage } from "@/lib/inventory";
import type { PublicVehicle } from "@/lib/db/publicReads";

export function VehicleCard({ v, large = false }: { v: PublicVehicle; large?: boolean }) {
  return (
    <Link
      href={v.href}
      className="group relative block overflow-hidden bg-card"
      style={{ aspectRatio: large ? "5/6" : "4/5" }}
    >
      <Image
        src={v.image}
        alt={`${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
        placeholder={v.blur ? "blur" : "empty"}
        blurDataURL={v.blur ?? undefined}
      />

      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, transparent 50%, rgba(0,0,0,0.9) 100%)" }} />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <span className="cap-label text-foreground/90 backdrop-blur-sm bg-black/30 px-2 py-1">{v.body}</span>
        <span className="inline-flex h-9 w-9 items-center justify-center border border-foreground/40 text-foreground bg-black/30 backdrop-blur-sm transition-all duration-300 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
          <ArrowUpRight size={14} aria-hidden />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="cap-label text-muted-foreground">{v.year} · {formatMileage(v.mileage)}</p>
        <h3 className="font-display mt-2 text-2xl text-foreground leading-[0.95] sm:text-3xl">
          {v.make}
          <br />
          <span className="text-foreground">{v.model}</span>
          {v.trim && <span className="block text-base normal-case tracking-normal text-muted-foreground mt-1.5 font-sans">{v.trim}</span>}
        </h3>
        <div className="mt-5 flex items-end justify-between">
          <p className="font-display text-lg text-foreground">{formatPrice(v.price)}</p>
          <span className="cap-label text-foreground/80 group-hover:text-foreground transition-colors">View →</span>
        </div>
      </div>
    </Link>
  );
}
