"use client";

import { useActionState } from "react";
import { Field, TextAreaField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { updateMiMarca } from "./actions";
import type { Marca } from "@/lib/types/database";

export function MiLocalForm({ marca }: { marca: Marca }) {
  const [state, formAction, pending] = useActionState(updateMiMarca, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
      <TextAreaField id="descripcion" label="Descripción de tu tienda" defaultValue={marca.descripcion} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="telefonos"
          label="Teléfono(s), separados por coma"
          defaultValue={marca.telefonos.join(", ")}
        />
        <Field id="correo" label="Correo" type="email" defaultValue={marca.correo} />
        <Field id="web" label="Sitio web" defaultValue={marca.web} />
        <Field id="tienda_en_linea" label="Tienda en línea (si es distinta)" defaultValue={marca.tienda_en_linea} />
        <Field id="instagram" label="Usuario de Instagram" defaultValue={marca.instagram} />
        <Field id="facebook" label="Usuario de Facebook" defaultValue={marca.facebook} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">Guardado.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
