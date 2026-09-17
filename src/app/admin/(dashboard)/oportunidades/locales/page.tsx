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
  await supabase.from("locales_renta").insert({
    titulo: String(formData.get("titulo")),
    m2: Number(formData.get("m2")) || null,
    servicios: String(formData.get("servicios") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    descripcion: String(formData.get("descripcion") ?? ""),
  });
  revalidatePath("/admin/oportunidades/locales");
}

async function toggleActivo(id: string, activo: boolean) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("locales_renta").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/oportunidades/locales");
}

async function eliminar(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("locales_renta").delete().eq("id", id);
  revalidatePath("/admin/oportunidades/locales");
}

export default async function LocalesRentaPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: locales } = await supabase.from("locales_renta").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Locales en renta</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Lo que está activo aquí aparece en /oportunidades/locales del sitio público.
      </p>

      <form action={crear} className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-900">Publicar un local</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="titulo" label="Título" required />
          <Field id="m2" label="Metros cuadrados" type="number" />
        </div>
        <Field id="servicios" label="Servicios, separados por coma" placeholder="Luz trifásica, Bodega interior" />
        <TextAreaField id="descripcion" label="Descripción" />
        <Button type="submit" className="self-start">Publicar</Button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {(locales ?? []).map((l) => (
          <div key={l.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">{l.titulo}</p>
              <p className="text-xs text-zinc-500">{l.m2 ? `${l.m2} m² · ` : ""}{l.servicios.join(", ")}</p>
            </div>
            <Badge tone={l.activo ? "aprobada" : "default"}>{l.activo ? "Activo" : "Oculto"}</Badge>
            <form action={toggleActivo.bind(null, l.id, l.activo)}>
              <Button type="submit" variant="secondary">{l.activo ? "Ocultar" : "Publicar"}</Button>
            </form>
            <form action={eliminar.bind(null, l.id)}>
              <Button type="submit" variant="ghost">Eliminar</Button>
            </form>
          </div>
        ))}
        {(locales ?? []).length === 0 && <p className="text-sm text-zinc-400">No hay locales publicados.</p>}
      </div>
    </div>
  );
}
