import Image from "next/image";
import { Star } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/admin/ui/Badge";
import { NuevaPromocionForm } from "./NuevaPromocionForm";
import { NuevaPromocionAdminForm } from "./NuevaPromocionAdminForm";
import { LocatarioPromoActions, SuperAdminPromoActions } from "./PromoActions";
import type { Marca, Promocion } from "@/lib/types/database";

export default async function PromocionesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  if (profile.role === "super_admin") {
    const [{ data: promos }, { data: marcas }] = await Promise.all([
      supabase.from("promociones").select("*, marcas(nombre)").order("created_at", { ascending: false }),
      supabase.from("marcas").select("id, nombre").order("nombre"),
    ]);

    const pendientes = (promos ?? []).filter((p) => p.estado === "pendiente");
    const revisadas = (promos ?? []).filter((p) => p.estado !== "pendiente");

    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Promociones</h1>
        <p className="mt-1 text-sm text-zinc-500">Sube las tuyas o revisa y aprueba lo que suben los locatarios.</p>

        <section className="mt-6">
          <NuevaPromocionAdminForm marcas={marcas ?? []} />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-700">Por revisar ({pendientes.length})</h2>
          <div className="mt-3 flex flex-col gap-3">
            {pendientes.map((p) => (
              <PromoRow key={p.id} promo={p as Promocion & { marcas: Pick<Marca, "nombre"> }} actions={<SuperAdminPromoActions id={p.id} />} />
            ))}
            {pendientes.length === 0 && <p className="text-sm text-zinc-400">Nada pendiente.</p>}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-700">Revisadas</h2>
          <div className="mt-3 flex flex-col gap-3">
            {revisadas.map((p) => (
              <PromoRow key={p.id} promo={p as Promocion & { marcas: Pick<Marca, "nombre"> }} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // locatario
  const { data: promos } = await supabase
    .from("promociones")
    .select("*")
    .eq("marca_id", profile.marca_id!)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Mis promociones</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Sube tus promociones aquí. Elige una como destacada: es la que puede aparecer en el inicio del
        sitio, sujeta a aprobación.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <NuevaPromocionForm />

        <div className="flex flex-col gap-3">
          {(promos ?? []).map((p) => (
            <PromoRow
              key={p.id}
              promo={p}
              actions={<LocatarioPromoActions id={p.id} destacada={p.destacada} estado={p.estado} />}
            />
          ))}
          {(promos ?? []).length === 0 && <p className="text-sm text-zinc-400">Aún no has subido promociones.</p>}
        </div>
      </div>
    </div>
  );
}

function PromoRow({
  promo,
  actions,
}: {
  promo: Promocion & { marcas?: { nombre: string } };
  actions?: React.ReactNode;
}) {
  const tone = promo.estado;
  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
      {promo.imagen_url ? (
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100">
          <Image src={promo.imagen_url} alt="" fill sizes="80px" className="object-cover" />
        </div>
      ) : (
        <div className="h-14 w-20 shrink-0 rounded-md bg-zinc-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-900">{promo.titulo}</p>
          {promo.destacada && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
        </div>
        <p className="truncate text-xs text-zinc-500">
          {promo.marcas?.nombre && <>{promo.marcas.nombre} · </>}
          {promo.vigente_desde} a {promo.vigente_hasta}
        </p>
      </div>
      <Badge tone={tone}>{promo.estado}</Badge>
      {actions}
    </div>
  );
}
