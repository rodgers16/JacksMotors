import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { listAllVehicles, listLeads } from "@/lib/db/queries";

export default async function AdminDashboard() {
  const session = await auth();

  let stats = { total: 0, available: 0, draft: 0, sold: 0, leadsNew: 0 };
  let dbReady = true;
  try {
    const [vehicles, leads] = await Promise.all([listAllVehicles(), listLeads()]);
    stats = {
      total: vehicles.length,
      available: vehicles.filter((v) => v.status === "available").length,
      draft: vehicles.filter((v) => v.status === "draft").length,
      sold: vehicles.filter((v) => v.status === "sold").length,
      leadsNew: leads.filter((l) => l.status === "new").length,
    };
  } catch {
    dbReady = false;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="font-display mt-3 text-balance text-4xl leading-[0.95] sm:text-6xl">
            {session?.user?.email?.split("@")[0] ?? "Admin"}
          </h1>
        </div>
        <Link
          href="/admin/inventory/new"
          className="cap-label inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-background hover:bg-foreground/90 transition-colors self-start"
        >
          <Plus size={14} aria-hidden /> New Car
        </Link>
      </div>

      {!dbReady && (
        <div className="mt-10 border border-destructive/40 bg-destructive/10 p-6">
          <p className="cap-label text-destructive">Database not configured</p>
          <p className="mt-2 text-foreground">
            Set <code className="font-mono text-sm">DATABASE_URL</code> in <code className="font-mono text-sm">.env.local</code>, then run:
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-foreground/5 p-3 text-xs text-foreground/80">{`npm run db:push      # creates tables
npm run db:seed      # imports the 24 sample vehicles`}</pre>
        </div>
      )}

      {dbReady && (
        <div className="mt-12 grid grid-cols-2 gap-px bg-[hsl(var(--border))] lg:grid-cols-4">
          <Stat label="Total inventory" value={stats.total} />
          <Stat label="Available" value={stats.available} />
          <Stat label="Drafts" value={stats.draft} />
          <Stat label="New leads" value={stats.leadsNew} highlight={stats.leadsNew > 0} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="bg-background p-6 sm:p-8">
      <p className="cap-label text-muted-foreground/60">{label}</p>
      <p className={`font-display mt-3 text-4xl sm:text-5xl ${highlight ? "text-foreground" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
