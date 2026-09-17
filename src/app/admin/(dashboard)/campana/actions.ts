"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function guardarCampana(_prevState: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const file = formData.get("imagen") as File | null;
  let imagenUrl: string | undefined;

  if (file && file.size > 0) {
    const path = `campana/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("sitio").upload(path, file, { upsert: true });
    if (uploadError) return { error: uploadError.message };
    imagenUrl = supabase.storage.from("sitio").getPublicUrl(path).data.publicUrl;
  }

  const concepto = String(formData.get("concepto") ?? "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("campana")
    .update({
      activa: formData.get("activa") === "on",
      titulo: String(formData.get("titulo") ?? ""),
      subtitulo: String(formData.get("subtitulo") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      concepto,
      cta_label: String(formData.get("cta_label") ?? ""),
      ...(imagenUrl ? { imagen_url: imagenUrl } : {}),
    })
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/admin/campana");
  return { ok: true };
}
