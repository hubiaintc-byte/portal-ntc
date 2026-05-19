import type { FieldHook } from "payload";
import slugify from "slugify";

/**
 * Gera slug a partir de um campo-fonte quando o slug está vazio (doc 11 §17).
 *
 * Locale "pt" mantém transliteração adequada (ç → c, ã → a). `strict: true`
 * remove pontuação. Se o usuário digitou um slug manualmente, respeita.
 */
export const autoSlug =
  (sourceField: string): FieldHook =>
  ({ data, originalDoc, value }) => {
    if (value) return value;
    const source = data?.[sourceField] ?? originalDoc?.[sourceField];
    if (typeof source !== "string" || source.length === 0) return value;
    return slugify(source, { lower: true, strict: true, locale: "pt" });
  };
