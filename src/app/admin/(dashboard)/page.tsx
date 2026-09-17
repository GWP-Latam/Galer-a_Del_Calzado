import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHome() {
  const profile = await requireProfile();

  if (profile.role !== "super_admin") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Bienvenido</h1>
        <p className="mt-2 text-zinc-600">
          Desde aquí puedes actualizar las fotos de tu local y subir tus promociones. Usa el menú de la
          izquierda.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ count: pendientes }, { count: marcas }, { count: mensajesSinLeer }, { count: suscriptores }] =
    await Promise.all([
      supabase.from("promociones").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
      supabase.from("marcas").select("*", { count: "exact", head: true }),
      supabase.from("mensajes_contacto").select("*", { count: "exact", head: true }).eq("leido", false),
      supabase.from("suscriptores_newsletter").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Promociones por revisar", value: pendientes ?? 0, href: "/promociones" },
    { label: "Marcas registradas", value: marcas ?? 0, href: "/marcas" },
    { label: "Mensajes sin leer", value: mensajesSinLeer ?? 0, href: "/mensajes" },
    { label: "Suscriptores al newsletter", value: suscriptores ?? 0, href: "/newsletter" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Inicio</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-zinc-200 bg-white p-5 hover:border-zinc-400"
          >
            <p className="text-3xl font-semibold text-zinc-900">{c.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
