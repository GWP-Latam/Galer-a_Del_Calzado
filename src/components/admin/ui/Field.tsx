import type { ComponentPropsWithoutRef } from "react";

const base =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900";

export function Field({
  label,
  id,
  hint,
  ...props
}: { label: string; hint?: string } & ComponentPropsWithoutRef<"input"> & { id: string }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <input id={id} name={id} className={base} {...props} />
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
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
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <textarea id={id} name={id} rows={4} className={base} {...props} />
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
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <select id={id} name={id} className={base} {...props}>
        {children}
      </select>
    </label>
  );
}

export function CheckboxField({
  label,
  id,
  ...props
}: { label: string } & ComponentPropsWithoutRef<"input"> & { id: string }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2">
      <input id={id} name={id} type="checkbox" className="h-4 w-4 rounded border-zinc-300" {...props} />
      <span className="text-sm text-zinc-700">{label}</span>
    </label>
  );
}
