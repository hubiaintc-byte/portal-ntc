import { ValidationError } from "payload";

/**
 * O Payload 3.90 converte a violação de unicidade do Postgres (23505) numa
 * `ValidationError` cujo `data.errors[].path` aponta o campo
 * (`@payloadcms/drizzle/dist/upsertRow/handleUpsertError.js`) — a mensagem
 * ("O seguinte campo está inválido: Slug") não traz mais "duplicate key".
 */
export function ehErroSlugDuplicado(e: unknown): boolean {
  if (!(e instanceof ValidationError)) return false;
  const erros = (e.data as { errors?: { path?: unknown }[] } | null)?.errors;
  return Array.isArray(erros) && erros.some((x) => x.path === "slug");
}
