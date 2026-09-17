"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

/**
 * Crea la cuenta del locatario e invita por correo (Supabase envía el
 * enlace para que el locatario elija su propia contraseña). El trigger
 * handle_new_user (ver migración 0001) crea su fila en profiles a partir
 * de los metadatos que le pasamos aquí.
 */
export async function crearCuentaLocatario(_prevState: { error?: string; ok?: boolean } | undefined, formData: FormData) {
  await requireSuperAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const marcaId = String(formData.get("marca_id") ?? "");
  const nombreCompleto = String(formData.get("nombre_completo") ?? "");

  if (!email || !marcaId) return { error: "Correo y marca son obligatorios." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: "locatario", marca_id: marcaId, nombre_completo: nombreCompleto },
  });

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
