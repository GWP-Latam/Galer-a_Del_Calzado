import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Marca, Profile } from "@/lib/types/database";

/**
 * Las cuentas de locatario ya no dependen de que nos den un correo real —
 * el super_admin les crea un usuario y contraseña directamente. Supabase
 * Auth exige un email único como identificador, así que el "usuario" que
 * el locatario escribe para entrar (p. ej. "flexi") se guarda por dentro
 * como `${usuario}@${LOCATARIO_EMAIL_DOMAIN}`. ".internal" es un TLD
 * reservado (RFC 6761) que nunca resuelve de verdad — nunca se le manda
 * correo a esta dirección, es solo un identificador único.
 */
export const LOCATARIO_EMAIL_DOMAIN = "locatarios.galeriadelcalzado.internal";

export function usuarioAEmail(usuarioOCorreo: string): string {
  const valor = usuarioOCorreo.trim();
  return valor.includes("@") ? valor : `${valor.toLowerCase()}@${LOCATARIO_EMAIL_DOMAIN}`;
}

/** Fetches the signed-in user's profile (role + marca_id). Redirects to
 * /login if there's no session — proxy.ts already does this for most
 * routes, but this is the safety net for anything it might miss. */
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) redirect("/admin/login");

  return profile;
}

export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "super_admin") redirect("/admin");
  return profile;
}

/** For a locatario, their own marca — the thing they're actually allowed
 * to manage. Redirects if a locatario account somehow has no marca linked
 * (a data-entry mistake on the super_admin's side, not a normal state). */
export async function requireOwnMarca(): Promise<{ profile: Profile; marca: Marca }> {
  const profile = await requireProfile();
  if (profile.role !== "locatario" || !profile.marca_id) redirect("/admin");

  const supabase = await createClient();
  const { data: marca } = await supabase.from("marcas").select("*").eq("id", profile.marca_id).single();

  if (!marca) redirect("/admin");

  return { profile, marca };
}
