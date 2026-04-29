import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { vehicles } from "@/lib/db/schema";
import { vehicleSchema } from "@/lib/validation/vehicle";
import { uniqueSlugFor } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = vehicleSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const [existing] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const oldSlug = existing.slug;

  const v = parsed.data;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (v.vin !== undefined)            updates.vin = v.vin || null;
  if (v.year !== undefined)           updates.year = v.year;
  if (v.make !== undefined)           updates.make = v.make;
  if (v.model !== undefined)          updates.model = v.model;
  if (v.trim !== undefined)           updates.trim = v.trim || null;
  if (v.body !== undefined)           updates.body = v.body;
  if (v.transmission !== undefined)   updates.transmission = v.transmission;
  if (v.drivetrain !== undefined)     updates.drivetrain = v.drivetrain;
  if (v.fuel !== undefined)           updates.fuel = v.fuel;
  if (v.exteriorColor !== undefined)  updates.exteriorColor = v.exteriorColor || null;
  if (v.interiorColor !== undefined)  updates.interiorColor = v.interiorColor || null;
  if (v.price !== undefined)          updates.priceCents = v.price * 100;
  if (v.mileage !== undefined)        updates.mileage = v.mileage;
  if (v.description !== undefined)    updates.description = v.description || null;
  if (v.badges !== undefined)         updates.badges = v.badges;
  if (v.carfaxUrl !== undefined)      updates.carfaxUrl = v.carfaxUrl || null;

  // Status transitions: preserve original publishedAt; clear soldAt when leaving sold
  if (v.status !== undefined) {
    updates.status = v.status;
    if ((v.status === "available" || v.status === "pending") && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }
    if (v.status === "sold") {
      updates.soldAt = new Date();
    } else if (existing.status === "sold") {
      updates.soldAt = null;
    }
  }

  // Recompute slug if any identity field changed
  const nextYear  = v.year  ?? existing.year;
  const nextMake  = v.make  ?? existing.make;
  const nextModel = v.model ?? existing.model;
  const nextTrim  = v.trim !== undefined ? (v.trim || null) : existing.trim;
  const identityChanged =
    nextYear !== existing.year ||
    nextMake !== existing.make ||
    nextModel !== existing.model ||
    (nextTrim ?? "") !== (existing.trim ?? "");
  if (identityChanged) {
    updates.slug = await uniqueSlugFor(
      { year: nextYear, make: nextMake, model: nextModel, trim: nextTrim },
      id
    );
  }

  const [row] = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePath("/inventory");
  revalidatePath("/");
  if (oldSlug && oldSlug !== row.slug) revalidatePath(`/inventory/${oldSlug}`);
  revalidatePath(`/inventory/${row.slug}`);

  return NextResponse.json({ vehicle: row });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!row) return NextResponse.json({ ok: true });

  await db.delete(vehicles).where(eq(vehicles.id, id));
  revalidatePath("/inventory");
  revalidatePath("/");
  revalidatePath(`/inventory/${row.slug}`);
  return NextResponse.json({ ok: true });
}
