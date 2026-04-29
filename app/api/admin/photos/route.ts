import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { vehiclePhotos } from "@/lib/db/schema";
import { processImage } from "@/lib/images/compress";

export const runtime = "nodejs";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  const file = formData.get("file");
  if (!vehicleId || !(file instanceof File)) {
    return NextResponse.json({ error: "vehicleId and file required" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 25MB per photo" }, { status: 413 });
  }

  let processed;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    processed = await processImage(buf);
  } catch (err) {
    console.error("[photos] processing failed:", err);
    return NextResponse.json({ error: "Could not process image" }, { status: 422 });
  }

  let blobUrl: string;
  try {
    const photoId = crypto.randomUUID();
    const { url } = await put(`cars/${vehicleId}/${photoId}-master.jpg`, processed.buffer, {
      access: "public",
      contentType: "image/jpeg",
      cacheControlMaxAge: 31_536_000, // 1 year — Next.js image optimizer keys off the URL
      addRandomSuffix: false,
    });
    blobUrl = url;
  } catch (err) {
    console.error("[photos] blob upload failed:", err);
    return NextResponse.json({ error: "Storage upload failed" }, { status: 502 });
  }

  // Take next position
  const existing = await db.select({ id: vehiclePhotos.id }).from(vehiclePhotos).where(eq(vehiclePhotos.vehicleId, vehicleId));
  const position = existing.length;

  const [row] = await db
    .insert(vehiclePhotos)
    .values({
      vehicleId,
      url: blobUrl,
      blur: processed.blur,
      width: processed.width,
      height: processed.height,
      position,
    })
    .returning();

  return NextResponse.json({ photo: row });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [row] = await db.select().from(vehiclePhotos).where(eq(vehiclePhotos.id, id)).limit(1);
  if (!row) return NextResponse.json({ ok: true });

  // Best-effort blob cleanup
  try {
    await del(row.url);
  } catch (err) {
    console.warn("[photos] blob delete failed (continuing):", err);
  }
  await db.delete(vehiclePhotos).where(eq(vehiclePhotos.id, id));
  return NextResponse.json({ ok: true });
}
