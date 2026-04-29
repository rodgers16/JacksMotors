"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

// ───────────────────────── Buttons ─────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const btnVariants: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/90 active:bg-foreground/80",
  secondary: "bg-card text-foreground border border-[hsl(var(--border))] hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  ghost: "text-foreground hover:bg-secondary",
};

const btnSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

type AdminBtnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">;

export function AdminButton({ variant = "primary", size = "md", className, children, ...rest }: AdminBtnProps) {
  return (
    <button className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

type AdminLinkBtnProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

export function AdminLinkButton({ href, variant = "primary", size = "md", className, children }: AdminLinkBtnProps) {
  return (
    <Link href={href} className={cn(btnBase, btnVariants[variant], btnSizes[size], className)}>
      {children}
    </Link>
  );
}

// ───────────────────────── Form fields ─────────────────────────

const fieldBase =
  "w-full bg-card text-foreground placeholder:text-muted-foreground/70 border border-[hsl(var(--border))] rounded-lg px-4 text-base focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors disabled:opacity-50 disabled:bg-secondary";

export const AdminInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function AdminInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, "h-12", className)} {...props} />;
  }
);

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function AdminTextarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, "py-3 min-h-[120px]", className)} {...props} />;
  }
);

export const AdminSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function AdminSelect({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          fieldBase,
          "h-12 appearance-none pr-10",
          "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22 fill=%22none%22><path d=%22M1 1.5L6 6.5L11 1.5%22 stroke=%22%2364748b%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-no-repeat bg-[right_1rem_center]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

// ───────────────────────── Field wrapper ─────────────────────────

type FieldProps = {
  label: React.ReactNode;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminField({ label, hint, required, error, children, className }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5" aria-hidden>*</span>}
        </span>
        {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      </span>
      {children}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </label>
  );
}

// ───────────────────────── Section card ─────────────────────────

export function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-card border border-[hsl(var(--border))] rounded-2xl p-4 sm:p-6", className)}>
      {(title || description) && (
        <header className="mb-4 sm:mb-5">
          {title && <h2 className="text-base font-semibold text-foreground sm:text-xl">{title}</h2>}
          {description && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

// ───────────────────────── Banner ─────────────────────────

type BannerTone = "info" | "warn" | "danger" | "success";

const bannerTones: Record<BannerTone, string> = {
  info:    "bg-blue-50 border-blue-200 text-blue-900",
  warn:    "bg-amber-50 border-amber-200 text-amber-900",
  danger:  "bg-red-50 border-red-200 text-red-900",
  success: "bg-emerald-50 border-emerald-200 text-emerald-900",
};

export function AdminBanner({
  tone = "info",
  children,
  className,
}: {
  tone?: BannerTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="status" className={cn("border rounded-lg px-4 py-3 text-sm", bannerTones[tone], className)}>
      {children}
    </div>
  );
}

// ───────────────────────── Status pill ─────────────────────────

export function AdminPill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "info" | "warn" | "success" | "danger";
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    neutral: "bg-secondary text-foreground",
    info:    "bg-blue-100 text-blue-800",
    warn:    "bg-amber-100 text-amber-800",
    success: "bg-emerald-100 text-emerald-800",
    danger:  "bg-red-100 text-red-800",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", map[tone])}>
      {children}
    </span>
  );
}
