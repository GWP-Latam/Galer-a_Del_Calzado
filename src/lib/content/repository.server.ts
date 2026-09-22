import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Promocion, Resena } from "./types";

/**
 * Extensión server-only de repository.ts para los datos del sitio público
 * que ya no vienen de src/data sino de Supabase (administrados desde
 * /admin): reseñas y promociones. Vive en un archivo aparte (en vez de en
 * repository.ts) porque ese archivo lo importan también componentes
 * cliente (por sus tipos/funciones basadas en JSON), y "server-only"/
 * next/headers no puede llegar a un bundle de cliente.
 *
 * Si Supabase no está configurado o la tabla aún no existe, no rompe el
 * home: devuelve un arreglo vacío y la sección correspondiente no se
 * muestra.
 */
export async function getResenasDestacadas(): Promise<Resena[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("resenas")
      .select("id, fuente, autor_nombre, autor_foto_url, calificacion, texto, fecha_resena")
      .eq("destacada", true)
      .order("orden", { ascending: true });

    if (error || !data) return [];
    return data as Resena[];
  } catch {
    return [];
  }
}

/**
 * RLS en la tabla `promociones` ya limita la lectura anónima a
 * estado="aprobada" y vigente_desde/vigente_hasta abarcando hoy (ver
 * migración 0001) — no hace falta repetir ese filtro aquí. `destacada`
 * primero para que la promoción marcada como tal por el locatario/admin
 * abra el carrusel.
 */
export async function getPromocionesVigentes(): Promise<Promocion[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("promociones")
      .select("id, titulo, descripcion, imagen_url, categorias, vigente_desde, vigente_hasta, destacada, marcas(slug)")
      .order("destacada", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      marca_slug: p.marcas?.slug ?? null,
      categorias: p.categorias,
      demo: false,
      destacada: p.destacada,
      vigente_desde: p.vigente_desde,
      vigente_hasta: p.vigente_hasta,
      imagen: p.imagen_url ?? undefined,
    }));
  } catch {
    return [];
  }
}
