import Image from "next/image";
import { Star } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { getResenasDestacadas } from "@/lib/content/repository.server";

const GOOGLE_REVIEWS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL ??
  "https://www.google.com/search?q=Galer%C3%ADa+del+Calzado+Guadalajara+rese%C3%B1as";

function Stars({ calificacion }: { calificacion: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${calificacion} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          strokeWidth={1.5}
          fill={i < calificacion ? "currentColor" : "none"}
          style={{ color: "var(--accent)" }}
        />
      ))}
    </div>
  );
}

/**
 * Curadas desde /admin/resenas — combina lo que trae la Google Places API
 * (máximo 5, límite de Google, no nuestro) con reseñas reales cargadas a
 * mano por el equipo de la plaza. Si no hay ninguna destacada todavía, la
 * sección no se muestra (no inventamos contenido de relleno para esto).
 */
export async function ReviewsSection() {
  const resenas = await getResenasDestacadas();
  if (resenas.length === 0) return null;

  return (
    <Section tone="paper" id="resenas">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Lo que dicen de nosotros</Eyebrow>
            <h2 className="mt-2 text-3xl md:text-4xl">Reseñas de Google</h2>
          </div>
          <LinkButton href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" variant="secondary">
            Ver todas en Google
          </LinkButton>
        </div>
      </Reveal>

      <Stagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3" stagger={0.08}>
        {resenas.map((resena) => (
          <StaggerItem key={resena.id}>
            <figure className="flex h-full flex-col gap-4 rounded-md border border-line bg-paper p-6 shadow-sm">
              <Stars calificacion={resena.calificacion} />
              <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">
                “{resena.texto}”
              </blockquote>
              <figcaption className="flex items-center gap-3">
                {resena.autor_foto_url ? (
                  <Image
                    src={resena.autor_foto_url}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs font-medium text-ink-soft">
                    {resena.autor_nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-ink">{resena.autor_nombre}</span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
