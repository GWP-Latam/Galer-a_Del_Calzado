/**
 * Single point of access to site content. Every page/component reads content
 * through these functions, never by importing the JSON files in src/data
 * directly. That is what lets Fase 2 swap this file's internals for a
 * Supabase-backed implementation without touching any calling code.
 */
import plazaData from "@/data/plaza.json";
import nivelesData from "@/data/niveles.json";
import localesData from "@/data/locales.json";
import localesGeometriaData from "@/data/locales-geometria.json";
import marcasData from "@/data/marcas.json";
import amenidadesData from "@/data/amenidades.json";
import beneficiosData from "@/data/beneficios.json";
import categoriasCalzadoData from "@/data/categorias-calzado.json";
import campanaData from "@/data/campana.json";
import eventosData from "@/data/eventos.json";
import type {
  Amenidad,
  Beneficio,
  Campana,
  CategoriaCalzado,
  Evento,
  Local,
  Marca,
  Nivel,
  Plaza,
  PuntoNormalizado,
} from "./types";

type LocalesGeometria = Record<string, { puntos: PuntoNormalizado[] }>;

export function getPlaza(): Plaza {
  return plazaData as Plaza;
}

export function getNiveles(): Nivel[] {
  return (nivelesData as Nivel[]).slice().sort((a, b) => a.orden - b.orden);
}

export function getNivelById(id: string): Nivel | undefined {
  return getNiveles().find((n) => n.id === id);
}

export function getLocales(): Local[] {
  const geometria = localesGeometriaData as unknown as LocalesGeometria;
  return (localesData as Local[]).map((local) => {
    const g = geometria[local.id_interno];
    return g ? { ...local, geometria: g.puntos } : local;
  });
}

export function getLocalesPorMarca(slug: string): Local[] {
  return getLocales().filter((l) => l.marca_slug === slug);
}

export function getMarcas(): Marca[] {
  return marcasData as Marca[];
}

export function getMarcaBySlug(slug: string): Marca | undefined {
  return getMarcas().find((m) => m.slug === slug);
}

export function getMarcasRelacionadas(slug: string, limit = 4): Marca[] {
  return getMarcas()
    .filter((m) => m.slug !== slug)
    .slice(0, limit);
}

export function getAmenidades(): Amenidad[] {
  return amenidadesData as Amenidad[];
}

export function getBeneficios(): Beneficio[] {
  return beneficiosData as Beneficio[];
}

export function getCategoriasCalzado(): CategoriaCalzado[] {
  return categoriasCalzadoData as CategoriaCalzado[];
}

export function getCampana(): Campana {
  return campanaData as Campana;
}

export function getEventos(): Evento[] {
  return (eventosData as Evento[])
    .slice()
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));
}

/**
 * The one event worth surfacing on the home page: the next upcoming event
 * (or the one currently in progress), or — if none is upcoming — the most
 * recently finished one, so the section is never empty as long as at least
 * one event has ever been loaded.
 */
export function getEventoDestacado(): Evento | null {
  const eventos = getEventos();
  if (eventos.length === 0) return null;

  const hoy = new Date().toISOString().slice(0, 10);
  const proximosOEnCurso = eventos
    .filter((e) => e.fecha_fin >= hoy)
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));
  if (proximosOEnCurso.length > 0) return proximosOEnCurso[0];

  const pasados = eventos
    .filter((e) => e.fecha_fin < hoy)
    .sort((a, b) => b.fecha_fin.localeCompare(a.fecha_fin));
  return pasados[0] ?? null;
}
