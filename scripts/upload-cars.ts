/**
 * One-shot: create the two listings sitting in uploads/cars/ and upload their photos.
 * Run: npx tsx scripts/upload-cars.ts
 */

import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Load .env.local manually (Node 16 has no --env-file flag)
try {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
} catch (e) {
  console.warn("Could not read .env.local:", e);
}
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { vehicles, vehiclePhotos, type NewVehicle } from "../lib/db/schema";
import { makeSlug } from "../lib/db/queries";
import { processImage } from "../lib/images/compress";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

type Listing = {
  folder: string;
  data: NewVehicle;
};

const listings: Listing[] = [
  {
    folder: "2019 wrx sti",
    data: {
      slug: "", // filled in below
      status: "available",
      year: 2019,
      make: "Subaru",
      model: "WRX STI",
      trim: "Limited",
      body: "Sedan",
      transmission: "Manual",
      drivetrain: "AWD",
      fuel: "Gas",
      priceCents: 27_900 * 100,
      mileage: 48_000,
      description:
        "Pro-tuned on Cobb (93 octane). Clean title.\n\n" +
        "Mods: ID1300 injectors, IAG air/oil separator, Perrin turbo inlet, " +
        "Tein coilovers, ACT clutch, Cobb downpipe, ETS intake, Rally Armor mudflaps, " +
        "Anovia Elder wheels.",
      badges: ["Clean Title", "6-Speed Manual", "Modified"],
      publishedAt: new Date(),
    },
  },
  {
    folder: "2003 350z",
    data: {
      slug: "",
      status: "available",
      year: 2003,
      make: "Nissan",
      model: "350Z",
      trim: null,
      body: "Coupe",
      transmission: "Manual",
      drivetrain: "RWD",
      fuel: "Gas",
      exteriorColor: "Orange",
      priceCents: 12_900 * 100,
      mileage: 81_000,
      description:
        "Lemans Sunset Orange. Motordyne exhaust, Axis custom wheels, billet grille.",
      badges: ["6-Speed Manual"],
      publishedAt: new Date(),
    },
  },
];

const shortId = () => Math.random().toString(36).slice(2, 6);

async function uniqueSlug(base: { year: number; make: string; model: string; trim?: string | null }) {
  let slug = makeSlug(base);
  for (let i = 0; i < 5; i++) {
    const existing = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.slug, slug)).limit(1);
    if (existing.length === 0) return slug;
    slug = makeSlug({ ...base, suffix: shortId() });
  }
  return slug;
}

async function uploadPhotosFromFolder(vehicleId: string, folderAbs: string) {
  const entries = (await readdir(folderAbs)).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f)).sort();
  let position = 0;
  for (const name of entries) {
    const buf = await readFile(join(folderAbs, name));
    const processed = await processImage(buf);
    const photoId = crypto.randomUUID();
    const { url } = await put(`cars/${vehicleId}/${photoId}-master.jpg`, processed.buffer, {
      access: "public",
      contentType: "image/jpeg",
      cacheControlMaxAge: 31_536_000,
      addRandomSuffix: false,
    });
    await db.insert(vehiclePhotos).values({
      vehicleId,
      url,
      blur: processed.blur,
      width: processed.width,
      height: processed.height,
      position,
    });
    console.log(`  uploaded ${name} → position ${position}`);
    position++;
  }
  return position;
}

async function main() {
  for (const l of listings) {
    const slug = await uniqueSlug({
      year: l.data.year,
      make: l.data.make,
      model: l.data.model,
      trim: l.data.trim ?? null,
    });
    const [row] = await db.insert(vehicles).values({ ...l.data, slug }).returning();
    console.log(`created ${row.year} ${row.make} ${row.model} (${row.id})`);

    const folderAbs = join(process.cwd(), "uploads", "cars", l.folder);
    const count = await uploadPhotosFromFolder(row.id, folderAbs);
    console.log(`  ${count} photos attached`);
  }
  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
