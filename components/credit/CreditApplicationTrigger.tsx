"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export const CREDIT_APP_EVENT = "jm:open-credit-app";

export type CreditAppContext = {
  vehicle?: { id?: string; title?: string };
};

export function openCreditApp(context?: CreditAppContext) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CreditAppContext>(CREDIT_APP_EVENT, { detail: context ?? {} }));
}

type Variant = "underline" | "outline" | "primary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = {
  context?: CreditAppContext;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function CreditApplicationTrigger({
  context,
  children,
  variant = "primary",
  size = "md",
  className,
}: Props) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => openCreditApp(context)}
    >
      {children}
    </Button>
  );
}
