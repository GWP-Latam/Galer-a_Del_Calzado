import Image from "next/image";
import {
  LayoutDashboard,
  Sparkles,
  Store,
  KeyRound,
  Image as ImageIcon,
  Megaphone,
  Mail,
  MessageSquare,
  CalendarDays,
  Star,
  LogOut,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "./NavLink";
import { signOut } from "./actions";

// Los componentes de lucide-react (forwardRef) no se pueden pasar como prop
// de un Server Component a NavLink (Client Component) — hay que renderizar
// el <Icono/> aquí mismo y pasar el elemento ya armado.
const ICON = "h-4 w-4 shrink-0";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const isSuperAdmin = profile.role === "super_admin";

  let marcaNombre: string | null = null;
  if (!isSuperAdmin && profile.marca_id) {
    const supabase = await createClient();
    const { data } = await supabase.from("marcas").select("nombre").eq("id", profile.marca_id).single();
    marcaNombre = data?.nombre ?? null;
  }

  return (
    <div className="flex min-h-dvh bg-zinc-50 font-sans text-zinc-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white p-4">
        <div>
          <div className="relative h-7 w-[150px]">
            <Image
              src="/logo-galeria-del-calzado.png"
              alt="Galería del Calzado"
              fill
              priority
              sizes="150px"
              className="object-contain object-left"
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-900">
            {isSuperAdmin ? "Administración" : marcaNombre ?? "Mi cuenta"}
          </p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {isSuperAdmin ? (
            <>
              <NavLink href="/admin" label="Inicio" icon={<LayoutDashboard className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/promociones" label="Promociones" icon={<Sparkles className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/marcas" label="Marcas" icon={<Store className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/cuentas" label="Cuentas" icon={<KeyRound className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/campana" label="Campaña del home" icon={<Megaphone className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/eventos" label="Eventos" icon={<CalendarDays className={ICON} strokeWidth={1.75} />} />
              <p className="mt-4 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Contenido
              </p>
              <NavLink href="/admin/resenas" label="Reseñas" icon={<Star className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/newsletter" label="Newsletter" icon={<Mail className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/mensajes" label="Mensajes" icon={<MessageSquare className={ICON} strokeWidth={1.75} />} />
            </>
          ) : (
            <>
              <NavLink href="/admin/mi-local" label="Mi local" icon={<ImageIcon className={ICON} strokeWidth={1.75} />} />
              <NavLink href="/admin/promociones" label="Mis promociones" icon={<Sparkles className={ICON} strokeWidth={1.75} />} />
            </>
          )}
        </nav>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </form>
      </aside>

      <main id="contenido" className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
