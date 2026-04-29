import Link from "next/link";
import { listLeads } from "@/lib/db/queries";
import { AdminBanner, AdminPill } from "@/components/admin/AdminUI";

const statusOrder: Record<string, number> = { new: 0, contacted: 1, approved: 2, sold: 3, lost: 4 };
const statusTone: Record<string, "info" | "warn" | "success" | "neutral" | "danger"> = {
  new: "info",
  contacted: "warn",
  approved: "success",
  sold: "success",
  lost: "neutral",
};

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  let dbError: string | null = null;
  try {
    leads = await listLeads();
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database not available";
  }

  const groups = leads.reduce<Record<string, typeof leads>>((acc, l) => {
    (acc[l.status] ||= []).push(l);
    return acc;
  }, {});
  const statuses = Object.keys(groups).sort((a, b) => (statusOrder[a] ?? 99) - (statusOrder[b] ?? 99));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Credit applications</h1>
      <p className="mt-1 text-muted-foreground">Move leads through the pipeline as you work them.</p>

      {dbError && (
        <AdminBanner tone="warn" className="mt-6">
          <p className="font-semibold">Database not configured</p>
          <p className="mt-1 text-sm">{dbError}</p>
        </AdminBanner>
      )}

      {!dbError && leads.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-card p-12 text-center">
          <p className="text-xl font-semibold text-foreground">No applications yet</p>
          <p className="mt-2 text-muted-foreground">When customers submit pre-approval requests, they'll appear here.</p>
        </div>
      )}

      {!dbError && statuses.map((status) => (
        <section key={status} className="mt-8">
          <div className="flex items-baseline gap-2 mb-3">
            <h2 className="text-base font-semibold text-foreground capitalize">{status}</h2>
            <span className="text-sm text-muted-foreground">· {groups[status].length}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-card">
            <ul className="divide-y divide-[hsl(var(--border))]">
              {groups[status].map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="grid grid-cols-1 gap-1.5 px-4 py-4 hover:bg-secondary transition-colors sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center sm:gap-4"
                  >
                    <p className="font-semibold text-foreground">{l.contactName}</p>
                    <p className="text-sm text-muted-foreground truncate">{l.contactEmail}</p>
                    <p className="text-sm text-muted-foreground">{l.vehicleTitle ?? "—"}</p>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(l.submittedAt).toLocaleDateString()}
                      </p>
                      <AdminPill tone={statusTone[l.status]}>{l.status}</AdminPill>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
