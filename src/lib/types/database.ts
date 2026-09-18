// Generado desde el proyecto real de Supabase (myxdlumhkjwejtuuxyfb) con
// generate_typescript_types. No editar a mano — si el esquema cambia, se
// vuelve a generar y se reemplaza este archivo completo.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      amenidades: {
        Row: {
          icono: string
          id: string
          local_numero: string | null
          nivel_id: string | null
          nombre: string
          revisar: boolean
          telefonos: string[]
          tipo: Database["public"]["Enums"]["amenidad_tipo"]
        }
        Insert: {
          icono?: string
          id?: string
          local_numero?: string | null
          nivel_id?: string | null
          nombre: string
          revisar?: boolean
          telefonos?: string[]
          tipo: Database["public"]["Enums"]["amenidad_tipo"]
        }
        Update: {
          icono?: string
          id?: string
          local_numero?: string | null
          nivel_id?: string | null
          nombre?: string
          revisar?: boolean
          telefonos?: string[]
          tipo?: Database["public"]["Enums"]["amenidad_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "amenidades_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficios: {
        Row: {
          descripcion: string
          icono: string
          id: string
          orden: number
          titulo: string
        }
        Insert: {
          descripcion: string
          icono: string
          id?: string
          orden?: number
          titulo: string
        }
        Update: {
          descripcion?: string
          icono?: string
          id?: string
          orden?: number
          titulo?: string
        }
        Relationships: []
      }
      campana: {
        Row: {
          activa: boolean
          concepto: string[]
          cta_href: string
          cta_label: string
          id: boolean
          imagen_url: string | null
          imagenes: string[]
          slug: string
          subtitulo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          activa?: boolean
          concepto?: string[]
          cta_href?: string
          cta_label?: string
          id?: boolean
          imagen_url?: string | null
          imagenes?: string[]
          slug?: string
          subtitulo?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          activa?: boolean
          concepto?: string[]
          cta_href?: string
          cta_label?: string
          id?: boolean
          imagen_url?: string | null
          imagenes?: string[]
          slug?: string
          subtitulo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_calzado: {
        Row: {
          id: string
          imagen_url: string | null
          nombre: string
          orden: number
          perfil: string
          slug: string
        }
        Insert: {
          id?: string
          imagen_url?: string | null
          nombre: string
          orden?: number
          perfil: string
          slug: string
        }
        Update: {
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number
          perfil?: string
          slug?: string
        }
        Relationships: []
      }
      codigos_acceso: {
        Row: {
          codigo: string
          created_at: string
          id: string
          marca_id: string
          usado: boolean
          usado_en: string | null
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          marca_id: string
          usado?: boolean
          usado_en?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          marca_id?: string
          usado?: boolean
          usado_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codigos_acceso_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
        ]
      }
      espacios_publicitarios: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string
          dimensiones: string
          id: string
          imagenes: string[]
          titulo: string
          ubicacion: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string
          dimensiones: string
          id?: string
          imagenes?: string[]
          titulo: string
          ubicacion: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string
          dimensiones?: string
          id?: string
          imagenes?: string[]
          titulo?: string
          ubicacion?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          imagen_url: string | null
          slug: string
          titulo: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          imagen_url?: string | null
          slug: string
          titulo: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          imagen_url?: string | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      fotos_local: {
        Row: {
          created_at: string
          id: string
          imagen_url: string
          marca_id: string
          orden: number
        }
        Insert: {
          created_at?: string
          id?: string
          imagen_url: string
          marca_id: string
          orden?: number
        }
        Update: {
          created_at?: string
          id?: string
          imagen_url?: string
          marca_id?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "fotos_local_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
        ]
      }
      locales: {
        Row: {
          amenidad_id: string | null
          estado: Database["public"]["Enums"]["local_estado"]
          id: string
          marca_id: string | null
          nivel_id: string
          numero: string
          x: number
          y: number
        }
        Insert: {
          amenidad_id?: string | null
          estado?: Database["public"]["Enums"]["local_estado"]
          id?: string
          marca_id?: string | null
          nivel_id: string
          numero: string
          x: number
          y: number
        }
        Update: {
          amenidad_id?: string | null
          estado?: Database["public"]["Enums"]["local_estado"]
          id?: string
          marca_id?: string | null
          nivel_id?: string
          numero?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "locales_amenidad_id_fkey"
            columns: ["amenidad_id"]
            isOneToOne: false
            referencedRelation: "amenidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locales_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locales_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      locales_renta: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string
          id: string
          imagenes: string[]
          m2: number | null
          nivel_id: string | null
          servicios: string[]
          titulo: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string
          id?: string
          imagenes?: string[]
          m2?: number | null
          nivel_id?: string | null
          servicios?: string[]
          titulo: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string
          id?: string
          imagenes?: string[]
          m2?: number | null
          nivel_id?: string | null
          servicios?: string[]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "locales_renta_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "niveles"
            referencedColumns: ["id"]
          },
        ]
      }
      marcas: {
        Row: {
          activa: boolean
          categorias_producto: string[]
          correo: string
          created_at: string
          descripcion: string
          facebook: string
          giro: string
          id: string
          instagram: string
          logo_generico: boolean
          logo_url: string | null
          nombre: string
          revisar: boolean
          slug: string
          telefonos: string[]
          tienda_en_linea: string
          updated_at: string
          web: string
        }
        Insert: {
          activa?: boolean
          categorias_producto?: string[]
          correo?: string
          created_at?: string
          descripcion?: string
          facebook?: string
          giro?: string
          id?: string
          instagram?: string
          logo_generico?: boolean
          logo_url?: string | null
          nombre: string
          revisar?: boolean
          slug: string
          telefonos?: string[]
          tienda_en_linea?: string
          updated_at?: string
          web?: string
        }
        Update: {
          activa?: boolean
          categorias_producto?: string[]
          correo?: string
          created_at?: string
          descripcion?: string
          facebook?: string
          giro?: string
          id?: string
          instagram?: string
          logo_generico?: boolean
          logo_url?: string | null
          nombre?: string
          revisar?: boolean
          slug?: string
          telefonos?: string[]
          tienda_en_linea?: string
          updated_at?: string
          web?: string
        }
        Relationships: []
      }
      mensajes_contacto: {
        Row: {
          correo: string
          created_at: string
          id: string
          leido: boolean
          mensaje: string
          nombre: string
          origen: Database["public"]["Enums"]["mensaje_origen"]
          telefono: string | null
        }
        Insert: {
          correo: string
          created_at?: string
          id?: string
          leido?: boolean
          mensaje: string
          nombre: string
          origen?: Database["public"]["Enums"]["mensaje_origen"]
          telefono?: string | null
        }
        Update: {
          correo?: string
          created_at?: string
          id?: string
          leido?: boolean
          mensaje?: string
          nombre?: string
          origen?: Database["public"]["Enums"]["mensaje_origen"]
          telefono?: string | null
        }
        Relationships: []
      }
      niveles: {
        Row: {
          alto_ref: number
          ancho_ref: number
          id: string
          nombre: string
          orden: number
          plano_raster_url: string | null
          plano_svg_url: string | null
        }
        Insert: {
          alto_ref: number
          ancho_ref: number
          id: string
          nombre: string
          orden?: number
          plano_raster_url?: string | null
          plano_svg_url?: string | null
        }
        Update: {
          alto_ref?: number
          ancho_ref?: number
          id?: string
          nombre?: string
          orden?: number
          plano_raster_url?: string | null
          plano_svg_url?: string | null
        }
        Relationships: []
      }
      plaza: {
        Row: {
          aviso_privacidad_url: string | null
          direccion: string
          geo_lat: number
          geo_lng: number
          horarios: Json
          id: boolean
          nombre: string
          redes: Json
          telefono: string
          updated_at: string
        }
        Insert: {
          aviso_privacidad_url?: string | null
          direccion: string
          geo_lat: number
          geo_lng: number
          horarios?: Json
          id?: boolean
          nombre?: string
          redes?: Json
          telefono: string
          updated_at?: string
        }
        Update: {
          aviso_privacidad_url?: string | null
          direccion?: string
          geo_lat?: number
          geo_lng?: number
          horarios?: Json
          id?: boolean
          nombre?: string
          redes?: Json
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          marca_id: string | null
          nombre_completo: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id: string
          marca_id?: string | null
          nombre_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          marca_id?: string | null
          nombre_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
        ]
      }
      promociones: {
        Row: {
          categorias: Database["public"]["Enums"]["promocion_categoria"][]
          created_at: string
          created_by: string | null
          descripcion: string
          destacada: boolean
          estado: Database["public"]["Enums"]["promocion_estado"]
          id: string
          imagen_url: string | null
          marca_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          titulo: string
          vigente_desde: string
          vigente_hasta: string
        }
        Insert: {
          categorias?: Database["public"]["Enums"]["promocion_categoria"][]
          created_at?: string
          created_by?: string | null
          descripcion: string
          destacada?: boolean
          estado?: Database["public"]["Enums"]["promocion_estado"]
          id?: string
          imagen_url?: string | null
          marca_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          titulo: string
          vigente_desde: string
          vigente_hasta: string
        }
        Update: {
          categorias?: Database["public"]["Enums"]["promocion_categoria"][]
          created_at?: string
          created_by?: string | null
          descripcion?: string
          destacada?: boolean
          estado?: Database["public"]["Enums"]["promocion_estado"]
          id?: string
          imagen_url?: string | null
          marca_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          titulo?: string
          vigente_desde?: string
          vigente_hasta?: string
        }
        Relationships: [
          {
            foreignKeyName: "promociones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promociones_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promociones_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resenas: {
        Row: {
          autor_foto_url: string | null
          autor_nombre: string
          calificacion: number
          created_at: string
          destacada: boolean
          fecha_resena: string | null
          fuente: Database["public"]["Enums"]["resena_fuente"]
          google_review_id: string | null
          id: string
          orden: number
          texto: string
          updated_at: string
        }
        Insert: {
          autor_foto_url?: string | null
          autor_nombre: string
          calificacion: number
          created_at?: string
          destacada?: boolean
          fecha_resena?: string | null
          fuente?: Database["public"]["Enums"]["resena_fuente"]
          google_review_id?: string | null
          id?: string
          orden?: number
          texto: string
          updated_at?: string
        }
        Update: {
          autor_foto_url?: string | null
          autor_nombre?: string
          calificacion?: number
          created_at?: string
          destacada?: boolean
          fecha_resena?: string | null
          fuente?: Database["public"]["Enums"]["resena_fuente"]
          google_review_id?: string | null
          id?: string
          orden?: number
          texto?: string
          updated_at?: string
        }
        Relationships: []
      }
      suscriptores_newsletter: {
        Row: {
          activo: boolean
          correo: string
          created_at: string
          id: string
        }
        Insert: {
          activo?: boolean
          correo: string
          created_at?: string
          id?: string
        }
        Update: {
          activo?: boolean
          correo?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      vacantes: {
        Row: {
          activo: boolean
          area: string
          created_at: string
          descripcion: string
          id: string
          marca_id: string | null
          puesto: string
          tipo: string
        }
        Insert: {
          activo?: boolean
          area: string
          created_at?: string
          descripcion?: string
          id?: string
          marca_id?: string | null
          puesto: string
          tipo: string
        }
        Update: {
          activo?: boolean
          area?: string
          created_at?: string
          descripcion?: string
          id?: string
          marca_id?: string | null
          puesto?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacantes_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_admin: { Args: never; Returns: boolean }
      owns_marca: { Args: { target_marca_id: string }; Returns: boolean }
    }
    Enums: {
      amenidad_tipo: "instalacion" | "servicio"
      local_estado: "ocupado" | "disponible"
      mensaje_origen:
        | "contacto"
        | "oportunidades"
        | "renta"
        | "empleo"
        | "publicidad"
      promocion_categoria:
        | "liquidacion"
        | "descuentos"
        | "rebajas"
        | "deportivo"
        | "lujo"
        | "casual"
      promocion_estado: "pendiente" | "aprobada" | "rechazada"
      resena_fuente: "google" | "manual"
      user_role: "super_admin" | "locatario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type Marca = Tables<"marcas">
export type Profile = Tables<"profiles">
export type Promocion = Tables<"promociones">
export type Campana = Tables<"campana">
export type Evento = Tables<"eventos">
export type FotoLocal = Tables<"fotos_local">
export type PromocionCategoria = Enums<"promocion_categoria">

export const Constants = {
  public: {
    Enums: {
      amenidad_tipo: ["instalacion", "servicio"],
      local_estado: ["ocupado", "disponible"],
      mensaje_origen: [
        "contacto",
        "oportunidades",
        "renta",
        "empleo",
        "publicidad",
      ],
      promocion_categoria: [
        "liquidacion",
        "descuentos",
        "rebajas",
        "deportivo",
        "lujo",
        "casual",
      ],
      promocion_estado: ["pendiente", "aprobada", "rechazada"],
      resena_fuente: ["google", "manual"],
      user_role: ["super_admin", "locatario"],
    },
  },
} as const
