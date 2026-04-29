import type { Metadata } from "next";
import Script from "next/script";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { TradeInForm } from "@/components/trade-in/TradeInForm";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trade-In",
  description:
    "Get a real cash offer for your car in under an hour. We'll buy it even if you don't buy ours. No obligation, no pressure, no test drive required.",
  alternates: { canonical: "/trade-in" },
  keywords: [
    "trade in car",
    "sell my car",
    "instant cash offer",
    "car trade in value",
    `sell car ${site.address.city}`,
  ],
  openGraph: {
    title: "Trade-In · Jacks Motors",
    description:
      "Real cash offer in under an hour. We'll buy your car even if you don't buy ours.",
    url: `${site.url}/trade-in`,
    type: "website",
  },
};

const steps = [
  {
    n: "01",
    title: "Tell us about it",
    body:
      "Drop your VIN or licence plate. We pull factory specs, options, and recall history automatically.",
  },
  {
    n: "02",
    title: "We send a real number",
    body:
      "Within an hour during business hours. Our offer is what we'll actually pay — not a top-of-the-range estimate that drops at the lot.",
  },
  {
    n: "03",
    title: "Cash, check, or credit",
    body:
      "Take it as a deposit on your next car or walk out with payment. Either way, no obligation.",
  },
];

const faqs = [
  {
    q: "Do I have to buy a car from you?",
    a: "No. We buy cars outright every week. The offer stands whether or not you find something on our lot.",
  },
  {
    q: "Will you beat my online instant offer?",
    a: "Often, yes — bring it in. We're competing with the actual market, not a pricing algorithm trying to leave room.",
  },
  {
    q: "Do you buy cars with negative equity?",
    a: "Yes. We pay off your existing loan and roll any remaining balance into your next financing — or write you a check if it pencils out.",
  },
  {
    q: "What documents do I need?",
    a: "Title (or current loan info), driver's licence, and current registration. That's usually enough to wrap up the same day.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function TradeInPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        {/* Page header + form */}
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12">
            <div className="lg:col-span-6">
              <p className="eyebrow">Trade-In</p>
              <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
                A real cash offer
                <br />
                in under an hour.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-muted-foreground leading-relaxed">
                Drop in your VIN or licence plate. We'll send a number you can
                deposit — no obligation, no pressure, no test drive required.
                Yes, even if you don't buy ours.
              </p>
              <p className="cap-label mt-6 text-muted-foreground/60">
                Free · 60 seconds · No commitment
              </p>
            </div>
            <div className="lg:col-span-6">
              <TradeInFormWrapper searchParams={searchParams} />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section aria-labelledby="how-heading" className="border-b border-[hsl(var(--border))] bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
                <p className="eyebrow">How It Works</p>
                <h2 id="how-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
                  Three steps.
                  <br />
                  No haggling.
                </h2>
              </div>
              <ol className="lg:col-span-7">
                {steps.map((s, i) => (
                  <li
                    key={s.n}
                    className={`grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 sm:py-10 ${
                      i !== steps.length - 1 ? "border-b border-[hsl(var(--border))]" : ""
                    }`}
                  >
                    <span className="font-display text-2xl text-muted-foreground/60 leading-none sm:text-3xl">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl text-foreground leading-tight sm:text-3xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="border-b border-[hsl(var(--border))] bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="eyebrow">Questions</p>
                <h2 id="faq-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                  Straight answers.
                </h2>
              </div>
              <dl className="lg:col-span-8">
                {faqs.map((f, i) => (
                  <details
                    key={f.q}
                    className={`group ${i !== faqs.length - 1 ? "border-b border-[hsl(var(--border))]" : ""}`}
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-6 py-6 list-none">
                      <dt className="font-display text-xl text-foreground sm:text-2xl">
                        {f.q}
                      </dt>
                      <span
                        aria-hidden
                        className="font-display text-xl text-muted-foreground transition-transform duration-300 group-open:rotate-45 sm:text-2xl"
                      >
                        +
                      </span>
                    </summary>
                    <dd className="pb-6 pr-10 text-muted-foreground leading-relaxed">{f.a}</dd>
                  </details>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 text-center sm:px-8 lg:px-12">
            <p className="eyebrow">Prefer to talk?</p>
            <h2 className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Drive in. Cash out.
            </h2>
            <p className="mt-6 max-w-md mx-auto text-muted-foreground leading-relaxed">
              Walk-in appraisals welcome — no appointment needed.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={site.phoneHref} size="lg" variant="primary">
                Call {site.phone}
              </Button>
              <Button href="/contact?intent=trade-in" size="lg" variant="outline">
                Send a Message
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
      <Script
        id="ld-tradein-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}

async function TradeInFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  return <TradeInForm initialQ={sp.q ?? ""} />;
}
