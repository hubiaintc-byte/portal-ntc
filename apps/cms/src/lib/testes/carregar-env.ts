import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Carrega o `.env` da raiz do monorepo para o Vitest de integração.
 *
 * O `payload run` faz isso sozinho; o Vitest não. Sem `DATABASE_URI` e
 * `PAYLOAD_SECRET` no ambiente, `buildConfig` falha ao resolver a config real.
 *
 * Só preenche o que ainda não está definido: uma variável já exportada no
 * shell continua vencendo o arquivo.
 */
const caminho = fileURLToPath(new URL("../../../../../.env", import.meta.url));

for (const linha of readFileSync(caminho, "utf8").split("\n")) {
  const limpa = linha.trim();
  if (limpa.length === 0 || limpa.startsWith("#")) continue;

  const separador = limpa.indexOf("=");
  if (separador === -1) continue;

  const chave = limpa.slice(0, separador).trim();
  const bruto = limpa.slice(separador + 1).trim();
  const valor = bruto.replace(/^["'](.*)["']$/, "$1");

  if (process.env[chave] === undefined) process.env[chave] = valor;
}
