import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { creditApplications } from "@/lib/db/schema";
import { decryptJSON } from "@/lib/crypto";
import { LeadStatusPicker } from "@/components/admin/LeadStatusPicker";
import { AdminCard } from "@/components/admin/AdminUI";

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
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to leads
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{new Date(lead.submittedAt).toLocaleString()}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {lead.contactName}
          </h1>
        </div>
        <LeadStatusPicker leadId={lead.id} status={lead.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <AdminCard title="Email">
          <a href={`mailto:${lead.contactEmail}`} className="text-blue-600 hover:underline break-all">
            {lead.contactEmail}
          </a>
        </AdminCard>
        <AdminCard title="Phone">
          <a href={`tel:${lead.contactPhone}`} className="text-blue-600 hover:underline">
            {lead.contactPhone}
          </a>
        </AdminCard>
        {lead.vehicleTitle && (
          <AdminCard title="Vehicle of interest" className="sm:col-span-2">
            <p>{lead.vehicleTitle}</p>
          </AdminCard>
        )}
      </div>

      <AdminCard title="Application data" description="Decrypted from encrypted storage." className="mt-4">
        <pre className="max-h-[60vh] overflow-auto rounded-lg bg-secondary p-4 text-sm font-mono text-foreground">
{JSON.stringify(payload, null, 2)}
        </pre>
      </AdminCard>
    </div>
  );
}
