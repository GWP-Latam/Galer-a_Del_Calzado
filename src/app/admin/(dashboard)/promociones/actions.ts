"use server";

import { revalidatePath } from "next/cache";
import { requireOwnMarca, requireProfile, requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PromocionCategoria } from "@/lib/types/database";

const SEIS_MESES_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export async function crearPromocion(_prevState: { error?: string } | undefined, formData: FormData) {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();

  const vigenteDesde = String(formData.get("vigente_desde"));
  const vigenteHasta = String(formData.get("vigente_hasta"));
  const categorias = formData.getAll("categorias") as PromocionCategoria[];
  const file = formData.get("imagen") as File | null;

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

  const { error } = await supabase.from("promociones").insert({
    marca_id: marca.id,
    titulo: String(formData.get("titulo")),
    descripcion: String(formData.get("descripcion")),
    imagen_url: imagenUrl,
    categorias,
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
  const categorias = formData.getAll("categorias") as PromocionCategoria[];
  const file = formData.get("imagen") as File | null;

  if (!marcaId) return { error: "Elige una marca." };
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

  const { error } = await supabase.from("promociones").insert({
    marca_id: marcaId,
    titulo: String(formData.get("titulo")),
    descripcion: String(formData.get("descripcion")),
    imagen_url: imagenUrl,
    categorias,
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
  return { ok: true };
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
