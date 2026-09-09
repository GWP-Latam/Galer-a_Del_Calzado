/**
 * Placeholder geometric rendering of the 2022 rebrand monogram (a squared "G").
 * Replace the path below with the official vector once the brand manual
 * arrives (plan punto 5.3) — everything that renders <Monogram /> keeps
 * working unchanged.
 */
export function Monogram({ className, strokeWidth = 3 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M17 7 L17 3 L3 3 L3 21 L21 21 L21 12 L13 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
