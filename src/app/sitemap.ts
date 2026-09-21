import type { MetadataRoute } from "next";
import { getMarcas } from "@/lib/content/repository";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://galeriadelcalzado.com.mx";

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/directorio", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/nosotros", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/promociones", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/eventos", priority: 0.5, changeFrequency: "weekly" as const },
  { path: "/preguntas-frecuentes", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/contacto", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/aviso-de-privacidad", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const brandEntries: MetadataRoute.Sitemap = getMarcas().map((marca) => ({
    url: `${SITE_URL}/directorio/${marca.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...brandEntries];
}
