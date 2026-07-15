"use client";

import {
  AREAS_CRM,
  ESFERAS_CRM,
  ORIGENS_CRM,
  STATUS_CLIENTE_CRM,
  STATUS_OPORTUNIDADE,
  TIPOS_INSTITUICAO,
} from "@ntc/lib";

import type { ClienteCrmDetalhe } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { rotuloDeLista, seloDeCliente, seloDeOportunidade } from "./seloStatus";

interface DetalheClienteProps {
  cliente: ClienteCrmDetalhe;
  onVoltar: () => void;
  onEditar: () => void;
  onAbrirOportunidade: (id: string) => void;
  onNovaOportunidade: () => void;
  onNovoContato: () => void;
}

/** Tela cheia de detalhe de um cliente — leitura, com atalhos para editar/criar registros ligados. */
export function DetalheCliente({
  cliente: c,
  onVoltar,
  onEditar,
  onAbrirOportunidade,
  onNovaOportunidade,
  onNovoContato,
}: DetalheClienteProps) {
  const dados = [
    { rotulo: "Órgão", valor: c.orgao },
    { rotulo: "Sigla", valor: c.sigla ?? "—" },
    { rotulo: "Tipo", valor: rotuloDeLista(TIPOS_INSTITUICAO, c.tipo) },
    {
      rotulo: "Município",
      valor: c.municipio !== null ? `${c.municipio}${c.uf !== null ? ` / ${c.uf}` : ""}` : "—",
    },
    { rotulo: "Esfera", valor: rotuloDeLista(ESFERAS_CRM, c.esfera) },
    { rotulo: "Área", valor: rotuloDeLista(AREAS_CRM, c.area) },
    { rotulo: "CNPJ", valor: c.cnpj ?? "—" },
    { rotulo: "Dirigente", valor: c.dirigente ?? "—" },
    { rotulo: "Cargo do dirigente", valor: c.cargoDirigente ?? "—" },
    { rotulo: "E-mail", valor: c.email ?? "—" },
    { rotulo: "Origem", valor: rotuloDeLista(ORIGENS_CRM, c.origem) },
    { rotulo: "Potencial", valor: c.potencial !== null ? formatarMoedaBRL(c.potencial) : "—" },
    { rotulo: "Responsável", valor: c.responsavelNome ?? "—" },
    { rotulo: "Próxima ação", valor: c.proximaAcao ?? "—" },
  ];

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Clientes <span>/ {c.orgao}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>{c.orgao}</h1>
        </div>
        <div className="pcms-pagehead__acoes">
          <span className={seloDeCliente(c.status)}>{rotuloDeLista(STATUS_CLIENTE_CRM, c.status)}</span>
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onEditar}>
            Editar
          </button>
        </div>
      </div>

      <section className="pcms-det-bloco">
        <h2>Dados institucionais</h2>
        <dl className="pcms-deflist">
          {dados.map((d) => (
            <div key={d.rotulo} className="pcms-deflist__item">
              <dt>{d.rotulo}</dt>
              <dd>{d.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      {c.observacoes !== null && (
        <section className="pcms-det-bloco">
          <h2>Observações</h2>
          <p>{c.observacoes}</p>
        </section>
      )}

      <section className="pcms-det-bloco">
        <div className="pcms-editor__head--sub">
          Contatos
          <button type="button" className="pcms-link-acao" onClick={onNovoContato}>
            Novo contato
          </button>
        </div>
        {c.contatos.length === 0 ? (
          <p>Nenhum contato cadastrado.</p>
        ) : (
          <table className="pcms-tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th>E-mail</th>
                <th>WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {c.contatos.map((ct) => (
                <tr key={ct.id}>
                  <td>{ct.nome}</td>
                  <td>{ct.cargo ?? "—"}</td>
                  <td>{ct.email ?? "—"}</td>
                  <td>{ct.whatsapp ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="pcms-det-bloco">
        <div className="pcms-editor__head--sub">
          Oportunidades
          <button type="button" className="pcms-link-acao" onClick={onNovaOportunidade}>
            Nova oportunidade
          </button>
        </div>
        {c.oportunidades.length === 0 ? (
          <p>Nenhuma oportunidade cadastrada.</p>
        ) : (
          <table className="pcms-tabela">
            <thead>
              <tr>
                <th>Código</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {c.oportunidades.map((o) => (
                <tr
                  key={o.id}
                  className="pcms-linha-click"
                  role="button"
                  tabIndex={0}
                  onClick={() => onAbrirOportunidade(o.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onAbrirOportunidade(o.id);
                    }
                  }}
                >
                  <td>{o.codigo}</td>
                  <td>{o.valor !== null ? formatarMoedaBRL(o.valor) : "—"}</td>
                  <td>
                    <span className={seloDeOportunidade(o.status)}>
                      {rotuloDeLista(STATUS_OPORTUNIDADE, o.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
