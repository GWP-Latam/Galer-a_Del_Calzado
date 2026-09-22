import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getLocales, getMarcas, getNiveles } from "@/lib/content/repository";
import { Badge } from "@/components/admin/ui/Badge";
import { NuevaMarcaForm } from "./NuevaMarcaForm";
import { AdminDirectorioMap } from "./AdminDirectorioMap";

export default async function MarcasPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const [{ data: marcasSupabase }, { data: profiles }, niveles, locales] = await Promise.all([
    supabase.from("marcas").select("id, slug, activa, revisar"),
    supabase.from("profiles").select("marca_id").eq("role", "locatario"),
    Promise.resolve(getNiveles()),
    Promise.resolve(getLocales()),
  ]);

  const estadoPorSlug = new Map((marcasSupabase ?? []).map((m) => [m.slug, m]));
  const marcaIdPorSlug = new Map((marcasSupabase ?? []).map((m) => [m.slug, m.id]));
  const marcasConCuenta = new Set((profiles ?? []).map((p) => p.marca_id));
  const marcasJson = getMarcas();
  const marcaNombrePorSlug = new Map(marcasJson.map((m) => [m.slug, m.nombre]));

  // Organizado por local (número), no alfabético — así se ve la plaza como
  // realmente está distribuida, nivel por nivel.
  const localesConMarca = locales
    .filter((l) => l.marca_slug)
    .sort((a, b) => a.numero.localeCompare(b.numero, "es", { numeric: true }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Marcas y locales</h1>
      <p className="mt-1 text-sm text-zinc-500">
        El directorio completo de la plaza, organizado por local. Haz clic en una marca (de la
        lista o del mapa) para editar todos sus datos — descripción, redes, logo, local y
        promociones. Para crear usuarios y contraseñas de locatarios, ve a{" "}
        <Link href="/admin/cuentas" className="underline">Cuentas</Link>.
      </p>

      <div className="mt-6">
        <NuevaMarcaForm />
      </div>

      <div className="mt-6">
        <AdminDirectorioMap niveles={niveles} locales={locales} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Local</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Cuenta</th>
            </tr>
          </thead>
          <tbody>
            {localesConMarca.map((local) => {
              const slug = local.marca_slug!;
              const estado = estadoPorSlug.get(slug);
              const marcaId = marcaIdPorSlug.get(slug);
              const nombre = marcaNombrePorSlug.get(slug) ?? slug;
              return (
                <tr key={local.id_interno} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-500">
                    {local.numero} <span className="text-zinc-300">· {local.nivel}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    <Link href={`/admin/marcas/${slug}`} className="hover:underline">
                      {nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {!estado ? (
                      <Badge>Sin registrar en Supabase</Badge>
                    ) : (
                      <>
                        {estado.activa ? <Badge tone="aprobada">Activa</Badge> : <Badge>Inactiva</Badge>}
                        {estado.revisar && <Badge tone="pendiente">Revisar</Badge>}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {marcaId && marcasConCuenta.has(marcaId) ? (
                      <Badge tone="aprobada">Sí</Badge>
                    ) : (
                      <Badge>No</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
