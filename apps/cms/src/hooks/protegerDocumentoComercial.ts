import { randomBytes } from "node:crypto";

import { APIError, type CollectionBeforeOperationHook } from "payload";

/**
 * Documentos comerciais (propostas, contratos, empenhos) só podem ir para o
 * bucket privado. Sem `SUPABASE_BUCKET_PRIVADO`, o plugin de storage cairia no
 * bucket público de `media` — em silêncio. Aqui o envio é recusado em vez
 * disso: o painel continua no ar, mas nenhum documento sai do privado.
 */
export function bucketPrivadoConfigurado(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.SUPABASE_BUCKET_PRIVADO?.trim());
}

const SUFIXO = /-[0-9a-f]{8}(\.[A-Za-z0-9]+)?$/;

/**
 * Nome não adivinhável: acrescenta 8 hex antes da extensão ("Contrato.pdf" →
 * "Contrato-1a2b3c4d.pdf"). Quem já tem o sufixo (o PDF gerado da proposta)
 * fica como está.
 */
export function nomeComSufixoAleatorio(nome: string, sufixo = randomBytes(4).toString("hex")): string {
  if (SUFIXO.test(nome)) return nome;
  const ponto = nome.lastIndexOf(".");
  return ponto > 0 ? `${nome.slice(0, ponto)}-${sufixo}${nome.slice(ponto)}` : `${nome}-${sufixo}`;
}

/** `beforeOperation` de documentos-comerciais — roda depois de `sanitizarFilename`. */
export const protegerDocumentoComercial: CollectionBeforeOperationHook = ({ req, operation }) => {
  if (operation !== "create" && operation !== "update") return;
  const file = req.file;
  if (!file) return;
  if (!bucketPrivadoConfigurado()) {
    throw new APIError(
      "Armazenamento privado de documentos não configurado (SUPABASE_BUCKET_PRIVADO). Avise o administrador.",
      503,
    );
  }
  file.name = nomeComSufixoAleatorio(file.name);
};
