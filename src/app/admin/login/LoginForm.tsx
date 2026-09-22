"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Field } from "@/components/admin/ui/Field";
import { PasswordField } from "@/components/admin/ui/PasswordField";
import { Button } from "@/components/admin/ui/Button";
import { signIn } from "./actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const linkExpirado = searchParams.get("error");
  const [state, formAction, pending] = useActionState(signIn, undefined);
  const error = state?.error ?? (!state ? linkExpirado : null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      {/* defaultValue en vez de dejar que el campo se resetee solo si el
          intento anterior falló — solo la contraseña debería borrarse. */}
      <Field id="email" label="Correo" type="email" autoComplete="email" defaultValue={state?.email} required />
      <PasswordField id="password" label="Contraseña" autoComplete="current-password" required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        <Link href="/admin/olvide-password" className="text-xs text-zinc-500 hover:text-zinc-900">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
