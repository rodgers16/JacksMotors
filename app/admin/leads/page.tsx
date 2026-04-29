import Link from "next/link";
import { listLeads } from "@/lib/db/queries";

const statusOrder: Record<string, number> = { new: 0, contacted: 1, approved: 2, sold: 3, lost: 4 };

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
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <p className="eyebrow">Pipeline</p>
      <h1 className="font-display mt-3 text-balance text-4xl leading-[0.95] sm:text-6xl">
        Credit applications
      </h1>

      {dbError && (
        <div className="mt-10 border border-destructive/40 bg-destructive/10 p-6">
          <p className="cap-label text-destructive">Database error</p>
          <p className="mt-2 text-foreground text-sm">{dbError}</p>
        </div>
      )}

      {!dbError && leads.length === 0 && (
        <p className="mt-10 text-muted-foreground">No applications yet — they'll show here as they come in.</p>
      )}

      {!dbError && statuses.map((status) => (
        <section key={status} className="mt-10">
          <h2 className="cap-label text-muted-foreground/60 mb-4">
            {status} <span className="text-foreground">· {groups[status].length}</span>
          </h2>
          <ul className="divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
            {groups[status].map((l) => (
              <li key={l.id}>
                <Link
                  href={`/admin/leads/${l.id}`}
                  className="grid grid-cols-1 gap-1 py-4 hover:bg-foreground/[0.02] transition-colors sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center sm:gap-6"
                >
                  <p className="font-display text-lg text-foreground">{l.contactName}</p>
                  <p className="text-sm text-muted-foreground truncate">{l.contactEmail}</p>
                  <p className="text-sm text-muted-foreground">{l.vehicleTitle ?? "—"}</p>
                  <p className="cap-label text-muted-foreground/60">
                    {new Date(l.submittedAt).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
