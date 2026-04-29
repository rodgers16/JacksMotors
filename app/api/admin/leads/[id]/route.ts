import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { creditApplications } from "@/lib/db/schema";

export const runtime = "nodejs";

const schema = z.object({
  status: z.enum(["new", "contacted", "approved", "sold", "lost"]).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 422 });

  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
    if (parsed.data.status === "contacted") updates.contactedAt = new Date();
    if (parsed.data.status === "approved" || parsed.data.status === "sold" || parsed.data.status === "lost") {
      updates.decidedAt = new Date();
    }
  }
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  const [row] = await db.update(creditApplications).set(updates).where(eq(creditApplications.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return NextResponse.json({ lead: row });
}
