"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreVertical,
  CheckCircle2,
  Clock,
  EyeOff,
  Eye,
  Copy,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Status = "draft" | "available" | "pending" | "sold" | "hidden";
type ActionKey = "available" | "pending" | "sold" | "hidden" | "duplicate" | "delete";

type Props = {
  vehicleId: string;
  slug: string;
  status: Status;
  title: string;
};

export function InventoryRowMenu({ vehicleId, slug, status, title }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<ActionKey | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const busy = pending !== null;

  const setStatus = async (next: ActionKey) => {
    if (busy) return;
    setPending(next);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Status update failed");
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setPending(null);
    }
  };

  const duplicate = async () => {
    if (busy) return;
    setPending("duplicate");
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Duplicate failed");
      const { vehicle } = await res.json();
      setOpen(false);
      router.push(`/admin/inventory/${vehicle.id}/edit`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Duplicate failed");
      setPending(null);
    }
  };

  const remove = async () => {
    if (busy) return;
    if (!window.confirm(`Delete ${title}? This cannot be undone.`)) return;
    setPending("delete");
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
      setPending(null);
    }
  };

  const isPublic = status === "available" || status === "pending";

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Listing actions"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <MoreVertical size={18} aria-hidden />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-60 rounded-xl border border-[hsl(var(--border))] bg-card shadow-lg overflow-hidden"
        >
          {status === "draft" && (
            <MenuLink href={`/admin/inventory/${vehicleId}/review`} icon={<Eye size={15} />}>
              Review &amp; publish
            </MenuLink>
          )}
          <MenuLink href={`/admin/inventory/${vehicleId}/edit`} icon={<Pencil size={15} />}>
            Edit details
          </MenuLink>
          {isPublic && (
            <MenuLink href={`/inventory/${slug}`} icon={<Eye size={15} />} target="_blank">
              View live page
            </MenuLink>
          )}
          <Separator />
          {status !== "available" && (
            <MenuButton
              onClick={() => setStatus("available")}
              icon={<CheckCircle2 size={15} className="text-emerald-600" />}
              loading={pending === "available"}
              loadingLabel="Publishing…"
            >
              Make available
            </MenuButton>
          )}
          {status !== "pending" && (
            <MenuButton
              onClick={() => setStatus("pending")}
              icon={<Clock size={15} className="text-blue-600" />}
              loading={pending === "pending"}
              loadingLabel="Updating…"
            >
              Mark sale pending
            </MenuButton>
          )}
          {status !== "sold" && (
            <MenuButton
              onClick={() => setStatus("sold")}
              icon={<CheckCircle2 size={15} className="text-muted-foreground" />}
              loading={pending === "sold"}
              loadingLabel="Marking sold…"
            >
              Mark as sold
            </MenuButton>
          )}
          {status !== "hidden" && (
            <MenuButton
              onClick={() => setStatus("hidden")}
              icon={<EyeOff size={15} />}
              loading={pending === "hidden"}
              loadingLabel="Hiding…"
            >
              Hide from site
            </MenuButton>
          )}
          <Separator />
          <MenuButton
            onClick={duplicate}
            icon={<Copy size={15} />}
            loading={pending === "duplicate"}
            loadingLabel="Duplicating…"
          >
            Duplicate listing
          </MenuButton>
          <MenuButton
            onClick={remove}
            icon={<Trash2 size={15} />}
            loading={pending === "delete"}
            loadingLabel="Deleting…"
            danger
          >
            Delete listing
          </MenuButton>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  target,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  target?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}

function MenuButton({
  onClick,
  icon,
  children,
  danger,
  loading,
  loadingLabel,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left disabled:opacity-60",
        danger
          ? "text-destructive hover:bg-red-50"
          : "text-foreground hover:bg-secondary"
      )}
    >
      <span className={danger ? "text-destructive" : "text-muted-foreground"}>
        {loading ? <Loader2 size={15} className="animate-spin" aria-hidden /> : icon}
      </span>
      {loading ? loadingLabel ?? "Working…" : children}
    </button>
  );
}

function Separator() {
  return <div className="h-px bg-[hsl(var(--border))]" />;
}
