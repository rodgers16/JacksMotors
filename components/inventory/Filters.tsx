"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const MAKES = ["Any make", "Acura", "Audi", "BMW", "Ford", "Honda", "Jeep", "Lexus", "Mercedes-Benz", "Porsche", "Tesla", "Toyota"];
const BODIES = ["Any body", "SUV", "Sedan", "Coupe", "Truck", "Convertible", "EV"];
const FUELS = ["Any fuel", "Gas", "Hybrid", "Diesel", "Electric"];
const DRIVES = ["Any drivetrain", "AWD", "FWD", "RWD", "4WD"];
const MIN_YEARS = ["Any year", "2024", "2023", "2022", "2021", "2020"];
const MAX_PRICES = ["No max", "$25K", "$50K", "$75K", "$100K", "$150K"];
const SORTS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price · Low to High" },
  { value: "price-desc", label: "Price · High to Low" },
  { value: "mileage-asc", label: "Lowest Mileage" },
];

type FieldKey = "make" | "body" | "fuel" | "drivetrain" | "minYear" | "maxPrice" | "sort";

const FIELD_KEYS: FieldKey[] = ["make", "body", "fuel", "drivetrain", "minYear", "maxPrice", "sort"];

export function Filters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const get = (key: string) => searchParams.get(key) ?? "";

  const update = (key: FieldKey, raw: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let value = raw;
    if (key === "maxPrice") value = raw.replace(/[^0-9]/g, "");
    if (
      raw === "" ||
      raw === MAKES[0] ||
      raw === BODIES[0] ||
      raw === FUELS[0] ||
      raw === DRIVES[0] ||
      raw === MIN_YEARS[0] ||
      raw === MAX_PRICES[0]
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/inventory${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const clearAll = () => router.replace("/inventory", { scroll: false });

  const activeCount = FIELD_KEYS.filter((k) => k !== "sort" && searchParams.has(k)).length;

  // Build options for selects with "current value" mapping
  const currentMaxPriceLabel =
    MAX_PRICES.find((p) => p.replace(/[^0-9]/g, "") === get("maxPrice")) ?? MAX_PRICES[0];

  return (
    <>
      {/* Desktop bar */}
      <div className="hidden lg:block border-b border-[hsl(var(--border))] bg-background sticky top-[72px] z-30">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-stretch divide-x divide-[hsl(var(--border))]">
            <FilterCell label="Make">
              <Select value={get("make") || MAKES[0]} onChange={(e) => update("make", e.target.value)} aria-label="Make">
                {MAKES.map((m) => <option key={m} value={m === MAKES[0] ? "" : m}>{m}</option>)}
              </Select>
            </FilterCell>
            <FilterCell label="Body">
              <Select value={get("body") || BODIES[0]} onChange={(e) => update("body", e.target.value)} aria-label="Body">
                {BODIES.map((b) => <option key={b} value={b === BODIES[0] ? "" : b}>{b}</option>)}
              </Select>
            </FilterCell>
            <FilterCell label="Min Year">
              <Select value={get("minYear") || MIN_YEARS[0]} onChange={(e) => update("minYear", e.target.value)} aria-label="Minimum year">
                {MIN_YEARS.map((y) => <option key={y} value={y === MIN_YEARS[0] ? "" : y}>{y}</option>)}
              </Select>
            </FilterCell>
            <FilterCell label="Max Price">
              <Select value={currentMaxPriceLabel} onChange={(e) => update("maxPrice", e.target.value)} aria-label="Max price">
                {MAX_PRICES.map((p) => <option key={p} value={p === MAX_PRICES[0] ? "" : p}>{p}</option>)}
              </Select>
            </FilterCell>
            <FilterCell label="Fuel">
              <Select value={get("fuel") || FUELS[0]} onChange={(e) => update("fuel", e.target.value)} aria-label="Fuel">
                {FUELS.map((f) => <option key={f} value={f === FUELS[0] ? "" : f}>{f}</option>)}
              </Select>
            </FilterCell>
            <FilterCell label="Drivetrain">
              <Select value={get("drivetrain") || DRIVES[0]} onChange={(e) => update("drivetrain", e.target.value)} aria-label="Drivetrain">
                {DRIVES.map((d) => <option key={d} value={d === DRIVES[0] ? "" : d}>{d}</option>)}
              </Select>
            </FilterCell>
            <div className="flex flex-col justify-center px-6 py-3 ml-auto">
              <span className="cap-label text-muted-foreground/60 mb-1">Sort</span>
              <Select value={get("sort") || "newest"} onChange={(e) => update("sort", e.target.value)} aria-label="Sort">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[hsl(var(--border))] py-3">
            <p className="cap-label text-muted-foreground">
              <span className="text-foreground">{resultCount}</span> {resultCount === 1 ? "vehicle" : "vehicles"}
            </p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="bug-cta-underline text-foreground"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile trigger */}
      <div className="lg:hidden sticky top-16 z-30 border-b border-[hsl(var(--border))] bg-background">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3">
          <p className="cap-label text-muted-foreground">
            <span className="text-foreground">{resultCount}</span> vehicles
          </p>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="cap-label inline-flex items-center gap-2 border border-foreground/30 px-4 py-2 hover:border-foreground transition-colors"
          >
            <SlidersHorizontal size={13} aria-hidden /> Filter
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground text-background px-1.5 text-[10px]">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        aria-hidden={!drawerOpen}
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <button type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background border-l border-[hsl(var(--border))] transition-transform duration-300",
            drawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <header className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
            <div>
              <p className="cap-label text-muted-foreground">Refine</p>
              <h2 className="font-display text-2xl mt-1">Filters</h2>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} aria-hidden /> Close
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <DrawerSelect label="Make" value={get("make") || MAKES[0]} options={MAKES} firstIsAny onChange={(v) => update("make", v)} />
            <DrawerSelect label="Body" value={get("body") || BODIES[0]} options={BODIES} firstIsAny onChange={(v) => update("body", v)} />
            <DrawerSelect label="Min Year" value={get("minYear") || MIN_YEARS[0]} options={MIN_YEARS} firstIsAny onChange={(v) => update("minYear", v)} />
            <DrawerSelect label="Max Price" value={currentMaxPriceLabel} options={MAX_PRICES} firstIsAny onChange={(v) => update("maxPrice", v)} />
            <DrawerSelect label="Fuel" value={get("fuel") || FUELS[0]} options={FUELS} firstIsAny onChange={(v) => update("fuel", v)} />
            <DrawerSelect label="Drivetrain" value={get("drivetrain") || DRIVES[0]} options={DRIVES} firstIsAny onChange={(v) => update("drivetrain", v)} />
            <div>
              <span className="cap-label text-muted-foreground/60 mb-2 block">Sort</span>
              <Select value={get("sort") || "newest"} onChange={(e) => update("sort", e.target.value)} aria-label="Sort">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
          </div>
          <footer className="border-t border-[hsl(var(--border))] px-6 py-4 flex items-center justify-between gap-3">
            {activeCount > 0 ? (
              <button type="button" onClick={clearAll} className="bug-cta-underline text-foreground">
                Clear all
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="cap-label rounded-full bg-foreground text-background px-6 py-2"
            >
              Show {resultCount} {resultCount === 1 ? "vehicle" : "vehicles"}
            </button>
          </footer>
        </aside>
      </div>
    </>
  );
}

function FilterCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-1 flex-col justify-center px-6 py-3">
      <span className="cap-label text-muted-foreground/60 mb-1">{label}</span>
      {children}
    </label>
  );
}

function DrawerSelect({
  label,
  value,
  options,
  firstIsAny,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  firstIsAny?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="cap-label text-muted-foreground/60 mb-2 block">{label}</span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o, i) => (
          <option key={o} value={firstIsAny && i === 0 ? "" : o}>{o}</option>
        ))}
      </Select>
    </div>
  );
}
