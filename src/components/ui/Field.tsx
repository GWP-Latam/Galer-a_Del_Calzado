import type { ComponentPropsWithoutRef } from "react";

const inputClasses =
  "w-full rounded-sm border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-stone-400 focus:border-ink";

export function Field({
  label,
  id,
  ...props
}: { label: string } & ComponentPropsWithoutRef<"input"> & { id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <input id={id} name={id} className={inputClasses} {...props} />
    </label>
  );
}

export function TextAreaField({
  label,
  id,
  ...props
}: { label: string } & ComponentPropsWithoutRef<"textarea"> & { id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <textarea id={id} name={id} rows={4} className={inputClasses} {...props} />
    </label>
  );
}

export function SelectField({
  label,
  id,
  children,
  ...props
}: { label: string } & ComponentPropsWithoutRef<"select"> & { id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</span>
      <select id={id} name={id} className={inputClasses} {...props}>
        {children}
      </select>
    </label>
  );
}
