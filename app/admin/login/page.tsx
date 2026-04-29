import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { AdminButton, AdminCard, AdminField, AdminInput, AdminBanner } from "@/components/admin/AdminUI";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ error?: string; from?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = !!params.error;
  const from = params.from || "/admin";

  async function loginWithPassword(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) return;
    await signIn("credentials", { email, password, redirectTo: from });
  }

  return (
    <div className="admin-theme min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-foreground font-semibold tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background text-sm">JM</span>
            <span>Jacks Motors</span>
          </Link>
        </div>

        <AdminCard className="mt-8">
          <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin access only.</p>

          {error && (
            <AdminBanner tone="danger" className="mt-5">
              Invalid email or password.
            </AdminBanner>
          )}

          <form action={loginWithPassword} className="mt-6 space-y-4">
            <AdminField label="Email" required>
              <AdminInput
                type="email"
                name="email"
                required
                autoFocus
                autoComplete="username"
                inputMode="email"
                placeholder="you@example.com"
              />
            </AdminField>
            <AdminField label="Password" required>
              <AdminInput
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </AdminField>
            <AdminButton type="submit" size="lg" className="w-full">
              Sign in
            </AdminButton>
          </form>
        </AdminCard>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </p>
      </main>
    </div>
  );
}
