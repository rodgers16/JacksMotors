/**
 * Seed script — ports the hardcoded vehicles from lib/inventory.ts into the DB.
 * Run with: npm run db:seed
 *
 * Idempotent: re-running deletes existing seed rows (slug = original) and re-inserts.
 * Photos are seeded with the existing Unsplash URLs and dummy LQIP blur strings.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, inArray } from "drizzle-orm";
import {
  vehicles,
  vehiclePhotos,
  type NewVehicle,
} from "../lib/db/schema";
import { vehicles as legacyVehicles } from "../lib/inventory";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Tiny constant LQIP — small grey gradient. Real photos get real blurs from sharp.
const placeholderBlur =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjYiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4=";

async function main() {
  console.log("seeding…");

  // Delete existing seed rows by slug to keep this idempotent
  const slugs = legacyVehicles.map((v) => v.slug);
  const existing = await db.select({ id: vehicles.id }).from(vehicles).where(inArray(vehicles.slug, slugs));
  if (existing.length) {
    await db.delete(vehiclePhotos).where(
      inArray(
        vehiclePhotos.vehicleId,
        existing.map((e) => e.id)
      )
    );
    await db.delete(vehicles).where(inArray(vehicles.id, existing.map((e) => e.id)));
    console.log(`removed ${existing.length} existing rows`);
  }

  // Insert vehicles
  const rows: NewVehicle[] = legacyVehicles.map((v) => ({
    slug: v.slug,
    status: "available",
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim ?? null,
    body: v.body,
    transmission: v.transmission,
    drivetrain: v.drivetrain,
    fuel: v.fuel,
    priceCents: v.price * 100,
    mileageKm: v.mileage,
    badges: v.badges ?? [],
    publishedAt: new Date(),
  }));
  const inserted = await db.insert(vehicles).values(rows).returning({ id: vehicles.id, slug: vehicles.slug });
  console.log(`inserted ${inserted.length} vehicles`);

  // Insert photos — one per vehicle, using the existing Unsplash hot-link
  const photoRows = inserted.map((v) => {
    const legacy = legacyVehicles.find((l) => l.slug === v.slug)!;
    return {
      vehicleId: v.id,
      url: legacy.image,
      blur: placeholderBlur,
      width: 1600,
      height: 1067,
      position: 0,
      alt: `${legacy.year} ${legacy.make} ${legacy.model}`,
    };
  });
  await db.insert(vehiclePhotos).values(photoRows);
  console.log(`inserted ${photoRows.length} photos`);

  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
