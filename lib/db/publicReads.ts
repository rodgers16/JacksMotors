/**
 * Public-site reads with graceful fallback to the hardcoded `lib/inventory.ts`
 * dataset when the DB is empty or unconfigured.
 *
 * - If DATABASE_URL is unset: skip DB, use hardcoded data
 * - If DB is reachable but returns 0 rows: fall back to hardcoded
 * - If DB query throws: log and fall back to hardcoded
 *
 * This lets us ship the schema + admin in parallel with the public site,
 * without a hard dependency on Neon being provisioned for local dev.
 */

import {
  vehicles as legacyVehicles,
  type Vehicle as LegacyVehicle,
} from "@/lib/inventory";
import {
  listPublicVehicles,
  getPublicVehicleBySlug,
  getFeaturedVehicles as getFeaturedVehiclesDb,
  type PublicFilters,
} from "./queries";
import type { VehicleWithPhotos } from "./schema";

/** Shape the public site renders against — uniform across DB rows and legacy hardcoded ones */
export type PublicVehicle = {
  id: string;
  slug: string;
  href: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  body: string;
  drivetrain: string;
  fuel: string;
  transmission: string;
  /** Dollars (no cents) — for display + sort */
  price: number;
  mileage: number;
  badges: string[];
  /** First photo URL */
  image: string;
  blur?: string | null;
  /** Dealer-written walkaround / notes */
  description?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  vin?: string | null;
  carfaxUrl?: string | null;
  /** All photos (sorted by position), so the public page can show a gallery, not just the cover */
  photos?: { id: string; url: string; blur?: string | null; width: number; height: number }[];
};

const dbConfigured = () => Boolean(process.env.DATABASE_URL);

function fromDb(v: VehicleWithPhotos): PublicVehicle {
  const photo = v.photos[0];
  return {
    id: v.id,
    slug: v.slug,
    href: `/inventory/${v.slug}`,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    body: v.body,
    drivetrain: v.drivetrain,
    fuel: v.fuel,
    transmission: v.transmission,
    price: Math.round(v.priceCents / 100),
    mileage: v.mileage,
    badges: v.badges ?? [],
    image: photo?.url ?? "",
    blur: photo?.blur ?? null,
    description: v.description,
    exteriorColor: v.exteriorColor,
    interiorColor: v.interiorColor,
    vin: v.vin,
    carfaxUrl: v.carfaxUrl,
    photos: v.photos.map((p) => ({ id: p.id, url: p.url, blur: p.blur, width: p.width, height: p.height })),
  };
}

function fromLegacy(v: LegacyVehicle): PublicVehicle {
  return {
    id: v.id,
    slug: v.slug,
    href: v.href,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    body: v.body,
    drivetrain: v.drivetrain,
    fuel: v.fuel,
    transmission: v.transmission,
    price: v.price,
    mileage: v.mileage,
    badges: v.badges ?? [],
    image: v.image,
    blur: null,
  };
}

function applyLegacyFilters(list: LegacyVehicle[], f: PublicFilters): LegacyVehicle[] {
  let out = list;
  if (f.make)       out = out.filter((v) => v.make.toLowerCase() === f.make!.toLowerCase());
  if (f.body)       out = out.filter((v) => v.body.toLowerCase() === f.body!.toLowerCase());
  if (f.fuel)       out = out.filter((v) => v.fuel.toLowerCase() === f.fuel!.toLowerCase());
  if (f.drivetrain) out = out.filter((v) => v.drivetrain.toLowerCase() === f.drivetrain!.toLowerCase());
  if (f.minYear)    out = out.filter((v) => v.year >= f.minYear!);
  if (f.maxPrice)   out = out.filter((v) => v.price <= f.maxPrice!);
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((v) =>
      `${v.year} ${v.make} ${v.model} ${v.trim ?? ""}`.toLowerCase().includes(q)
    );
  }
  switch (f.sort) {
    case "price-asc":   return [...out].sort((a, b) => a.price - b.price);
    case "price-desc":  return [...out].sort((a, b) => b.price - a.price);
    case "mileage-asc": return [...out].sort((a, b) => a.mileage - b.mileage);
    default:            return [...out].sort((a, b) => b.year - a.year || a.mileage - b.mileage);
  }
}

export async function listVehiclesPublic(f: PublicFilters = {}): Promise<PublicVehicle[]> {
  if (dbConfigured()) {
    try {
      const rows = await listPublicVehicles(f);
      if (rows.length > 0) return rows.map(fromDb);
    } catch (err) {
      console.warn("[publicReads] DB query failed, falling back to legacy data:", err instanceof Error ? err.message : err);
    }
  }
  return applyLegacyFilters(legacyVehicles, f).slice(0, f.limit ?? legacyVehicles.length).map(fromLegacy);
}

export async function getFeaturedPublic(limit = 6): Promise<PublicVehicle[]> {
  if (dbConfigured()) {
    try {
      const rows = await getFeaturedVehiclesDb(limit);
      if (rows.length > 0) return rows.map(fromDb);
    } catch (err) {
      console.warn("[publicReads] featured DB query failed:", err instanceof Error ? err.message : err);
    }
  }
  return legacyVehicles.slice(0, limit).map(fromLegacy);
}

export async function getVehicleBySlugPublic(slug: string): Promise<PublicVehicle | null> {
  if (dbConfigured()) {
    try {
      const row = await getPublicVehicleBySlug(slug);
      if (row) return fromDb(row);
    } catch (err) {
      console.warn("[publicReads] slug DB query failed:", err instanceof Error ? err.message : err);
    }
  }
  const v = legacyVehicles.find((x) => x.slug === slug);
  return v ? fromLegacy(v) : null;
}

export async function listAllSlugsPublic(): Promise<string[]> {
  if (dbConfigured()) {
    try {
      const rows = await listPublicVehicles({ limit: 1000 });
      if (rows.length > 0) return rows.map((r) => r.slug);
    } catch (err) {
      console.warn("[publicReads] slug list DB query failed:", err instanceof Error ? err.message : err);
    }
  }
  return legacyVehicles.map((v) => v.slug);
}
