import Link from "next/link";
import { Logo } from "./Logo";
import { InstagramIcon, FacebookIcon, YoutubeIcon } from "./BrandIcons";
import { site } from "@/lib/site";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/inventory", label: "All Inventory" },
      { href: "/inventory?body=suv", label: "SUVs" },
      { href: "/inventory?body=sedan", label: "Sedans" },
      { href: "/inventory?body=coupe", label: "Coupes" },
      { href: "/inventory?body=ev", label: "Electric" },
    ],
  },
  {
    title: "Buy & Sell",
    links: [
      { href: "/financing", label: "Financing" },
      { href: "/trade-in", label: "Trade-In" },
      { href: "/warranty", label: "Warranty" },
      { href: "/service", label: "Service" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-background pt-20 pb-10">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Hand-picked premium pre-owned vehicles. Transparent pricing.
              Financing for every credit story.
            </p>
            <div className="mt-8 grid gap-1 text-sm text-foreground">
              <a href={site.phoneHref} className="hover:text-muted-foreground transition-colors">{site.phone}</a>
              <a href={`mailto:${site.email}`} className="text-muted-foreground hover:text-foreground transition-colors">{site.email}</a>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <a aria-label="Instagram" href={site.social.instagram} className="inline-flex h-10 w-10 items-center justify-center border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <InstagramIcon size={15} />
              </a>
              <a aria-label="Facebook" href={site.social.facebook} className="inline-flex h-10 w-10 items-center justify-center border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <FacebookIcon size={15} />
              </a>
              <a aria-label="YouTube" href={site.social.youtube} className="inline-flex h-10 w-10 items-center justify-center border border-[hsl(var(--border))] text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                <YoutubeIcon size={15} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5 lg:col-start-7">
            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="cap-label text-muted-foreground mb-5">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-foreground hover:text-muted-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 lg:col-start-12 lg:row-start-1">
            <h3 className="cap-label text-muted-foreground mb-5">Visit</h3>
            <p className="text-sm text-foreground">{site.address.street}</p>
            <p className="text-sm text-muted-foreground">
              {site.address.city}, {site.address.region} {site.address.postalCode}
            </p>
            <h3 className="cap-label text-muted-foreground mt-8 mb-3">Hours</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span className="text-foreground">{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 h-px bg-foreground/10" />
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Jacks Motors</p>
          <p>{site.dealerLicense}</p>
        </div>
      </div>
    </footer>
  );
}
