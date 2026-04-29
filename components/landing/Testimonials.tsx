const reviews = [
  {
    quote:
      "Bought a fully-loaded GLE here. They handled my trade, my financing, and even shipped my old plates back to me. Wouldn't go anywhere else.",
    name: "Marcus L.",
    city: "Mississauga, ON",
    rating: 5,
  },
  {
    quote:
      "Genuinely the easiest car-buying experience I've had in 20 years. No games, no markup, no surprise fees. Pricing was sharp from the first call.",
    name: "Priya R.",
    city: "Toronto, ON",
    rating: 5,
  },
  {
    quote:
      "Got pre-approved on my phone in a coffee shop, drove home in a 911 the next afternoon. Jack and his team are the real deal.",
    name: "Daniel K.",
    city: "Vaughan, ON",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section aria-labelledby="reviews-heading" className="border-t border-[hsl(var(--border))] bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">In Their Words</p>
            <h2 id="reviews-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              1,800+ five-star reviews.
            </h2>
          </div>
          <p className="cap-label text-muted-foreground">4.9 / 5 · Google · Facebook</p>
        </div>

        <ul className="mt-14 grid gap-px bg-[hsl(var(--border))] sm:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.name} className="flex flex-col bg-background p-8 sm:p-10">
              <span className="font-display text-3xl text-foreground/40 leading-none">"</span>
              <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-foreground">
                {r.quote}
              </blockquote>
              <div className="mt-8 flex items-center justify-between border-t border-[hsl(var(--border))] pt-5">
                <div>
                  <p className="cap-label text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.city}</p>
                </div>
                <div className="cap-label text-muted-foreground">★★★★★</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
