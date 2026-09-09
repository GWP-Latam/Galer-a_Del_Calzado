import { Monogram } from "@/components/Monogram";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container as="div" className="flex flex-col items-center gap-6 py-32 text-center">
      <Monogram className="h-12 w-12 text-stone-300" strokeWidth={1.5} />
      <div>
        <p className="font-display text-5xl">404</p>
        <h1 className="mt-3 text-2xl">No encontramos esta página</h1>
        <p className="mt-2 max-w-sm text-ink-soft">
          Puede que el local haya cambiado de nombre o la liga esté mal escrita. Busca la marca que
          buscabas o vuelve al inicio.
        </p>
      </div>
      <div className="flex gap-3">
        <LinkButton href="/directorio" variant="secondary">
          Ir al directorio
        </LinkButton>
        <LinkButton href="/">Volver al inicio</LinkButton>
      </div>
    </Container>
  );
}
