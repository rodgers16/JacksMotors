"use client";

import * as React from "react";
import { X, ArrowRight, ArrowLeft, ShieldCheck, Check } from "lucide-react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  creditApplicationSchema,
  type CreditApplicationInput,
} from "@/lib/validation/creditApp";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, FieldError } from "@/components/ui/Field";
import { CREDIT_APP_EVENT, type CreditAppContext } from "./CreditApplicationTrigger";
import { cn } from "@/lib/cn";

type Step = 0 | 1 | 2 | 3;

const stepLabels = ["Vehicle", "About you", "Employment", "Review"] as const;

const stepFields: Record<Step, (keyof CreditApplicationInput)[]> = {
  0: ["vehicleId", "vehicleTitle"],
  1: ["firstName", "lastName", "email", "phone", "dob", "street", "city", "region", "postal"],
  2: ["employer", "jobTitle", "monthlyIncome", "monthsAtJob", "housingStatus", "monthlyHousing"],
  3: ["consent"],
};

export function CreditApplication() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const methods = useForm<CreditApplicationInput>({
    resolver: zodResolver(creditApplicationSchema),
    mode: "onTouched",
    defaultValues: {
      vehicleId: "",
      vehicleTitle: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      street: "",
      city: "",
      region: "",
      postal: "",
      employer: "",
      jobTitle: "",
      monthlyIncome: "",
      monthsAtJob: "",
      housingStatus: "rent",
      monthlyHousing: "",
      consent: false as unknown as true,
    },
  });

  React.useEffect(() => {
    const onOpen = (e: Event) => {
      const ctx = (e as CustomEvent<CreditAppContext>).detail;
      if (ctx?.vehicle) {
        methods.setValue("vehicleId", ctx.vehicle.id ?? "");
        methods.setValue("vehicleTitle", ctx.vehicle.title ?? "");
        setStep(1);
      } else {
        setStep(0);
      }
      setSubmitted(false);
      setSubmitError(null);
      setOpen(true);
    };
    window.addEventListener(CREDIT_APP_EVENT, onOpen);
    return () => window.removeEventListener(CREDIT_APP_EVENT, onOpen);
  }, [methods]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const next = async () => {
    const fields = stepFields[step];
    const ok = await methods.trigger(fields);
    if (ok) setStep((s) => Math.min(3, s + 1) as Step);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1) as Step);

  const onSubmit = methods.handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/credit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Submission failed");
      }
      setSubmitted(true);
      methods.reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <FormProvider {...methods}>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="credit-app-heading"
          className={cn(
            "absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-background border-l border-[hsl(var(--border))] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <header className="flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] px-8 py-5">
            <div>
              <p className="cap-label text-muted-foreground">Pre-approval</p>
              <h2 id="credit-app-heading" className="font-display mt-1 text-2xl text-foreground">
                {submitted ? "You're in." : "Get Pre-Approved"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close pre-approval"
              className="cap-label inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} aria-hidden /> Close
            </button>
          </header>

          {!submitted && (
            <ProgressRail step={step} />
          )}

          <div className="flex-1 overflow-y-auto px-8 py-8">
            {submitted ? (
              <SuccessPanel onClose={() => setOpen(false)} />
            ) : (
              <form onSubmit={onSubmit} className="space-y-8">
                {step === 0 && <StepVehicle />}
                {step === 1 && <StepPersonal />}
                {step === 2 && <StepEmployment />}
                {step === 3 && <StepReview submitting={submitting} error={submitError} />}
              </form>
            )}
          </div>

          {!submitted && (
            <footer className="border-t border-[hsl(var(--border))] px-8 py-5 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={prev}
                disabled={step === 0}
              >
                <ArrowLeft size={14} aria-hidden /> Back
              </Button>

              <p className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck size={12} className="text-foreground" aria-hidden />
                Soft pull · No credit impact
              </p>

              {step < 3 ? (
                <Button type="button" size="sm" onClick={next}>
                  Continue <ArrowRight size={14} aria-hidden />
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={onSubmit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              )}
            </footer>
          )}
        </aside>
      </div>
    </FormProvider>
  );
}

function ProgressRail({ step }: { step: Step }) {
  return (
    <div className="px-8 pt-6">
      <ol className="flex items-center gap-2" aria-label="Application steps">
        {stepLabels.map((label, i) => (
          <li key={label} className="flex-1">
            <span
              className={cn(
                "block h-px transition-colors",
                i <= step ? "bg-foreground" : "bg-[hsl(var(--border))]"
              )}
            />
            <span
              className={cn(
                "mt-3 block cap-label",
                i === step ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              {String(i + 1).padStart(2, "0")} · {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StepVehicle() {
  const { register, watch } = useFormContext<CreditApplicationInput>();
  const title = watch("vehicleTitle");
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-2xl text-foreground">Vehicle interest</h3>
        <p className="mt-1 text-sm text-muted-foreground">Optional — helps us tailor your approval.</p>
      </div>
      <div>
        <Label htmlFor="ca-vehicleTitle">Vehicle (year / make / model)</Label>
        <Input
          id="ca-vehicleTitle"
          placeholder="e.g. 2022 Porsche 911 Carrera S"
          {...register("vehicleTitle")}
        />
        {title && <p className="mt-2 text-xs text-muted-foreground">We'll prep the file ahead of your call.</p>}
      </div>
    </div>
  );
}

function StepPersonal() {
  const { register, formState: { errors } } = useFormContext<CreditApplicationInput>();
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-2xl text-foreground">About you</h3>
        <p className="mt-1 text-sm text-muted-foreground">Standard info — nothing leaves Jacks Motors.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ca-firstName">First name</Label>
          <Input id="ca-firstName" autoComplete="given-name" {...register("firstName")} />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div>
          <Label htmlFor="ca-lastName">Last name</Label>
          <Input id="ca-lastName" autoComplete="family-name" {...register("lastName")} />
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ca-email">Email</Label>
          <Input id="ca-email" type="email" autoComplete="email" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="ca-phone">Phone</Label>
          <Input id="ca-phone" type="tel" autoComplete="tel" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="ca-dob">Date of birth</Label>
        <Input id="ca-dob" type="date" autoComplete="bday" {...register("dob")} />
        <FieldError message={errors.dob?.message} />
      </div>
      <div>
        <Label htmlFor="ca-street">Street address</Label>
        <Input id="ca-street" autoComplete="street-address" {...register("street")} />
        <FieldError message={errors.street?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="ca-city">City</Label>
          <Input id="ca-city" autoComplete="address-level2" {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <Label htmlFor="ca-region">Province / State</Label>
          <Input id="ca-region" autoComplete="address-level1" {...register("region")} />
          <FieldError message={errors.region?.message} />
        </div>
        <div>
          <Label htmlFor="ca-postal">Postal / ZIP</Label>
          <Input id="ca-postal" autoComplete="postal-code" {...register("postal")} />
          <FieldError message={errors.postal?.message} />
        </div>
      </div>
    </div>
  );
}

function StepEmployment() {
  const { register, formState: { errors } } = useFormContext<CreditApplicationInput>();
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-2xl text-foreground">Employment & income</h3>
        <p className="mt-1 text-sm text-muted-foreground">Helps lenders match you with the best rate.</p>
      </div>
      <div>
        <Label htmlFor="ca-employer">Employer</Label>
        <Input id="ca-employer" autoComplete="organization" {...register("employer")} />
        <FieldError message={errors.employer?.message} />
      </div>
      <div>
        <Label htmlFor="ca-jobTitle">Job title (optional)</Label>
        <Input id="ca-jobTitle" autoComplete="organization-title" {...register("jobTitle")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ca-monthlyIncome">Monthly income (gross)</Label>
          <Input id="ca-monthlyIncome" inputMode="numeric" placeholder="$" {...register("monthlyIncome")} />
          <FieldError message={errors.monthlyIncome?.message} />
        </div>
        <div>
          <Label htmlFor="ca-monthsAtJob">Months at this job</Label>
          <Input id="ca-monthsAtJob" inputMode="numeric" placeholder="e.g. 24" {...register("monthsAtJob")} />
          <FieldError message={errors.monthsAtJob?.message} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ca-housingStatus">Housing</Label>
          <Select id="ca-housingStatus" {...register("housingStatus")}>
            <option value="own">Own</option>
            <option value="rent">Rent</option>
            <option value="other">Other</option>
          </Select>
          <FieldError message={errors.housingStatus?.message} />
        </div>
        <div>
          <Label htmlFor="ca-monthlyHousing">Monthly housing payment</Label>
          <Input id="ca-monthlyHousing" inputMode="numeric" placeholder="$" {...register("monthlyHousing")} />
          <FieldError message={errors.monthlyHousing?.message} />
        </div>
      </div>
    </div>
  );
}

function StepReview({ submitting, error }: { submitting: boolean; error: string | null }) {
  const { register, getValues, formState: { errors } } = useFormContext<CreditApplicationInput>();
  const v = getValues();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl text-foreground">Review & consent</h3>
        <p className="mt-1 text-sm text-muted-foreground">Final check, then we'll get you a number.</p>
      </div>

      <dl className="grid divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))] text-sm">
        {v.vehicleTitle && (
          <Row label="Vehicle" value={v.vehicleTitle} />
        )}
        <Row label="Name" value={`${v.firstName} ${v.lastName}`} />
        <Row label="Contact" value={`${v.email} · ${v.phone}`} />
        <Row label="Address" value={`${v.street}, ${v.city}, ${v.region} ${v.postal}`} />
        <Row label="Employer" value={`${v.employer}${v.jobTitle ? ` · ${v.jobTitle}` : ""}`} />
        <Row label="Income" value={`$${v.monthlyIncome}/mo · ${v.monthsAtJob} mo at job`} />
        <Row label="Housing" value={`${v.housingStatus} · $${v.monthlyHousing}/mo`} />
      </dl>

      <label className="flex items-start gap-3 border border-[hsl(var(--border))] p-5 text-sm">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(var(--foreground))]" {...register("consent")} />
        <span className="text-muted-foreground leading-relaxed">
          I authorize Jacks Motors to perform a <span className="text-foreground">soft credit inquiry</span> for
          pre-approval purposes. I understand this will <span className="text-foreground">not impact my credit score</span> and
          consent to be contacted about my application.
        </span>
      </label>
      <FieldError message={errors.consent?.message as string | undefined} />

      {error && (
        <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {submitting && (
        <p className="text-sm text-muted-foreground">Submitting your application…</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <dt className="cap-label text-muted-foreground/60 shrink-0 pt-1">{label}</dt>
      <dd className="text-foreground text-right">{value}</dd>
    </div>
  );
}

function SuccessPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center pt-12">
      <span className="inline-flex h-16 w-16 items-center justify-center border border-foreground text-foreground">
        <Check size={24} aria-hidden />
      </span>
      <p className="eyebrow mt-8">Confirmation</p>
      <h3 className="font-display mt-4 text-4xl text-foreground">Application received.</h3>
      <p className="mt-4 max-w-sm text-pretty text-muted-foreground leading-relaxed">
        We'll review and reach out within one business hour during open hours —
        usually faster. Keep an eye on your inbox and phone.
      </p>
      <Button onClick={onClose} variant="primary" className="mt-10">Back to browsing</Button>
    </div>
  );
}
