"use client";

import * as React from "react";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "sent" | "error";

const intents = [
  { value: "general", label: "General question" },
  { value: "test-drive", label: "Book a test drive" },
  { value: "trade-in", label: "Trade-in appraisal" },
  { value: "financing", label: "Financing question" },
  { value: "service", label: "Service appointment" },
];

export function ContactForm({
  initialIntent = "general",
  initialVehicle = "",
}: {
  initialIntent?: string;
  initialVehicle?: string;
}) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [intent, setIntent] = React.useState(initialIntent);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [vehicle, setVehicle] = React.useState(initialVehicle);
  const [message, setMessage] = React.useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, name, email, phone, vehicle, message }),
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
        <p className="eyebrow">Sent</p>
        <p className="font-display mt-4 text-3xl leading-tight sm:text-4xl">
          Thanks — talk soon.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Most messages get a real reply within an hour during business hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-[hsl(var(--border))] p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="ct-intent">I'm reaching out about</Label>
          <Select
            id="ct-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
          >
            {intents.map((i) => (
              <option key={i.value} value={i.value} className="bg-background">
                {i.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="ct-name">Your name</Label>
          <Input
            id="ct-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="ct-phone">Phone</Label>
          <Input
            id="ct-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ct-email">Email</Label>
          <Input
            id="ct-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ct-vehicle">Vehicle of interest (optional)</Label>
          <Input
            id="ct-vehicle"
            placeholder="e.g. 2021 Audi Q5 — stock #A1234"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ct-message">Message</Label>
          <Textarea
            id="ct-message"
            placeholder="Tell us a bit about what you're looking for…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="cap-label text-muted-foreground/60">
          We never share your info. Reply within an hour.
        </p>
        <Button
          type="submit"
          size="md"
          variant="primary"
          disabled={status === "submitting"}
          className="sm:px-10"
        >
          {status === "submitting" ? "Sending…" : "Send Message"}
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
