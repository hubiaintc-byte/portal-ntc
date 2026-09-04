"use client";

import { ESTAGIO_OPORTUNIDADE, ORIGENS_CRM, SITUACAO_OPORTUNIDADE } from "@ntc/lib";

import type { OportunidadeCrmDetalhe, TransicaoEstagioResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { rotuloDeLista, seloDeEstagio, seloDeSituacao } from "./seloStatus";

interface DetalheOportunidadeProps {
  oportunidade: OportunidadeCrmDetalhe;
  historico: TransicaoEstagioResumo[];
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
export function DetalheOportunidade({
  oportunidade: o,
  historico,
  onVoltar,
  onEditar,
}: DetalheOportunidadeProps) {
  const valorPonderado =
    o.valor !== null && o.probabilidade !== null ? (o.valor * o.probabilidade) / 100 : null;

  const dados = [
    { rotulo: "Cliente", valor: o.clienteNome },
    { rotulo: "Estágio", valor: rotuloDeLista(ESTAGIO_OPORTUNIDADE, o.estagio) },
    { rotulo: "Situação", valor: rotuloDeLista(SITUACAO_OPORTUNIDADE, o.situacao) },
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
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>{o.codigo}</h1>
        </div>
        <div className="pcms-pagehead__acoes">
          <span className={seloDeEstagio(o.estagio)}>
            {rotuloDeLista(ESTAGIO_OPORTUNIDADE, o.estagio)}
          </span>
          <span className={seloDeSituacao(o.situacao)}>
            {rotuloDeLista(SITUACAO_OPORTUNIDADE, o.situacao)}
          </span>
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onEditar}>
            Editar
          </button>
        </div>
      </div>

      {o.migracaoPendenteRevisao ? (
        <p className="pcms-editor__hint">
          <strong>Estágio provisório.</strong> Esta oportunidade veio da migração automática e ainda
          não foi confirmada pela Direção. {o.migracaoFlag ?? ""}
        </p>
      ) : null}

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

      <div className="pcms-editor__head--sub">Histórico de estágio</div>
      {historico.length === 0 ? (
        <p className="pcms-editor__hint">Nenhuma transição registrada.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Quando</th>
              <th>De</th>
              <th>Para</th>
              <th>Quem</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((t) => (
              <tr key={t.id}>
                <td>{formatarDataBR(t.dataHoraISO)}</td>
                <td>
                  {t.estagioAnterior === null
                    ? "—"
                    : rotuloDeLista(ESTAGIO_OPORTUNIDADE, t.estagioAnterior)}
                </td>
                <td>
                  <span className={seloDeEstagio(t.estagioNovo)}>
                    {rotuloDeLista(ESTAGIO_OPORTUNIDADE, t.estagioNovo)}
                  </span>
                </td>
                <td>{t.autor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {o.observacoes !== null && (
        <section className="pcms-det-bloco">
          <h2>Observações</h2>
          <p>{o.observacoes}</p>
        </section>
      )}
    </>
  );
}
