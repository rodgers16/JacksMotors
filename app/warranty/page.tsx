import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Warranty",
  description: `Every ${site.name} vehicle includes a 30-day, 1,000-mile limited warranty. Extended coverage from 12 to 84 months available — fully transparent pricing, no fine print.`,
  alternates: { canonical: "/warranty" },
  openGraph: {
    title: `Warranty · ${site.name}`,
    description: `Every car covered. Extended plans up to 84 months.`,
    url: `${site.url}/warranty`,
    type: "website",
  },
};

const tiers = [
  {
    name: "Included",
    eyebrow: "Standard",
    duration: "30 days / 1,000 miles",
    summary: "Every vehicle on the lot. No upcharge, no opt-in.",
    coverage: [
      "Engine internals",
      "Transmission internals",
      "Drive axle",
      "Recall pass-through",
    ],
  },
  {
    name: "Powertrain Plus",
    eyebrow: "Most Popular",
    duration: "12 – 36 months",
    summary: "Big-ticket peace of mind for the money-makers.",
    coverage: [
      "Everything in Standard",
      "Cooling & fuel systems",
      "Steering & suspension",
      "$100 deductible",
      "Roadside assistance",
    ],
  },
  {
    name: "Premium Bumper-to-Bumper",
    eyebrow: "Maximum Coverage",
    duration: "Up to 84 months",
    summary: "Closest thing to driving a brand-new car off the lot.",
    coverage: [
      "Everything in Powertrain Plus",
      "Electrical & electronics",
      "Climate control & infotainment",
      "$0 deductible at our shop",
      "Rental car coverage",
      "Nationwide repair network",
    ],
  },
];

const claimsSteps = [
  { n: "01", t: "Call us first", b: "We'll triage over the phone — most issues are simpler than they sound." },
  { n: "02", t: "Drop off when convenient", b: "Use our service bay or any covered shop nationwide on extended plans." },
  { n: "03", t: "We handle the paperwork", b: "You see a receipt — not a 14-page claim form." },
];

export default function WarrantyPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        {/* Header */}
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">Warranty</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              Coverage that
              <br />
              keeps the keys.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              Every vehicle leaves the lot with our 30-day, 1,000-mile limited
              warranty included — no opt-in, no upsell. Want longer? Extended
              plans cover you for up to 84 months at fully transparent pricing.
            </p>
          </div>
        </section>

        {/* Tiers */}
        <section aria-labelledby="tiers-heading" className="border-b border-[hsl(var(--border))] bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">The Plans</p>
            <h2 id="tiers-heading" className="font-display mt-4 text-balance text-3xl leading-[0.95] sm:text-5xl lg:text-6xl">
              Pick your peace of mind.
            </h2>

            <div className="mt-12 grid gap-px bg-[hsl(var(--border))] lg:grid-cols-3">
              {tiers.map((t) => (
                <article
                  key={t.name}
                  className="flex flex-col bg-background p-8 sm:p-10"
                >
                  <p className="cap-label text-muted-foreground">{t.eyebrow}</p>
                  <h3 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
                    {t.name}
                  </h3>
                  <p className="cap-label mt-3 text-foreground/80">{t.duration}</p>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{t.summary}</p>
                  <ul className="mt-8 space-y-3 border-t border-[hsl(var(--border))] pt-6">
                    {t.coverage.map((c) => (
                      <li key={c} className="flex items-start gap-3 text-sm">
                        <span aria-hidden className="mt-2 inline-block h-px w-3 shrink-0 bg-foreground/60" />
                        <span className="text-foreground">{c}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Claims process */}
        <section aria-labelledby="claims-heading" className="border-b border-[hsl(var(--border))] bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
                <p className="eyebrow">Filing a Claim</p>
                <h2 id="claims-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
                  Three steps. Real people.
                </h2>
              </div>
              <ol className="lg:col-span-7">
                {claimsSteps.map((s, i) => (
                  <li
                    key={s.n}
                    className={`grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 sm:py-10 ${
                      i !== claimsSteps.length - 1 ? "border-b border-[hsl(var(--border))]" : ""
                    }`}
                  >
                    <span className="font-display text-2xl text-muted-foreground/60 leading-none sm:text-3xl">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl text-foreground leading-tight sm:text-3xl">
                        {s.t}
                      </h3>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{s.b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 text-center sm:px-8 lg:px-12">
            <p className="eyebrow">Questions?</p>
            <h2 className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              We'll walk you through it.
            </h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={site.phoneHref} size="lg" variant="primary">
                Call {site.phone}
              </Button>
              <Button href="/contact?intent=general" size="lg" variant="outline">
                Send a Message
              </Button>
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
