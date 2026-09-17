import { revalidatePath } from "next/cache";
import { Star, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchGooglePlaceReviews, isGooglePlacesConfigured } from "@/lib/google-places";
import { Field, TextAreaField, SelectField } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import type { Database } from "@/lib/types/database";

type Resena = Database["public"]["Tables"]["resenas"]["Row"];

async function agregarManual(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("resenas").insert({
    fuente: "manual",
    autor_nombre: String(formData.get("autor_nombre") ?? ""),
    calificacion: Number(formData.get("calificacion") ?? 5),
    texto: String(formData.get("texto") ?? ""),
    fecha_resena: String(formData.get("fecha_resena") || "") || null,
  });
  revalidatePath("/admin/resenas");
}

async function alternarDestacada(id: string, destacada: boolean) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("resenas").update({ destacada: !destacada }).eq("id", id);
  revalidatePath("/admin/resenas");
  revalidatePath("/");
}

async function eliminar(id: string) {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("resenas").delete().eq("id", id);
  revalidatePath("/admin/resenas");
  revalidatePath("/");
}

async function mover(id: string, direccion: "arriba" | "abajo") {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: destacadas } = await supabase
    .from("resenas")
    .select("id, orden")
    .eq("destacada", true)
    .order("orden", { ascending: true });
  if (!destacadas) return;

  const index = destacadas.findIndex((r) => r.id === id);
  const vecino = direccion === "arriba" ? destacadas[index - 1] : destacadas[index + 1];
  if (index === -1 || !vecino) return;

  const actual = destacadas[index];
  await supabase.from("resenas").update({ orden: vecino.orden }).eq("id", actual.id);
  await supabase.from("resenas").update({ orden: actual.orden }).eq("id", vecino.id);
  revalidatePath("/admin/resenas");
  revalidatePath("/");
}

async function sincronizarGoogle() {
  "use server";
  await requireSuperAdmin();
  const supabase = await createClient();
  const reviews = await fetchGooglePlaceReviews();
  for (const review of reviews) {
    await supabase.from("resenas").upsert(
      { fuente: "google", ...review },
      { onConflict: "google_review_id" },
    );
  }
  revalidatePath("/admin/resenas");
  revalidatePath("/");
}

export default async function ResenasPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("resenas")
    .select("*")
    .order("destacada", { ascending: false })
    .order("orden", { ascending: true })
    .order("created_at", { ascending: false });
  const resenas = (data ?? []) as Resena[];
  const googleListo = isGooglePlacesConfigured();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Reseñas</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Elige cuáles de estas reseñas aparecen en el home. No se edita el texto de ninguna —
        solo se selecciona cuáles mostrar y en qué orden. Google solo entrega un máximo de 5
        reseñas por su API; para tener más, agrégalas a mano copiándolas tal cual desde Google
        Maps.
      </p>

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900">Sincronizar con Google</p>
          <p className="mt-1 text-xs text-zinc-500">
            {googleListo
              ? "Trae hasta 5 reseñas desde tu ficha de Google Business Profile."
              : "Configura GOOGLE_PLACES_API_KEY y GOOGLE_PLACE_ID en las variables de entorno para activar esto."}
          </p>
        </div>
        <form action={sincronizarGoogle}>
          <Button type="submit" variant="secondary" disabled={!googleListo}>
            Sincronizar ahora
          </Button>
        </form>
      </div>

      <form
        action={agregarManual}
        className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6"
      >
        <p className="text-sm font-medium text-zinc-900">Agregar reseña a mano</p>
        <p className="text-xs text-zinc-500">
          Cópiala tal cual aparece en Google Maps — nombre del autor y texto exactos, sin
          modificarla.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="autor_nombre" label="Nombre del autor" required />
          <SelectField id="calificacion" label="Calificación" defaultValue="5">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrella{n === 1 ? "" : "s"}
              </option>
            ))}
          </SelectField>
          <Field id="fecha_resena" label="Fecha (opcional)" type="date" />
        </div>
        <TextAreaField id="texto" label="Texto de la reseña" rows={3} required />
        <Button type="submit" className="self-start">
          Agregar
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {resenas.map((r) => (
          <div key={r.id} className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex shrink-0 items-center gap-0.5 pt-0.5 text-amber-500">
              {Array.from({ length: r.calificacion }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-zinc-900">{r.autor_nombre}</p>
                <Badge tone={r.fuente === "google" ? "aprobada" : "default"}>
                  {r.fuente === "google" ? "Google" : "Manual"}
                </Badge>
                {r.fecha_resena && <span className="text-xs text-zinc-400">{r.fecha_resena}</span>}
              </div>
              <p className="mt-1 text-sm text-zinc-600">{r.texto}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {r.destacada && (
                <>
                  <form action={mover.bind(null, r.id, "arriba")}>
                    <Button type="submit" variant="ghost" aria-label="Subir">
                      <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </Button>
                  </form>
                  <form action={mover.bind(null, r.id, "abajo")}>
                    <Button type="submit" variant="ghost" aria-label="Bajar">
                      <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </Button>
                  </form>
                </>
              )}
              <form action={alternarDestacada.bind(null, r.id, r.destacada)}>
                <Button type="submit" variant="secondary">
                  {r.destacada ? "Ocultar" : "Mostrar en sitio"}
                </Button>
              </form>
              <form action={eliminar.bind(null, r.id)}>
                <Button type="submit" variant="ghost" aria-label="Eliminar">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Button>
              </form>
            </div>
          </div>
        ))}
        {resenas.length === 0 && (
          <p className="text-sm text-zinc-400">
            Todavía no hay reseñas. Sincroniza con Google o agrega una a mano arriba.
          </p>
        )}
      </div>
    </div>
  );
}
