"use client";

import { useActionState } from "react";
import { Field } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { crearMarca } from "./actions";

export function NuevaMarcaForm() {
  const [state, formAction, pending] = useActionState(crearMarca, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="w-48"><Field id="nombre" label="Nombre de la marca" required /></div>
      <div className="w-40"><Field id="slug" label="Slug (url)" placeholder="ej. flexi" required /></div>
      <Button type="submit" disabled={pending}>{pending ? "Creando…" : "Agregar marca"}</Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
