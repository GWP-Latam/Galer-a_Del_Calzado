import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Field, TextAreaField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function crear(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  const titulo = String(formData.get("titulo") ?? "");
  await supabase.from("eventos").insert({
    slug: `${slugify(titulo)}-${Date.now().toString(36)}`,
    titulo,
    descripcion: String(formData.get("descripcion") ?? ""),
    fecha_inicio: String(formData.get("fecha_inicio")),
    fecha_fin: String(formData.get("fecha_fin") || formData.get("fecha_inicio")),
  });
  revalidatePath("/admin/eventos");
}

async function toggleActivo(id: string, activo: boolean) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("eventos").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/eventos");
}

async function eliminar(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("eventos").delete().eq("id", id);
  revalidatePath("/admin/eventos");
}

export default async function EventosPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: eventos } = await supabase
    .from("eventos")
    .select("*")
    .order("fecha_inicio", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Eventos</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Lo que está activo aquí aparece en /eventos y, el más próximo o el más reciente, también en el
        inicio del sitio. Un evento puede durar más de un día: usa fecha de inicio y fin distintas para
        marcar un periodo.
      </p>

      <form action={crear} className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-900">Publicar un evento</p>
        <Field id="titulo" label="Título" required />
        <TextAreaField id="descripcion" label="Descripción" rows={3} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="fecha_inicio" label="Fecha de inicio" type="date" required />
          <Field id="fecha_fin" label="Fecha de fin (déjalo vacío si es de un solo día)" type="date" />
        </div>
        <Button type="submit" className="self-start">Publicar</Button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {(eventos ?? []).map((e) => (
          <div key={e.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="min-w-0 flex-1 basis-40">
              <p className="text-sm font-medium text-zinc-900">{e.titulo}</p>
              <p className="text-xs text-zinc-500">
                {e.fecha_inicio === e.fecha_fin ? e.fecha_inicio : `${e.fecha_inicio} → ${e.fecha_fin}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={e.activo ? "aprobada" : "default"}>{e.activo ? "Activo" : "Oculto"}</Badge>
              <form action={toggleActivo.bind(null, e.id, e.activo)}>
                <Button type="submit" variant="secondary">{e.activo ? "Ocultar" : "Publicar"}</Button>
              </form>
              <form action={eliminar.bind(null, e.id)}>
                <Button type="submit" variant="ghost">Eliminar</Button>
              </form>
            </div>
          </div>
        ))}
        {(eventos ?? []).length === 0 && <p className="text-sm text-zinc-400">No hay eventos publicados.</p>}
      </div>
    </div>
  );
}
