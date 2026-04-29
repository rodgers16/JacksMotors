"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2, Check, Camera } from "lucide-react";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/Field";
import { VinScanner } from "./VinScanner";
import { vehicleSchema, type VehicleInput, BODY_VALUES, DRIVETRAIN_VALUES, FUEL_VALUES, TRANSMISSION_VALUES, STATUS_VALUES } from "@/lib/validation/vehicle";
import { MAKES } from "@/lib/presets/makes";
import { STANDARD_COLORS } from "@/lib/presets/colors";
import { BADGE_PRESETS } from "@/lib/presets/badges";
import { isValidVin } from "@/lib/vin/validate";
import type { DecodeResult } from "@/lib/vin/decode";
import { PhotoUploader, type Photo } from "./PhotoUploader";
import { cn } from "@/lib/cn";

type Props = {
  mode: "new" | "edit";
  vehicleId?: string;
  initial?: Partial<VehicleInput>;
  initialPhotos?: Photo[];
};

const currentYear = new Date().getFullYear();
const YEARS: number[] = [];
for (let y = currentYear + 1; y >= 1990; y--) YEARS.push(y);

export function VehicleForm({ mode, vehicleId, initial, initialPhotos = [] }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [decoding, setDecoding] = React.useState(false);
  const [decodeMsg, setDecodeMsg] = React.useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = React.useState(false);

  const form = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema) as Resolver<VehicleInput>,
    mode: "onTouched",
    defaultValues: {
      vin: initial?.vin ?? "",
      year: initial?.year ?? currentYear,
      make: initial?.make ?? MAKES[0],
      model: initial?.model ?? "",
      trim: initial?.trim ?? "",
      body: initial?.body ?? "Sedan",
      transmission: initial?.transmission ?? "Automatic",
      drivetrain: initial?.drivetrain ?? "AWD",
      fuel: initial?.fuel ?? "Gas",
      exteriorColor: initial?.exteriorColor ?? "",
      interiorColor: initial?.interiorColor ?? "",
      price: initial?.price ?? 0,
      mileage: initial?.mileage ?? 0,
      description: initial?.description ?? "",
      badges: initial?.badges ?? [],
      carfaxUrl: initial?.carfaxUrl ?? "",
      status: initial?.status ?? "available",
    },
  });

  const vinValue = form.watch("vin");
  const badges = form.watch("badges") ?? [];

  const decode = async () => {
    const vin = (vinValue ?? "").toUpperCase().trim();
    if (!isValidVin(vin)) {
      setDecodeMsg("Enter a valid 17-char VIN to decode");
      return;
    }
    setDecoding(true);
    setDecodeMsg(null);
    try {
      const res = await fetch(`/api/admin/vin/${vin}`);
      const data: DecodeResult = await res.json();
      if (!data.ok) {
        setDecodeMsg(data.reason);
        return;
      }
      const f = data.fields;
      const fields: (keyof VehicleInput)[] = ["year", "make", "model", "body", "fuel", "drivetrain", "transmission"];
      const filled: string[] = [];
      for (const k of fields) {
        const v = f[k as keyof typeof f];
        if (v !== undefined) {
          form.setValue(k, v as never, { shouldDirty: true, shouldValidate: true });
          filled.push(k);
        }
      }
      setDecodeMsg(filled.length ? `Filled: ${filled.join(", ")}` : "VIN decoded but no fields available");
    } catch (err) {
      setDecodeMsg(err instanceof Error ? err.message : "Decode failed");
    } finally {
      setDecoding(false);
    }
  };

  const onScanned = (vin: string) => {
    form.setValue("vin", vin, { shouldDirty: true, shouldValidate: true });
    setDecodeMsg(`Scanned ${vin} — tap Decode to auto-fill`);
  };

  const toggleBadge = (badge: string) => {
    const next = badges.includes(badge)
      ? badges.filter((b) => b !== badge)
      : [...badges, badge];
    form.setValue("badges", next, { shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const url = mode === "new" ? "/api/admin/vehicles" : `/api/admin/vehicles/${vehicleId}`;
      const method = mode === "new" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Save failed (${res.status})`);
      }
      const { vehicle } = await res.json();
      if (mode === "new") {
        router.push(`/admin/inventory/${vehicle.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="pb-32 lg:pb-12">
      {/* VIN intake — top of the form, primary action */}
      <Section title="VIN" eyebrow="Scan or type">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <div className="relative">
              <Input
                {...form.register("vin")}
                placeholder="17-character VIN"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={17}
                className="font-mono uppercase tracking-widest pr-12"
              />
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                aria-label="Scan VIN with camera"
                className="absolute right-0 top-0 inline-flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Camera size={16} aria-hidden />
              </button>
            </div>
            <FieldError message={form.formState.errors.vin?.message} />
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="cap-label inline-flex h-12 items-center justify-center gap-2 border border-foreground/30 px-5 hover:border-foreground transition-colors sm:hidden"
          >
            <Camera size={13} aria-hidden /> Scan
          </button>
          <button
            type="button"
            onClick={decode}
            disabled={decoding || !vinValue}
            className="cap-label inline-flex h-12 items-center justify-center gap-2 bg-foreground px-6 text-background hover:bg-foreground/90 disabled:opacity-40 transition-colors"
          >
            {decoding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={13} />}
            {decoding ? "Decoding…" : "Decode VIN"}
          </button>
        </div>
        {decodeMsg && (
          <p className="mt-3 cap-label text-muted-foreground">
            <Check size={11} className="inline mr-1.5" /> {decodeMsg}
          </p>
        )}
      </Section>

      <VinScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onResult={onScanned} />

      {/* Core vehicle */}
      <Section title="Vehicle" eyebrow="Core info">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Year">
            <Select {...form.register("year", { valueAsNumber: true })}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            <FieldError message={form.formState.errors.year?.message} />
          </Field>
          <Field label="Make">
            <Select {...form.register("make")}>
              {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
            <FieldError message={form.formState.errors.make?.message} />
          </Field>
          <Field label="Model">
            <Input {...form.register("model")} placeholder="e.g. M340i" />
            <FieldError message={form.formState.errors.model?.message} />
          </Field>
          <Field label="Trim (optional)">
            <Input {...form.register("trim")} placeholder="e.g. xDrive" />
          </Field>
          <Field label="Body">
            <Select {...form.register("body")}>
              {BODY_VALUES.map((b) => <option key={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Drivetrain">
            <Select {...form.register("drivetrain")}>
              {DRIVETRAIN_VALUES.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Fuel">
            <Select {...form.register("fuel")}>
              {FUEL_VALUES.map((f) => <option key={f}>{f}</option>)}
            </Select>
          </Field>
          <Field label="Transmission">
            <Select {...form.register("transmission")}>
              {TRANSMISSION_VALUES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing & odometer" eyebrow="Numbers">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Asking price (CAD)">
            <Input
              {...form.register("price", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min={1}
              max={1_000_000}
              placeholder="e.g. 68500"
            />
            <FieldError message={form.formState.errors.price?.message} />
          </Field>
          <Field label="Mileage (km)">
            <Input
              {...form.register("mileage", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min={0}
              max={999_999}
              placeholder="e.g. 18420"
            />
            <FieldError message={form.formState.errors.mileage?.message} />
          </Field>
        </div>
      </Section>

      {/* Color */}
      <Section title="Color" eyebrow="Appearance">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Exterior color">
            <Select {...form.register("exteriorColor")}>
              <option value="">— select —</option>
              {STANDARD_COLORS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Interior color">
            <Select {...form.register("interiorColor")}>
              <option value="">— select —</option>
              {STANDARD_COLORS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Features */}
      <Section title="Features" eyebrow="Tap to toggle">
        <Controller
          control={form.control}
          name="badges"
          render={() => (
            <div className="flex flex-wrap gap-2">
              {BADGE_PRESETS.map((b) => {
                const on = badges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBadge(b)}
                    className={cn(
                      "cap-label border px-3 py-2 transition-colors",
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/30 text-foreground hover:border-foreground"
                    )}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          )}
        />
      </Section>

      {/* Description */}
      <Section title="Walkaround" eyebrow="Optional notes">
        <Field label="Description (markdown supported)">
          <Textarea {...form.register("description")} rows={6} placeholder="Anything noteworthy — service history, options, story behind the car…" />
        </Field>
        <Field label="Carfax / AutoCheck URL (optional)">
          <Input {...form.register("carfaxUrl")} type="url" placeholder="https://…" />
          <FieldError message={form.formState.errors.carfaxUrl?.message} />
        </Field>
      </Section>

      {/* Photos — only after first save (vehicle ID needed) */}
      {mode === "edit" && vehicleId ? (
        <Section title="Photos" eyebrow="Drag to reorder · first is the cover">
          <PhotoUploader vehicleId={vehicleId} initialPhotos={initialPhotos} />
        </Section>
      ) : (
        <Section title="Photos" eyebrow="Save first to add photos">
          <p className="text-muted-foreground">
            Save this vehicle once — then come back to upload photos.
          </p>
        </Section>
      )}

      {/* Status */}
      <Section title="Visibility" eyebrow="Where this car shows">
        <Field label="Status">
          <Select {...form.register("status")}>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Available</strong> shows on the public site ·{" "}
          <strong className="text-foreground">Pending</strong> shows with a "Sale Pending" badge ·{" "}
          <strong className="text-foreground">Sold</strong>/<strong className="text-foreground">Hidden</strong>/<strong className="text-foreground">Draft</strong> are admin-only
        </p>
      </Section>

      {submitError && (
        <div role="alert" className="my-6 border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {/* Sticky bottom save bar (mobile-first) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[hsl(var(--border))] bg-background/95 backdrop-blur-md lg:static lg:mt-8 lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-0">
          <button
            type="button"
            onClick={() => history.back()}
            className="cap-label text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="cap-label inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitting ? "Saving…" : mode === "new" ? "Create vehicle" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[hsl(var(--border))] py-8 lg:grid lg:grid-cols-12 lg:gap-10">
      <header className="lg:col-span-4 mb-5 lg:mb-0">
        {eyebrow && <p className="cap-label text-muted-foreground/60 mb-2">{eyebrow}</p>}
        <h2 className="font-display text-xl text-foreground sm:text-2xl">{title}</h2>
      </header>
      <div className="lg:col-span-8">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
