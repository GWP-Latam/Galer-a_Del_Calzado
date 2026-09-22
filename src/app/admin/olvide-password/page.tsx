import { Suspense } from "react";
import Image from "next/image";
import { RecoverForm } from "./RecoverForm";

export default function OlvidePasswordPage() {
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
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">Recuperar acceso</h1>
        <p className="mt-1 text-sm text-zinc-500">Te mandamos un enlace a tu correo para elegir una contraseña nueva.</p>
        <div className="mt-6">
          <Suspense>
            <RecoverForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
