"use client";

import type { ReactNode } from "react";

import { LISTAS_FIN, modalidadeKeys, type CampoDoCrm as NomeCampoCrm } from "@ntc/lib";

import { CLASSE_VERTICAL } from "../ui/Selo";
import { dataCurta, intervaloDatas, inteiro, tipoCurto } from "../ui/formato";
import {
  CampoAreaTexto,
  CampoChips,
  CampoDoCrm,
  CampoSelect,
  CampoTexto,
  Grupo,
  Nota,
} from "./CamposWizard";
import {
  campoVisivel,
  ehAberto,
  ehB2g,
  temPagantes,
  totalPrevisto,
  type FormEvento,
} from "./dadosEventos";

/**
 * As quatro etapas do wizard de evento (`eventSchemas` do protótipo FIN-05):
 * campos, campos condicionais (`show`), notas (`TIPO_NOTES`,
 * `modalidadeNote`) e o resumo da etapa 4. Campo que o CRM já preencheu sai
 * só leitura (`CampoDoCrm`).
 */

/** `TIPO_NOTES` do protótipo. */
const NOTA_TIPO: Record<string, ReactNode> = {
  "Evento aberto": (
    <>
      Evento aberto: receita por <b>inscrição</b> (quantidade × valor unitário), com <b>pagantes</b>{" "}
      e <b>cortesias</b>. Os múltiplos órgãos/clientes são registrados na aba <b>Receitas</b> do
      evento.
    </>
  ),
  "In Company / Projeto B2G": (
    <>
      In Company / B2G: <b>órgão/cliente principal</b> obrigatório; receita por <b>valor global</b>,{" "}
      <b>parcelas</b> ou <b>faturamento por etapa/módulo</b>. Informe a referência contratual na
      etapa 4.
    </>
  ),
  Programa: "Programa: composto por vários módulos; consolida módulos e custos do programa.",
  Módulo: "Módulo: unidade independente de execução, vinculada a um programa.",
  "Evento avulso": "Evento avulso: sem programa obrigatório.",
};

const ICONE_MODALIDADE = {
  "Online ao vivo": "wifi",
  Presencial: "pin",
  Híbrido: "hybrid",
} as const;

/** `modalidadeNote(v)` do protótipo. */
function NotaModalidade({ modalidade }: { modalidade: string }) {
  if (!modalidade) return null;
  const chaves = modalidadeKeys(modalidade);
  const especificas = LISTAS_FIN.categorias
    .filter((c) => c.mod.length === 1 && chaves.includes(c.mod[0]!))
    .map((c) => c.nome);
  const rotulo =
    (
      {
        "Online ao vivo": "Online",
        Presencial: "Presencial",
        Híbrido: "Híbrido (online + presencial)",
      } as Record<string, string>
    )[modalidade] ?? modalidade;
  return (
    <Nota>
      <b>{rotulo}</b> — a estrutura financeira é a mesma; na aba Custos, estas categorias aparecerão
      priorizadas:
      <div className="cat-sugg">
        {especificas.map((c) => (
          <span key={c}>{c}</span>
        ))}
        <span>+ categorias comuns</span>
      </div>
      <div style={{ marginTop: 6, opacity: 0.8 }}>
        Apoio de taxonomia: nenhum custo é gerado automaticamente.
      </div>
    </Nota>
  );
}

interface EtapaWizardProps {
  passo: number;
  v: FormEvento;
  mudar: (campo: keyof FormEvento) => (valor: string) => void;
  erros: Record<string, string>;
  soLeitura: ReadonlySet<NomeCampoCrm>;
}

export function EtapaWizard({ passo, v, mudar, erros, soLeitura }: EtapaWizardProps) {
  const erro = (c: string) => erros[c];
  const crm = (c: NomeCampoCrm) => soLeitura.has(c);

  const etapa0 = (
    <>
      {crm("nome") ? (
        <CampoDoCrm campo="nome" rotulo="Nome do evento" valor={v.nome} erro={erro("nome")} />
      ) : (
        <CampoTexto
          campo="nome"
          rotulo="Nome do evento"
          obrigatorio
          valor={v.nome}
          aoMudar={mudar("nome")}
          placeholder="Ex.: Seminário Nacional de Contratações Públicas"
          erro={erro("nome")}
        />
      )}
      <CampoChips
        campo="vertical"
        rotulo="Vertical"
        obrigatorio
        valor={v.vertical}
        aoMudar={mudar("vertical")}
        opcoes={LISTAS_FIN.verticais.map((x) => ({
          valor: x,
          rotulo: x,
          classeVertical: CLASSE_VERTICAL[x],
        }))}
        erro={erro("vertical")}
      />
      <CampoChips
        campo="tipo"
        rotulo="Tipo de operação"
        obrigatorio
        valor={v.tipo}
        aoMudar={mudar("tipo")}
        opcoes={LISTAS_FIN.tiposOperacao.map((x) => ({ valor: x, rotulo: tipoCurto(x) }))}
        erro={erro("tipo")}
      />
      {NOTA_TIPO[v.tipo] && <Nota>{NOTA_TIPO[v.tipo]}</Nota>}
      {campoVisivel("programa", v) && (
        <CampoSelect
          campo="programa"
          rotulo="Programa"
          span={3}
          obrigatorio={v.tipo === "Programa" || v.tipo === "Módulo"}
          opcional
          valor={v.programa}
          aoMudar={mudar("programa")}
          opcoes={(v.vertical && LISTAS_FIN.programas[v.vertical]) || []}
          placeholder="Selecione (conforme vertical)…"
          ajuda={v.vertical ? "" : "Selecione a vertical para listar os programas."}
          erro={erro("programa")}
        />
      )}
      {campoVisivel("modulo", v) && (
        <CampoTexto
          campo="modulo"
          rotulo="Módulo / trilha / etapas"
          span={3}
          obrigatorio={v.tipo === "Módulo"}
          opcional
          valor={v.modulo}
          aoMudar={mudar("modulo")}
          placeholder="Ex.: Módulo 02"
          erro={erro("modulo")}
        />
      )}
    </>
  );

  const etapa1 = (
    <>
      {crm("modalidade") ? (
        <CampoDoCrm
          campo="modalidade"
          rotulo="Modalidade"
          valor={v.modalidade}
          erro={erro("modalidade")}
        />
      ) : (
        <CampoChips
          campo="modalidade"
          rotulo="Modalidade"
          obrigatorio
          valor={v.modalidade}
          aoMudar={mudar("modalidade")}
          opcoes={LISTAS_FIN.modalidades.map((x) => ({
            valor: x,
            rotulo: x,
            icone: ICONE_MODALIDADE[x as keyof typeof ICONE_MODALIDADE],
          }))}
          erro={erro("modalidade")}
        />
      )}
      <NotaModalidade modalidade={v.modalidade} />
      <CampoTexto
        campo="cidade"
        rotulo="Cidade"
        span={3}
        opcional
        valor={v.cidade}
        aoMudar={mudar("cidade")}
        placeholder="Cidade-sede"
      />
      <CampoSelect
        campo="uf"
        rotulo="UF"
        span={1}
        valor={v.uf}
        aoMudar={mudar("uf")}
        opcoes={LISTAS_FIN.ufs}
        placeholder="UF"
      />
      <CampoTexto
        campo="cargaHoraria"
        rotulo="Carga horária (h)"
        tipo="number"
        span={2}
        obrigatorio
        valor={v.cargaHoraria}
        aoMudar={mudar("cargaHoraria")}
        erro={erro("cargaHoraria")}
      />
      {campoVisivel("local", v) &&
        (crm("local") ? (
          <CampoDoCrm campo="local" rotulo="Local" valor={v.local} erro={erro("local")} />
        ) : (
          <CampoTexto
            campo="local"
            rotulo="Local"
            obrigatorio
            valor={v.local}
            aoMudar={mudar("local")}
            placeholder="Espaço físico da execução"
            erro={erro("local")}
          />
        ))}
      {crm("dataInicio") ? (
        <CampoDoCrm
          campo="dataInicio"
          rotulo="Data inicial"
          span={3}
          valor={dataCurta(v.dataInicio)}
          erro={erro("dataInicio")}
        />
      ) : (
        <CampoTexto
          campo="dataInicio"
          rotulo="Data inicial"
          tipo="date"
          span={3}
          obrigatorio
          valor={v.dataInicio}
          aoMudar={mudar("dataInicio")}
          erro={erro("dataInicio")}
        />
      )}
      {crm("dataFim") ? (
        <CampoDoCrm
          campo="dataFim"
          rotulo="Data final"
          span={3}
          valor={dataCurta(v.dataFim)}
          erro={erro("dataFim")}
        />
      ) : (
        <CampoTexto
          campo="dataFim"
          rotulo="Data final"
          tipo="date"
          span={3}
          obrigatorio
          valor={v.dataFim}
          aoMudar={mudar("dataFim")}
          erro={erro("dataFim")}
        />
      )}
      <CampoSelect
        campo="status"
        rotulo="Status operacional"
        span={3}
        obrigatorio
        valor={v.status}
        aoMudar={mudar("status")}
        opcoes={LISTAS_FIN.statusOperacional}
        dica="Situação da operação. A situação da receita e a do custo são independentes desta."
        erro={erro("status")}
      />
      <CampoTexto
        campo="responsavel"
        rotulo="Responsável"
        span={3}
        obrigatorio
        valor={v.responsavel}
        aoMudar={mudar("responsavel")}
        sugestoes={LISTAS_FIN.responsaveis}
        placeholder="Função responsável"
        erro={erro("responsavel")}
      />
    </>
  );

  const pagantes = temPagantes(v);
  const etapa2 = (
    <>
      {ehAberto(v) && (
        <Nota>
          Evento aberto: não há cliente único — cada órgão/cliente é vinculado à sua receita, na aba
          Receitas.
        </Nota>
      )}
      {campoVisivel("cliente", v) &&
        (crm("cliente") ? (
          <CampoDoCrm
            campo="cliente"
            rotulo="Órgão/cliente principal"
            valor={v.cliente}
            erro={erro("cliente")}
          />
        ) : (
          <CampoTexto
            campo="cliente"
            rotulo="Órgão/cliente principal"
            obrigatorio={ehB2g(v)}
            opcional
            valor={v.cliente}
            aoMudar={mudar("cliente")}
            placeholder="Ex.: Secretaria de Estado A"
            ajuda={ehB2g(v) ? "Obrigatório em In Company/B2G." : "Quando aplicável."}
            erro={erro("cliente")}
          />
        ))}
      <Grupo titulo="Participação" />
      <CampoTexto
        campo="qtdPrevista"
        rotulo="Participantes previstos"
        tipo="number"
        span={2}
        opcional
        valor={v.qtdPrevista}
        aoMudar={mudar("qtdPrevista")}
        erro={erro("qtdPrevista")}
      />
      <CampoTexto
        campo="capacidade"
        rotulo="Capacidade"
        tipo="number"
        span={2}
        opcional
        valor={v.capacidade}
        aoMudar={mudar("capacidade")}
        erro={erro("capacidade")}
      />
      {campoVisivel("efetivos", v) && (
        <CampoTexto
          campo="efetivos"
          rotulo="Participantes efetivos"
          tipo="number"
          span={2}
          opcional
          dica="Apurados após a execução."
          valor={v.efetivos}
          aoMudar={mudar("efetivos")}
          erro={erro("efetivos")}
        />
      )}
      {pagantes && (
        <>
          <Grupo titulo="Pagantes e cortesias (previsão)" />
          <CampoTexto
            campo="pagantesPrev"
            rotulo="Pagantes previstos"
            tipo="number"
            span={2}
            opcional
            valor={v.pagantesPrev}
            aoMudar={mudar("pagantesPrev")}
            erro={erro("pagantesPrev")}
          />
          <CampoTexto
            campo="cortesiasPrev"
            rotulo="Cortesias previstas"
            tipo="number"
            span={2}
            opcional
            valor={v.cortesiasPrev}
            aoMudar={mudar("cortesiasPrev")}
            erro={erro("cortesiasPrev")}
          />
          <div className="fld s2" data-f="totPrev">
            <label htmlFor="f_totPrev">Total previsto</label>
            <output id="f_totPrev" className="computed" aria-live="polite">
              <span className="num">{inteiro(totalPrevisto(v))}</span>
            </output>
          </div>
          <Nota icone="ticket" dourada>
            Cortesia <b>não é custo negativo nem desconto</b>: é participante sem receita
            diretamente associada. Pagantes e cortesias efetivos são registrados por órgão, nas
            receitas.
          </Nota>
        </>
      )}
    </>
  );

  const resumo: [string, string][] = [
    ["Evento", v.nome],
    ["Vertical", v.vertical],
    ["Tipo", v.tipo && tipoCurto(v.tipo)],
    ["Programa/Módulo", [v.programa, v.modulo].filter(Boolean).join(" · ")],
    ["Modalidade", v.modalidade],
    ["Período", v.dataInicio ? intervaloDatas(v.dataInicio, v.dataFim) : ""],
    [
      "Local",
      [v.local, v.cidade && v.cidade + (v.uf ? "/" + v.uf : "")].filter(Boolean).join(" · "),
    ],
    ["Status", v.status],
    ["Responsável", v.responsavel],
    ["Cliente principal", ehAberto(v) ? "Múltiplos (via receitas)" : v.cliente],
  ];
  const etapa3 = (
    <>
      <Nota>
        Campos de <b>integração/referência</b>: o comercial permanece no CRM — aqui apenas
        identificamos o vínculo, sem duplicar a dimensão comercial.
      </Nota>
      <CampoTexto
        campo="refContratual"
        rotulo="Referência contratual"
        span={3}
        opcional
        valor={v.refContratual}
        aoMudar={mudar("refContratual")}
        placeholder="Nº do contrato/instrumento"
        ajuda={ehB2g(v) ? "Recomendado em In Company/B2G." : ""}
      />
      <CampoAreaTexto
        campo="observacoes"
        rotulo="Observações"
        opcional
        valor={v.observacoes}
        aoMudar={mudar("observacoes")}
      />
      <div className="summary-box">
        {resumo.map(([l, x]) => (
          <div className="cline" key={l}>
            <span className="cl">{l}</span>
            <span className="cv">{x || "—"}</span>
          </div>
        ))}
      </div>
    </>
  );

  const etapas = [etapa0, etapa1, etapa2, etapa3];
  return etapas[passo] ?? null;
}
