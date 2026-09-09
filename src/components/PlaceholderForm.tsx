"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

/**
 * Fase 1 ships the interface for every form (plan: "solo interfaz"); none
 * submits anywhere yet. Prevent default, acknowledge the visitor, and point
 * them at a real channel meanwhile instead of a dead end.
 */
export function PlaceholderForm({
  children,
  submitLabel = "Enviar",
  fallbackPhone,
}: {
  children: ReactNode;
  submitLabel?: string;
  fallbackPhone: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border border-line bg-stone-50 p-6">
        <CheckCircle2 className="h-6 w-6 text-accent" strokeWidth={1.5} />
        <p className="text-ink">
          Gracias. Este formulario se activará en la siguiente fase del sitio; mientras tanto,
          escríbenos directamente al{" "}
          <a href={`tel:${fallbackPhone.replace(/\s+/g, "")}`} className="font-medium text-ink hover:text-accent">
            {fallbackPhone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {children}
      <Button type="submit" size="lg" className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
