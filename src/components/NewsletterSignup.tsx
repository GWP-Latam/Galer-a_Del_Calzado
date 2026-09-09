"use client";

import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

/**
 * UI only in Fase 1. Fase 2: guarda el correo en una tabla de suscriptores;
 * cuando administración aprueba una imagen de campaña de alto impacto, se
 * envía por SMTP a todos los suscriptores con esa misma imagen (ver memoria
 * backend_promociones_locatarios).
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  }

  return (
    <div className="rounded-md bg-ink px-8 py-10 text-paper md:px-14 md:py-14">
      <div className="mx-auto max-w-lg text-center">
        <Mail className="mx-auto h-6 w-6 text-accent" strokeWidth={1.5} />
        <p className="mt-4 font-display text-2xl">Mantente enterad@ de nuevas promociones</p>
        <p className="mt-2 text-sm text-paper/70">
          Deja tu correo y te avisamos en cuanto haya una promoción nueva para ti.
        </p>

        {sent ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-paper/85">
            <CheckCircle2 className="h-4 w-4 text-accent" strokeWidth={1.75} />
            Listo — cuando activemos los avisos por correo, empezarás a recibirlos aquí.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              aria-label="Tu correo electrónico"
              className="w-full rounded-sm border border-paper/25 bg-paper/10 px-4 py-2.5 text-sm text-paper outline-none placeholder:text-paper/50 focus:border-paper/60"
            />
            <button
              type="submit"
              className="shrink-0 rounded-sm bg-paper px-6 py-2.5 text-sm font-medium text-ink hover:bg-paper/90"
            >
              Avísame
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
