import { CheckboxField, SelectField } from "@/components/admin/ui/Field";
import { CALZADOS, PUBLICOS, TIPOS_OFERTA } from "@/lib/promociones/clasificacion";

/**
 * Los tres ejes con los que se filtra /promociones (ver
 * src/lib/promociones/clasificacion.ts). Solo el tipo de oferta es
 * obligatorio: dejar "para quién" o "calzado" vacíos significa toda la
 * familia / toda la tienda.
 */
export function ClasificacionFields({ prefijo }: { prefijo: string }) {
  return (
    <div className="flex flex-col gap-4">
      <SelectField id="tipo_oferta" label="Tipo de oferta" required defaultValue="">
        <option value="" disabled>
          ¿Qué ofreces?
        </option>
        {Object.entries(TIPOS_OFERTA).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </SelectField>

      <fieldset>
        <legend className="text-xs font-medium text-zinc-600">¿Para quién? <span className="font-normal text-zinc-400">— vacío = toda la familia</span></legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(PUBLICOS).map(([value, label]) => (
            <CheckboxField key={value} id={`${prefijo}-publico-${value}`} name="publico" value={value} label={label} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium text-zinc-600">Calzado <span className="font-normal text-zinc-400">— vacío = toda la tienda</span></legend>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(CALZADOS).map(([value, label]) => (
            <CheckboxField key={value} id={`${prefijo}-calzado-${value}`} name="calzado" value={value} label={label} />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
