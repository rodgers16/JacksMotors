import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { listAllSlugsPublic } from "@/lib/db/publicReads";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`,           lastModified: now, changeFrequency: "daily",  priority: 1 },
    { url: `${site.url}/inventory`,  lastModified: now, changeFrequency: "daily",  priority: 0.9 },
    { url: `${site.url}/financing`,  lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${site.url}/trade-in`,   lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${site.url}/warranty`,   lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/service`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/contact`,    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/privacy`,    lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${site.url}/terms`,      lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  const slugs = await listAllSlugsPublic();
  for (const slug of slugs) {
    routes.push({
      url: `${site.url}/inventory/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return routes;
}
