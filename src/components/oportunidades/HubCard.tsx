import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HubCard({
  href,
  titulo,
  descripcion,
}: {
  href: string;
  titulo: string;
  descripcion: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-md bg-ink p-6"
    >
      <Image
        src="/patrones/greca.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover opacity-[0.07] mix-blend-screen transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
      <div className="relative text-paper">
        <p className="font-display text-2xl leading-tight">{titulo}</p>
        <p className="mt-2 text-sm text-paper/75">{descripcion}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-paper">
          Ver más
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
