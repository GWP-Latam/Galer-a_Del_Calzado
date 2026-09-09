/**
 * Official monogram vector (delivered by the client). `strokeWidth` is kept
 * in the prop type only so existing call sites don't need to change — the
 * shape is filled, not stroked, so it has no effect.
 */
export function Monogram({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 131.98 241.3" className={className} aria-hidden="true" focusable="false">
      <polygon
        fill="currentColor"
        points="131.98 241.3 0 241.3 0 0 131.98 0 131.98 99.61 119.09 99.61 119.09 7.84 12.89 7.84 12.89 233.47 119.09 233.47 119.09 127.65 65.99 127.65 65.99 119.83 131.98 119.83 131.98 241.3"
      />
      <polygon
        fill="currentColor"
        points="99.07 207.1 32.91 207.1 32.91 34.21 99.07 34.21 99.07 99.8 86.18 99.8 86.18 42.04 45.8 42.04 45.8 199.26 86.18 199.26 86.18 146.81 99.07 146.81 99.07 207.1"
      />
    </svg>
  );
}
