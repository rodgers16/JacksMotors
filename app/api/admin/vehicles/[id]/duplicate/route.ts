import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { vehicles } from "@/lib/db/schema";
import { uniqueSlugFor } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [src] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!src) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug = await uniqueSlugFor({
    year: src.year,
    make: src.make,
    model: src.model,
    trim: src.trim,
  });

  const [row] = await db
    .insert(vehicles)
    .values({
      slug,
      status: "draft",
      vin: null,
      year: src.year,
      make: src.make,
      model: src.model,
      trim: src.trim,
      body: src.body,
      transmission: src.transmission,
      drivetrain: src.drivetrain,
      fuel: src.fuel,
      exteriorColor: src.exteriorColor,
      interiorColor: src.interiorColor,
      priceCents: src.priceCents,
      mileage: src.mileage,
      description: src.description,
      badges: src.badges,
      carfaxUrl: null,
      publishedAt: null,
    })
    .returning();

  revalidatePath("/admin/inventory");
  return NextResponse.json({ vehicle: row });
}
