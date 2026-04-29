const props = [
  {
    n: "01",
    title: "Curated Inventory",
    body: "Every vehicle personally inspected and detailed. No volume games. No surprises.",
  },
  {
    n: "02",
    title: "Financing for Any Credit",
    body: "We work with every major lender — including options for thin or rebuilding credit profiles.",
  },
  {
    n: "03",
    title: "Top-Dollar Trade-Ins",
    body: "Real-time market pricing on your trade. We'll buy your car even if you don't buy ours.",
  },
  {
    n: "04",
    title: "Lifetime Service Support",
    body: "On-site service, courtesy loaners, and a relationship that doesn't end at the keys.",
  },
];

export function ValueProps() {
  return (
    <section aria-labelledby="why-heading" className="border-t border-[hsl(var(--border))] bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow">Why Jacks Motors</p>
            <h2 id="why-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              A different kind of dealership.
            </h2>
            <p className="mt-6 max-w-md text-pretty text-muted-foreground leading-relaxed">
              For twelve years we've sold cars the way we'd want to buy them — slowly,
              honestly, and only the ones worth keeping.
            </p>
          </div>

          <ol className="lg:col-span-7">
            {props.map((p, i) => (
              <li key={p.n} className={`grid grid-cols-[auto_1fr] gap-6 sm:gap-10 py-8 sm:py-10 ${i !== props.length - 1 ? "border-b border-[hsl(var(--border))]" : ""}`}>
                <span className="font-display text-2xl text-muted-foreground/60 leading-none sm:text-3xl">{p.n}</span>
                <div>
                  <h3 className="font-display text-2xl text-foreground leading-tight sm:text-3xl">{p.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
