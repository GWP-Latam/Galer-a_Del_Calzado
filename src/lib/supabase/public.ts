import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Cliente anónimo sin cookies, para lecturas públicas desde el sitio
 * (Fase 1 sigue siendo estático/ISR). A diferencia de src/lib/supabase/server.ts
 * (que usa next/headers para la sesión del admin), este no fuerza render
 * dinámico: no depende de la cookie de nadie, solo de RLS con la anon key.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
