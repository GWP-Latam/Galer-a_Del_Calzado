/**
 * lucide-react dropped brand/social glyphs; these small inline outlines
 * cover the two networks Galería del Calzado actually uses.
 */
type IconProps = { className?: string };

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.1" cy="6.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M15 8.5h-2a1.5 1.5 0 0 0-1.5 1.5v2H15l-.4 3h-2.1v6.5" />
      <path d="M12.5 21.5A9 9 0 1 0 3.5 12.5" />
    </svg>
  );
}
