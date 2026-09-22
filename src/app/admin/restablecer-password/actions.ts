"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function actualizarPassword(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const password = String(formData.get("password") ?? "");
  const confirmacion = String(formData.get("confirmacion") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirmacion) {
    return { error: "Las dos contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "No se pudo actualizar — el enlace ya expiró. Pide uno nuevo desde 'Olvidé mi contraseña'." };
  }

  redirect("/admin");
}
