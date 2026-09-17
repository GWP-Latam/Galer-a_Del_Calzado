import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 font-sans text-zinc-900">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="relative h-8 w-[180px]">
          <Image
            src="/logo-galeria-del-calzado.png"
            alt="Galería del Calzado"
            fill
            priority
            sizes="180px"
            className="object-contain object-left"
          />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">Panel de administración</h1>
        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-xs text-zinc-400">
          Tu cuenta la crea el administrador de la plaza. Si no tienes acceso, contáctalo directamente.
        </p>
      </div>
    </div>
  );
}
