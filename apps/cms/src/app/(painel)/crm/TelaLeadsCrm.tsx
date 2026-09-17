"use client";

import { useMemo, useState } from "react";

import { ESTAGIOS_LEAD, rotuloDoEstagio } from "@ntc/lib";

import type { LeadCrmResumo, UsuarioCmsResumo } from "@/lib/cms/painelCrm";

import { seloDeEstagioLead } from "./seloStatus";

interface TelaLeadsCrmProps {
  leads: LeadCrmResumo[];
  usuarios: UsuarioCmsResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

type Situacao = "ativos" | "perdidos" | "todos";

const FMT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** Data local `aaaa-mm-dd` de um ISO — comparável ao valor de `<input type="date">`. */
function chaveDiaLocal(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Lista dos leads do CRM (tipo = proposta) com filtros; abre o ModalLead e cria lead manual. */
export function TelaLeadsCrm({ leads, usuarios, onAbrir, onNovo }: TelaLeadsCrmProps) {
  const [estagio, setEstagio] = useState("");
  const [situacao, setSituacao] = useState<Situacao>("ativos");
  const [responsavel, setResponsavel] = useState("");
  const [busca, setBusca] = useState("");
  const [periodoDe, setPeriodoDe] = useState("");
  const [periodoAte, setPeriodoAte] = useState("");

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      // Período (spec §4.3): inclusivo nas duas pontas, vazio = sem limite.
      const dia = periodoDe !== "" || periodoAte !== "" ? chaveDiaLocal(l.criadoEmISO) : "";
      return (
        (estagio === "" || l.estagio === estagio) &&
        (situacao === "todos" || (situacao === "perdidos") === l.perdido) &&
        (responsavel === "" || l.responsavelId === responsavel) &&
        (periodoDe === "" || dia >= periodoDe) &&
        (periodoAte === "" || dia <= periodoAte) &&
        (termo === "" ||
          [l.instituicao, l.nome, l.email, l.clienteNome ?? ""].some((v) => v.toLowerCase().includes(termo)))
      );
    });
  }, [leads, estagio, situacao, responsavel, busca, periodoDe, periodoAte]);

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Leads</h1>
          <p>
            {leads.length} {leads.length === 1 ? "lead" : "leads"} — pedidos de proposta do site e leads criados à mão.
          </p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo lead
          </button>
        </div>
      </div>

      <div className="pcms-toolbar pcms-kanban__toolbar">
        <div className="pcms-field pcms-kanban__busca">
          <input
            type="search"
            placeholder="Buscar por órgão, contato ou e-mail"
            aria-label="Buscar leads"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Estágio" value={estagio} onChange={(e) => setEstagio(e.target.value)}>
            <option value="">Todos os estágios</option>
            {ESTAGIOS_LEAD.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Situação" value={situacao} onChange={(e) => setSituacao(e.target.value as Situacao)}>
            <option value="ativos">Ativos</option>
            <option value="perdidos">Perdidos</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Responsável" value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
            <option value="">Todos os responsáveis</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="pcms-field pcms-field--curto pcms-field--data">
          <label htmlFor="leads-periodo-de">Recebido de</label>
          <input
            id="leads-periodo-de"
            type="date"
            value={periodoDe}
            max={periodoAte || undefined}
            onChange={(e) => setPeriodoDe(e.target.value)}
          />
        </div>
        <div className="pcms-field pcms-field--curto pcms-field--data">
          <label htmlFor="leads-periodo-ate">até</label>
          <input
            id="leads-periodo-ate"
            type="date"
            value={periodoAte}
            min={periodoDe || undefined}
            onChange={(e) => setPeriodoAte(e.target.value)}
          />
        </div>
      </div>

      {visiveis.length === 0 ? (
        <div className="pcms-vazio">Nenhum lead com esses filtros.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Recebido</th>
              <th>Órgão</th>
              <th>Contato</th>
              <th>Programa</th>
              <th>Estágio</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr
                key={l.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                aria-label={`Abrir lead de ${l.clienteNome ?? l.instituicao}`}
                onClick={() => onAbrir(l.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(l.id);
                  }
                }}
              >
                <td>{FMT.format(new Date(l.criadoEmISO))}</td>
                <td>
                  <strong>{l.clienteNome ?? l.instituicao}</strong>
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
                <td>{l.responsavelNome ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
