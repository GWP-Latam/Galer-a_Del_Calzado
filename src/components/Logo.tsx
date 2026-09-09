import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";

export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={clsx("relative block h-9 w-[150px] shrink-0", className)}
      aria-label="Galería del Calzado, ir al inicio"
    >
      <Image
        src={inverted ? "/logo-galeria-del-calzado-blanco.png" : "/logo-galeria-del-calzado.png"}
        alt="Galería del Calzado"
        fill
        priority
        sizes="150px"
        className="object-contain object-center"
      />
    </Link>
  );
}
