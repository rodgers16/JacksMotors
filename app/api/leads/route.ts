import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const RESEND_FROM = process.env.RESEND_FROM ?? "Jacks Motors <leads@jacksmotors.example.com>";
const RESEND_TO = process.env.RESEND_TO ?? site.email;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const leadSchema = z.object({
  intent: z.enum(["general", "test-drive", "trade-in", "financing", "service"]),
  name: z.string().min(1).max(120).optional().default(""),
  email: z.string().email().max(200).optional().or(z.literal("")).default(""),
  phone: z.string().max(40).optional().default(""),
  vehicle: z.string().max(200).optional().default(""),
  vin: z.string().max(40).optional().default(""),
  mileage: z.string().max(20).optional().default(""),
  message: z.string().max(4000).optional().default(""),
  notes: z.string().max(4000).optional().default(""),
});

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

function renderEmail(intent: string, data: Record<string, unknown>) {
  const rows = Object.entries(data)
    .filter(([, v]) => v !== "" && v !== undefined && v !== null)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#9a9aa2;font:12px/1.4 -apple-system,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em">${escapeHtml(k)}</td><td style="padding:8px 12px;color:#0a0a0b;font:14px/1.5 -apple-system,system-ui,sans-serif">${escapeHtml(String(v))}</td></tr>`,
    )
    .join("");
  return `<div style="background:#f5f5f7;padding:32px;font-family:-apple-system,system-ui,sans-serif"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea"><div style="padding:24px 28px;background:#0a0a0b;color:#f5f5f7"><div style="font:600 18px/1 'Times New Roman',serif;letter-spacing:.02em">Jacks <span style="color:#c9a24c">Motors</span></div><div style="margin-top:6px;font:12px/1 sans-serif;text-transform:uppercase;letter-spacing:.14em;color:#9a9aa2">New ${escapeHtml(intent)} lead</div></div><table style="width:100%;border-collapse:collapse">${rows}</table></div></div>`;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
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

  if (!RESEND_API_KEY) {
    console.log(`[leads:${parsed.data.intent}] (dev — no RESEND_API_KEY) submission:`);
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
        reply_to: parsed.data.email || undefined,
        subject: `New ${parsed.data.intent} lead — ${parsed.data.name || "anonymous"}`,
        html: renderEmail(parsed.data.intent, submission as unknown as Record<string, unknown>),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[leads] Resend failed:", res.status, text);
      return NextResponse.json({ error: "Email service failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[leads] Resend error:", err);
    return NextResponse.json({ error: "Email service unavailable" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
