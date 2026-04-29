"use client";

import * as React from "react";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "sent" | "error";

export function TradeInForm({ initialQ = "" }: { initialQ?: string }) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [vin, setVin] = React.useState(initialQ);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [mileage, setMileage] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "trade-in",
          vin,
          name,
          email,
          phone,
          mileage,
          notes,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="border border-[hsl(var(--border))] p-8 sm:p-10">
        <p className="eyebrow">Got it</p>
        <p className="font-display mt-4 text-3xl leading-tight sm:text-4xl">
          We're on it.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Expect a real cash offer within the hour during business hours.
          We'll text and email — keep an eye out.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-[hsl(var(--border))] p-6 sm:p-10">
      <p className="eyebrow">Get My Offer</p>
      <p className="font-display mt-3 text-2xl leading-tight sm:text-3xl">
        60 seconds. Real number.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="ti-vin">VIN or licence plate</Label>
          <Input
            id="ti-vin"
            placeholder="1HGCM82633A123456"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div>
          <Label htmlFor="ti-mileage">Mileage</Label>
          <Input
            id="ti-mileage"
            placeholder="68,500"
            inputMode="numeric"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="ti-name">Your name</Label>
          <Input
            id="ti-name"
            placeholder="First & last"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="ti-email">Email</Label>
          <Input
            id="ti-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </div>
        <div>
          <Label htmlFor="ti-phone">Phone</Label>
          <Input
            id="ti-phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ti-notes">Anything we should know? (optional)</Label>
          <Textarea
            id="ti-notes"
            placeholder="Recent service, modifications, accident history…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="cap-label text-muted-foreground/60">
          Free · 60 seconds · No commitment
        </p>
        <Button
          type="submit"
          size="md"
          variant="primary"
          disabled={status === "submitting"}
          className="sm:px-10"
        >
          {status === "submitting" ? "Sending…" : "Get My Offer"}
        </Button>
      </div>
      {status === "error" && (
        <p className="mt-4 text-xs font-bug-monospace uppercase tracking-widest text-destructive">
          Something went wrong — please try again or call us.
        </p>
      )}
    </form>
  );
}
