import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Service-role client. Bypasses RLS entirely — only ever import this from
 * Server Actions or Route Handlers (never a Client Component, never
 * anything that ships to the browser). Used for the one thing regular
 * signed-in users can't do themselves: creating a locatario's auth account
 * (see app/(dashboard)/marcas/actions.ts).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
