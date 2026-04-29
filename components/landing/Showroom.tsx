import { CreditApplicationTrigger } from "@/components/credit/CreditApplicationTrigger";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export function Showroom() {
  return (
    <section aria-labelledby="visit-heading" className="border-t border-[hsl(var(--border))] bg-background">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        {/* Text side */}
        <div className="flex flex-col justify-center px-6 py-20 sm:px-10 lg:px-16 lg:py-32">
          <p className="eyebrow">Visit The Showroom</p>
          <h2 id="visit-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
            Come for the cars.
            <br />
            Stay for the espresso.
          </h2>
          <p className="mt-6 max-w-md text-pretty text-muted-foreground leading-relaxed">
            We're a hand-shake-and-real-people kind of place. Drop by, take a
            test drive, and meet the team that's going to find your next car.
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="cap-label text-muted-foreground/60 mb-2">Address</dt>
              <dd className="text-foreground leading-relaxed">
                {site.address.street}<br />
                {site.address.city}, {site.address.region}<br />
                {site.address.postalCode}
              </dd>
            </div>
            <div>
              <dt className="cap-label text-muted-foreground/60 mb-2">Hours</dt>
              <dd className="text-muted-foreground leading-relaxed">
                {site.hours.map((h) => (
                  <span key={h.day} className="block">
                    <span className="text-foreground">{h.day}</span> · {h.time}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <CreditApplicationTrigger size="md" variant="primary">Get Pre-Approved</CreditApplicationTrigger>
            <Button href="/contact?intent=test-drive" variant="outline" size="md">
              Book a Test Drive
            </Button>
          </div>
        </div>

        {/* Map side */}
        <div className="relative min-h-[400px] overflow-hidden border-t border-[hsl(var(--border))] lg:min-h-[640px] lg:border-l lg:border-t-0">
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
              <p className="cap-label mt-3 text-muted-foreground">Map embed wires up at launch</p>
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
  );
}
