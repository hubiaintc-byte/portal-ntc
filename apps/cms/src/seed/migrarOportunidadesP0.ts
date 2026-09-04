/**
 * Migra as oportunidades existentes para o funil P0 — docs/17 §1.5 e §5.
 *
 * Uso:
 *   pnpm --filter @ntc/cms crm:migrar-p0                              # dry-run: só relata
 *   CRM_MIGRACAO_APLICAR=1 pnpm --filter @ntc/cms crm:migrar-p0       # grava
 *
 * Env var em vez de flag porque o pnpm engole flags sem `--` (mesma decisão
 * de crm:importar).
 *
 * ATENÇÃO — ORDEM OBRIGATÓRIA: rode esta migração IMEDIATAMENTE APÓS o
 * `payload:push:schema`, antes de qualquer uso do painel. `estagio` e
 * `situacao` são `required` com `defaultValue`, então o push preenche TODAS
 * as linhas existentes com "mapeada"/"ativa" — a verdade fica só no `status`
 * legado, que este script lê. Uma única edição pela interface entre o push e
 * a migração reescreve esse `status` a partir do estágio default (hook
 * `espelharStatusLegado`) e a posição real de funil daquela oportunidade se
 * perde para sempre.
 *
 * Idempotência: pula quem JÁ TEM linha em `historico-estagio` — não quem tem
 * `estagio` preenchido, que o default do push preenche em todo mundo e faria
 * o script pular a base inteira relatando sucesso. Como consequência, o
 * script sobrescreve `estagio`/`situacao` a partir do `status` legado mesmo
 * quando já vierem preenchidos, e é auto-recuperável: se morrer entre o
 * update da oportunidade e o create do histórico, a re-execução refaz os dois.
 *
 * Os casos ambíguos NÃO são consolidados como verdade histórica: saem com
 * migracaoPendenteRevisao = true e a flag explicando o que a Direção precisa
 * confirmar. "Mapeada" vindo de Perdida/Cancelada é fallback técnico.
 */
import { planejarMigracaoOportunidade } from "@ntc/lib";
import { getPayload } from "payload";

import { lerEstagioOuNulo, montarTransicaoEstagio } from "../lib/crm/historicoEstagio";
import { ehSituacaoOportunidade } from "../lib/crm/situacaoOportunidade";
import config from "../payload.config";

const APLICAR = process.env.CRM_MIGRACAO_APLICAR === "1";

const AVISO_ORDEM =
  "ATENÇÃO: rode esta migração imediatamente após o payload:push:schema, antes de qualquer uso do painel — " +
  "uma edição pela interface reescreve o status legado a partir do estágio default e a posição real de funil se perde.";

/** Relationship do Payload: id cru com depth 0, objeto populado quando populado. */
function idDoRelacionamento(v: unknown): string | null {
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (typeof v === "object" && v !== null && "id" in v) {
    const { id } = v;
    if (typeof id === "number" || typeof id === "string") return String(id);
  }
  return null;
}

const payload = await getPayload({ config });

console.log(`${AVISO_ORDEM}\n`);

const res = await payload.find({
  collection: "oportunidades",
  limit: 1000,
  depth: 0,
  sort: "codigo",
});

/**
 * Uma consulta só para toda a página: quem já tem histórico já foi migrado.
 * Uma consulta por oportunidade seria N+1 contra o Postgres do Supabase.
 */
const idsDaPagina = res.docs.map((doc) => String(doc.id));
const jaMigradas = new Set<string>();
if (idsDaPagina.length > 0) {
  const historico = await payload.find({
    collection: "historico-estagio",
    where: { oportunidade: { in: idsDaPagina } },
    pagination: false,
    depth: 0,
    select: { oportunidade: true },
  });
  for (const linha of historico.docs) {
    const id = idDoRelacionamento(linha.oportunidade);
    if (id !== null) jaMigradas.add(id);
  }
}

let migradas = 0;
let pendentes = 0;
let puladas = 0;
let erros = 0;

for (const doc of res.docs) {
  if (jaMigradas.has(String(doc.id))) {
    puladas += 1;
    continue;
  }
  const plano = planejarMigracaoOportunidade(doc.status ?? null);
  const estagio = lerEstagioOuNulo(plano.estagio);
  const situacao = ehSituacaoOportunidade(plano.situacao) ? plano.situacao : null;
  if (estagio === null || situacao === null) {
    // Defensivo: só dispara se a TABELA_MIGRACAO de @ntc/lib passar a devolver
    // um slug fora das listas controladas — não deveria acontecer em uso normal.
    console.error(
      `${doc.codigo}: plano de migração inválido (estagio=${plano.estagio}, situacao=${plano.situacao}) — pulando.`,
    );
    erros += 1;
    continue;
  }

  const linha = `${doc.codigo}: ${doc.status ?? "(sem status)"} -> ${estagio} / ${situacao}`;
  console.log(plano.revisao ? `${linha}  [REVISAR] ${plano.flag}` : linha);
  migradas += 1;
  if (plano.revisao) pendentes += 1;

  if (!APLICAR) continue;

  await payload.update({
    collection: "oportunidades",
    id: doc.id,
    context: { migracaoP0: true },
    data: {
      estagio,
      situacao,
      migracaoPendenteRevisao: plano.revisao,
      migracaoFlag: plano.revisao ? plano.flag : null,
    },
  });

  // O hook afterChange da coleção só registra transição quando o estágio muda
  // e não conhece o motivo da migração; a linha de origem é gravada aqui, com
  // ator de sistema legível (divergência M6 de docs/17 §4.0). O contexto
  // `migracaoP0` acima faz o hook pular a própria escrita, evitando duplicar
  // este registro.
  const transicao = montarTransicaoEstagio({
    oportunidadeId: doc.id,
    anterior: null,
    novo: estagio,
    atorSistema: "migração automática",
    motivo: `Migração P0 do status legado "${doc.status ?? "(sem status)"}". ${plano.flag}`.trim(),
  });
  if (transicao !== null) {
    await payload.create({ collection: "historico-estagio", data: transicao });
  }
}

console.log(
  `\n${APLICAR ? "APLICADO" : "DRY-RUN"} · ${migradas} oportunidade(s) migrada(s), ` +
    `${pendentes} pendente(s) de revisão humana, ${puladas} já migrada(s) e pulada(s) ` +
    `(já tinham histórico), ${erros} erro(s).`,
);
if (!APLICAR) console.log("Nada foi gravado. Rode com CRM_MIGRACAO_APLICAR=1 para aplicar.");
console.log(AVISO_ORDEM);
process.exit(0);
