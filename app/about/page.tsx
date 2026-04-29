import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { CreditApplicationTrigger } from "@/components/credit/CreditApplicationTrigger";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Family-run since 2013, ${site.name} sells premium pre-owned vehicles the way we'd want to buy them — slowly, honestly, and only the ones worth keeping.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About · ${site.name}`,
    description: `Premium pre-owned, since 2013. Hand-picked. Inspected. Honestly priced.`,
    url: `${site.url}/about`,
    type: "website",
  },
};

const stats = [
  { value: "2013", label: "Founded" },
  { value: "120+", label: "Vehicles in stock" },
  { value: "1,800+", label: "Five-star reviews" },
  { value: "12 yrs", label: "Same family" },
];

const values = [
  {
    n: "01",
    title: "Honesty over volume",
    body:
      "We pass on a lot of cars. The ones that make it onto the lot are the ones we'd put our own family in.",
  },
  {
    n: "02",
    title: "Pricing that doesn't move",
    body:
      "No bait-and-switch, no doc-fee surprises, no markup based on credit tier. The price you see is the price.",
  },
  {
    n: "03",
    title: "Approvals for every story",
    body:
      "Thin file, rebuilding, perfect 800 — every buyer gets the same respect, the same answers, the same transparency.",
  },
  {
    n: "04",
    title: "After the sale matters",
    body:
      "On-site service, courtesy loaners, and a phone call back when something needs to be made right.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        {/* Page header */}
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">About</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              A different kind
              <br />
              of dealership.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              For twelve years we've sold cars the way we'd want to buy them —
              slowly, honestly, and only the ones worth keeping.
            </p>
          </div>
        </section>

        {/* Story */}
        <section aria-labelledby="story-heading" className="border-b border-[hsl(var(--border))] bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="eyebrow">Our Story</p>
                <h2 id="story-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                  Started in a garage. Ended up your favorite lot.
                </h2>
              </div>
              <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  Jack opened the doors in 2013 with three cars and a simple
                  rule: never sell something you wouldn't drive home yourself.
                  Twelve years later that rule is still the one we hire for.
                </p>
                <p>
                  We grew slowly on purpose. Today we keep about 120 vehicles on
                  the lot — every one personally inspected, mechanically
                  reconditioned, and detailed before it ever sees the website.
                </p>
                <p>
                  We're family-run, locally owned, and we live within a few
                  miles of the showroom. When you call, you get someone whose
                  name is on the building. That accountability shows up in the
                  cars, the prices, and the way we handle anything that needs
                  to be made right.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section aria-label="By the numbers" className="border-b border-[hsl(var(--border))] bg-background">
          <dl className="mx-auto grid max-w-[1600px] grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col gap-3 px-6 py-12 sm:px-10 sm:py-16 ${
                  i !== 0 ? "border-l border-[hsl(var(--border))]" : ""
                } ${i >= 2 ? "border-t border-[hsl(var(--border))] lg:border-t-0" : ""}`}
              >
                <dd className="font-display text-4xl text-foreground leading-none sm:text-6xl">
                  {s.value}
                </dd>
                <dt className="cap-label text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Values */}
        <section aria-labelledby="values-heading" className="border-b border-[hsl(var(--border))] bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
                <p className="eyebrow">What We Stand For</p>
                <h2 id="values-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
                  Four things we don't compromise on.
                </h2>
              </div>
              <ol className="lg:col-span-7">
                {values.map((v, i) => (
                  <li
                    key={v.n}
                    className={`grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 sm:py-10 ${
                      i !== values.length - 1 ? "border-b border-[hsl(var(--border))]" : ""
                    }`}
                  >
                    <span className="font-display text-2xl text-muted-foreground/60 leading-none sm:text-3xl">
                      {v.n}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl text-foreground leading-tight sm:text-3xl">
                        {v.title}
                      </h3>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{v.body}</p>
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
            <p className="eyebrow">Stop By</p>
            <h2 className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Come for the cars.
              <br />
              Stay for the espresso.
            </h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/inventory" size="lg" variant="primary">
                Browse Inventory
              </Button>
              <CreditApplicationTrigger size="lg" variant="outline">
                Get Pre-Approved
              </CreditApplicationTrigger>
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
