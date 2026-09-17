"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Field } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { signIn } from "./actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field id="email" label="Correo" type="email" autoComplete="email" required />
      <Field id="password" label="Contraseña" type="password" autoComplete="current-password" required />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
