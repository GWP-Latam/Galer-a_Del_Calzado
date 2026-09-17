import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";

async function marcarLeido(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("mensajes_contacto").update({ leido: true }).eq("id", id);
  revalidatePath("/admin/mensajes");
}

const ORIGEN_LABEL: Record<string, string> = {
  contacto: "Contacto",
  oportunidades: "Oportunidades",
  renta: "Renta de locales",
  empleo: "Bolsa de trabajo",
  publicidad: "Espacios publicitarios",
};

export default async function MensajesPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: mensajes } = await supabase
    .from("mensajes_contacto")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Mensajes</h1>
      <p className="mt-1 text-sm text-zinc-500">Lo que llega de todos los formularios del sitio.</p>

      <div className="mt-6 flex flex-col gap-3">
        {(mensajes ?? []).map((m) => (
          <div key={m.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900">{m.nombre}</p>
                  <Badge>{ORIGEN_LABEL[m.origen] ?? m.origen}</Badge>
                  {!m.leido && <Badge tone="pendiente">Nuevo</Badge>}
                </div>
                <p className="text-xs text-zinc-500">
                  {m.correo} {m.telefono && `· ${m.telefono}`} ·{" "}
                  {new Date(m.created_at).toLocaleString("es-MX")}
                </p>
              </div>
              {!m.leido && (
                <form action={marcarLeido.bind(null, m.id)}>
                  <Button type="submit" variant="secondary">Marcar leído</Button>
                </form>
              )}
            </div>
            <p className="mt-3 text-sm text-zinc-700">{m.mensaje}</p>
          </div>
        ))}
        {(mensajes ?? []).length === 0 && <p className="text-sm text-zinc-400">No hay mensajes todavía.</p>}
      </div>
    </div>
  );
}
