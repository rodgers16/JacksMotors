import type { Metadata } from "next";
import Script from "next/script";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { ContactForm } from "@/components/contact/ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call, text, email, or stop by. ${site.name} is open 6 days a week at ${site.address.street}, ${site.address.city}, ${site.address.region}.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${site.name}`,
    description: `Call ${site.phone}, email ${site.email}, or stop by ${site.address.street}.`,
    url: `${site.url}/contact`,
    type: "website",
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${site.url}/contact`,
  mainEntity: {
    "@type": "AutoDealer",
    name: site.name,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
  },
};

const validIntents = new Set([
  "general",
  "test-drive",
  "trade-in",
  "financing",
  "service",
]);

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; vehicle?: string }>;
}) {
  const sp = await searchParams;
  const initialIntent = validIntents.has(sp.intent ?? "")
    ? (sp.intent as string)
    : "general";

  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        {/* Page header */}
        <section className="border-b border-[hsl(var(--border))] bg-background py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <p className="eyebrow">Contact</p>
            <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl lg:text-[88px]">
              Talk to a real person.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              Phone, text, email, or walk in. Whichever's fastest for you — we'll
              answer the same way: like a neighbor, not a call center.
            </p>
          </div>
        </section>

        {/* Contact methods */}
        <section className="border-b border-[hsl(var(--border))] bg-background">
          <div className="mx-auto grid max-w-[1600px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={site.phoneHref}
              className="group flex flex-col gap-3 border-[hsl(var(--border))] px-6 py-10 transition-colors hover:bg-foreground/[0.03] sm:px-8 sm:py-12 sm:border-r sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(3)]:border-r"
            >
              <Phone size={18} aria-hidden className="text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
              <p className="cap-label text-muted-foreground">Call or text</p>
              <p className="font-display text-2xl text-foreground sm:text-3xl">{site.phone}</p>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="group flex flex-col gap-3 border-t border-[hsl(var(--border))] px-6 py-10 transition-colors hover:bg-foreground/[0.03] sm:border-t-0 sm:px-8 sm:py-12 lg:border-r"
            >
              <Mail size={18} aria-hidden className="text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
              <p className="cap-label text-muted-foreground">Email</p>
              <p className="font-display text-lg text-foreground sm:text-xl break-all">{site.email}</p>
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address.street}, ${site.address.city}, ${site.address.region}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 border-t border-[hsl(var(--border))] px-6 py-10 transition-colors hover:bg-foreground/[0.03] sm:border-r sm:px-8 sm:py-12 lg:border-t-0"
            >
              <MapPin size={18} aria-hidden className="text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
              <p className="cap-label text-muted-foreground">Visit</p>
              <p className="font-display text-lg text-foreground sm:text-xl leading-tight">
                {site.address.street}
                <br />
                <span className="text-muted-foreground">
                  {site.address.city}, {site.address.region} {site.address.postalCode}
                </span>
              </p>
            </a>
            <div className="flex flex-col gap-3 border-t border-[hsl(var(--border))] px-6 py-10 sm:px-8 sm:py-12 lg:border-t-0">
              <Clock size={18} aria-hidden className="text-muted-foreground" strokeWidth={1.5} />
              <p className="cap-label text-muted-foreground">Hours</p>
              <ul className="space-y-1 text-sm">
                {site.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-3">
                    <span className="text-foreground">{h.day}</span>
                    <span className="text-muted-foreground">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Form */}
        <section aria-labelledby="form-heading" className="border-b border-[hsl(var(--border))] bg-background py-20 sm:py-28">
          <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">Send a Message</p>
              <h2 id="form-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                Tell us what you're after.
              </h2>
              <p className="mt-6 max-w-md text-pretty text-muted-foreground leading-relaxed">
                We typically reply within an hour during business hours and
                first thing the next morning otherwise.
              </p>
            </div>
            <div className="lg:col-span-7">
              <ContactForm initialIntent={initialIntent} initialVehicle={sp.vehicle ?? ""} />
            </div>
          </div>
        </section>

        {/* Map */}
        <section aria-label="Map" className="bg-background">
          <div className="mx-auto max-w-[1600px]">
            <div className="relative min-h-[320px] overflow-hidden border-y border-[hsl(var(--border))] lg:min-h-[480px]">
              <div aria-hidden className="absolute inset-0 bg-card" />
              <div
                aria-hidden
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                  maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 75%)",
                }}
              />
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <div>
                  <p className="font-display text-4xl text-foreground sm:text-5xl">Find Us</p>
                  <p className="cap-label mt-3 text-muted-foreground">
                    {site.address.street} · {site.address.city}, {site.address.region}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address.street}, ${site.address.city}, ${site.address.region}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cap-label mt-6 inline-flex items-center gap-3 text-foreground hover:text-muted-foreground"
                  >
                    <span className="inline-block h-px w-8 bg-foreground" aria-hidden /> Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />
      <Script
        id="ld-contact"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
    </>
  );
}
