"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { usuarioAEmail } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Crea la cuenta del locatario directamente con usuario + contraseña que
 * elige el super_admin — ya no depende de que el locatario tenga (o revise)
 * un correo real. createUser + email_confirm:true no manda ningún correo;
 * el trigger handle_new_user (migración 0001) crea su fila en profiles a
 * partir de los metadatos que le pasamos aquí.
 */
export async function crearCuentaLocatario(
  _prevState: { error?: string; ok?: boolean; usuario?: string; password?: string } | undefined,
  formData: FormData,
) {
  await requireSuperAdmin();

  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const marcaId = String(formData.get("marca_id") ?? "");
  const nombreCompleto = String(formData.get("nombre_completo") ?? "");

  if (!usuario || !/^[a-z0-9._-]+$/.test(usuario)) {
    return { error: "Usuario inválido — solo minúsculas, números, punto, guion o guion bajo." };
  }
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (!marcaId) return { error: "Falta la marca." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: usuarioAEmail(usuario),
    password,
    email_confirm: true,
    user_metadata: { role: "locatario", marca_id: marcaId, nombre_completo: nombreCompleto },
  });

  if (error) return { error: error.message };

  // A propósito, sin revalidatePath: si esta página se refresca sola, la
  // fila de esta marca se movería de "Sin cuenta" a "Con cuenta" y el
  // mensaje con la contraseña recién creada desaparecería antes de que el
  // admin alcance a copiarla. Se actualiza sola la próxima vez que entren
  // a la página.
  return { ok: true, usuario, password };
}

/**
 * El equivalente a "olvidé mi contraseña" pero para locatarios: no tienen
 * correo real donde recibir un link, así que el super_admin les asigna una
 * contraseña nueva directamente y se las da en persona/WhatsApp/etc.
 */
export async function restablecerPasswordLocatario(
  _prevState: { error?: string; password?: string } | undefined,
  formData: FormData,
) {
  await requireSuperAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { error: error.message };

  return { password };
}
