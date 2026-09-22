import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CuentaForm } from "./CuentaForm";
import { ResetPasswordButton } from "./ResetPasswordButton";

export default async function CuentasPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const [{ data: marcas }, { data: profiles }] = await Promise.all([
    supabase.from("marcas").select("id, nombre, slug").order("nombre"),
    supabase.from("profiles").select("id, marca_id").eq("role", "locatario"),
  ]);

  // Los correos (reales o el usuario@dominio-interno) solo se pueden leer
  // con la Admin API — auth.users no está expuesto por la API normal.
  const admin = createAdminClient();
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailPorId = new Map(usersData?.users.map((u) => [u.id, u.email ?? ""]) ?? []);

  const perfilPorMarca = new Map((profiles ?? []).map((p) => [p.marca_id, p]));

  const conCuenta = (marcas ?? []).filter((m) => perfilPorMarca.has(m.id));
  const sinCuenta = (marcas ?? []).filter((m) => !perfilPorMarca.has(m.id));

  function usuarioDe(email: string) {
    return email.endsWith("@locatarios.galeriadelcalzado.internal") ? email.split("@")[0] : email;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Cuentas de locatarios</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Usuario y contraseña por marca — no depende de que te den un correo real. Guarda la
        contraseña apenas se genera: no se vuelve a mostrar.
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-700">Sin cuenta ({sinCuenta.length})</h2>
        <div className="mt-3 flex flex-col gap-3">
          {sinCuenta.map((marca) => (
            <div key={marca.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="mb-2 text-sm font-medium text-zinc-900">{marca.nombre}</p>
              <CuentaForm marcaId={marca.id} sugerido={marca.slug} />
            </div>
          ))}
          {sinCuenta.length === 0 && <p className="text-sm text-zinc-400">Todas las marcas ya tienen cuenta.</p>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-zinc-700">Con cuenta ({conCuenta.length})</h2>
        <div className="mt-3 flex flex-col gap-3">
          {conCuenta.map((marca) => {
            const perfil = perfilPorMarca.get(marca.id)!;
            const email = emailPorId.get(perfil.id) ?? "";
            return (
              <div key={marca.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{marca.nombre}</p>
                  <p className="text-xs text-zinc-500">Usuario: {usuarioDe(email)}</p>
                </div>
                <ResetPasswordButton userId={perfil.id} />
              </div>
            );
          })}
          {conCuenta.length === 0 && <p className="text-sm text-zinc-400">Ninguna marca tiene cuenta todavía.</p>}
        </div>
      </section>
    </div>
  );
}
