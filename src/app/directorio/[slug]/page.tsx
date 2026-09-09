import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Globe, MapPin } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";
import { BrandLogo } from "@/components/BrandLogo";
import { BrandActions } from "@/components/directorio/BrandActions";
import { InteractiveMap } from "@/components/directorio/InteractiveMap";
import {
  getLocales,
  getLocalesPorMarca,
  getMarcaBySlug,
  getMarcas,
  getMarcasRelacionadas,
  getNivelById,
  getPlaza,
} from "@/lib/content/repository";

export function generateStaticParams() {
  return getMarcas().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/directorio/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const marca = getMarcaBySlug(slug);
  if (!marca) return {};
  const localesTxt = marca.locales.length ? `Local ${marca.locales.join(", ")}.` : "";
  return {
    title: marca.nombre,
    description: `${marca.nombre} en Galería del Calzado. ${localesTxt} Teléfono, sitio web y ubicación en el mapa interactivo.`,
    openGraph: { title: `${marca.nombre} — Galería del Calzado` },
  };
}

export default async function MarcaPage(props: PageProps<"/directorio/[slug]">) {
  const { slug } = await props.params;
  const marca = getMarcaBySlug(slug);
  if (!marca) notFound();

  const plaza = getPlaza();
  const locales = getLocalesPorMarca(marca.slug);
  const todosLocales = getLocales();
  const relacionadas = getMarcasRelacionadas(marca.slug, 4);
  const nivelesConLocal = [...new Set(locales.map((l) => l.nivel))]
    .map((id) => getNivelById(id))
    .filter((n) => n !== undefined);

  return (
    <Container as="div" className="py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: marca.nombre,
            url: marca.web || undefined,
            telephone: marca.telefonos[0] || undefined,
            email: marca.correo || undefined,
            containedInPlace: {
              "@type": "ShoppingCenter",
              name: plaza.nombre,
              address: plaza.direccion,
            },
          }),
        }}
      />

      <Link href="/directorio" className="text-sm text-ink-soft hover:text-ink">
        ← Volver al directorio
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
        <div className="h-40 w-40 overflow-hidden rounded-md border border-line bg-stone-50 p-4 lg:h-full lg:w-full">
          <BrandLogo marca={marca} />
        </div>

        <div>
          <h1 className="font-display text-3xl md:text-4xl">{marca.nombre}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-ink-soft">
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
            {locales.length
              ? `Local ${locales.map((l) => l.numero).join(", ")}`
              : "Ubicación por confirmar"}
          </p>

          <div className="mt-6">
            <BrandActions marca={marca} />
          </div>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {marca.telefonos.map((tel) => (
              <a key={tel} href={`tel:${tel.replace(/\s+/g, "")}`} className="text-ink-soft hover:text-ink">
                {tel}
              </a>
            ))}
            {marca.correo && (
              <a href={`mailto:${marca.correo}`} className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
                <Mail className="h-4 w-4" strokeWidth={1.75} /> {marca.correo}
              </a>
            )}
            {marca.web && (
              <a href={marca.web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
                <Globe className="h-4 w-4" strokeWidth={1.75} /> {marca.web.replace(/^https?:\/\//, "")}
              </a>
            )}
            {marca.instagram && (
              <a
                href={`https://instagram.com/${marca.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink"
              >
                <InstagramIcon className="h-4 w-4" /> @{marca.instagram}
              </a>
            )}
            {marca.facebook && (
              <a
                href={`https://facebook.com/${marca.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink"
              >
                <FacebookIcon className="h-4 w-4" /> {marca.facebook}
              </a>
            )}
          </div>
        </div>
      </div>

      <section id="ubicacion-local" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl">Dónde encontrarla</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {nivelesConLocal.map((nivel) => (
            <div key={nivel!.id} className="h-[420px]">
              <p className="mb-2 text-sm font-medium text-ink-soft">{nivel!.nombre}</p>
              <div className="h-[380px]">
                <InteractiveMap
                  nivel={nivel!}
                  locales={todosLocales.filter((l) => l.nivel === nivel!.id)}
                  selectedSlug={marca.slug}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {relacionadas.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl">Otras marcas</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relacionadas.map((m) => (
              <Link
                key={m.slug}
                href={`/directorio/${m.slug}`}
                className="flex flex-col items-center gap-2 rounded-md border border-line p-4 text-center hover:border-ink"
              >
                <div className="h-16 w-16 overflow-hidden rounded-sm bg-stone-50 p-2">
                  <BrandLogo marca={m} />
                </div>
                <span className="text-sm">{m.nombre}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
