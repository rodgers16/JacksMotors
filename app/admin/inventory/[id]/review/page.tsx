import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle, Image as ImageIcon, Pencil } from "lucide-react";
import { getVehicleById } from "@/lib/db/queries";
import { formatMileage, formatPrice } from "@/lib/inventory";
import { PublishBar } from "@/components/admin/PublishBar";

type Params = Promise<{ id: string }>;

export default async function ReviewVehiclePage({ params }: { params: Params }) {
  const { id } = await params;
  const v = await getVehicleById(id).catch(() => null);
  if (!v) notFound();

  // Already published — review page is for drafts. Send to edit instead.
  if (v.status !== "draft") {
    redirect(`/admin/inventory/${id}/edit`);
  }

  const title = `${v.year} ${v.make} ${v.model}`;
  const trimLabel = v.trim ?? "";
  const cover = v.photos[0];
  const price = Math.round(v.priceCents / 100);

  // Lightweight readiness checks the dealer might want flagged
  const checks: { ok: boolean; label: string }[] = [
    { ok: v.photos.length > 0, label: v.photos.length > 0 ? `${v.photos.length} photo${v.photos.length === 1 ? "" : "s"}` : "No photos yet" },
    { ok: !!v.description && v.description.trim().length > 20, label: v.description ? "Walkaround written" : "No walkaround written" },
    { ok: !!v.vin, label: v.vin ? "VIN set" : "No VIN" },
    { ok: !!v.exteriorColor, label: v.exteriorColor ? `Exterior: ${v.exteriorColor}` : "No exterior color" },
  ];

  return (
    <div className="pb-32 sm:pb-28">
      {/* Top bar */}
      <div className="border-b border-[hsl(var(--border))] bg-card">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} aria-hidden /> Inventory
          </Link>
          <Link
            href={`/admin/inventory/${id}/edit`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline sm:hidden"
          >
            <Pencil size={14} aria-hidden /> Edit
          </Link>
        </div>
      </div>

      {/* Draft banner */}
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-[1280px] items-start gap-3 px-4 py-3 sm:items-center sm:px-6 lg:px-8">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertTriangle size={14} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-900">This listing is a draft — not visible to visitors yet</p>
            <p className="mt-0.5 text-xs text-amber-800/80 sm:text-sm">
              Review the preview below the way buyers will see it, then publish when you're ready.
            </p>
          </div>
        </div>
      </div>

      {/* Hero photo */}
      <section>
        <div className="mx-auto max-w-[1280px]">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary sm:aspect-[21/9]">
            {cover ? (
              <Image
                src={cover.url}
                alt={title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                placeholder={cover.blur ? "blur" : "empty"}
                blurDataURL={cover.blur ?? undefined}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon size={28} aria-hidden />
                  <p className="text-sm">No cover photo yet</p>
                  <Link
                    href={`/admin/inventory/${id}/edit`}
                    className="mt-1 text-sm font-medium text-foreground hover:underline"
                  >
                    Add photos →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Title + price */}
      <section className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-12">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {v.year} · {v.body} · {v.drivetrain}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {v.make} {v.model}
            </h1>
            {trimLabel && <p className="mt-3 text-lg text-muted-foreground sm:text-xl">{trimLabel}</p>}

            {v.badges && v.badges.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {v.badges.map((b) => (
                  <li
                    key={b}
                    className="rounded-full border border-foreground/20 bg-card px-3 py-1 text-xs font-medium text-foreground sm:text-sm"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="lg:col-span-4 lg:border-l lg:border-[hsl(var(--border))] lg:pl-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Asking</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {formatPrice(price)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">All-in. No surprise fees.</p>
          </aside>
        </div>
      </section>

      {/* Spec strip */}
      <section className="border-b border-[hsl(var(--border))] bg-card">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-px bg-[hsl(var(--border))] sm:grid-cols-3 lg:grid-cols-6">
            <Spec label="Year"         value={String(v.year)} />
            <Spec label="Mileage"      value={formatMileage(v.mileage)} />
            <Spec label="Body"         value={v.body} />
            <Spec label="Drivetrain"   value={v.drivetrain} />
            <Spec label="Fuel"         value={v.fuel} />
            <Spec label="Transmission" value={v.transmission} />
          </dl>
        </div>
      </section>

      {/* Description (Walkaround) */}
      {v.description && v.description.trim() && (
        <section className="border-b border-[hsl(var(--border))]">
          <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-14">
            <div className="lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Walkaround</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                A few notes from the lot.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {v.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* All photos */}
      {v.photos.length > 1 && (
        <section className="border-b border-[hsl(var(--border))]">
          <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              All photos · {v.photos.length}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {v.photos.map((p) => (
                <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={p.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    placeholder={p.blur ? "blur" : "empty"}
                    blurDataURL={p.blur ?? undefined}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Readiness checks */}
      <section className="border-b border-[hsl(var(--border))] bg-card">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Listing checklist</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {checks.map((c) => (
              <li
                key={c.label}
                className="flex items-center gap-2.5 rounded-lg border border-[hsl(var(--border))] bg-card px-3.5 py-2.5"
              >
                <span
                  className={
                    c.ok
                      ? "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                      : "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white"
                  }
                >
                  {c.ok ? "✓" : "!"}
                </span>
                <span className={c.ok ? "text-sm text-foreground" : "text-sm font-medium text-amber-900"}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PublishBar vehicleId={id} slug={v.slug} title={title} />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-5 sm:px-5 sm:py-6">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/70">{label}</dt>
      <dd className="mt-2 text-base font-semibold text-foreground sm:text-lg">{value}</dd>
    </div>
  );
}
