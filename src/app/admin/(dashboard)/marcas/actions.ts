"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function crearMarca(_prevState: { error?: string } | undefined, formData: FormData) {
  await requireSuperAdmin();
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!nombre || !slug) return { error: "Nombre y slug son obligatorios." };

  const { error } = await supabase.from("marcas").insert({ nombre, slug });
  if (error) return { error: error.message };

  revalidatePath("/admin/marcas");
  return { ok: true };
}

export async function actualizarMarca(id: string, campos: { activa?: boolean; revisar?: boolean }) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("marcas").update(campos).eq("id", id);
  revalidatePath("/admin/marcas");
}
