"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

/**
 * Cuando un link de recuperación de contraseña de Supabase expira o ya se
 * usó, Supabase ignora nuestro redirectTo y manda al visitante a la "Site
 * URL" del proyecto — hoy eso es la raíz del sitio público — con el error
 * pegado en la query string Y en el hash (#error=...). Sin esto, alguien
 * cae aquí y ve la home normal con basura críptica en la URL, sin ninguna
 * pista de qué pasó ni qué hacer.
 */
export function AuthErrorBanner() {
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search || window.location.hash.replace(/^#/, ""));
    const errorCode = params.get("error_code");
    if (!errorCode) return;

    // Lee window.location (no existe en el primer render del servidor) —
    // caso legítimo de "external state on mount", no un derivado de props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMensaje(
      errorCode === "otp_expired"
        ? "El enlace para restablecer tu contraseña ya expiró o ya se usó."
        : "El enlace ya no es válido.",
    );

    // Limpia la URL para que no se quede pegado el error si recargan o comparten el link.
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  if (!mensaje) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p>
        {mensaje}{" "}
        <Link href="/admin/olvide-password" className="font-medium underline underline-offset-2">
          Pide uno nuevo
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={() => setMensaje(null)}
        aria-label="Cerrar aviso"
        className="text-amber-700 hover:text-amber-900"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
