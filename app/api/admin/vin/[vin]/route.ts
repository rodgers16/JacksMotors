import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { decodeVin } from "@/lib/vin/decode";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ vin: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { vin } = await params;
  const result = await decodeVin(vin);
  return NextResponse.json(result);
}
