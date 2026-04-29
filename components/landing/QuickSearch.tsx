"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/Field";

const makes = ["Any make", "Audi", "BMW", "Mercedes-Benz", "Lexus", "Porsche", "Tesla", "Toyota", "Honda", "Acura", "Ford", "Jeep"];
const bodies = ["Any body", "SUV", "Sedan", "Coupe", "Truck", "Convertible", "EV"];
const maxPrices = ["No max", "$15K", "$25K", "$35K", "$50K", "$75K", "$100K+"];

export function QuickSearch() {
  const router = useRouter();
  const [make, setMake] = React.useState(makes[0]);
  const [body, setBody] = React.useState(bodies[0]);
  const [price, setPrice] = React.useState(maxPrices[0]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (make !== makes[0]) qs.set("make", make);
    if (body !== bodies[0]) qs.set("body", body.toLowerCase());
    if (price !== maxPrices[0]) qs.set("maxPrice", price.replace(/[^0-9]/g, ""));
    router.push(`/inventory${qs.toString() ? `?${qs.toString()}` : ""}`);
  };

  return (
    <section aria-label="Search inventory" className="border-y border-[hsl(var(--border))] bg-background">
      <form
        onSubmit={onSubmit}
        role="search"
        className="mx-auto grid max-w-[1600px] grid-cols-1 items-stretch divide-y divide-[hsl(var(--border))] px-5 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:divide-y-0 sm:divide-x sm:px-8 lg:px-12"
      >
        <div className="hidden items-center gap-3 py-5 pr-8 sm:flex">
          <Search size={14} className="text-muted-foreground" aria-hidden />
          <span className="cap-label text-muted-foreground">Find your next</span>
        </div>
        <FilterCell label="Make">
          <Select aria-label="Make" value={make} onChange={(e) => setMake(e.target.value)}>
            {makes.map((m) => (<option key={m}>{m}</option>))}
          </Select>
        </FilterCell>
        <FilterCell label="Body">
          <Select aria-label="Body type" value={body} onChange={(e) => setBody(e.target.value)}>
            {bodies.map((b) => (<option key={b}>{b}</option>))}
          </Select>
        </FilterCell>
        <FilterCell label="Max price">
          <Select aria-label="Max price" value={price} onChange={(e) => setPrice(e.target.value)}>
            {maxPrices.map((p) => (<option key={p}>{p}</option>))}
          </Select>
        </FilterCell>
        <div className="flex">
          <button
            type="submit"
            className="cap-label flex-1 bg-foreground text-background hover:bg-muted transition-colors px-8 py-5"
          >
            Search
          </button>
        </div>
      </form>
    </section>
  );
}

function FilterCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col justify-center px-0 py-4 sm:px-6">
      <span className="cap-label text-muted-foreground/60 mb-1">{label}</span>
      {children}
    </label>
  );
}
