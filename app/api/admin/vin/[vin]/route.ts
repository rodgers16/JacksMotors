import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { decodeVin } from "@/lib/vin/decode";
import { lookupMpg } from "@/lib/vin/mpg";
import { lookupRecalls } from "@/lib/vin/recalls";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ vin: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { vin } = await params;
  const decoded = await decodeVin(vin);
  if (!decoded.ok) return NextResponse.json(decoded);

  // Free side-trips, in parallel: EPA MPG + NHTSA Recalls.
  // Both are best-effort — if either fails or returns nothing, we still return the VIN decode.
  const { year, make, model } = decoded.fields;
  const haveTriplet = year !== undefined && make && model;

  const [mpg, recalls] = await Promise.all([
    haveTriplet ? lookupMpg(year, make, model).catch(() => null) : Promise.resolve(null),
    haveTriplet ? lookupRecalls(year, make, model).catch(() => []) : Promise.resolve([]),
  ]);

  return NextResponse.json({
    ok: true,
    fields: decoded.fields,
    mpg,
    recalls,
  });
}
