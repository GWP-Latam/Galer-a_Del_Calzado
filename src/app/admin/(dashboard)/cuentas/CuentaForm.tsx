"use client";

import { useActionState, useState } from "react";
import { Wand2 } from "lucide-react";
import { Field } from "@/components/admin/ui/Field";
import { PasswordField } from "@/components/admin/ui/PasswordField";
import { Button } from "@/components/admin/ui/Button";
import { generarPassword } from "@/lib/generate-password";
import { crearCuentaLocatario } from "./actions";

export function CuentaForm({ marcaId, sugerido }: { marcaId: string; sugerido: string }) {
  const [state, formAction, pending] = useActionState(crearCuentaLocatario, undefined);
  const [password, setPassword] = useState("");

  if (state?.ok) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        <p className="font-medium">Cuenta creada — dale estos datos al locatario (no se vuelven a mostrar):</p>
        <p className="mt-1">
          Usuario: <code className="rounded bg-white px-1.5 py-0.5">{state.usuario}</code>
          {" · "}
          Contraseña: <code className="rounded bg-white px-1.5 py-0.5">{state.password}</code>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="marca_id" value={marcaId} />
      <div className="w-32">
        <Field id={`usuario-${marcaId}`} name="usuario" label="Usuario" defaultValue={sugerido} required />
      </div>
      <div className="flex items-end gap-1">
        <div className="w-40">
          <PasswordField
            id={`password-${marcaId}`}
            name="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          aria-label="Generar contraseña"
          onClick={() => setPassword(generarPassword())}
          className="mb-0.5"
        >
          <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Button>
      </div>
      <Button type="submit" disabled={pending} className="!px-2.5 !py-1.5 !text-xs">
        {pending ? "…" : "Crear cuenta"}
      </Button>
      {state?.error && <span className="w-full text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
