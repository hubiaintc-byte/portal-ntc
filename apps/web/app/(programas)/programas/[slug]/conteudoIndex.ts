/**
 * Tipo `ConteudoPrograma` e índice agregador dos 15 programas.
 *
 * Cada programa tem seu próprio arquivo `conteudo<SIGLA>.ts` com o
 * objeto literal exportado. Este índice apenas registra todos eles
 * em `PROGRAMAS` para consumo pela rota dinâmica.
 *
 * Política da porta do HTML: conteúdo é cópia 1:1 dos protótipos
 * (CLAUDE.md §5.3). Sem CMS nesta versão.
 */

import type { ConteudoPrograma, RelacionadoPrograma } from "@ntc/lib";
import { AGIP } from "./conteudoAGIP";
import { EDUTEC } from "./conteudoEDUTEC";
import { EGIDE } from "./conteudoEGIDE";
import { FUTURA } from "./conteudoFUTURA";
import { LIDERA } from "./conteudoLIDERA";
import { PEAR } from "./conteudoPEAR";
import { PEI } from "./conteudoPEI";
import { PINEI } from "./conteudoPINEI";
import { PROAPS } from "./conteudoPROAPS";
import { PROGE } from "./conteudoPROGE";
import { PROGIR } from "./conteudoPROGIR";
import { PROSUS } from "./conteudoPROSUS";
import { SIGA } from "./conteudoSIGA";
import { SIGS } from "./conteudoSIGS";
import { VIVAESCOLA } from "./conteudoVIVAESCOLA";

export type {
  Vertical,
  CtaPrograma,
  StatHero,
  MetaItem,
  EixoTematico,
  Modulo,
  FaqItem,
  RelacionadoPrograma,
  NavAnchor,
  BlocoEditorial,
  DetalhamentoItem,
  Detalhamento,
  DiferencialItem,
  Diferenciais,
  CoordenacaoDocente,
  EspecialistaDocente,
  DocentesRich,
  EventoMini,
  EventoFeature,
  ModulosAbertosRich,
  CtaFinal,
  ConteudoPrograma,
} from "@ntc/lib";

export const PROGRAMAS: Record<string, ConteudoPrograma> = {
  [AGIP.slug]: AGIP,
  [EDUTEC.slug]: EDUTEC,
  [EGIDE.slug]: EGIDE,
  [FUTURA.slug]: FUTURA,
  [LIDERA.slug]: LIDERA,
  [PEAR.slug]: PEAR,
  [PEI.slug]: PEI,
  [PINEI.slug]: PINEI,
  [PROAPS.slug]: PROAPS,
  [PROGE.slug]: PROGE,
  [PROGIR.slug]: PROGIR,
  [PROSUS.slug]: PROSUS,
  [SIGA.slug]: SIGA,
  [SIGS.slug]: SIGS,
  [VIVAESCOLA.slug]: VIVAESCOLA,
};

export const SLUGS_VALIDOS: string[] = Object.keys(PROGRAMAS);

export function calcularRelacionados(slugAtual: string): RelacionadoPrograma[] {
  const atual = PROGRAMAS[slugAtual];
  if (!atual) return [];
  return Object.values(PROGRAMAS)
    .filter((p) => p.vertical === atual.vertical && p.slug !== slugAtual)
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      sigla: p.siglaExibida,
      nomeCurto: p.nomeCompleto,
      descritor: p.breadcrumb.current,
    }));
}
