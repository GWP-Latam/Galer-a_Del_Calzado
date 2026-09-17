import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Resena } from "./types";

/**
 * Extensión server-only de repository.ts para el único dato del sitio
 * público que no viene de src/data: las reseñas, administradas desde
 * /admin/resenas (tabla `resenas` en Supabase). Vive en un archivo aparte
 * (en vez de en repository.ts) porque ese archivo lo importan también
 * componentes cliente (por sus tipos/funciones basadas en JSON), y
 * "server-only"/next/headers no puede llegar a un bundle de cliente.
 *
 * Si Supabase no está configurado o la tabla aún no existe, no rompe el
 * home: devuelve un arreglo vacío y la sección de reseñas no se muestra.
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
