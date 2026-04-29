"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Loader2, Check, Camera, ArrowLeft, AlertCircle, Search, X, ShieldAlert, Gauge } from "lucide-react";
import {
  vehicleSchema,
  type VehicleInput,
  BODY_VALUES,
  DRIVETRAIN_VALUES,
  FUEL_VALUES,
  TRANSMISSION_VALUES,
  STATUS_VALUES,
} from "@/lib/validation/vehicle";
import { MAKES } from "@/lib/presets/makes";
import { STANDARD_COLORS } from "@/lib/presets/colors";
import { BADGE_PRESETS } from "@/lib/presets/badges";
import { isValidVin, normalizeVin } from "@/lib/vin/validate";
import type { DecodeResult } from "@/lib/vin/decode";
import { PhotoUploader, type Photo } from "./PhotoUploader";
import { VinScanner } from "./VinScanner";
import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminBanner,
} from "./AdminUI";
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

const formatThousands = (n: number | "" | undefined) => {
  if (n === "" || n === undefined || n === null || Number.isNaN(n as number)) return "";
  return new Intl.NumberFormat("en-US").format(n as number);
};

export function VehicleForm({ mode, vehicleId, initial, initialPhotos = [] }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [decoding, setDecoding] = React.useState(false);
  const [decodeMsg, setDecodeMsg] = React.useState<{ tone: "info" | "success" | "warn"; text: string } | null>(null);
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [decodedSummary, setDecodedSummary] = React.useState<{
    title: string;
    details: Array<{ label: string; value: string }>;
    mpg?: { city?: number; highway?: number; combined?: number; annualFuelCost?: number } | null;
    safety?: string[];
    recalls?: Array<{ campaignNumber: string; component?: string; summary?: string }>;
  } | null>(null);
  const [justDetected, setJustDetected] = React.useState(false);
  const [editingVin, setEditingVin] = React.useState(false);
  const [vinFilled, setVinFilled] = React.useState<Set<keyof VehicleInput>>(() => new Set());
  const unlockVinField = React.useCallback((key: keyof VehicleInput) => {
    setVinFilled((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);
  const lastDecodedRef = React.useRef<string>("");
  const lastDetectedVinRef = React.useRef<string>("");

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
      price: initial?.price ?? (undefined as unknown as number),
      mileage: initial?.mileage ?? (undefined as unknown as number),
      description: initial?.description ?? "",
      badges: initial?.badges ?? [],
      carfaxUrl: initial?.carfaxUrl ?? "",
      status: initial?.status ?? "available",
    },
  });

  const vinValue = form.watch("vin") ?? "";
  const badges = form.watch("badges") ?? [];
  const priceValue = form.watch("price");
  const mileageValue = form.watch("mileage");
  const status = form.watch("status");
  const yearValue = form.watch("year");
  const makeValue = form.watch("make");
  const modelValue = form.watch("model");
  const trimValue = form.watch("trim");
  const bodyValue = form.watch("body");
  const drivetrainValue = form.watch("drivetrain");
  const fuelValue = form.watch("fuel");
  const transmissionValue = form.watch("transmission");

  const vinValid = isValidVin(vinValue);

  const decode = React.useCallback(async (vinToDecode?: string) => {
    const vin = normalizeVin(vinToDecode ?? vinValue);
    if (!isValidVin(vin)) {
      setDecodeMsg({ tone: "warn", text: "Enter a valid 17-character VIN to decode." });
      return;
    }
    if (vin === lastDecodedRef.current) return; // already decoded this VIN
    setDecoding(true);
    setDecodeMsg(null);
    try {
      const res = await fetch(`/api/admin/vin/${vin}`);
      type ApiResponse =
        | (DecodeResult & { ok: false })
        | {
            ok: true;
            fields: Extract<DecodeResult, { ok: true }>["fields"];
            mpg?: { city?: number; highway?: number; combined?: number; annualFuelCost?: number } | null;
            recalls?: Array<{ campaignNumber: string; component?: string; summary?: string }>;
          };
      const data: ApiResponse = await res.json();
      if (!data.ok) {
        setDecodedSummary(null);
        setDecodeMsg({ tone: "warn", text: `Couldn't decode this VIN — ${data.reason}. Fill in manually below.` });
        return;
      }
      lastDecodedRef.current = vin;
      const f = data.fields;
      const mpg = data.mpg ?? null;
      const recalls = data.recalls ?? [];

      // Auto-fill the form fields we have inputs for (now includes trim from NHTSA!)
      const formFillable: (keyof VehicleInput)[] = [
        "year", "make", "model", "trim", "body", "fuel", "drivetrain", "transmission",
      ];
      const filled = new Set<keyof VehicleInput>();
      for (const k of formFillable) {
        const v = (f as Record<string, unknown>)[k];
        if (v !== undefined && v !== null) {
          form.setValue(k, v as never, { shouldDirty: true, shouldValidate: true });
          filled.add(k);
        }
      }
      setVinFilled(filled);

      // Build a complete details grid — includes display-only fields too (engine, doors, plant)
      const titleParts = [f.year, f.make, f.model].filter(Boolean);
      const engineParts: string[] = [];
      if (f.displacementL) engineParts.push(`${f.displacementL}L`);
      if (f.cylinders)     engineParts.push(`${f.cylinders}-cyl`);
      const engineStr = engineParts.length ? engineParts.join(" ") : undefined;
      const plantStr = [f.plantCity, f.plantCountry].filter(Boolean).join(", ") || undefined;

      const details: Array<{ label: string; value: string }> = [];
      const push = (label: string, value: string | number | undefined) => {
        if (value !== undefined && value !== null && value !== "") {
          details.push({ label, value: String(value) });
        }
      };
      push("Year", f.year);
      push("Make", f.make);
      push("Model", f.model);
      push("Trim", f.trim);
      push("Series", f.series);
      push("Body", f.body);
      push("Drivetrain", f.drivetrain);
      push("Fuel", f.fuel);
      push("Transmission", f.transmission);
      push("Doors", f.doors);
      push("Engine", engineStr);
      push("Assembled", plantStr);

      // MPG slot in the grid (when EPA returned data)
      if (mpg && (mpg.city || mpg.highway || mpg.combined)) {
        const parts: string[] = [];
        if (mpg.city)    parts.push(`${mpg.city} city`);
        if (mpg.highway) parts.push(`${mpg.highway} hwy`);
        const mpgStr = parts.length ? parts.join(" / ") + " mpg" : `${mpg.combined} mpg`;
        push("MPG", mpgStr);
      }

      if (titleParts.length > 0) {
        setDecodedSummary({
          title: titleParts.join(" "),
          details,
          mpg,
          safety: f.safetyFeatures ?? [],
          recalls,
        });
        setDecodeMsg(null);
      } else {
        setDecodedSummary(null);
        setDecodeMsg({ tone: "warn", text: "VIN decoded but no fields available. Fill in manually." });
      }
      // Light haptic feedback on success
      try { (navigator as Navigator & { vibrate?: (p: number) => void }).vibrate?.(15); } catch {}
    } catch (err) {
      setDecodedSummary(null);
      setDecodeMsg({ tone: "warn", text: err instanceof Error ? err.message : "Decode failed" });
    } finally {
      setDecoding(false);
    }
  }, [form, vinValue]);

  // Auto-decode when 17 valid chars are entered (or pasted)
  React.useEffect(() => {
    const v = normalizeVin(vinValue);
    if (isValidVin(v) && v !== lastDecodedRef.current && !decoding) {
      const isNewVin = lastDetectedVinRef.current !== v;
      let resetAnim: ReturnType<typeof setTimeout> | null = null;
      if (isNewVin) {
        lastDetectedVinRef.current = v;
        setJustDetected(true);
        try { (navigator as Navigator & { vibrate?: (p: number) => void }).vibrate?.(8); } catch {}
        resetAnim = setTimeout(() => setJustDetected(false), 1500);
      }
      // Auto-decode shortly after — give the detect animation a beat to play
      const runDecode = setTimeout(() => { decode(v); }, isNewVin ? 800 : 400);
      return () => {
        if (resetAnim) clearTimeout(resetAnim);
        clearTimeout(runDecode);
      };
    }
    // VIN cleared or partially deleted — drop the detected/decoded state so it can re-trigger
    if (!isValidVin(v)) {
      lastDetectedVinRef.current = "";
      if (decodedSummary) setDecodedSummary(null);
      if (decodeMsg) setDecodeMsg(null);
      setVinFilled((prev) => (prev.size ? new Set() : prev));
    }
  }, [vinValue, decoding, decode, decodedSummary, decodeMsg]);

  const onScanned = (vin: string) => {
    form.setValue("vin", vin, { shouldDirty: true, shouldValidate: true });
    setDecodeMsg({ tone: "info", text: `Scanned ${vin} — decoding…` });
  };

  const toggleBadge = (badge: string) => {
    const next = badges.includes(badge) ? badges.filter((b) => b !== badge) : [...badges, badge];
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
        router.push(`/admin/inventory/${vehicle.id}/edit?created=1`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  });

  // Renders a locked, green "VIN-filled" pill in place of an input. Clicking
  // Change unlocks the field, returning to the normal input/select.
  const renderVinLocked = (key: keyof VehicleInput, value: React.ReactNode) => (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 h-12">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check size={13} strokeWidth={3} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-emerald-950">
        {value || <span className="text-emerald-700/60 italic">—</span>}
      </span>
      <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700/70">
        From VIN
      </span>
      <button
        type="button"
        onClick={() => unlockVinField(key)}
        className="text-xs font-medium text-emerald-800 hover:text-emerald-900 underline underline-offset-4 decoration-emerald-400 hover:decoration-emerald-700"
      >
        Change
      </button>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="pb-32 space-y-5 sm:space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/inventory")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} aria-hidden /> Back to inventory
        </button>
      </div>

      {/* VIN — primary intake. Transforms from input → locked verified card after decode. */}
      <AdminCard
        title="VIN"
        description={
          decodedSummary && !editingVin
            ? "Looks good. Make any final tweaks below, then save."
            : "Scan the door-jamb barcode or type the VIN. We'll auto-fill year, make, model, and more."
        }
      >
        {(justDetected || decoding) && vinValid && !editingVin && !decodedSummary ? (
          // ─── LOADING CARD — input is replaced by a "looking up" state immediately on detection ───
          <div className="admin-pop relative overflow-hidden rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100/50 p-5 sm:p-6">
            <span aria-hidden className="absolute inset-0 admin-shimmer pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="shrink-0">
                <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                  <Loader2 size={26} strokeWidth={2.5} className="animate-spin" aria-hidden />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
                  VIN Detected
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
                  Looking up vehicle…
                </p>
                <p className="mt-2 font-mono text-sm text-blue-800/80 break-all">{vinValue}</p>
                <p className="mt-2 text-xs text-blue-700/80">
                  Checking the NHTSA database. This usually takes a second.
                </p>
              </div>
            </div>
          </div>
        ) : decodedSummary && vinValid && !editingVin ? (
          // ─── VERIFIED CARD VIEW — input is replaced by a confident locked-in state ───
          <div className="admin-pop relative overflow-hidden rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100/50 p-5 sm:p-6">
            {/* Decorative glow blob */}
            <span aria-hidden className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative flex items-start gap-4">
              {/* Big check */}
              <div className="shrink-0">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 admin-pulse-success">
                  <Check size={28} strokeWidth={3} aria-hidden />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  VIN Verified
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-950 sm:text-3xl">
                  {decodedSummary.title}
                </p>
                <p className="mt-2 font-mono text-sm text-emerald-800/80 break-all">
                  {vinValue}
                </p>
              </div>
            </div>

            {decodedSummary.details.length > 0 && (
              <div className="relative mt-5 rounded-xl bg-card/80 border border-emerald-200/70 px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Auto-filled
                  </span>
                  <span className="text-[10px] text-emerald-700/40">·</span>
                  <span className="text-[10px] font-medium text-emerald-700/70">
                    {decodedSummary.details.length} field{decodedSummary.details.length === 1 ? "" : "s"}
                  </span>
                </div>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                  {decodedSummary.details.map((d) => (
                    <div
                      key={d.label}
                      className="min-w-0 flex items-baseline justify-between gap-4 border-b border-emerald-200/40 pb-3 last:border-b-0 last:pb-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-last-child(-n+2)]:pb-0"
                    >
                      <dt className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700/80">
                        {d.label}
                      </dt>
                      <dd className="min-w-0 text-right text-[15px] font-semibold leading-snug text-emerald-950 break-words [overflow-wrap:anywhere]">
                        {d.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Safety / driver-assist features standard on this trim */}
            {decodedSummary.safety && decodedSummary.safety.length > 0 && (
              <div className="relative mt-4 rounded-xl bg-card/80 border border-emerald-200/70 px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Standard safety features
                  </span>
                  <span className="text-[10px] text-emerald-700/40">·</span>
                  <span className="text-[10px] font-medium text-emerald-700/70">
                    {decodedSummary.safety.length}
                  </span>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {decodedSummary.safety.map((feat) => (
                    <li
                      key={feat}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900 ring-1 ring-emerald-200"
                    >
                      <Check size={11} strokeWidth={3} className="text-emerald-600" aria-hidden />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Open recalls — surface prominently if any */}
            {decodedSummary.recalls && decodedSummary.recalls.length > 0 && (
              <div className="relative mt-4 rounded-xl bg-amber-50 border border-amber-300 px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                    <ShieldAlert size={18} aria-hidden strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                      Open Recalls · NHTSA
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-amber-950">
                      {decodedSummary.recalls.length} recall{decodedSummary.recalls.length === 1 ? "" : "s"} reported for this year/make/model
                    </p>
                    <p className="mt-1 text-xs text-amber-800/80">
                      Verify with the manufacturer that this specific VIN has been remedied. Disclose to buyers.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {decodedSummary.recalls.slice(0, 4).map((r) => (
                        <li key={r.campaignNumber} className="text-xs text-amber-900">
                          <span className="font-mono font-semibold">{r.campaignNumber}</span>
                          {r.component && <span> · {r.component}</span>}
                          {r.summary && (
                            <span className="block text-amber-800/80 mt-0.5 line-clamp-2">{r.summary}</span>
                          )}
                        </li>
                      ))}
                      {decodedSummary.recalls.length > 4 && (
                        <li className="text-xs text-amber-700/80">
                          + {decodedSummary.recalls.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="relative mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingVin(true)}
                className="text-sm font-medium text-emerald-800 hover:text-emerald-900 underline underline-offset-4 decoration-emerald-400 hover:decoration-emerald-700 transition-colors"
              >
                Change VIN
              </button>
              <span className="text-emerald-700/50">·</span>
              <button
                type="button"
                onClick={() => {
                  form.setValue("vin", "", { shouldDirty: true });
                  setDecodedSummary(null);
                  setDecodeMsg(null);
                  setEditingVin(false);
                  setVinFilled(new Set());
                  lastDecodedRef.current = "";
                  lastDetectedVinRef.current = "";
                }}
                className="text-sm font-medium text-emerald-800/70 hover:text-emerald-900 underline underline-offset-4 decoration-transparent hover:decoration-emerald-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          // ─── INPUT VIEW — typing, scanning, or before decode ───
          <>
            <AdminField
              label="Vehicle Identification Number"
              hint={`${vinValue.length}/17 characters`}
            >
              <div className="relative">
                <AdminInput
                  {...form.register("vin")}
                  autoFocus={editingVin}
                  placeholder="e.g. 5YJ3E1EA4KF317050"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={17}
                  className={cn(
                    "relative pr-12 font-mono uppercase tracking-wider text-base text-foreground transition-colors",
                    vinValid && !justDetected && "border-emerald-500 text-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/30",
                    justDetected && "border-emerald-500 text-emerald-700 vin-verifying"
                  )}
                />
                {justDetected && <div className="vin-sweep-overlay rounded-lg" aria-hidden />}

                {vinValid ? (
                  <span
                    className={cn(
                      "absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm pointer-events-none z-10",
                      justDetected && "admin-pop"
                    )}
                    aria-label="Valid VIN"
                  >
                    <Check size={15} aria-hidden strokeWidth={3} />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    aria-label="Scan VIN with camera"
                    className="absolute inset-y-0 right-2 my-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
                  >
                    <Camera size={18} aria-hidden />
                  </button>
                )}

                {justDetected && (
                  <div
                    key={`pill-${vinValue}`}
                    className="vin-pill absolute left-1/2 -top-1 z-20 pointer-events-none"
                    aria-hidden
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-emerald-500/40 ring-2 ring-card">
                      <Check size={12} strokeWidth={3} aria-hidden /> VIN Verified
                    </span>
                  </div>
                )}
              </div>
            </AdminField>

            {/* Status feedback below input */}
            <div className="mt-3">
              {decoding ? (
                <div className="admin-pop relative overflow-hidden flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <span className="absolute inset-0 admin-shimmer pointer-events-none" />
                  <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Loader2 size={14} strokeWidth={2.5} aria-hidden className="animate-spin" />
                  </span>
                  <div className="relative">
                    <p className="text-sm font-semibold text-blue-900">Looking up vehicle…</p>
                    <p className="text-xs text-blue-700/80">Checking the VIN database</p>
                  </div>
                </div>
              ) : decodeMsg ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>{decodeMsg.text}</span>
                </div>
              ) : vinValue.length > 0 ? (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{vinValue.length}</span> of 17 characters typed
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Tip: tap the camera icon to scan the door-jamb barcode.
                </div>
              )}
            </div>

            {/* Action row */}
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton type="button" variant="secondary" size="sm" onClick={() => setScannerOpen(true)}>
                <Camera size={15} aria-hidden /> Scan with camera
              </AdminButton>
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => decode()}
                disabled={!vinValid || decoding}
              >
                {decoding ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {decoding ? "Decoding…" : "Decode now"}
              </AdminButton>
              {vinValue.length > 0 && (
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    form.setValue("vin", "", { shouldDirty: true });
                    setDecodedSummary(null);
                    setDecodeMsg(null);
                    setEditingVin(false);
                    setVinFilled(new Set());
                    lastDecodedRef.current = "";
                    lastDetectedVinRef.current = "";
                  }}
                >
                  <X size={14} aria-hidden /> Clear
                </AdminButton>
              )}
            </div>
          </>
        )}
      </AdminCard>

      {/* Vehicle details */}
      <AdminCard title="Vehicle details" description="The basics — fill in or confirm what the VIN decoded.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Year" required error={form.formState.errors.year?.message}>
              {vinFilled.has("year") ? (
                renderVinLocked("year", yearValue)
              ) : (
                <AdminSelect {...form.register("year", { valueAsNumber: true })}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </AdminSelect>
              )}
            </AdminField>
            <AdminField label="Make" required error={form.formState.errors.make?.message}>
              {vinFilled.has("make") ? (
                renderVinLocked("make", makeValue)
              ) : (
                <AdminSelect {...form.register("make")}>
                  {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </AdminSelect>
              )}
            </AdminField>
          </div>
          <AdminField label="Model" required error={form.formState.errors.model?.message}>
            {vinFilled.has("model") ? (
              renderVinLocked("model", modelValue)
            ) : (
              <AdminInput {...form.register("model")} placeholder="e.g. M340i" />
            )}
          </AdminField>
          <AdminField label="Trim" hint="optional — e.g. xDrive, GT, Sport">
            {vinFilled.has("trim") ? (
              renderVinLocked("trim", trimValue)
            ) : (
              <AdminInput {...form.register("trim")} placeholder="e.g. xDrive" />
            )}
          </AdminField>
        </div>
      </AdminCard>

      {/* Specs */}
      <AdminCard title="Specs">
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Body type" required>
            {vinFilled.has("body") ? (
              renderVinLocked("body", bodyValue)
            ) : (
              <AdminSelect {...form.register("body")}>
                {BODY_VALUES.map((b) => <option key={b}>{b}</option>)}
              </AdminSelect>
            )}
          </AdminField>
          <AdminField label="Drivetrain" required>
            {vinFilled.has("drivetrain") ? (
              renderVinLocked("drivetrain", drivetrainValue)
            ) : (
              <AdminSelect {...form.register("drivetrain")}>
                {DRIVETRAIN_VALUES.map((d) => <option key={d}>{d}</option>)}
              </AdminSelect>
            )}
          </AdminField>
          <AdminField label="Fuel" required>
            {vinFilled.has("fuel") ? (
              renderVinLocked("fuel", fuelValue)
            ) : (
              <AdminSelect {...form.register("fuel")}>
                {FUEL_VALUES.map((f) => <option key={f}>{f}</option>)}
              </AdminSelect>
            )}
          </AdminField>
          <AdminField label="Transmission" required>
            {vinFilled.has("transmission") ? (
              renderVinLocked("transmission", transmissionValue)
            ) : (
              <AdminSelect {...form.register("transmission")}>
                {TRANSMISSION_VALUES.map((t) => <option key={t}>{t}</option>)}
              </AdminSelect>
            )}
          </AdminField>
        </div>
      </AdminCard>

      {/* Pricing */}
      <AdminCard title="Pricing" description="Asking price and current odometer reading.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminField
            label="Asking price"
            required
            hint={priceValue && Number(priceValue) > 0 ? `$${formatThousands(Number(priceValue))} USD` : "USD"}
            error={form.formState.errors.price?.message}
          >
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">$</span>
              <AdminInput
                {...form.register("price", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                min={1}
                max={1_000_000}
                step={100}
                placeholder="68500"
                className="pl-8"
              />
            </div>
          </AdminField>
          <AdminField
            label="Mileage"
            required
            hint={mileageValue && Number(mileageValue) > 0 ? `${formatThousands(Number(mileageValue))} mi` : "mi"}
            error={form.formState.errors.mileage?.message}
          >
            <div className="relative">
              <AdminInput
                {...form.register("mileage", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                min={0}
                max={999_999}
                step={100}
                placeholder="18420"
                className="pr-12"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">
                mi
              </span>
            </div>
          </AdminField>
        </div>
      </AdminCard>

      {/* Color */}
      <AdminCard title="Color">
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Exterior" hint="optional">
            <AdminSelect {...form.register("exteriorColor")}>
              <option value="">— select —</option>
              {STANDARD_COLORS.map((c) => <option key={c}>{c}</option>)}
            </AdminSelect>
          </AdminField>
          <AdminField label="Interior" hint="optional">
            <AdminSelect {...form.register("interiorColor")}>
              <option value="">— select —</option>
              {STANDARD_COLORS.map((c) => <option key={c}>{c}</option>)}
            </AdminSelect>
          </AdminField>
        </div>
      </AdminCard>

      {/* Features */}
      <AdminCard title="Features" description="Tap each one this car has. These appear as badges on the listing.">
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
                      "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      on
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                    )}
                  >
                    {on && <Check size={13} className="inline mr-1.5 -mt-0.5" />}
                    {b}
                  </button>
                );
              })}
            </div>
          )}
        />
      </AdminCard>

      {/* Photos */}
      <AdminCard
        title="Photos"
        description={
          mode === "edit"
            ? "Drag to reorder. The first photo is the cover image."
            : "Save the vehicle once, then come back to upload photos."
        }
      >
        {mode === "edit" && vehicleId ? (
          <PhotoUploader vehicleId={vehicleId} initialPhotos={initialPhotos} />
        ) : (
          <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-6 text-center">
            <p className="text-sm text-muted-foreground">Save first, then photos.</p>
          </div>
        )}
      </AdminCard>

      {/* Description */}
      <AdminCard title="Walkaround" description="Anything noteworthy — service history, options, story behind the car. Optional.">
        <div className="space-y-4">
          <AdminField label="Description">
            <AdminTextarea {...form.register("description")} rows={5} placeholder="e.g. One owner, dealer-serviced from new, original window sticker on file…" />
          </AdminField>
          <AdminField label="Carfax / AutoCheck URL" hint="optional" error={form.formState.errors.carfaxUrl?.message}>
            <AdminInput {...form.register("carfaxUrl")} type="url" placeholder="https://…" />
          </AdminField>
        </div>
      </AdminCard>

      {/* Status */}
      <AdminCard title="Visibility" description="When this car shows on the public site.">
        <AdminField label="Status">
          <AdminSelect {...form.register("status")}>
            <option value="available">Available — show on site</option>
            <option value="pending">Pending — show with sale-pending badge</option>
            <option value="sold">Sold — hide from site</option>
            <option value="hidden">Hidden — admin-only</option>
            <option value="draft">Draft — admin-only, not yet ready</option>
          </AdminSelect>
        </AdminField>
        {(status === "available" || status === "pending") && (
          <p className="mt-3 text-sm text-emerald-700 inline-flex items-center gap-1.5">
            <Check size={14} aria-hidden /> This vehicle will be visible to visitors.
          </p>
        )}
      </AdminCard>

      {submitError && (
        <AdminBanner tone="danger">
          <AlertCircle size={16} className="inline mr-1.5 -mt-0.5" />
          {submitError}
        </AdminBanner>
      )}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[hsl(var(--border))] bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push("/admin/inventory")}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
          >
            Cancel
          </button>
          <AdminButton type="submit" disabled={submitting} size="lg" className="min-w-[160px]">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? "Saving…" : mode === "new" ? "Create vehicle" : "Save changes"}
          </AdminButton>
        </div>
      </div>

      <VinScanner open={scannerOpen} onClose={() => setScannerOpen(false)} onResult={onScanned} />
    </form>
  );
}
