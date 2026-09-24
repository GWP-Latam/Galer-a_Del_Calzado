"use server";

import { revalidatePath } from "next/cache";
import { requireOwnMarca, requireProfile, requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categoriasLegado, clasificacionDesdeFormulario, type Clasificacion } from "@/lib/promociones/clasificacion";
import type { Database } from "@/lib/types/database";

const SEIS_MESES_MS = 1000 * 60 * 60 * 24 * 30 * 6;

type NuevaPromocion = Database["public"]["Tables"]["promociones"]["Insert"];

/**
 * Guarda los tres ejes de clasificación y, además, la columna vieja
 * `categorias` equivalente. Si la migración 0004 aún no se aplicó (no existen
 * tipo_oferta/publico/calzado), reintenta solo con `categorias` para que subir
 * promociones no se rompa mientras tanto.
 */
async function insertarPromocion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clasificacion: Clasificacion,
  fila: Omit<NuevaPromocion, "categorias" | "tipo_oferta" | "publico" | "calzado">,
) {
  const categorias = categoriasLegado(clasificacion);
  const { error } = await supabase.from("promociones").insert({ ...fila, ...clasificacion, categorias });
  if (error?.code !== "PGRST204") return error;
  return (await supabase.from("promociones").insert({ ...fila, categorias })).error;
}

export async function crearPromocion(_prevState: { error?: string } | undefined, formData: FormData) {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();

  const vigenteDesde = String(formData.get("vigente_desde"));
  const vigenteHasta = String(formData.get("vigente_hasta"));
  const clasificacion = clasificacionDesdeFormulario(formData);
  const file = formData.get("imagen") as File | null;

  if (!clasificacion.tipo_oferta) return { error: "Elige el tipo de oferta." };
  if (new Date(vigenteHasta) <= new Date(vigenteDesde)) {
    return { error: "La fecha final debe ser posterior a la fecha de inicio." };
  }
  if (new Date(vigenteHasta).getTime() - new Date(vigenteDesde).getTime() > SEIS_MESES_MS) {
    return { error: "El periodo no puede ser mayor a 6 meses." };
  }

  let imagenUrl: string | null = null;
  if (file && file.size > 0) {
    const path = `${marca.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("promociones").upload(path, file);
    if (uploadError) return { error: uploadError.message };
    imagenUrl = supabase.storage.from("promociones").getPublicUrl(path).data.publicUrl;
  }

  const { data: userData } = await supabase.auth.getUser();

  const error = await insertarPromocion(supabase, clasificacion, {
    marca_id: marca.id,
    titulo: String(formData.get("titulo")),
    descripcion: String(formData.get("descripcion")),
    imagen_url: imagenUrl,
    vigente_desde: vigenteDesde,
    vigente_hasta: vigenteHasta,
    estado: "pendiente",
    created_by: userData.user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/promociones");
  return { ok: true };
}

export async function crearPromocionComoAdmin(_prevState: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  await requireSuperAdmin();
  const profile = await requireProfile();
  const supabase = await createClient();

  const marcaId = String(formData.get("marca_id") ?? "");
  const vigenteDesde = String(formData.get("vigente_desde"));
  const vigenteHasta = String(formData.get("vigente_hasta"));
  const clasificacion = clasificacionDesdeFormulario(formData);
  const file = formData.get("imagen") as File | null;

  if (!marcaId) return { error: "Elige una marca." };
  if (!clasificacion.tipo_oferta) return { error: "Elige el tipo de oferta." };
  if (new Date(vigenteHasta) <= new Date(vigenteDesde)) {
    return { error: "La fecha final debe ser posterior a la fecha de inicio." };
  }
  if (new Date(vigenteHasta).getTime() - new Date(vigenteDesde).getTime() > SEIS_MESES_MS) {
    return { error: "El periodo no puede ser mayor a 6 meses." };
  }

  let imagenUrl: string | null = null;
  if (file && file.size > 0) {
    const path = `${marcaId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("promociones").upload(path, file);
    if (uploadError) return { error: uploadError.message };
    imagenUrl = supabase.storage.from("promociones").getPublicUrl(path).data.publicUrl;
  }

  const error = await insertarPromocion(supabase, clasificacion, {
    marca_id: marcaId,
    titulo: String(formData.get("titulo")),
    descripcion: String(formData.get("descripcion")),
    imagen_url: imagenUrl,
    vigente_desde: vigenteDesde,
    vigente_hasta: vigenteHasta,
    destacada: formData.get("destacada") === "on",
    estado: "aprobada",
    created_by: profile.id,
    reviewed_by: profile.id,
    reviewed_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/promociones");
  revalidatePath("/admin/marcas");
  revalidatePath("/");
  return { ok: true };
}

export async function eliminarPromocionAdmin(id: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("promociones").delete().eq("id", id);
  revalidatePath("/admin/promociones");
  revalidatePath("/admin/marcas");
  revalidatePath("/");
}

export async function marcarDestacada(id: string) {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();
  await supabase.from("promociones").update({ destacada: true }).eq("id", id).eq("marca_id", marca.id);
  revalidatePath("/admin/promociones");
}

export async function eliminarPromocion(id: string) {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();
  await supabase.from("promociones").delete().eq("id", id).eq("marca_id", marca.id).eq("estado", "pendiente");
  revalidatePath("/admin/promociones");
}

export async function revisarPromocion(id: string, aprobar: boolean) {
  await requireSuperAdmin();
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase
    .from("promociones")
    .update({
      estado: aprobar ? "aprobada" : "rechazada",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/admin/promociones");
}
