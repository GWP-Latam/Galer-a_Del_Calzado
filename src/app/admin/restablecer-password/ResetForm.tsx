"use client";

import { useActionState } from "react";
import { PasswordField } from "@/components/admin/ui/PasswordField";
import { Button } from "@/components/admin/ui/Button";
import { actualizarPassword } from "./actions";

export function ResetForm() {
  const [state, formAction, pending] = useActionState(actualizarPassword, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <PasswordField id="password" label="Nueva contraseña" autoComplete="new-password" minLength={8} required />
      <PasswordField id="confirmacion" label="Confirma la contraseña" autoComplete="new-password" minLength={8} required />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
