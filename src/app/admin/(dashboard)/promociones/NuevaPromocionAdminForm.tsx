"use client";

import { useActionState } from "react";
import { Field, TextAreaField, CheckboxField, SelectField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { crearPromocionComoAdmin } from "./actions";
import type { Marca } from "@/lib/types/database";

const CATEGORIAS: { value: string; label: string }[] = [
  { value: "liquidacion", label: "Liquidación" },
  { value: "descuentos", label: "Descuentos" },
  { value: "rebajas", label: "Rebajas" },
  { value: "deportivo", label: "Deportivo" },
  { value: "lujo", label: "Lujo" },
  { value: "casual", label: "Casual" },
];

export function NuevaPromocionAdminForm({ marcas }: { marcas: Pick<Marca, "id" | "nombre">[] }) {
  const [state, formAction, pending] = useActionState(crearPromocionComoAdmin, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
      <p className="text-sm font-medium text-zinc-900">Subir promoción directamente</p>
      <p className="text-xs text-zinc-500">
        Se publica ya aprobada — para cuando la plaza (no un locatario) sube una promoción propia.
      </p>

      <SelectField id="marca_id" label="Marca" required>
        <option value="" disabled>
          Selecciona una marca
        </option>
        {marcas.map((m) => (
          <option key={m.id} value={m.id}>{m.nombre}</option>
        ))}
      </SelectField>

      <Field id="titulo" label="Título" required />
      <TextAreaField id="descripcion" label="Descripción" required />

      <div className="grid grid-cols-2 gap-4">
        <Field id="vigente_desde" label="Vigente desde" type="date" required />
        <Field id="vigente_hasta" label="Vigente hasta" type="date" required hint="Máximo 6 meses después del inicio." />
      </div>

      <div>
        <span className="text-xs font-medium text-zinc-600">Categorías</span>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {CATEGORIAS.map((c) => (
            <CheckboxField key={c.value} id={`admin-cat-${c.value}`} name="categorias" value={c.value} label={c.label} />
          ))}
        </div>
      </div>

      <Field id="imagen" label="Fotografía de la promoción" type="file" accept="image/*" />
      <CheckboxField id="destacada" label="Destacarla en el inicio del sitio" />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">Publicada.</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Publicando…" : "Publicar promoción"}
      </Button>
    </form>
  );
}
