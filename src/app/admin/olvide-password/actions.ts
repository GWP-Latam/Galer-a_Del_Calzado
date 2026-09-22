"use server";

import { createClient } from "@/lib/supabase/server";

// Mismo fallback que src/app/layout.tsx (metadataBase) — en local, sin
// NEXT_PUBLIC_SITE_URL, el correo de recuperación apuntará al dominio de
// producción en vez de localhost (no hay forma limpia de saber el origin
// real desde una Server Action).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://galeriadelcalzado.com.mx";

export async function solicitarRecuperacion(
  _prevState: { enviado?: boolean; error?: string } | undefined,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "");
  if (!email) {
    return { error: "Escribe tu correo." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/admin/auth/callback?next=/admin/restablecer-password`,
  });

  // No revelamos si el correo existe o no en el sistema — mismo mensaje
  // siempre, para no dejar enumerar cuentas.
  if (error) {
    console.error("resetPasswordForEmail:", error.message);
  }

  return { enviado: true };
}
