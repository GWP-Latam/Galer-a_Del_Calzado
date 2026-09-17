import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database";

/** Server-side Supabase client (Server Components, Server Actions, Route
 * Handlers) — reads/writes the session via cookies. Uses the anon key;
 * RLS + the signed-in user's session determine what they can see. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component (not a Server Action/Route
            // Handler) — cookies can't be written there. Middleware refreshes
            // the session on every request, so this is safe to ignore.
          }
        },
      },
    },
  );
}
