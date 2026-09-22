"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { solicitarRecuperacion } from "./actions";

export function RecoverForm() {
  const [state, formAction, pending] = useActionState(solicitarRecuperacion, undefined);

  if (state?.enviado) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-700">
          Si ese correo tiene una cuenta, te enviamos un enlace para restablecer tu contraseña.
          Revisa tu bandeja de entrada (y spam).
        </p>
        <Link href="/admin/login" className="text-sm font-medium text-zinc-900 hover:underline">
          ← Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-500">
        Esto es solo para cuentas con correo real (administración). Si eres locatario y entras con
        un usuario, no tienes correo registrado — pídele a la administración de la plaza que te
        restablezca la contraseña directamente.
      </p>
      <Field id="email" label="Correo" type="email" autoComplete="email" required />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enviando…" : "Enviar enlace de recuperación"}
      </Button>
      <Link href="/admin/login" className="text-center text-xs text-zinc-500 hover:text-zinc-900">
        ← Volver a iniciar sesión
      </Link>
    </form>
  );
}
