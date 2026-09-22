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
import { AdminMobileNav } from "./AdminMobileNav";
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

  const tituloCuenta = isSuperAdmin ? "Administración" : marcaNombre ?? "Mi cuenta";

  // Un único árbol de <NavLink> reutilizado tal cual en el sidebar de
  // escritorio y en el drawer móvil — así nunca hay dos listas de enlaces
  // que se puedan desincronizar entre sí.
  const navLinks = isSuperAdmin ? (
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
  );

  const botonCerrarSesion = (
    <form action={signOut}>
      <button
        type="submit"
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        Cerrar sesión
      </button>
    </form>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 font-sans text-zinc-900 md:flex-row">
      {/* Barra superior solo en móvil: logo + botón de hamburguesa. El menú
          arranca siempre cerrado — nada de sidebar invadiendo la pantalla. */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
        <div className="relative h-6 w-[130px]">
          <Image
            src="/logo-galeria-del-calzado.png"
            alt="Galería del Calzado"
            fill
            priority
            sizes="130px"
            className="object-contain object-left"
          />
        </div>
        <AdminMobileNav title={tituloCuenta} signOut={botonCerrarSesion}>
          {navLinks}
        </AdminMobileNav>
      </header>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white p-4 md:flex">
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
          <p className="mt-2 text-sm font-semibold text-zinc-900">{tituloCuenta}</p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">{navLinks}</nav>

        {botonCerrarSesion}
      </aside>

      <main id="contenido" className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
