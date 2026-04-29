import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "underline" | "outline" | "primary" | "ghost";
type Size = "text" | "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-bug-monospace uppercase tracking-widest text-xs whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] focus-visible:outline-1 focus-visible:outline-foreground focus-visible:outline-offset-4 disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  // Bugatti's signature small CTA — tiny mono underline that snugs closer on hover
  underline:
    "bg-transparent text-current underline underline-offset-[0.3em] hover:underline-offset-[0.2em] p-0",
  // Big hero pill — outline that fills on hover
  outline:
    "border border-foreground/40 text-foreground hover:bg-foreground hover:text-background rounded-full",
  // Filled primary
  primary:
    "bg-foreground text-background hover:bg-foreground/90 rounded-full",
  // Plain text, no decoration
  ghost: "text-foreground hover:text-foreground/70 p-0",
};

const sizes: Record<Size, string> = {
  text: "h-auto p-0",
  sm: "h-9 px-5",
  md: "h-12 px-8",
  lg: "h-14 px-10",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "underline", size, className, children, ...rest } = props;
  // Underline / ghost variants default to "text" size (no padding); pill variants default to md
  const effectiveSize: Size = size ?? (variant === "underline" || variant === "ghost" ? "text" : "md");
  const classes = cn(base, variants[variant], sizes[effectiveSize], className);

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest;
    const isExternal = /^(https?:)?\/\//.test(href) || href.startsWith("tel:") || href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a href={href} className={classes} {...anchorRest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
