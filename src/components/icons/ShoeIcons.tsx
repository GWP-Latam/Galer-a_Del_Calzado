/**
 * Line-art shoe set for the "Un estilo para cada paso" categories. Replaces
 * the framed clip-art PNGs in public/estilos/ (client feedback 23/09/26: "los
 * íconos de sandalias, sneakers, zapatos están muy feos"). Every glyph is a
 * side view, toe to the right, on the same 64×48 grid and stroke so the set
 * reads as one family; color comes from `currentColor`.
 */
type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Derby de piel con punta y tacón bajo. */
function Zapato({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 36c0-6 1.2-11.5 3.5-15 5.5 2 11 2 16-.5l7 5c8 1.6 17.5 3.4 22.5 6 2.5 1.3 3.5 2.6 3.5 4.5Z" />
      <path d="M5 36h55v1.5a3 3 0 0 1-3 3H16v2H7.5A2.5 2.5 0 0 1 5 40Z" />
      <path d="M26.5 20.8l2.5 5.7M29.5 23.4l3.8-.6" />
      <path d="M11 30c8 .8 17 0 22.5-4" />
      <path d="M48 29c-1.2 2.3-1.3 4.7-.4 7" />
    </Svg>
  );
}

/** Tenis de corte bajo con agujetas y suela gruesa. */
function Sneaker({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 36c-.3-5.5.4-11 2.6-16 5 2 10.5 1.4 15-1.5l4-2c3 4.5 7.5 8.5 14 10.2 6.5 1.6 12 2.5 14.4 5.4.8 1 .8 2.4 0 3.9Z" />
      <path d="M6 36h54v1.5a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5Z" />
      <path d="M31.5 20.5l-3.4 2.2M35 24l-3.4 2.2M38.8 26.7l-3.4 2" />
      <path d="M14 31.5c9 1.5 20 .5 28-4" />
      <path d="M6.5 39.5h53" />
    </Svg>
  );
}

/** Sandalia de tiras sobre plantilla gruesa. */
function Sandalia({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 37c0-2.2 1.8-3.5 4.5-3.5H55c3 0 5 1.4 5 3.5s-2 3.5-5 3.5H9.5C6.8 40.5 5 39.2 5 37Z" />
      <path d="M39 33.5c2-6.5 11.5-8 16.5 0" />
      <path d="M10.5 33.5c-.4-4.5.2-8.5 2-11.5" />
      <path d="M12.5 22c5.5 1.8 11.5 1.8 17-.5" />
      <path d="M26 22.6c2.5 4.2 7.5 7.4 14.8 7.9" />
      <rect x="16.5" y="20.3" width="4" height="4" rx="1" />
    </Svg>
  );
}

/** Botín tipo Chelsea con resorte lateral y tacón. */
function Bota({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M13 36.5c.4-10 .8-20.5 1.8-30.5h15c.5 7.5.8 14.5 1.7 20 7.5 1.8 18.5 3.4 24 6.3 2.4 1.3 3.4 2.6 3.5 4.2Z" />
      <path d="M10.5 36.5H59V38a3 3 0 0 1-3 3H20v2.5h-8a1.5 1.5 0 0 1-1.5-1.5Z" />
      <path d="M19.5 13c1 4.8 2.6 8.6 4.8 11.5 2-2.9 3.6-6.7 4.6-11.5" />
      <path d="M20 6V3.5h4.5V6" />
    </Svg>
  );
}

/** Zapato infantil tipo merceditas: puntera redonda y correa con botón. */
function ZapatoNinos({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 36c-.8-5.5.6-10.5 5-12 6 1.8 12.5 2 18.5 1.2 9-.3 18 1.8 21.5 6.3 1.2 1.6 1.2 3.4-.5 4.5Z" />
      <path d="M10 36h48v1.5a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" />
      <path d="M25.5 25.8c2.5-6 11.5-7.3 15.5-.2" />
      <circle cx="28.6" cy="22.6" r="1.4" fill="currentColor" />
      <path d="M48 26.8c-1.2 3-1.2 6.2 0 9.2" />
    </Svg>
  );
}

/** Tenis infantil con dos correas de velcro y puntera de hule. */
function SneakerNinos({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M11 36c-.8-5.5 0-11 3-15 5 2 10 1.6 14-1 4 4 10 7.5 18.5 8.5 6 .8 11 2.6 12.5 5.6.6 1.3.2 2.4-1 1.9Z" />
      <path d="M8 36h52v2a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z" />
      <path d="M27.5 21l8.3 9.2 3.4-1.6-7.6-8.9M34.8 24.6l6.4 7 3.3-1.3-5.6-6.3" />
      <path d="M50 36c.8-3 4-4.8 8.5-3.2" />
    </Svg>
  );
}

const ICONOS: Record<string, (p: IconProps) => React.ReactElement> = {
  zapatos: Zapato,
  sneakers: Sneaker,
  sandalias: Sandalia,
  botas: Bota,
  "zapatos-ninos": ZapatoNinos,
  "sneakers-ninos": SneakerNinos,
};

/** Icon for a `categorias_calzado.slug`, or null if the set has none for it. */
export function shoeIconFor(slug: string) {
  return ICONOS[slug] ?? null;
}
