import type { CollectionBeforeOperationHook } from "payload";

/**
 * Normaliza o nome do arquivo de upload ANTES de ir ao Sharp/Supabase S3.
 *
 * O Supabase Storage (endpoint S3-compat) rejeita chaves de objeto com
 * acentos e caracteres especiais — ex.: "César-Callegari.png" vira
 * "Ce%CC%81sar-Callegari.png" e o S3 responde `InvalidKey` (400), o que
 * derruba o upload com 500. Como nomes de palestrantes têm acento, isso
 * quebrava o fluxo de fotos.
 *
 * A normalização:
 *  - separa acentos (NFD) e remove os diacríticos combinantes;
 *  - troca qualquer caractere fora de [A-Za-z0-9._-] por hífen;
 *  - colapsa hífens repetidos e apara as pontas;
 *  - preserva a extensão.
 *
 * Ex.: "César-Callegari.png" → "Cesar-Callegari.png"
 *      "João da Silva (foto).JPG" → "Joao-da-Silva-foto.JPG"
 */
export function normalizarNomeArquivo(nome: string): string {
  const ponto = nome.lastIndexOf(".");
  const base = ponto > 0 ? nome.slice(0, ponto) : nome;
  const ext = ponto > 0 ? nome.slice(ponto) : "";

  const baseLimpa = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos combinantes
    .replace(/[^A-Za-z0-9._-]+/g, "-") // qualquer outro char vira hífen
    .replace(/-+/g, "-") // colapsa hífens
    .replace(/^[-.]+|[-.]+$/g, ""); // apara hífens/pontos das pontas

  const extLimpa = ext
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9.]+/g, "");

  return `${baseLimpa || "arquivo"}${extLimpa.toLowerCase()}`;
}

/**
 * Hook `beforeOperation` (create/update) que aplica `normalizarNomeArquivo`
 * ao arquivo recebido no upload. No-op quando não há arquivo na request
 * (ex.: edição de metadados sem trocar a imagem).
 */
export const sanitizarFilename: CollectionBeforeOperationHook = ({ req, operation }) => {
  if (operation !== "create" && operation !== "update") return;
  const file = req.file;
  if (file?.name) {
    file.name = normalizarNomeArquivo(file.name);
  }
};
