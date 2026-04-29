export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <p className="eyebrow">Coming soon</p>
      <h1 className="font-display mt-3 text-balance text-4xl leading-[0.95] sm:text-6xl">
        Site settings
      </h1>
      <p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
        Edit hours, address, phone number, social links, and dealer license info
        from here. For now these live in <code className="font-mono text-sm text-foreground">lib/site.ts</code>.
      </p>
    </div>
  );
}
