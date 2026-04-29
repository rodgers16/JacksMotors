import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { listAllVehicles, listLeads } from "@/lib/db/queries";
import { AdminCard, AdminLinkButton, AdminBanner } from "@/components/admin/AdminUI";

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

  const name = session?.user?.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as {session?.user?.email ?? ""}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome back, {name}
          </h1>
        </div>
        <AdminLinkButton href="/admin/inventory/new" size="lg">
          <Plus size={16} aria-hidden /> New car
        </AdminLinkButton>
      </div>

      {!dbReady ? (
        <AdminBanner tone="warn" className="mt-8">
          <p className="font-semibold">Database not configured</p>
          <p className="mt-1">
            Set <code className="font-mono text-sm bg-amber-100 px-1 rounded">DATABASE_URL</code> in{" "}
            <code className="font-mono text-sm bg-amber-100 px-1 rounded">.env.local</code>, then run:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-card border border-amber-300 p-3 text-xs">{`npm run db:push      # creates tables
npm run db:seed      # imports the 24 sample vehicles`}</pre>
        </AdminBanner>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <Stat label="Total" value={stats.total} sub="all vehicles" />
          <Stat label="Available" value={stats.available} sub="visible on site" tone="success" />
          <Stat label="Drafts" value={stats.draft} sub="not published" />
          <Stat label="New leads" value={stats.leadsNew} sub="awaiting reply" tone={stats.leadsNew > 0 ? "info" : undefined} />
        </div>
      )}

      {dbReady && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <AdminCard title="Manage inventory" description="Add new cars, edit prices, mark sold.">
            <AdminLinkButton href="/admin/inventory" variant="secondary">View inventory →</AdminLinkButton>
          </AdminCard>
          <AdminCard title="Customer leads" description="Credit applications and pre-approval requests.">
            <AdminLinkButton href="/admin/leads" variant="secondary">View leads →</AdminLinkButton>
          </AdminCard>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "info" | "success";
}) {
  const accent = tone === "info" ? "text-blue-600" : tone === "success" ? "text-emerald-600" : "text-foreground";
  return (
    <div className="rounded-2xl bg-card border border-[hsl(var(--border))] p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-4xl font-semibold tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
