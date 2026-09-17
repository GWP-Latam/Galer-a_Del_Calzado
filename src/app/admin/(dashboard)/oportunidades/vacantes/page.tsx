import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Field, TextAreaField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";

async function crear(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("vacantes").insert({
    puesto: String(formData.get("puesto")),
    area: String(formData.get("area")),
    tipo: String(formData.get("tipo")),
    descripcion: String(formData.get("descripcion") ?? ""),
  });
  revalidatePath("/admin/oportunidades/vacantes");
}

async function toggleActivo(id: string, activo: boolean) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("vacantes").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/oportunidades/vacantes");
}

async function eliminar(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("vacantes").delete().eq("id", id);
  revalidatePath("/admin/oportunidades/vacantes");
}

export default async function VacantesPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: vacantes } = await supabase.from("vacantes").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Bolsa de trabajo</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Lo que está activo aquí aparece en /oportunidades/empleo del sitio público.
      </p>

      <form action={crear} className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-900">Publicar una vacante</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="puesto" label="Puesto" required />
          <Field id="area" label="Área" required />
          <Field id="tipo" label="Tipo" placeholder="Tiempo completo" required />
        </div>
        <TextAreaField id="descripcion" label="Descripción" />
        <Button type="submit" className="self-start">Publicar</Button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {(vacantes ?? []).map((v) => (
          <div key={v.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">{v.puesto}</p>
              <p className="text-xs text-zinc-500">{v.area} · {v.tipo}</p>
            </div>
            <Badge tone={v.activo ? "aprobada" : "default"}>{v.activo ? "Activa" : "Oculta"}</Badge>
            <form action={toggleActivo.bind(null, v.id, v.activo)}>
              <Button type="submit" variant="secondary">{v.activo ? "Ocultar" : "Publicar"}</Button>
            </form>
            <form action={eliminar.bind(null, v.id)}>
              <Button type="submit" variant="ghost">Eliminar</Button>
            </form>
          </div>
        ))}
        {(vacantes ?? []).length === 0 && <p className="text-sm text-zinc-400">No hay vacantes publicadas.</p>}
      </div>
    </div>
  );
}
