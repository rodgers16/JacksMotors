import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { vehicles } from "@/lib/db/schema";
import { STATUS_VALUES } from "@/lib/validation/vehicle";

export const runtime = "nodejs";

const schema = z.object({ status: z.enum(STATUS_VALUES) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 422 });

  const [existing] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status = parsed.data.status;
  const updates: Record<string, unknown> = { status, updatedAt: new Date() };
  if ((status === "available" || status === "pending") && !existing.publishedAt) {
    updates.publishedAt = new Date();
  }
  if (status === "sold") {
    updates.soldAt = new Date();
  } else if (existing.status === "sold") {
    updates.soldAt = null;
  }

  const [row] = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();

  revalidatePath("/inventory");
  revalidatePath("/");
  if (row?.slug) revalidatePath(`/inventory/${row.slug}`);

  return NextResponse.json({ vehicle: row });
}
