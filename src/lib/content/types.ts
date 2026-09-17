/**
 * Content model for Galería del Calzado. This shape is designed to match the
 * future Supabase tables 1:1 (see plan, sección "Modelo de contenido"), so the
 * JSON-backed repository in Fase 1 can be swapped for a Supabase-backed one in
 * Fase 2 without touching any page or component.
 */

export interface Horario {
  dias: string;
  horario: string;
}

export interface Plaza {
  nombre: string;
  direccion: string;
  geo: { lat: number; lng: number };
  telefono: string;
  horarios: Horario[];
  redes: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  aviso_privacidad: string;
}

export type NivelId = "sotano" | "gc-piso";

export interface Nivel {
  id: NivelId;
  nombre: string;
  /** SVG plan when available (only "gc-piso" has one today). */
  plano?: string;
  /** Raster fallback / only version for levels without an SVG. */
  plano_raster?: string;
  ancho_ref: number;
  alto_ref: number;
  orden: number;
}

export type LocalEstado = "ocupado" | "disponible";

/** Coordenada normalizada 0–1 sobre el frame de referencia del nivel. */
export type PuntoNormalizado = [number, number];

export interface Local {
  id_interno: string;
  numero: string;
  nivel: NivelId | string;
  /** Normalized 0–1 coordinates over the level's reference plan. */
  x: number;
  y: number;
  estado: LocalEstado;
  marca_slug: string | null;
  amenidad_nombre: string | null;
  /**
   * Polígono del local sobre el plano, en coordenadas normalizadas 0–1
   * (mismo convenio que x/y). Viene de src/data/locales-geometria.json,
   * fusionado por getLocales() — ver Fase 2/3 del plan de implementación.
   * Opcional: todo local tiene una semilla rectangular generada
   * automáticamente, pero puede faltar si se agregó un local nuevo antes
   * de correr `npm run generar-geometria`.
   */
  geometria?: PuntoNormalizado[];
}

export interface Marca {
  slug: string;
  nombre: string;
  descripcion: string;
  categorias_producto: string[];
  telefonos: string[];
  correo: string;
  web: string;
  tienda_en_linea: string;
  instagram: string;
  facebook: string;
  fotos: string[];
  logo: string | null;
  logo_generico: boolean;
  locales: string[];
  revisar: boolean;
}

export type AmenidadTipo = "instalacion" | "servicio";

export interface Amenidad {
  nombre: string;
  tipo: AmenidadTipo;
  icono: string;
  local: string;
  nivel: NivelId | string;
  telefonos: string[];
  revisar: boolean;
}

export interface Beneficio {
  icono: string;
  titulo: string;
  descripcion: string;
}

export interface CategoriaCalzado {
  slug: string;
  nombre: string;
  perfil: string;
  imagen: string;
}

export type PromocionCategoria =
  | "liquidacion"
  | "descuentos"
  | "rebajas"
  | "deportivo"
  | "lujo"
  | "casual";

export interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  marca_slug: string | null;
  categorias: PromocionCategoria[];
  demo: boolean;
  destacada: boolean;
  vigente_desde?: string;
  vigente_hasta?: string;
  imagen?: string;
}

/**
 * Editorial campaign banner shown on the home page, right below the brand
 * marquee. Administración controls it entirely from Fase 2: turning `activa`
 * off, or leaving `imagen` empty, makes the whole section disappear from the
 * home page with no code change.
 */
export interface Campana {
  activa: boolean;
  slug: string;
  titulo: string;
  subtitulo: string;
  imagen: string | null;
  cta_label: string;
  /** Cuerpo del artículo de la campaña (uno o más párrafos). */
  concepto: string[];
  /** Galería de imágenes de la campaña mostrada dentro del artículo. */
  imagenes: string[];
}

export interface Evento {
  slug: string;
  titulo: string;
  descripcion: string;
  /** Un evento puede durar más de un día: fecha_inicio y fecha_fin pueden
   * ser el mismo día, o abrir un periodo (p. ej. una activación de 2 semanas). */
  fecha_inicio: string;
  fecha_fin: string;
  imagen: string | null;
  demo?: boolean;
}

export interface LocalRenta {
  id: string;
  titulo: string;
  m2: number;
  nivel: string;
  servicios: string[];
  descripcion: string;
  demo: boolean;
}

export interface Vacante {
  id: string;
  puesto: string;
  area: string;
  tipo: string;
  descripcion: string;
  demo: boolean;
}

export interface EspacioPublicitario {
  id: string;
  titulo: string;
  ubicacion: string;
  dimensiones: string;
  descripcion: string;
  demo: boolean;
}

export interface Resena {
  id: string;
  fuente: "google" | "manual";
  autor_nombre: string;
  autor_foto_url: string | null;
  calificacion: number;
  texto: string;
  fecha_resena: string | null;
}
