import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Resend } from "resend";
import { db } from "./db/client";
import { users, accounts, sessions, verificationTokens } from "./db/schema";
import { site } from "./site";
import { verifyPassword } from "./passwords";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const dbConfigured = Boolean(process.env.DATABASE_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Adapter only when DB is configured. With Credentials + JWT, login still works
  // without a DB; magic-link requires it.
  adapter: dbConfigured
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  // JWT strategy is required when using the Credentials provider.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    verifyRequest: "/admin/login?check-email=1",
    error: "/admin/login?error=1",
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user }) {
      if (ADMIN_EMAILS.length === 0) return true; // dev: permissive
      const email = user.email?.toLowerCase();
      return Boolean(email && ADMIN_EMAILS.includes(email));
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token?.email && session.user) session.user.email = token.email as string;
      return session;
    },
  },
});

function buildProviders(): NextAuthConfig["providers"] {
  const providers: NextAuthConfig["providers"] = [
    Credentials({
      name: "Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) return null;
        const expectedHash = process.env.ADMIN_PASSWORD_HASH;
        if (!expectedHash) return null;
        if (!verifyPassword(password, expectedHash)) return null;
        return { id: email, email, name: email.split("@")[0] };
      },
    }),
  ];

  // Magic-link only when both DB adapter and Resend are configured.
  if (dbConfigured && resend) {
    providers.push({
      id: "magic-link",
      name: "Magic Link",
      type: "email",
      maxAge: 15 * 60,
      from: process.env.RESEND_FROM ?? "Jacks Motors <auth@example.com>",
      async sendVerificationRequest({ identifier: email, url }: { identifier: string; url: string }) {
        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email.toLowerCase())) return;
        const { error } = await resend!.emails.send({
          from: process.env.RESEND_FROM ?? "Jacks Motors <auth@example.com>",
          to: email,
          subject: `Sign in to ${site.name}`,
          html: renderEmail({ url }),
        });
        if (error) throw new Error("Failed to send sign-in email.");
      },
    });
  }

  return providers;
}

function renderEmail({ url }: { url: string }) {
  const safeUrl = url.replace(/[<>"']/g, "");
  return `<div style="background:#0a0a0a;padding:48px 24px;font-family:-apple-system,system-ui,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#0a0a0a;color:#f5f5f7">
    <div style="font:600 18px/1 'Times New Roman',serif;letter-spacing:.18em;text-transform:uppercase;color:#fff">JACKS · MOTORS</div>
    <p style="margin-top:32px;color:#fff;font-size:24px;font-weight:300">Click below to sign in.</p>
    <p style="color:#9a9aa2;font-size:14px;line-height:1.5">This link is good for 15 minutes. If you didn't request it, you can ignore this email.</p>
    <a href="${safeUrl}" style="display:inline-block;margin-top:24px;padding:16px 32px;background:#fff;color:#0a0a0a;text-decoration:none;font:500 12px/1 monospace;letter-spacing:.16em;text-transform:uppercase">Sign in →</a>
    <p style="color:#5a5a5a;font-size:11px;line-height:1.5;margin-top:32px;word-break:break-all">${safeUrl}</p>
  </div>
</div>`;
}
