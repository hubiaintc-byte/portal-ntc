"use client";

import { ORIGENS_CRM, STATUS_OPORTUNIDADE } from "@ntc/lib";

import type { OportunidadeCrmDetalhe } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { rotuloDeLista, seloDeOportunidade } from "./seloStatus";

interface DetalheOportunidadeProps {
  oportunidade: OportunidadeCrmDetalhe;
  onVoltar: () => void;
  onEditar: () => void;
}

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd); "—" para nulo. */
function formatarDataBR(iso: string | null): string {
  if (iso === null) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Tela cheia de detalhe de uma oportunidade — leitura, com atalho para editar. */
export function DetalheOportunidade({ oportunidade: o, onVoltar, onEditar }: DetalheOportunidadeProps) {
  const valorPonderado =
    o.valor !== null && o.probabilidade !== null ? (o.valor * o.probabilidade) / 100 : null;

  const dados = [
    { rotulo: "Cliente", valor: o.clienteNome },
    { rotulo: "Programa", valor: o.programaSigla ?? "—" },
    {
      rotulo: "Módulos",
      valor: o.modulos.length > 0 ? o.modulos.map((m) => m.titulo).join(", ") : "—",
    },
    {
      rotulo: "Eventos",
      valor: o.eventos.length > 0 ? o.eventos.map((e) => e.nome).join(", ") : "—",
    },
    { rotulo: "UF", valor: o.uf ?? "—" },
    { rotulo: "Origem", valor: rotuloDeLista(ORIGENS_CRM, o.origem) },
    { rotulo: "Quantidade", valor: o.quantidade !== null ? String(o.quantidade) : "—" },
    { rotulo: "Modalidade", valor: o.modalidade ?? "—" },
    { rotulo: "Valor", valor: o.valor !== null ? formatarMoedaBRL(o.valor) : "—" },
    { rotulo: "Probabilidade", valor: o.probabilidade !== null ? `${o.probabilidade}%` : "—" },
    { rotulo: "Valor ponderado", valor: valorPonderado !== null ? formatarMoedaBRL(valorPonderado) : "—" },
    { rotulo: "Data de abertura", valor: formatarDataBR(o.dataAberturaISO) },
    { rotulo: "Previsão de fechamento", valor: formatarDataBR(o.dataPrevFechamentoISO) },
    { rotulo: "Follow-up", valor: formatarDataBR(o.followupISO) },
    { rotulo: "Próxima ação", valor: o.proximaAcao ?? "—" },
    { rotulo: "Responsável", valor: o.responsavelNome ?? "—" },
  ];

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Oportunidades <span>/ {o.codigo}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>{o.codigo}</h1>
        </div>
        <div className="pcms-pagehead__acoes">
          <span className={seloDeOportunidade(o.status)}>
            {rotuloDeLista(STATUS_OPORTUNIDADE, o.status)}
          </span>
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onEditar}>
            Editar
          </button>
        </div>
      </div>

      <section className="pcms-det-bloco">
        <h2>Dados da oportunidade</h2>
        <dl className="pcms-deflist">
          {dados.map((d) => (
            <div key={d.rotulo} className="pcms-deflist__item">
              <dt>{d.rotulo}</dt>
              <dd>{d.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      {o.observacoes !== null && (
        <section className="pcms-det-bloco">
          <h2>Observações</h2>
          <p>{o.observacoes}</p>
        </section>
      )}
    </>
  );
}
