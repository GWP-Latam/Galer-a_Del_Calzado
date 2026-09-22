"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Field, TextAreaField, CheckboxField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { actualizarMarcaAdmin } from "./actions";
import type { Marca } from "@/lib/types/database";

export function MarcaEditForm({ marca }: { marca: Marca }) {
  const [state, formAction, pending] = useActionState(actualizarMarcaAdmin, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
      <input type="hidden" name="marca_id" value={marca.id} />

      <div className="flex items-center gap-4">
        {marca.logo_url && !marca.logo_generico ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
            <Image src={marca.logo_url} alt="" fill sizes="64px" className="object-contain p-1" />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs text-zinc-400">
            Sin logo
          </div>
        )}
        <div className="flex-1">
          <Field id="logo" label="Reemplazar logo" type="file" accept="image/*" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="nombre" label="Nombre" defaultValue={marca.nombre} required />
        <Field
          id="categorias_producto"
          label="Categorías de producto (separadas por coma)"
          defaultValue={marca.categorias_producto.join(", ")}
        />
      </div>

      <TextAreaField id="descripcion" label="Descripción" defaultValue={marca.descripcion} rows={4} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="telefonos" label="Teléfono(s), separados por coma" defaultValue={marca.telefonos.join(", ")} />
        <Field id="correo" label="Correo" type="email" defaultValue={marca.correo} />
        <Field id="web" label="Sitio web" defaultValue={marca.web} />
        <Field id="tienda_en_linea" label="Tienda en línea (si es distinta)" defaultValue={marca.tienda_en_linea} />
        <Field id="instagram" label="Usuario de Instagram" defaultValue={marca.instagram} />
        <Field id="facebook" label="Usuario de Facebook" defaultValue={marca.facebook} />
      </div>

      <CheckboxField id="activa" label="Marca activa (visible en el sitio público)" defaultChecked={marca.activa} />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-600">Guardado.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
