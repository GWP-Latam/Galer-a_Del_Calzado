"use client";

import { useTransition } from "react";
import { Check, X, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { eliminarPromocion, marcarDestacada, revisarPromocion } from "./actions";

export function LocatarioPromoActions({ id, destacada, estado }: { id: string; destacada: boolean; estado: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {!destacada && (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => startTransition(() => marcarDestacada(id))}
        >
          <Star className="h-3.5 w-3.5" strokeWidth={1.75} /> Destacar
        </Button>
      )}
      {estado === "pendiente" && (
        <Button variant="ghost" disabled={pending} onClick={() => startTransition(() => eliminarPromocion(id))}>
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Eliminar
        </Button>
      )}
    </div>
  );
}

export function SuperAdminPromoActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button variant="primary" disabled={pending} onClick={() => startTransition(() => revisarPromocion(id, true))}>
        <Check className="h-3.5 w-3.5" strokeWidth={1.75} /> Aprobar
      </Button>
      <Button variant="danger" disabled={pending} onClick={() => startTransition(() => revisarPromocion(id, false))}>
        <X className="h-3.5 w-3.5" strokeWidth={1.75} /> Rechazar
      </Button>
    </div>
  );
}
