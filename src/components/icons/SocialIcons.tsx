/**
 * lucide-react dropped brand/social glyphs; these small inline outlines
 * cover the networks Galería del Calzado actually uses. All three share the
 * same 24px grid, 1.6 stroke and rounded joins so they read as one set.
 */
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.1" cy="6.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14 20.5v-7h2.6l.4-3H14V8.8c0-.9.3-1.5 1.6-1.5H17V4.7a19 19 0 0 0-2.3-.2c-2.4 0-3.9 1.4-3.9 4v2H8.2v3h2.6v7" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12.5 3.5v11.2a3.3 3.3 0 1 1-3.3-3.3" />
      <path d="M12.5 3.5c.4 2.6 2.3 4.5 5 4.8" />
    </svg>
  );
}
