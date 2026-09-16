"use client";

import { AREAS_CRM, ESFERAS_CRM, ORIGENS_CLIENTE, TIPOS_INSTITUICAO } from "@ntc/lib";

import type { ClienteCrmDetalhe } from "@/lib/cms/painelCrm";

import { rotuloDeLista } from "./seloStatus";

interface DetalheClienteProps {
  cliente: ClienteCrmDetalhe;
  onVoltar: () => void;
  onEditar: () => void;
}

/** Tela cheia de detalhe de um cliente — leitura, com atalho para editar. */
export function DetalheCliente({ cliente: c, onVoltar, onEditar }: DetalheClienteProps) {
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
    { rotulo: "E-mail", valor: c.email ?? "—" },
    { rotulo: "Origem", valor: rotuloDeLista(ORIGENS_CLIENTE, c.origem) },
    { rotulo: "Responsável", valor: c.responsavelNome ?? "—" },
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
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>{c.orgao}</h1>
        </div>
        <div className="pcms-pagehead__acoes">
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
        <div className="pcms-editor__head--sub">Contatos</div>
        {c.contatos.length === 0 ? (
          <p>Nenhum contato cadastrado.</p>
        ) : (
          <table className="pcms-tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Setor</th>
                <th>E-mail</th>
                <th>WhatsApp</th>
                <th>Papel</th>
              </tr>
            </thead>
            <tbody>
              {c.contatos.map((ct, i) => (
                <tr key={`${ct.nome}-${i}`}>
                  <td>{ct.nome}</td>
                  <td>{ct.cargo ?? "—"}</td>
                  <td>{ct.setor ?? "—"}</td>
                  <td>{ct.email ?? "—"}</td>
                  <td>{ct.whatsapp ?? "—"}</td>
                  <td>
                    {ct.principal && <span className="pcms-selo pcms-selo--ok">Principal</span>}{" "}
                    {ct.decisor && <span className="pcms-selo pcms-selo--info">Decisor</span>}
                    {!ct.principal && !ct.decisor && "—"}
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
