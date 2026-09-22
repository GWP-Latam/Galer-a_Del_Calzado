"use client";

import { useActionState, useState } from "react";
import { Wand2 } from "lucide-react";
import { PasswordField } from "@/components/admin/ui/PasswordField";
import { Button } from "@/components/admin/ui/Button";
import { generarPassword } from "@/lib/generate-password";
import { restablecerPasswordLocatario } from "./actions";

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(restablecerPasswordLocatario, undefined);

  if (state?.password) {
    return (
      <div className="text-xs text-emerald-700">
        Nueva contraseña: <code className="rounded bg-emerald-50 px-1.5 py-0.5">{state.password}</code>
      </div>
    );
  }

  if (!abierto) {
    return (
      <Button type="button" variant="ghost" className="!text-xs" onClick={() => setAbierto(true)}>
        Restablecer contraseña
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-1.5">
      <input type="hidden" name="user_id" value={userId} />
      <div className="w-36">
        <PasswordField
          id={`reset-${userId}`}
          name="password"
          label="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <Button type="button" variant="ghost" aria-label="Generar contraseña" onClick={() => setPassword(generarPassword())}>
        <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Button>
      <Button type="submit" disabled={pending} className="!px-2.5 !py-1.5 !text-xs">
        {pending ? "…" : "Guardar"}
      </Button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
