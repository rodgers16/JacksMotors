import type { Metadata } from "next";
import Script from "next/script";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { CreditApplicationTrigger } from "@/components/credit/CreditApplicationTrigger";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "Auto financing for every credit story. Soft-pull pre-approval in 60 seconds — no impact to your credit score. Competitive rates from every major lender.",
  alternates: { canonical: "/financing" },
  keywords: [
    "auto financing",
    "car loan",
    "bad credit auto loan",
    "no credit auto loan",
    "pre-approved car loan",
    `${site.address.city} auto financing`,
  ],
  openGraph: {
    title: "Financing · Jacks Motors",
    description:
      "Soft-pull pre-approval in 60 seconds. Financing for every credit story.",
    url: `${site.url}/financing`,
    type: "website",
  },
};

const steps = [
  {
    n: "01",
    title: "Apply in 60 seconds",
    body:
      "Soft pull only — no impact to your credit. Tell us a little about you and the kind of monthly payment that fits.",
  },
  {
    n: "02",
    title: "We shop every lender",
    body:
      "Prime, near-prime, sub-prime, first-time buyer — we work with every major bank and credit union to find your real rate.",
  },
  {
    n: "03",
    title: "Drive home the same day",
    body:
      "Sign digitally or in person. Most approvals fund within hours, and your trade rolls right into the deal.",
  },
];

const lenders = [
  "Capital One",
  "Ally",
  "Chase",
  "Wells Fargo",
  "Westlake",
  "Santander",
  "Credit Acceptance",
  "Local Credit Unions",
];

const faqs = [
  {
    q: "Will applying hurt my credit?",
    a: "No. Our pre-approval uses a soft credit pull, which never affects your score. A hard pull only happens once you decide on a vehicle and confirm the offer.",
  },
  {
    q: "What credit score do I need?",
    a: "There's no minimum. We've placed buyers from 480 to 820. Lower scores typically come with a higher rate or a slightly larger down payment, not a denial.",
  },
  {
    q: "Can I finance with no co-signer?",
    a: "Most of our buyers finance solo. A co-signer can lower your rate, but it's rarely required.",
  },
  {
    q: "How much down payment do I need?",
    a: "Plenty of approvals come through with $0 down. Putting money down (or rolling in trade equity) typically lowers your monthly payment and total interest.",
  },
  {
    q: "Do you finance first-time buyers?",
    a: "Yes. We have lender programs specifically for thin or no credit history — student, military, and first-time buyer.",
  },
  {
    q: "How fast is approval?",
    a: "Most pre-approvals come back in minutes. Funding is usually same-day once you've picked the car.",
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

export default function FinancingPage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        {/* Page header */}
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">Financing</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              Know your number
              <br />
              in 60 seconds.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              Soft pull. No impact to your credit. Real rates from real lenders —
              not a teaser, not a callback queue. Get approved before you fall in love.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <CreditApplicationTrigger size="lg" variant="primary">
                Start Pre-Approval
              </CreditApplicationTrigger>
              <Button href="/inventory" size="lg" variant="outline">
                Browse Inventory
              </Button>
            </div>
            <p className="cap-label mt-6 text-muted-foreground/60">
              Soft pull · No impact · Approvals for every credit story
            </p>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" className="border-b border-[hsl(var(--border))] bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
                <p className="eyebrow">How It Works</p>
                <h2 id="how-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
                  Three steps.
                  <br />
                  No back-and-forth.
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

        {/* Lenders */}
        <section aria-labelledby="lenders-heading" className="border-b border-[hsl(var(--border))] bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">Our Lender Network</p>
            <h2 id="lenders-heading" className="font-display mt-4 text-balance text-3xl leading-[0.95] sm:text-5xl lg:text-6xl">
              Every major bank.
              <br className="hidden sm:block" /> Every credit story.
            </h2>
            <ul className="mt-12 grid grid-cols-2 gap-px bg-[hsl(var(--border))] sm:grid-cols-3 lg:grid-cols-4">
              {lenders.map((l) => (
                <li
                  key={l}
                  className="bg-background px-6 py-8 text-center font-display text-lg text-foreground sm:py-10 sm:text-xl"
                >
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="border-b border-[hsl(var(--border))] bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <p className="eyebrow">Common Questions</p>
                <h2 id="faq-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                  Plain-spoken answers.
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
            <p className="eyebrow">Ready?</p>
            <h2 className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Start your number.
            </h2>
            <div className="mt-10 flex justify-center">
              <CreditApplicationTrigger size="lg" variant="primary">
                Get Pre-Approved
              </CreditApplicationTrigger>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
      <Script
        id="ld-financing-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
