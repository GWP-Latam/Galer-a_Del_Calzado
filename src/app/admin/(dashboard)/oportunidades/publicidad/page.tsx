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
  await supabase.from("espacios_publicitarios").insert({
    titulo: String(formData.get("titulo")),
    ubicacion: String(formData.get("ubicacion")),
    dimensiones: String(formData.get("dimensiones")),
    descripcion: String(formData.get("descripcion") ?? ""),
  });
  revalidatePath("/admin/oportunidades/publicidad");
}

async function toggleActivo(id: string, activo: boolean) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("espacios_publicitarios").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/oportunidades/publicidad");
}

async function eliminar(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("espacios_publicitarios").delete().eq("id", id);
  revalidatePath("/admin/oportunidades/publicidad");
}

export default async function EspaciosPublicitariosPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: espacios } = await supabase
    .from("espacios_publicitarios")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Espacios publicitarios</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Lo que está activo aquí aparece en /oportunidades/publicidad del sitio público.
      </p>

      <form action={crear} className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-900">Publicar un espacio</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="titulo" label="Título" required />
          <Field id="ubicacion" label="Ubicación" required />
          <Field id="dimensiones" label="Dimensiones" placeholder="1920 × 1080 px" required />
        </div>
        <TextAreaField id="descripcion" label="Descripción" />
        <Button type="submit" className="self-start">Publicar</Button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {(espacios ?? []).map((e) => (
          <div key={e.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">{e.titulo}</p>
              <p className="text-xs text-zinc-500">{e.ubicacion} · {e.dimensiones}</p>
            </div>
            <Badge tone={e.activo ? "aprobada" : "default"}>{e.activo ? "Activo" : "Oculto"}</Badge>
            <form action={toggleActivo.bind(null, e.id, e.activo)}>
              <Button type="submit" variant="secondary">{e.activo ? "Ocultar" : "Publicar"}</Button>
            </form>
            <form action={eliminar.bind(null, e.id)}>
              <Button type="submit" variant="ghost">Eliminar</Button>
            </form>
          </div>
        ))}
        {(espacios ?? []).length === 0 && <p className="text-sm text-zinc-400">No hay espacios publicados.</p>}
      </div>
    </div>
  );
}
