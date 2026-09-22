"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { usuarioAEmail } from "@/lib/auth";

export async function signIn(
  _prevState: { error?: string; email?: string } | undefined,
  formData: FormData,
) {
  const entrada = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!entrada || !password) {
    return { error: "Escribe tu usuario (o correo) y contraseña.", email: entrada };
  }

  const supabase = await createClient();
  // Los locatarios entran con un usuario corto (ej. "flexi"), no un correo
  // real — usuarioAEmail lo traduce a su dirección interna. El super_admin
  // sigue usando su correo real tal cual, sin cambios.
  const { error } = await supabase.auth.signInWithPassword({ email: usuarioAEmail(entrada), password });

  if (error) {
    return { error: "Usuario/correo o contraseña incorrectos.", email: entrada };
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}
