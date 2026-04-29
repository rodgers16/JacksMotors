import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { MobileStickyBar } from "@/components/site/MobileStickyBar";
import { CreditApplication } from "@/components/credit/CreditApplication";
import { CreditApplicationTrigger } from "@/components/credit/CreditApplicationTrigger";
import { Button } from "@/components/ui/Button";
import { formatMileage, formatPrice } from "@/lib/inventory";
import {
  getVehicleBySlugPublic,
  listAllSlugsPublic,
  listVehiclesPublic,
} from "@/lib/db/publicReads";
import { site } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await listAllSlugsPublic();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicleBySlugPublic(slug);
  if (!v) return { title: "Vehicle not found" };
  const title = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;
  return {
    title,
    description: `${title} — ${formatPrice(v.price)} · ${formatMileage(v.mileage)} · ${v.body} · ${v.drivetrain} · at Jacks Motors.`,
    alternates: { canonical: `/inventory/${v.slug}` },
    openGraph: { title, images: [{ url: v.image, alt: title }] },
  };
}

export default async function VehicleDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const v = await getVehicleBySlugPublic(slug);
  if (!v) notFound();

  const title = `${v.year} ${v.make} ${v.model}`;
  const all = await listVehiclesPublic({ limit: 200 });
  const others = all.filter((x) => x.id !== v.id && x.body === v.body).slice(0, 3);

  const vehicleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: title,
    brand: v.make,
    model: v.model,
    vehicleConfiguration: v.trim,
    modelDate: v.year,
    bodyType: v.body,
    fuelType: v.fuel,
    driveWheelConfiguration: v.drivetrain,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.mileage, unitCode: "SMI" },
    image: v.image,
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: site.name, url: site.url },
    },
  };

  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16 lg:pt-[72px]">
        {/* Breadcrumb */}
        <div className="border-b border-[hsl(var(--border))] bg-background">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-5 py-4 sm:px-8 lg:px-12">
            <Link href="/inventory" className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={13} aria-hidden /> All inventory
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <section className="bg-background">
          <div className="mx-auto max-w-[1600px]">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-card sm:aspect-[21/9]">
              <Image
                src={v.image}
                alt={title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)" }} />
            </div>
          </div>
        </section>

        {/* Title + buy box */}
        <section className="border-b border-[hsl(var(--border))] bg-background py-12 sm:py-16">
          <div className="mx-auto grid max-w-[1600px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
            <div className="lg:col-span-8">
              <p className="eyebrow">{v.year} · {v.body} · {v.drivetrain}</p>
              <h1 className="font-display mt-4 text-balance text-5xl leading-[0.95] sm:text-7xl">
                {v.make} {v.model}
              </h1>
              {v.trim && <p className="mt-3 text-xl text-muted-foreground">{v.trim}</p>}

              {v.badges && v.badges.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-2">
                  {v.badges.map((b) => (
                    <li key={b} className="cap-label border border-foreground/30 px-3 py-1.5 text-foreground">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="lg:col-span-4 lg:pl-10 lg:border-l lg:border-[hsl(var(--border))]">
              <p className="cap-label text-muted-foreground">Asking</p>
              <p className="font-display mt-2 text-5xl text-foreground">{formatPrice(v.price)}</p>
              <p className="mt-2 cap-label text-muted-foreground">All-in. No surprise fees.</p>

              <div className="mt-8 flex flex-col gap-3">
                <CreditApplicationTrigger
                  size="lg"
                  variant="primary"
                  context={{ vehicle: { id: v.id, title } }}
                >
                  Get Pre-Approved
                </CreditApplicationTrigger>
                <Button href={`/contact?intent=test-drive&vehicle=${encodeURIComponent(v.slug)}`} variant="outline" size="lg">
                  Book a Test Drive
                </Button>
                <a href={site.phoneHref} className="bug-cta-underline mt-2 self-start text-foreground">
                  Or call {site.phone}
                </a>
              </div>
            </aside>
          </div>
        </section>

        {/* Spec strip */}
        <section className="border-b border-[hsl(var(--border))] bg-background">
          <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
            <dl className="grid grid-cols-2 gap-px bg-[hsl(var(--border))] sm:grid-cols-3 lg:grid-cols-6">
              <Spec label="Year"        value={String(v.year)} />
              <Spec label="Mileage"     value={formatMileage(v.mileage)} />
              <Spec label="Body"        value={v.body} />
              <Spec label="Drivetrain"  value={v.drivetrain} />
              <Spec label="Fuel"        value={v.fuel} />
              <Spec label="Transmission" value={v.transmission} />
            </dl>
          </div>
        </section>

        {/* Description placeholder — lives in CMS in Phase 2 */}
        <section className="bg-background py-20 sm:py-28">
          <div className="mx-auto grid max-w-[1600px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Walkaround</p>
              <h2 className="font-display mt-4 text-3xl leading-[1.05] sm:text-4xl">
                A few notes from the lot.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Inspected and detailed in our shop the week it arrived. Tires
                measured at over 70%, brakes within new-spec range, and a fresh
                oil service before delivery.
              </p>
              <p>
                Two keys, full books, and the original window sticker on file.
                Carfax available on request — happy to walk you through it before
                you drive in.
              </p>
              <p className="text-foreground/80">
                Extended warranty options and certified-finance rates available
                from our lender network. Trade-ins welcome on any vehicle.
              </p>
            </div>
          </div>
        </section>

        {/* Similar vehicles */}
        {others.length > 0 && (
          <section className="border-t border-[hsl(var(--border))] bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
              <div className="flex items-end justify-between gap-8">
                <div>
                  <p className="eyebrow">More like this</p>
                  <h2 className="font-display mt-4 text-3xl sm:text-5xl">Other {v.body.toLowerCase()}s in stock</h2>
                </div>
                <Link href={`/inventory?body=${v.body.toLowerCase()}`} className="bug-cta-underline text-foreground">
                  View all {v.body.toLowerCase()}s →
                </Link>
              </div>
              <div className="mt-10 grid gap-px bg-[hsl(var(--border))] sm:grid-cols-2 lg:grid-cols-3">
                {others.map((x) => (
                  <Link
                    key={x.id}
                    href={x.href}
                    className="group relative block aspect-[4/5] overflow-hidden bg-card"
                  >
                    <Image
                      src={x.image}
                      alt={`${x.year} ${x.make} ${x.model}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%)" }} />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="cap-label text-muted-foreground">{x.year} · {formatMileage(x.mileage)}</p>
                      <p className="font-display mt-2 text-2xl text-foreground leading-[0.95]">
                        {x.make} {x.model}
                      </p>
                      <p className="mt-2 font-display text-lg text-foreground">{formatPrice(x.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <MobileStickyBar />
      <CreditApplication />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleJsonLd) }}
      />
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-5 py-6 sm:px-6 sm:py-8">
      <dt className="cap-label text-muted-foreground/60">{label}</dt>
      <dd className="font-display mt-3 text-xl text-foreground sm:text-2xl">{value}</dd>
    </div>
  );
}
