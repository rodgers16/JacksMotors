import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import { Input } from "@/components/ui/Field";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ "check-email"?: string; error?: string; from?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const checkEmail = !!params["check-email"];
  const error = !!params.error;

  async function sendLink(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    if (!email) return;
    await signIn("magic-link", { email, redirectTo: "/admin" });
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center"><Logo /></div>

        <div className="mt-12 border border-[hsl(var(--border))] p-8 sm:p-10">
          <p className="eyebrow">Admin</p>
          <h1 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">
            {checkEmail ? "Check your inbox." : "Sign in"}
          </h1>

          {checkEmail ? (
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We sent a sign-in link to your email. Click it within 15 minutes to
              continue. You can close this tab.
            </p>
          ) : (
            <>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Enter your email and we'll send you a one-time sign-in link.
              </p>

              {error && (
                <p className="mt-4 border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  Something went wrong. Try again, or check that your email is on the admin allowlist.
                </p>
              )}

              <form action={sendLink} className="mt-8 space-y-5">
                <label className="block">
                  <span className="cap-label text-muted-foreground/60 mb-2 block">Email</span>
                  <Input
                    type="email"
                    name="email"
                    required
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                  />
                </label>
                <button
                  type="submit"
                  className="cap-label w-full rounded-full bg-foreground text-background py-4 hover:bg-foreground/90 transition-colors"
                >
                  Send sign-in link
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-8 text-center">
          <Link href="/" className="bug-cta-underline text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
