import { useMemo, useState } from "react";

import type { LeadCmsResumo, LeadTipoCms } from "@/lib/cms/painelCms";

const ROTULO_TIPO: Record<LeadTipoCms, string> = {
  proposta: "Proposta",
  contato: "Contato",
  newsletter: "Newsletter",
  candidatura: "Candidatura",
};

/** Rótulo legível para os status da coleção Leads (shared/types LEAD_STATUS). */
const ROTULO_STATUS: Record<string, string> = {
  novo: "Novo",
  "em-atendimento": "Em atendimento",
  qualificado: "Qualificado",
  descartado: "Descartado",
  convertido: "Convertido",
};

type FiltroTipo = "todos" | LeadTipoCms;

const CHIPS: { id: FiltroTipo; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "proposta", rotulo: "Propostas" },
  { id: "contato", rotulo: "Contato" },
  { id: "newsletter", rotulo: "Newsletter" },
  { id: "candidatura", rotulo: "Candidaturas" },
];

interface TelaLeadsProps {
  leads: LeadCmsResumo[];
  onAbrir: (id: string) => void;
}

/** Listagem de leads — dados reais do banco (somente leitura, triagem comercial). */
export function TelaLeads({ leads, onAbrir }: TelaLeadsProps) {
  const [filtro, setFiltro] = useState<FiltroTipo>("todos");

  const visiveis = useMemo(
    () => (filtro === "todos" ? leads : leads.filter((l) => l.tipo === filtro)),
    [leads, filtro],
  );

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Leads</h1>
          <p>
            {leads.length === 0
              ? "Nenhum lead recebido ainda."
              : `${leads.length} ${leads.length === 1 ? "lead recebido" : "leads recebidos"} pelos formulários do site.`}
          </p>
        </div>
      </div>

      <div className="pcms-toolbar">
        <div className="pcms-filtros">
          {CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`pcms-chip${filtro === c.id ? " pcms-chip--ativo" : ""}`}
              aria-pressed={filtro === c.id}
              onClick={() => setFiltro(c.id)}
            >
              {c.rotulo}
            </button>
          ))}
        </div>
      </div>

      {visiveis.length === 0 ? (
        <div className="pcms-vazio">
          {leads.length === 0
            ? "Nenhum lead recebido ainda."
            : "Nenhum lead deste tipo."}
        </div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Instituição</th>
              <th>Tipo</th>
              <th>Recebido</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr
                key={l.id}
                className="pcms-linha-click"
                tabIndex={0}
                role="button"
                aria-label={`Abrir lead de ${l.nome}`}
                onClick={() => onAbrir(l.id)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onAbrir(l.id);
                  }
                }}
              >
                <td>
                  <div className="pcms-cel-nome">
                    <span>
                      <strong>{l.nome}</strong>
                      <small>{l.email}</small>
                    </span>
                  </div>
                </td>
                <td>{l.instituicao}</td>
                <td>
                  <span className="pcms-modalidade">{ROTULO_TIPO[l.tipo]}</span>
                </td>
                <td>{l.data}</td>
                <td>
                  <span className={`pcms-selo pcms-selo--${l.status}`}>
                    {ROTULO_STATUS[l.status] ?? l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
