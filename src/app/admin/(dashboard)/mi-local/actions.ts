"use server";

import { revalidatePath } from "next/cache";
import { requireOwnMarca } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateMiMarca(_prevState: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();

  const { error } = await supabase
    .from("marcas")
    .update({
      descripcion: String(formData.get("descripcion") ?? ""),
      telefonos: String(formData.get("telefonos") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      correo: String(formData.get("correo") ?? ""),
      web: String(formData.get("web") ?? ""),
      tienda_en_linea: String(formData.get("tienda_en_linea") ?? ""),
      instagram: String(formData.get("instagram") ?? ""),
      facebook: String(formData.get("facebook") ?? ""),
    })
    .eq("id", marca.id);

  if (error) return { error: error.message };

  revalidatePath("/admin/mi-local");
  return { ok: true };
}

export async function uploadFotoLocal(formData: FormData) {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selecciona una imagen." };

  const path = `${marca.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("locales").upload(path, file);
  if (uploadError) return { error: uploadError.message };

  const { data: publicUrl } = supabase.storage.from("locales").getPublicUrl(path);

  const { error: insertError } = await supabase.from("fotos_local").insert({
    marca_id: marca.id,
    imagen_url: publicUrl.publicUrl,
  });
  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/mi-local");
  return { ok: true };
}

export async function deleteFotoLocal(id: string, imagenUrl: string) {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();

  // The URL's last two path segments are "<marca_id>/<filename>" — exactly
  // the storage object path, since that's the convention uploadFotoLocal uses.
  const path = imagenUrl.split("/").slice(-2).join("/");
  await supabase.storage.from("locales").remove([path]);

  await supabase.from("fotos_local").delete().eq("id", id).eq("marca_id", marca.id);

  revalidatePath("/admin/mi-local");
}
