import "server-only";

/**
 * Trae las reseñas de Galería del Calzado desde la Google Places API (New).
 * Google limita esta respuesta a un máximo de 5 reseñas por lugar — es un
 * límite de su API, no algo que podamos ampliar desde aquí. Para tener más,
 * el equipo de la plaza carga reseñas reales a mano desde /admin/resenas.
 *
 * Requiere GOOGLE_PLACES_API_KEY (proyecto de Google Cloud con la Places API
 * "New" habilitada y facturación activa) y GOOGLE_PLACE_ID (el Place ID de
 * la ficha de Google Business Profile de la plaza).
 */

export type GooglePlaceReview = {
  google_review_id: string;
  autor_nombre: string;
  autor_foto_url: string | null;
  calificacion: number;
  texto: string;
  fecha_resena: string | null;
};

type PlacesApiResponse = {
  reviews?: Array<{
    name: string;
    rating?: number;
    text?: { text?: string };
    originalText?: { text?: string };
    publishTime?: string;
    authorAttribution?: { displayName?: string; photoUri?: string };
  }>;
};

export function isGooglePlacesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);
}

export async function fetchGooglePlaceReviews(): Promise<GooglePlaceReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    throw new Error(
      "Configura GOOGLE_PLACES_API_KEY y GOOGLE_PLACE_ID en las variables de entorno antes de sincronizar.",
    );
  }

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "reviews",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Places API respondió ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as PlacesApiResponse;

  return (data.reviews ?? []).map((review) => ({
    google_review_id: review.name,
    autor_nombre: review.authorAttribution?.displayName ?? "Cliente de Google",
    autor_foto_url: review.authorAttribution?.photoUri ?? null,
    calificacion: Math.round(review.rating ?? 5),
    texto: review.text?.text ?? review.originalText?.text ?? "",
    fecha_resena: review.publishTime ? review.publishTime.slice(0, 10) : null,
  }));
}
