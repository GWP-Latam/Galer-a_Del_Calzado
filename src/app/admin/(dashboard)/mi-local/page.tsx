import { requireOwnMarca } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MiLocalForm } from "./MiLocalForm";
import { FotosManager } from "./FotosManager";

export default async function MiLocalPage() {
  const { marca } = await requireOwnMarca();
  const supabase = await createClient();
  const { data: fotos } = await supabase
    .from("fotos_local")
    .select("*")
    .eq("marca_id", marca.id)
    .order("orden");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Mi local — {marca.nombre}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Esta información aparece en tu ficha del directorio en el sitio público.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <MiLocalForm marca={marca} />
        <FotosManager fotos={fotos ?? []} />
      </div>
    </div>
  );
}
