"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function actualizarMarcaAdmin(
  _prevState: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
) {
  await requireSuperAdmin();
  const supabase = await createClient();
  const marcaId = String(formData.get("marca_id") ?? "");

  const file = formData.get("logo") as File | null;
  let logoUrl: string | undefined;
  if (file && file.size > 0) {
    const path = `${marcaId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("sitio").upload(path, file, { upsert: true });
    if (uploadError) return { error: uploadError.message };
    logoUrl = supabase.storage.from("sitio").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("marcas")
    .update({
      nombre: String(formData.get("nombre") ?? ""),
      descripcion: String(formData.get("descripcion") ?? ""),
      categorias_producto: String(formData.get("categorias_producto") ?? "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      telefonos: String(formData.get("telefonos") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      correo: String(formData.get("correo") ?? ""),
      web: String(formData.get("web") ?? ""),
      tienda_en_linea: String(formData.get("tienda_en_linea") ?? ""),
      instagram: String(formData.get("instagram") ?? ""),
      facebook: String(formData.get("facebook") ?? ""),
      activa: formData.get("activa") === "on",
      ...(logoUrl ? { logo_url: logoUrl, logo_generico: false } : {}),
    })
    .eq("id", marcaId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/marcas`);
  return { ok: true };
}

export async function asignarLocal(marcaId: string, localId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("locales").update({ marca_id: marcaId, estado: "ocupado" }).eq("id", localId);
  revalidatePath(`/admin/marcas`);
}

export async function quitarLocal(localId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("locales").update({ marca_id: null, estado: "disponible" }).eq("id", localId);
  revalidatePath(`/admin/marcas`);
}
