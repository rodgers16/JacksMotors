import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { creditApplications } from "@/lib/db/schema";
import { decryptJSON } from "@/lib/crypto";
import { LeadStatusPicker } from "@/components/admin/LeadStatusPicker";

type Params = Promise<{ id: string }>;

export default async function LeadDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  let lead: typeof creditApplications.$inferSelect | undefined;
  try {
    [lead] = await db.select().from(creditApplications).where(eq(creditApplications.id, id)).limit(1);
  } catch {
    notFound();
  }
  if (!lead) notFound();

  let payload: Record<string, unknown> = {};
  try {
    payload = decryptJSON<Record<string, unknown>>(lead.payloadEncrypted);
  } catch (err) {
    payload = { _decrypt_error: err instanceof Error ? err.message : "Decryption failed" };
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <Link
        href="/admin/leads"
        className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={13} /> All leads
      </Link>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{new Date(lead.submittedAt).toLocaleString()}</p>
          <h1 className="font-display mt-3 text-balance text-3xl leading-[0.95] sm:text-5xl">
            {lead.contactName}
          </h1>
        </div>
        <LeadStatusPicker leadId={lead.id} status={lead.status} />
      </div>

      <dl className="mt-10 grid gap-px border-y border-[hsl(var(--border))] bg-[hsl(var(--border))] sm:grid-cols-2">
        <Row label="Email"   value={lead.contactEmail} />
        <Row label="Phone"   value={lead.contactPhone} />
        {lead.vehicleTitle && <Row label="Vehicle" value={lead.vehicleTitle} />}
        {lead.ip && <Row label="IP" value={lead.ip} />}
      </dl>

      <h2 className="font-display mt-12 text-2xl">Application</h2>
      <pre className="mt-4 max-h-[60vh] overflow-auto border border-[hsl(var(--border))] bg-card p-5 text-sm font-mono text-foreground">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-5">
      <dt className="cap-label text-muted-foreground/60">{label}</dt>
      <dd className="mt-2 text-foreground">{value}</dd>
    </div>
  );
}
