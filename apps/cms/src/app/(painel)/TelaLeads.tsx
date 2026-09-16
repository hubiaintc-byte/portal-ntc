import { rotuloDoEstagio } from "@ntc/lib";

import type { LeadCrmResumo } from "@/lib/cms/painelCrm";

import { seloDeEstagioLead } from "./crm/seloStatus";

interface TelaLeadsProps {
  leads: LeadCrmResumo[];
  onAbrir: (id: string) => void;
}

/** Listagem simples dos leads do CRM (tipo = proposta) — o kanban chega na Task 9. */
export function TelaLeads({ leads, onAbrir }: TelaLeadsProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Leads</h1>
          <p>
            {leads.length === 0
              ? "Nenhum lead recebido ainda."
              : `${leads.length} ${leads.length === 1 ? "lead" : "leads"} no funil comercial.`}
          </p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="pcms-vazio">Nenhum lead recebido ainda.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Órgão</th>
              <th>Contato</th>
              <th>Programa</th>
              <th>Estágio</th>
              <th>Recebido</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
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
                  <strong>{l.instituicao}</strong>
                </td>
                <td>
                  <div className="pcms-cel-nome">
                    <span>
                      <strong>{l.nome}</strong>
                      <small>{l.email}</small>
                    </span>
                  </div>
                </td>
                <td>{l.programaSigla ?? "—"}</td>
                <td>
                  <span className={seloDeEstagioLead(l.estagio)}>{rotuloDoEstagio(l.estagio)}</span>{" "}
                  {l.perdido && <span className="pcms-selo pcms-selo--erro">Perdido</span>}
                </td>
                <td>{new Date(l.criadoEmISO).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
