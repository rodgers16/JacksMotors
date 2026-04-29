import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { vehicles } from "@/lib/db/schema";
import { vehicleSchema } from "@/lib/validation/vehicle";
import { makeSlug } from "@/lib/db/queries";

export const runtime = "nodejs";

const shortId = () => Math.random().toString(36).slice(2, 6);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = vehicleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const v = parsed.data;

  // Build a unique slug — retry with a random suffix on collision
  let slug = makeSlug({ year: v.year, make: v.make, model: v.model, trim: v.trim || null });
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.slug, slug)).limit(1);
    if (existing.length === 0) break;
    slug = makeSlug({ year: v.year, make: v.make, model: v.model, trim: v.trim || null, suffix: shortId() });
  }

  const isPublic = v.status === "available" || v.status === "pending";
  const [row] = await db
    .insert(vehicles)
    .values({
      slug,
      status: v.status,
      vin: v.vin || null,
      year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim || null,
      body: v.body,
      transmission: v.transmission,
      drivetrain: v.drivetrain,
      fuel: v.fuel,
      exteriorColor: v.exteriorColor || null,
      interiorColor: v.interiorColor || null,
      priceCents: v.price * 100,
      mileageKm: v.mileage,
      description: v.description || null,
      badges: v.badges,
      carfaxUrl: v.carfaxUrl || null,
      publishedAt: isPublic ? new Date() : null,
    })
    .returning();

  revalidatePath("/inventory");
  revalidatePath("/");
  revalidatePath(`/inventory/${row.slug}`);

  return NextResponse.json({ vehicle: row });
}
