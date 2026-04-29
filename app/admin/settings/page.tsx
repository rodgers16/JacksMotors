import { AdminCard } from "@/components/admin/AdminUI";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 lg:py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Settings</h1>
      <p className="mt-1 text-muted-foreground">Hours, address, contact, and social.</p>

      <AdminCard className="mt-6" title="Coming soon">
        <p className="text-muted-foreground">
          For now, site contact info lives in <code className="font-mono text-sm bg-secondary px-1.5 py-0.5 rounded">lib/site.ts</code>.
          We'll move this into editable settings once you tell me which fields you'd like to change first.
        </p>
      </AdminCard>
    </div>
  );
}
