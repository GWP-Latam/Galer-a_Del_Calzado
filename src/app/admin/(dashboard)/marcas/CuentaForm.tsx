"use client";

import { useActionState } from "react";
import { Button } from "@/components/admin/ui/Button";
import { crearCuentaLocatario } from "./actions";

export function CuentaForm({ marcaId }: { marcaId: string }) {
  const [state, formAction, pending] = useActionState(crearCuentaLocatario, undefined);

  if (state?.ok) return <span className="text-xs text-emerald-600">Invitación enviada.</span>;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="marca_id" value={marcaId} />
      <input
        type="email"
        name="email"
        placeholder="correo@locatario.com"
        required
        className="w-48 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs outline-none focus:border-zinc-900"
      />
      <Button type="submit" disabled={pending} className="!px-2.5 !py-1.5 !text-xs">
        {pending ? "…" : "Invitar"}
      </Button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
