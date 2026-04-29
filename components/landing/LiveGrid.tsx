import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/site/BrandIcons";
import { site } from "@/lib/site";
import { liveImages } from "@/lib/inventory";

const posts = [
  { id: "p1", caption: "2022 Porsche 911 Carrera S — just in.", likes: 412, comments: 18 },
  { id: "p2", caption: "Detail bay, 6am. The fun never stops.", likes: 287, comments: 9 },
  { id: "p3", caption: "M340i delivered to its third owner today.", likes: 521, comments: 24 },
  { id: "p4", caption: "Trade-in week — the variety this round was wild.", likes: 198, comments: 6 },
  { id: "p5", caption: "Lexus LX 600 Ultra — under 10k km.", likes: 634, comments: 31 },
  { id: "p6", caption: "AMG line GLE on the showroom floor tonight.", likes: 392, comments: 14 },
];

export function LiveGrid() {
  return (
    <section aria-labelledby="live-heading" className="border-t border-[hsl(var(--border))] bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">@jacksmotors</p>
            <h2 id="live-heading" className="font-display mt-4 text-balance text-4xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Jacks Motors live
            </h2>
          </div>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="cap-label group inline-flex items-center gap-3 text-foreground hover:text-muted-foreground self-start sm:self-end"
          >
            <InstagramIcon size={14} aria-hidden />
            <span className="inline-block h-px w-8 bg-foreground transition-all duration-300 group-hover:w-14" aria-hidden />
            Follow on Instagram
          </a>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-px bg-[hsl(var(--border))] sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((p, i) => (
            <li key={p.id} className="group relative aspect-square overflow-hidden bg-card">
              <Image
                src={liveImages[i % liveImages.length]}
                alt={p.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="p-4">
                  <p className="text-xs text-foreground leading-snug line-clamp-2">{p.caption}</p>
                  <div className="mt-3 flex items-center gap-4 cap-label text-foreground">
                    <span className="inline-flex items-center gap-1.5"><Heart size={11} aria-hidden /> {p.likes}</span>
                    <span className="inline-flex items-center gap-1.5"><MessageCircle size={11} aria-hidden /> {p.comments}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
