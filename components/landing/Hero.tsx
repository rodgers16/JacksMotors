import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreditApplicationTrigger } from "@/components/credit/CreditApplicationTrigger";
import { heroImage } from "@/lib/inventory";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-background">
        {/* Poster image — paints instantly as the LCP target while the video downloads */}
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Hero video — autoplays muted, loops, scales to cover. Sits above the poster. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroImage}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 cinema-vignette" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col items-center px-5 pt-24 pb-16 text-center sm:px-8 lg:px-12 fade-up">
        <p className="eyebrow text-foreground/80">Premium Pre-Owned · Est. 2013</p>

        <h1 className="font-display mt-6 text-[44px] leading-[0.92] sm:text-7xl lg:text-[112px]">
          THE ART OF
          <br />
          <span className="text-foreground">THE NEXT DRIVE</span>
        </h1>

        <p className="cap-label mt-6 max-w-md text-muted-foreground">
          Hand-picked. Inspected. Honestly priced. Driven home this week.
        </p>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row">
          <Button href="/inventory" size="lg" variant="primary">
            View The Collection
          </Button>
          <CreditApplicationTrigger size="lg" variant="outline">
            Get Pre-Approved
          </CreditApplicationTrigger>
        </div>
      </div>

      {/* Scroll affordance */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 cap-label flex flex-col items-center gap-2 text-muted-foreground">
        <span>Scroll</span>
        <ChevronDown size={14} aria-hidden className="animate-bounce" />
      </div>

      {/* Stat strip — Bugatti-style sub-hero band */}
      <div className="absolute inset-x-0 bottom-0 z-10 hidden border-t border-[hsl(var(--border))] bg-background/40 backdrop-blur-sm md:block">
        <dl className="mx-auto grid max-w-[1600px] grid-cols-3 divide-x divide-[hsl(var(--border))] px-5 sm:px-8 lg:px-12">
          {[
            { label: "Vehicles in stock", value: "120+" },
            { label: "Five-star reviews", value: "1,800+" },
            { label: "Years in business", value: "12" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 py-5 first:pl-0 last:pr-0 md:px-8">
              <dd className="font-display text-3xl text-foreground leading-none">{s.value}</dd>
              <dt className="cap-label text-muted-foreground">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
