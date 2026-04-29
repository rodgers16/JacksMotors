import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses, and protects your personal information. Read our privacy policy.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    h: "What we collect",
    p: [
      "Information you give us directly: name, contact details, vehicle preferences, financing application data, and any messages you send.",
      "Information collected automatically: device, browser, IP address, pages viewed, and approximate location, gathered through cookies and similar technologies.",
    ],
  },
  {
    h: "How we use it",
    p: [
      "To respond to your inquiries, schedule appointments, present financing options, and process transactions.",
      "To improve our website, inventory selection, and customer experience — and to send you communications you've opted into.",
    ],
  },
  {
    h: "Who we share it with",
    p: [
      "Lenders and financial institutions, only when you submit a financing application.",
      "Service providers (hosting, analytics, communications) under written agreements that limit their use of your information to providing services to us.",
      "We do not sell your personal information.",
    ],
  },
  {
    h: "Your rights",
    p: [
      "You may request access to, correction of, or deletion of the personal information we hold about you. You may also opt out of marketing communications at any time.",
      `Send requests to ${site.email} or call ${site.phone}.`,
    ],
  },
  {
    h: "Cookies",
    p: [
      "We use essential cookies to operate the site, plus analytics cookies to understand usage. Most browsers let you control cookies through settings.",
    ],
  },
  {
    h: "Data security",
    p: [
      "We use industry-standard safeguards to protect your information in transit and at rest. No method of transmission is perfectly secure, but we work to protect your data.",
    ],
  },
  {
    h: "Children",
    p: [
      "Our services are not directed to children under 13, and we do not knowingly collect their personal information.",
    ],
  },
  {
    h: "Changes",
    p: [
      "We may update this policy from time to time. Material changes will be highlighted on this page with an updated date.",
    ],
  },
  {
    h: "Contact",
    p: [
      `Questions? Email ${site.email}, call ${site.phone}, or write to us at ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">Legal</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              Privacy Policy
            </h1>
            <p className="cap-label mt-6 text-muted-foreground/60">Last updated: April 2026</p>
          </div>
        </section>

        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-12">
              <p className="lg:col-span-12 max-w-3xl text-pretty text-muted-foreground leading-relaxed">
                {site.name} ("we", "us") respects your privacy. This policy
                describes the personal information we collect, how we use it,
                and the choices you have. By using our website or services, you
                agree to this policy.
              </p>
              <div className="lg:col-span-12">
                {sections.map((s, i) => (
                  <section
                    key={s.h}
                    className={`grid gap-6 py-10 lg:grid-cols-12 lg:gap-16 ${
                      i !== sections.length - 1 ? "border-b border-[hsl(var(--border))]" : ""
                    }`}
                  >
                    <h2 className="font-display text-2xl leading-tight sm:text-3xl lg:col-span-4">
                      {s.h}
                    </h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed lg:col-span-8">
                      {s.p.map((para, j) => (
                        <p key={j}>{para}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
    </>
  );
}
