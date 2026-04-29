import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { vehiclePhotos } from "@/lib/db/schema";

export const runtime = "nodejs";

const schema = z.object({
  vehicleId: z.string().uuid(),
  photoIds: z.array(z.string().uuid()).min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { photoIds } = parsed.data;
  await Promise.all(
    photoIds.map((id, position) =>
      db.update(vehiclePhotos).set({ position }).where(eq(vehiclePhotos.id, id))
    )
  );
  return NextResponse.json({ ok: true });
}
