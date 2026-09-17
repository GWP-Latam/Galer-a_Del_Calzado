import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CampanaForm } from "./CampanaForm";

export default async function CampanaPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: campana } = await supabase.from("campana").select("*").eq("id", true).single();

  if (!campana) return <p className="text-sm text-red-600">No se encontró la fila de campaña.</p>;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Campaña del inicio</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Si la desactivas o no tiene imagen, la sección desaparece del sitio automáticamente.
      </p>
      <div className="mt-6">
        <CampanaForm campana={campana} />
      </div>
    </div>
  );
}
