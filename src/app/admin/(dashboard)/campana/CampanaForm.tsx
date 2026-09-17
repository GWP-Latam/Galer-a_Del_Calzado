"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Field, CheckboxField, TextAreaField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { guardarCampana } from "./actions";
import type { Campana } from "@/lib/types/database";

export function CampanaForm({ campana }: { campana: Campana }) {
  const [state, formAction, pending] = useActionState(guardarCampana, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
      <CheckboxField id="activa" label="Mostrar esta campaña en el inicio" defaultChecked={campana.activa} />
      <Field id="titulo" label="Título" defaultValue={campana.titulo} />
      <Field id="subtitulo" label="Subtítulo" defaultValue={campana.subtitulo} />
      <Field
        id="slug"
        label="Slug de la página del artículo (se ve en la URL)"
        defaultValue={campana.slug}
        pattern="[a-z0-9-]+"
        title="Solo minúsculas, números y guiones"
      />
      <TextAreaField
        id="concepto"
        label="Concepto de la campaña (un párrafo por línea, se muestra en la página del artículo)"
        rows={6}
        defaultValue={campana.concepto.join("\n")}
      />
      <Field id="cta_label" label="Texto del botón" defaultValue={campana.cta_label} />

      {campana.imagen_url && (
        <div className="relative h-40 w-full overflow-hidden rounded-md bg-zinc-100">
          <Image src={campana.imagen_url} alt="" fill className="object-cover" />
        </div>
      )}
      <Field id="imagen" label="Reemplazar imagen" type="file" accept="image/*" />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">Guardado.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
