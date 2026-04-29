import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Resend } from "resend";
import { db } from "./db/client";
import { users, accounts, sessions, verificationTokens } from "./db/schema";
import { site } from "./site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  pages: {
    signIn: "/admin/login",
    verifyRequest: "/admin/login?check-email=1",
    error: "/admin/login?error=1",
  },
  providers: [
    {
      id: "magic-link",
      name: "Magic Link",
      type: "email",
      maxAge: 15 * 60,
      from: process.env.RESEND_FROM ?? "Jacks Motors <auth@example.com>",
      async sendVerificationRequest({ identifier: email, url }) {
        if (!resend) {
          console.log("[auth] (dev — no RESEND_API_KEY) magic link for", email, ":", url);
          return;
        }
        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email.toLowerCase())) {
          console.warn("[auth] rejected non-admin email:", email);
          // We still pretend success to avoid leaking which emails are admins.
          return;
        }
        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM ?? "Jacks Motors <auth@example.com>",
          to: email,
          subject: `Sign in to ${site.name}`,
          html: renderEmail({ url }),
        });
        if (error) {
          console.error("[auth] resend error:", error);
          throw new Error("Failed to send sign-in email.");
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user }) {
      // Hard gate: only allowlisted emails get a session.
      if (ADMIN_EMAILS.length === 0) return true; // dev mode: anything goes
      const email = user.email?.toLowerCase();
      return Boolean(email && ADMIN_EMAILS.includes(email));
    },
  },
});

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
