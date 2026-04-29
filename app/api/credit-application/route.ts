import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { creditApplicationSchema } from "@/lib/validation/creditApp";
import { site } from "@/lib/site";
import { db } from "@/lib/db/client";
import { creditApplications, vehicles } from "@/lib/db/schema";
import { encryptJSON } from "@/lib/crypto";

export const runtime = "nodejs";

const RESEND_FROM = process.env.RESEND_FROM ?? "Jacks Motors <leads@jacksmotors.example.com>";
const RESEND_TO = process.env.RESEND_TO ?? site.email;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderEmail(data: Record<string, unknown>) {
  const rows = Object.entries(data)
    .filter(([, v]) => v !== "" && v !== undefined && v !== null)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#9a9aa2;font:12px/1.4 -apple-system,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em">${escapeHtml(k)}</td><td style="padding:8px 12px;color:#0a0a0b;font:14px/1.5 -apple-system,system-ui,sans-serif">${escapeHtml(String(v))}</td></tr>`
    )
    .join("");
  return `<div style="background:#f5f5f7;padding:32px;font-family:-apple-system,system-ui,sans-serif"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea"><div style="padding:24px 28px;background:#0a0a0b;color:#f5f5f7"><div style="font:600 18px/1 'Times New Roman',serif;letter-spacing:.02em">Jacks <span style="color:#c9a24c">Motors</span></div><div style="margin-top:6px;font:12px/1 sans-serif;text-transform:uppercase;letter-spacing:.14em;color:#9a9aa2">New pre-approval</div></div><table style="width:100%;border-collapse:collapse">${rows}</table><div style="padding:16px 28px;background:#fafafa;color:#9a9aa2;font:12px/1.5 sans-serif;border-top:1px solid #e5e5ea">Submitted from jacksmotors.example.com</div></div></div>`;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = creditApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const submission = {
    ...parsed.data,
    submittedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? "",
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "",
  };

  // Persist to DB if configured (errors don't block the response — email is the backup)
  if (process.env.DATABASE_URL && process.env.ENCRYPTION_KEY) {
    try {
      // Resolve vehicleId from vehicleTitle if vehicleId not provided as a UUID
      let vehicleId: string | null = parsed.data.vehicleId && /^[0-9a-f-]{36}$/i.test(parsed.data.vehicleId)
        ? parsed.data.vehicleId
        : null;
      if (!vehicleId && parsed.data.vehicleId) {
        // legacy string IDs from hardcoded data — try slug match
        const [row] = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.slug, parsed.data.vehicleId)).limit(1);
        if (row) vehicleId = row.id;
      }
      await db.insert(creditApplications).values({
        vehicleId,
        vehicleTitle: parsed.data.vehicleTitle ?? null,
        contactName: `${parsed.data.firstName} ${parsed.data.lastName}`,
        contactEmail: parsed.data.email,
        contactPhone: parsed.data.phone,
        payloadEncrypted: encryptJSON(submission),
        ip: submission.ip,
        userAgent: submission.userAgent,
      });
    } catch (err) {
      console.error("[credit-application] DB persist failed (continuing with email):", err);
    }
  }

  if (!RESEND_API_KEY) {
    console.log("[credit-application] (dev — no RESEND_API_KEY) submission received:");
    console.log(JSON.stringify(submission, null, 2));
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [RESEND_TO],
        reply_to: submission.email,
        subject: `New pre-approval — ${submission.firstName} ${submission.lastName}`,
        html: renderEmail(submission as unknown as Record<string, unknown>),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[credit-application] Resend failed:", res.status, text);
      return NextResponse.json({ error: "Email service failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[credit-application] Resend error:", err);
    return NextResponse.json({ error: "Email service unavailable" }, { status: 502 });
  }

  // TODO Phase 2: persist to Sanity / Postgres for the leads dashboard.

  return NextResponse.json({ ok: true });
}
