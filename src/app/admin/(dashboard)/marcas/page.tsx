import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/admin/ui/Badge";
import { NuevaMarcaForm } from "./NuevaMarcaForm";
import { CuentaForm } from "./CuentaForm";

export default async function MarcasPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const [{ data: marcas }, { data: profiles }] = await Promise.all([
    supabase.from("marcas").select("*").order("nombre"),
    supabase.from("profiles").select("marca_id").eq("role", "locatario"),
  ]);

  const marcasConCuenta = new Set((profiles ?? []).map((p) => p.marca_id));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Marcas y cuentas</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Una cuenta por marca/locatario. Al invitar, reciben un correo para elegir su propia contraseña.
      </p>

      <div className="mt-6">
        <NuevaMarcaForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Cuenta</th>
            </tr>
          </thead>
          <tbody>
            {(marcas ?? []).map((marca) => (
              <tr key={marca.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{marca.nombre}</td>
                <td className="px-4 py-3 text-zinc-500">{marca.slug}</td>
                <td className="px-4 py-3">
                  {marca.activa ? <Badge tone="aprobada">Activa</Badge> : <Badge>Inactiva</Badge>}
                  {marca.revisar && <Badge tone="pendiente">Revisar datos</Badge>}
                </td>
                <td className="px-4 py-3">
                  {marcasConCuenta.has(marca.id) ? (
                    <Badge tone="aprobada">Ya tiene cuenta</Badge>
                  ) : (
                    <CuentaForm marcaId={marca.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
