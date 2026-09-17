import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Field, SelectField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import type { Enums } from "@/lib/types/database";

async function crear(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("amenidades").insert({
    nombre: String(formData.get("nombre")),
    tipo: String(formData.get("tipo")) as Enums<"amenidad_tipo">,
    icono: String(formData.get("icono") || "map-pin"),
    local_numero: String(formData.get("local_numero") ?? ""),
  });
  revalidatePath("/admin/amenidades");
}

async function eliminar(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("amenidades").delete().eq("id", id);
  revalidatePath("/admin/amenidades");
}

export default async function AmenidadesPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: amenidades } = await supabase.from("amenidades").select("*").order("nombre");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Amenidades</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Cafés, salón de belleza, baños y demás servicios que no son marcas de calzado.
      </p>

      <form action={crear} className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="w-48"><Field id="nombre" label="Nombre" required /></div>
        <div className="w-40">
          <SelectField id="tipo" label="Tipo" defaultValue="servicio">
            <option value="servicio">Servicio</option>
            <option value="instalacion">Instalación</option>
          </SelectField>
        </div>
        <div className="w-32"><Field id="local_numero" label="Local" /></div>
        <div className="w-32"><Field id="icono" label="Ícono (lucide)" placeholder="coffee" /></div>
        <Button type="submit">Agregar</Button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {(amenidades ?? []).map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">{a.nombre}</p>
              <p className="text-xs text-zinc-500">Local {a.local_numero}</p>
            </div>
            <Badge>{a.tipo}</Badge>
            <form action={eliminar.bind(null, a.id)}>
              <Button type="submit" variant="ghost">Eliminar</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
