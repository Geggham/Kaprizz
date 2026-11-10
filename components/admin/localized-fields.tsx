"use client";

export const cmsLocales = ["en", "ru", "hy"] as const;
export type CmsLocale = (typeof cmsLocales)[number];
export type LocalizedValue = { locale: CmsLocale; value: string };

export function emptyLocalized(): LocalizedValue[] {
  return cmsLocales.map((locale) => ({ locale, value: "" }));
}

export function localizedFromRows(rows: { locale: string; value: string | null | undefined }[]): LocalizedValue[] {
  return cmsLocales.map((locale) => ({
    locale,
    value: rows.find((row) => row.locale === locale)?.value ?? "",
  }));
}

export function LocalizedFields({
  label,
  values,
  onChange,
  multiline = false,
}: {
  label: string;
  values: LocalizedValue[];
  onChange: (values: LocalizedValue[]) => void;
  multiline?: boolean;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-semibold">{label}</legend>
      {values.map((item) => (
        <label key={item.locale} className="grid gap-1 text-xs font-medium text-leather">
          {item.locale.toUpperCase()}
          {multiline ? (
            <textarea
              rows={3}
              value={item.value}
              onChange={(event) => onChange(values.map((value) => value.locale === item.locale ? { ...value, value: event.target.value } : value))}
              className="border border-sand p-2 text-sm text-charcoal"
            />
          ) : (
            <input
              value={item.value}
              onChange={(event) => onChange(values.map((value) => value.locale === item.locale ? { ...value, value: event.target.value } : value))}
              className="border border-sand p-2 text-sm text-charcoal"
            />
          )}
        </label>
      ))}
    </fieldset>
  );
}
