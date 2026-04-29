import type { Metadata } from "next";
import Script from "next/script";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service",
  description: `On-site service center at ${site.name}. Factory-trained techs, OEM parts, courtesy loaners, and same-day appointments for most makes.`,
  alternates: { canonical: "/service" },
  openGraph: {
    title: `Service · ${site.name}`,
    description: `Factory-trained techs. OEM parts. Same-day appointments.`,
    url: `${site.url}/service`,
    type: "website",
  },
};

const services = [
  { t: "Oil & filter", b: "Full synthetic, every time. OEM filters." },
  { t: "Brakes & rotors", b: "Same-day on most makes. Pads, rotors, calipers, fluid." },
  { t: "Tires & alignment", b: "All major brands, four-wheel laser alignment, road-force balance." },
  { t: "Diagnostics", b: "Factory-level scan tools. We tell you what's wrong, not what we can sell." },
  { t: "Battery & electrical", b: "Hybrid and EV battery diagnostics included." },
  { t: "State inspection", b: "While you wait. Coffee's on us." },
  { t: "Detailing", b: "Hand wash, ceramic prep, headlight restoration, paint correction." },
  { t: "Pre-purchase inspection", b: "Buying somewhere else? We'll inspect it before you sign." },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutomotiveBusiness",
  name: `${site.name} Service`,
  url: `${site.url}/service`,
  telephone: site.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "17:00",
    },
  ],
};

export default function ServicePage() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">Service</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              Keep it running
              <br />
              the way you bought it.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              On-site service for every vehicle we sell — and most we didn't.
              Factory-trained techs, OEM parts, and a courtesy loaner if you need one.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact?intent=service" size="lg" variant="primary">
                Book a Service Visit
              </Button>
              <Button href={site.phoneHref} size="lg" variant="outline">
                Call {site.phone}
              </Button>
            </div>
          </div>
        </section>

        {/* Services grid */}
        <section aria-labelledby="services-heading" className="border-b border-[hsl(var(--border))] bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">What We Do</p>
            <h2 id="services-heading" className="font-display mt-4 text-balance text-3xl leading-[0.95] sm:text-5xl lg:text-6xl">
              From oil changes to overhauls.
            </h2>
            <ul className="mt-12 grid grid-cols-1 gap-px bg-[hsl(var(--border))] sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s) => (
                <li key={s.t} className="bg-background p-8">
                  <h3 className="font-display text-xl text-foreground leading-tight sm:text-2xl">
                    {s.t}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.b}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Hours */}
        <section aria-labelledby="hours-heading" className="border-b border-[hsl(var(--border))] bg-background py-20 sm:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="eyebrow">Service Hours</p>
                <h2 id="hours-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                  Walk in or book ahead.
                </h2>
                <p className="mt-6 max-w-md text-pretty text-muted-foreground leading-relaxed">
                  Same-day appointments most weekdays. Walk-ins welcome — we'll
                  be straight with you about the wait.
                </p>
              </div>
              <dl className="lg:col-span-7 lg:col-start-7">
                {site.hours.map((h, i) => (
                  <div
                    key={h.day}
                    className={`flex justify-between gap-4 py-4 ${
                      i !== site.hours.length - 1 ? "border-b border-[hsl(var(--border))]" : ""
                    }`}
                  >
                    <dt className="font-display text-xl text-foreground sm:text-2xl">{h.day}</dt>
                    <dd className="font-display text-xl text-muted-foreground sm:text-2xl">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-[1600px] px-5 text-center sm:px-8 lg:px-12">
            <p className="eyebrow">Ready When You Are</p>
            <h2 className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Book a visit.
            </h2>
            <div className="mt-10 flex justify-center">
              <Button href="/contact?intent=service" size="lg" variant="primary">
                Schedule Service
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
      <Script
        id="ld-service"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
