"use client";

import { useActionState } from "react";
import { Field, TextAreaField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { ClasificacionFields } from "./ClasificacionFields";
import { crearPromocion } from "./actions";

export function NuevaPromocionForm() {
  const [state, formAction, pending] = useActionState(crearPromocion, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
      <p className="text-sm font-medium text-zinc-900">Nueva promoción</p>
      <Field id="titulo" label="Título" required />
      <TextAreaField id="descripcion" label="Descripción" required />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="vigente_desde" label="Vigente desde" type="date" required />
        <Field id="vigente_hasta" label="Vigente hasta" type="date" required hint="Máximo 6 meses después del inicio." />
      </div>

      <ClasificacionFields prefijo="loc" />

      <Field id="imagen" label="Fotografía de la promoción" type="file" accept="image/*" />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">Enviada. Queda pendiente de aprobación.</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </form>
  );
}
