import { clsx } from "clsx";

const TONES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  aprobada: "bg-emerald-100 text-emerald-800",
  rechazada: "bg-red-100 text-red-800",
  default: "bg-zinc-100 text-zinc-700",
};

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone] ?? TONES.default)}>
      {children}
    </span>
  );
}
