import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db } from "./client";
import {
  vehicles,
  vehiclePhotos,
  creditApplications,
  PUBLIC_STATUSES,
  type Vehicle,
  type VehiclePhoto,
  type VehicleWithPhotos,
} from "./schema";

// ---------- Public (visitor-facing) reads ----------

export type SortKey = "newest" | "price-asc" | "price-desc" | "mileage-asc";

export type PublicFilters = {
  make?: string;
  body?: string;
  fuel?: string;
  drivetrain?: string;
  minYear?: number;
  /** Dollars (we'll convert to cents) */
  maxPrice?: number;
  q?: string;
  sort?: SortKey;
  limit?: number;
};

/** Returns publicly visible vehicles with their photos, ordered by sort key. */
export async function listPublicVehicles(f: PublicFilters = {}): Promise<VehicleWithPhotos[]> {
  const conditions = [
    inArray(vehicles.status, [...PUBLIC_STATUSES]),
  ];
  if (f.make)       conditions.push(sql`lower(${vehicles.make}) = ${f.make.toLowerCase()}`);
  if (f.body)       conditions.push(sql`lower(${vehicles.body}::text) = ${f.body.toLowerCase()}`);
  if (f.fuel)       conditions.push(sql`lower(${vehicles.fuel}::text) = ${f.fuel.toLowerCase()}`);
  if (f.drivetrain) conditions.push(sql`lower(${vehicles.drivetrain}::text) = ${f.drivetrain.toLowerCase()}`);
  if (f.minYear)    conditions.push(gte(vehicles.year, f.minYear));
  if (f.maxPrice)   conditions.push(lte(vehicles.priceCents, f.maxPrice * 100));
  if (f.q) {
    const q = `%${f.q.toLowerCase()}%`;
    conditions.push(sql`lower(${vehicles.make} || ' ' || ${vehicles.model} || ' ' || coalesce(${vehicles.trim}, '')) like ${q}`);
  }

  const orderBy =
    f.sort === "price-asc"   ? [asc(vehicles.priceCents)]                       :
    f.sort === "price-desc"  ? [desc(vehicles.priceCents)]                      :
    f.sort === "mileage-asc" ? [asc(vehicles.mileage)]                        :
    /* newest */               [desc(vehicles.year), asc(vehicles.mileage)];

  const rows = await db
    .select()
    .from(vehicles)
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(f.limit ?? 200);

  if (rows.length === 0) return [];

  const photos = await db
    .select()
    .from(vehiclePhotos)
    .where(inArray(vehiclePhotos.vehicleId, rows.map((r) => r.id)))
    .orderBy(asc(vehiclePhotos.position));

  const photosByVehicle = new Map<string, VehiclePhoto[]>();
  for (const p of photos) {
    const arr = photosByVehicle.get(p.vehicleId) ?? [];
    arr.push(p);
    photosByVehicle.set(p.vehicleId, arr);
  }

  return rows.map((v) => ({ ...v, photos: photosByVehicle.get(v.id) ?? [] }));
}

export async function getPublicVehicleBySlug(slug: string): Promise<VehicleWithPhotos | null> {
  const [row] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.slug, slug), inArray(vehicles.status, [...PUBLIC_STATUSES])))
    .limit(1);
  if (!row) return null;
  const photos = await db
    .select()
    .from(vehiclePhotos)
    .where(eq(vehiclePhotos.vehicleId, row.id))
    .orderBy(asc(vehiclePhotos.position));
  return { ...row, photos };
}

export async function getFeaturedVehicles(limit = 6): Promise<VehicleWithPhotos[]> {
  return listPublicVehicles({ sort: "newest", limit });
}

export async function listAvailableSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: vehicles.slug })
    .from(vehicles)
    .where(inArray(vehicles.status, [...PUBLIC_STATUSES]));
  return rows.map((r) => r.slug);
}

// ---------- Admin reads ----------

export type AdminListFilters = {
  status?: "available" | "pending" | "sold" | "hidden" | "draft";
  q?: string;
};

export async function listAllVehicles(f: AdminListFilters = {}): Promise<VehicleWithPhotos[]> {
  const conditions = [];
  if (f.status) conditions.push(eq(vehicles.status, f.status));
  if (f.q && f.q.trim()) {
    const needle = `%${f.q.trim()}%`;
    const orExpr = or(
      ilike(vehicles.make, needle),
      ilike(vehicles.model, needle),
      ilike(vehicles.trim, needle),
      ilike(vehicles.vin, needle),
      sql`${vehicles.year}::text ilike ${needle}`,
    );
    if (orExpr) conditions.push(orExpr);
  }

  const baseQuery = db.select().from(vehicles).$dynamic();
  const filteredQuery = conditions.length ? baseQuery.where(and(...conditions)) : baseQuery;
  const rows = await filteredQuery.orderBy(desc(vehicles.updatedAt));

  if (rows.length === 0) return [];
  const photos = await db
    .select()
    .from(vehiclePhotos)
    .where(inArray(vehiclePhotos.vehicleId, rows.map((r) => r.id)))
    .orderBy(asc(vehiclePhotos.position));
  const map = new Map<string, VehiclePhoto[]>();
  for (const p of photos) {
    const arr = map.get(p.vehicleId) ?? [];
    arr.push(p);
    map.set(p.vehicleId, arr);
  }
  return rows.map((v) => ({ ...v, photos: map.get(v.id) ?? [] }));
}

export type StatusCounts = Record<"available" | "pending" | "sold" | "hidden" | "draft" | "all", number>;

export async function getVehicleStatusCounts(): Promise<StatusCounts> {
  const rows = await db
    .select({ status: vehicles.status, count: sql<number>`count(*)::int` })
    .from(vehicles)
    .groupBy(vehicles.status);
  const counts: StatusCounts = { available: 0, pending: 0, sold: 0, hidden: 0, draft: 0, all: 0 };
  for (const r of rows) {
    counts[r.status] = Number(r.count);
    counts.all += Number(r.count);
  }
  return counts;
}

export async function getVehicleById(id: string): Promise<VehicleWithPhotos | null> {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!row) return null;
  const photos = await db
    .select()
    .from(vehiclePhotos)
    .where(eq(vehiclePhotos.vehicleId, id))
    .orderBy(asc(vehiclePhotos.position));
  return { ...row, photos };
}

// ---------- Slugify ----------

export function makeSlug(parts: { year: number; make: string; model: string; trim?: string | null; suffix?: string }) {
  const base = [parts.year, parts.make, parts.model, parts.trim, parts.suffix]
    .filter(Boolean)
    .join("-")
    .toLowerCase();
  return base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const shortSuffix = () => Math.random().toString(36).slice(2, 6);

/**
 * Generate a slug that's unique in the vehicles table. If `excludeId` is
 * provided, that row's existing slug is allowed (used on edit so a vehicle
 * doesn't collide with itself).
 */
export async function uniqueSlugFor(
  parts: { year: number; make: string; model: string; trim?: string | null },
  excludeId?: string
): Promise<string> {
  let slug = makeSlug(parts);
  for (let attempt = 0; attempt < 5; attempt++) {
    const where = excludeId
      ? and(eq(vehicles.slug, slug), ne(vehicles.id, excludeId))
      : eq(vehicles.slug, slug);
    const existing = await db.select({ id: vehicles.id }).from(vehicles).where(where).limit(1);
    if (existing.length === 0) return slug;
    slug = makeSlug({ ...parts, suffix: shortSuffix() });
  }
  return slug;
}

// ---------- Lead reads ----------

export async function listLeads() {
  return db.select().from(creditApplications).orderBy(desc(creditApplications.submittedAt));
}

export type VehicleLite = Pick<Vehicle, "id" | "slug" | "year" | "make" | "model" | "trim" | "priceCents" | "mileage" | "body" | "drivetrain" | "fuel">;
