"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { tradeInImage } from "@/lib/inventory";

export function TradeInTeaser() {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/trade-in?q=${encodeURIComponent(q)}` : "/trade-in");
  };

  return (
    <section aria-labelledby="trade-heading" className="border-t border-[hsl(var(--border))] bg-background">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        {/* Image side */}
        <div className="relative min-h-[320px] overflow-hidden lg:min-h-[640px]">
          <Image
            src={tradeInImage}
            alt="Trade-in your car"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 45%, rgba(0,0,0,0.9) 100%)" }} />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-10 sm:pb-10">
            <p className="cap-label text-muted-foreground">Trade-In</p>
            <p className="font-display mt-2 text-3xl text-foreground sm:text-5xl">Drive in. Cash out.</p>
          </div>
        </div>

        {/* Form side */}
        <div className="flex flex-col justify-center border-t border-[hsl(var(--border))] px-6 py-16 sm:px-10 lg:border-l lg:border-t-0 lg:px-16 lg:py-24">
          <p className="eyebrow">What's it worth?</p>
          <h2 id="trade-heading" className="font-display mt-4 text-balance text-3xl leading-[0.95] sm:text-5xl lg:text-6xl">
            A real cash offer
            <br />
            in under an hour.
          </h2>
          <p className="mt-6 max-w-md text-pretty text-muted-foreground leading-relaxed">
            Drop in your VIN or licence plate. We'll send a number you can deposit —
            no obligation, no pressure, no test drive required.
          </p>

          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="cap-label text-muted-foreground/60 mb-2 block">VIN or licence plate</span>
              <Input
                placeholder="e.g. 1HGCM82633A123456"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <Button type="submit" size="md" variant="primary" className="sm:px-10">
              Get My Offer
            </Button>
          </form>
          <p className="mt-4 cap-label text-muted-foreground/60">Free · 60 seconds · No commitment</p>
        </div>
      </div>
    </section>
  );
}
