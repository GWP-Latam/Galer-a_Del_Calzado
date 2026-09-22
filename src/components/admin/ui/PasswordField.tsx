"use client";

import { useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";

const base =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-zinc-900";

export function PasswordField({
  label,
  id,
  ...props
}: { label: string } & ComponentPropsWithoutRef<"input"> & { id: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <div className="relative">
        <input id={id} name={id} type={visible ? "text" : "password"} className={base} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-700"
        >
          {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
        </button>
      </div>
    </label>
  );
}
