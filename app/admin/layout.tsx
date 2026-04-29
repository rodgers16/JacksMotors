import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Jacks Motors Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground flex flex-col">
      <AdminNav />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
