import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";
import { MarcaEditForm } from "./MarcaEditForm";
import { LocalAsignado } from "./LocalAsignado";
import { NuevaPromocionAdminForm } from "../../promociones/NuevaPromocionAdminForm";
import { eliminarPromocionAdmin } from "../../promociones/actions";

export default async function MarcaDetallePage(props: PageProps<"/admin/marcas/[slug]">) {
  await requireSuperAdmin();
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: marca } = await supabase.from("marcas").select("*").eq("slug", slug).single();
  if (!marca) notFound();

  const [{ data: localesAsignados }, { data: localesDisponibles }, { data: promociones }] = await Promise.all([
    supabase.from("locales").select("id, numero, nivel_id").eq("marca_id", marca.id).order("numero"),
    supabase
      .from("locales")
      .select("id, numero, nivel_id")
      .is("marca_id", null)
      .is("amenidad_id", null) // excluye baños/administración: ya "ocupados" por una amenidad, no están realmente libres
      .order("numero"),
    supabase.from("promociones").select("*").eq("marca_id", marca.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/marcas" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Marcas
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">{marca.nombre}</h1>
        {marca.activa ? <Badge tone="aprobada">Activa</Badge> : <Badge>Inactiva</Badge>}
        {marca.revisar && <Badge tone="pendiente">Revisar datos</Badge>}
      </div>
      <p className="mt-1 text-sm text-zinc-500">/{marca.slug}</p>

      <div className="mt-6 flex flex-col gap-6">
        <MarcaEditForm marca={marca} />

        <LocalAsignado
          marcaId={marca.id}
          localesAsignados={localesAsignados ?? []}
          localesDisponibles={localesDisponibles ?? []}
        />

        <div>
          <p className="mb-3 text-sm font-medium text-zinc-900">Promociones</p>
          <div className="flex flex-col gap-3">
            {(promociones ?? []).map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{p.titulo}</p>
                  <p className="text-xs text-zinc-500">
                    {p.vigente_desde} a {p.vigente_hasta} {p.destacada && "· destacada"}
                  </p>
                </div>
                <Badge tone={p.estado}>{p.estado}</Badge>
                <form action={eliminarPromocionAdmin.bind(null, p.id)}>
                  <Button type="submit" variant="ghost" aria-label="Eliminar">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Button>
                </form>
              </div>
            ))}
            {(promociones ?? []).length === 0 && (
              <p className="text-sm text-zinc-400">Esta marca no tiene promociones todavía.</p>
            )}
          </div>
          <div className="mt-3">
            <NuevaPromocionAdminForm marcaFija={{ id: marca.id, nombre: marca.nombre }} />
          </div>
        </div>
      </div>
    </div>
  );
}
