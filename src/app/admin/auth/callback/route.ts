import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * A donde apunta el link del correo de "recuperar contraseña" (y, a futuro,
 * cualquier otro flujo de Supabase Auth basado en un ?code= — confirmación
 * de correo, invitaciones). Intercambia el code por una sesión real
 * (guardada en cookies por el cliente server-side) y de ahí redirige a
 * `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const loginUrl = new URL("/admin/login", origin);
  loginUrl.searchParams.set("error", "El enlace ya expiró o no es válido. Pide uno nuevo.");
  return NextResponse.redirect(loginUrl);
}
