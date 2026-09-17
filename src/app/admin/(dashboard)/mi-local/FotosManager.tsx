"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { deleteFotoLocal, uploadFotoLocal } from "./actions";
import type { FotoLocal } from "@/lib/types/database";

export function FotosManager({ fotos }: { fotos: FotoLocal[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadFotoLocal(formData);
      if (result?.error) setError(result.error);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-900">Fotos de tu local</p>
        <label className="cursor-pointer">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={pending} />
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-700">
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            {pending ? "Subiendo…" : "Subir foto"}
          </span>
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {fotos.map((foto) => (
          <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-md bg-zinc-100">
            <Image src={foto.imagen_url} alt="" fill sizes="200px" className="object-cover" />
            <Button
              type="button"
              variant="danger"
              className="absolute right-1.5 top-1.5 !p-1.5 opacity-0 group-hover:opacity-100"
              onClick={() => startTransition(() => deleteFotoLocal(foto.id, foto.imagen_url))}
              aria-label="Eliminar foto"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Button>
          </div>
        ))}
        {fotos.length === 0 && <p className="col-span-full text-sm text-zinc-400">Aún no subes fotos.</p>}
      </div>
    </div>
  );
}
