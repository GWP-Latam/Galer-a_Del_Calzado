import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Ping diario (ver vercel.json) para que el proyecto de Supabase (plan
 * gratuito) no se pause por inactividad — Supabase pausa automáticamente
 * tras ~7 días sin tráfico contra su API. Una consulta real a la Data API
 * cuenta como actividad; visitar el dashboard no.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("plaza").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, checked_at: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
