import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { vehicles } from "@/lib/db/schema";
import { vehicleSchema } from "@/lib/validation/vehicle";
import { uniqueSlugFor } from "@/lib/db/queries";

export const runtime = "nodejs";

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

  // New listings always start as drafts. Dealer reviews then explicitly publishes.
  const status = "draft" as const;

  const slug = await uniqueSlugFor({ year: v.year, make: v.make, model: v.model, trim: v.trim || null });

  const [row] = await db
    .insert(vehicles)
    .values({
      slug,
      status,
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
      mileage: v.mileage,
      description: v.description || null,
      badges: v.badges,
      carfaxUrl: v.carfaxUrl || null,
      publishedAt: null,
    })
    .returning();

  revalidatePath("/inventory");
  revalidatePath("/");
  revalidatePath(`/inventory/${row.slug}`);

  return NextResponse.json({ vehicle: row });
}
