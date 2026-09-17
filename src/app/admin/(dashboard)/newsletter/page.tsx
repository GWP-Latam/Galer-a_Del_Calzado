import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/admin/ui/Button";

async function eliminar(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("suscriptores_newsletter").delete().eq("id", id);
  revalidatePath("/admin/newsletter");
}

export default async function NewsletterPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: suscriptores } = await supabase
    .from("suscriptores_newsletter")
    .select("*")
    .order("created_at", { ascending: false });

  const csv = ["correo,fecha", ...(suscriptores ?? []).map((s) => `${s.correo},${s.created_at}`)].join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Newsletter</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {suscriptores?.length ?? 0} correos registrados en &ldquo;Mantente enterad@ de nuevas
            promociones&rdquo;.
          </p>
        </div>
        <a href={csvHref} download="suscriptores.csv">
          <Button variant="secondary">Descargar CSV</Button>
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Desde</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(suscriptores ?? []).map((s) => (
              <tr key={s.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">{s.correo}</td>
                <td className="px-4 py-3 text-zinc-500">{new Date(s.created_at).toLocaleDateString("es-MX")}</td>
                <td className="px-4 py-3 text-right">
                  <form action={eliminar.bind(null, s.id)}>
                    <Button type="submit" variant="ghost">Quitar</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(suscriptores ?? []).length === 0 && <p className="p-4 text-sm text-zinc-400">Aún no hay suscriptores.</p>}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Cuando apruebes una promoción de alto impacto, el envío automático por correo a esta lista es
        trabajo pendiente de integrar (requiere configurar un proveedor SMTP) — ver notas del proyecto.
      </p>
    </div>
  );
}
