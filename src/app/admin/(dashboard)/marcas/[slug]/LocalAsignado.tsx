"use client";

import { useState, useTransition } from "react";
import { SelectField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { asignarLocal, quitarLocal } from "./actions";

type Local = { id: string; numero: string; nivel_id: string };

export function LocalAsignado({
  marcaId,
  localesAsignados,
  localesDisponibles,
}: {
  marcaId: string;
  localesAsignados: Local[];
  localesDisponibles: Local[];
}) {
  const [pending, startTransition] = useTransition();
  const [seleccion, setSeleccion] = useState(localesDisponibles[0]?.id ?? "");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <p className="text-sm font-medium text-zinc-900">Local en el que se encuentra</p>

      <div className="mt-3 flex flex-col gap-2">
        {localesAsignados.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm">
            <span>
              Local {l.numero} <span className="text-zinc-400">({l.nivel_id})</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => startTransition(() => quitarLocal(l.id))}
              className="!text-xs"
            >
              Quitar
            </Button>
          </div>
        ))}
        {localesAsignados.length === 0 && <p className="text-sm text-zinc-400">No tiene ningún local asignado.</p>}
      </div>

      {localesDisponibles.length > 0 && (
        <div className="mt-4 flex items-end gap-2 border-t border-zinc-100 pt-4">
          <div className="w-48">
            <SelectField
              id="nuevo-local"
              label="Asignar otro local"
              value={seleccion}
              onChange={(e) => setSeleccion(e.target.value)}
            >
              {localesDisponibles.map((l) => (
                <option key={l.id} value={l.id}>
                  Local {l.numero} ({l.nivel_id})
                </option>
              ))}
            </SelectField>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !seleccion}
            onClick={() => startTransition(() => asignarLocal(marcaId, seleccion))}
          >
            Asignar
          </Button>
        </div>
      )}
    </div>
  );
}
