"use client";

import { useMemo, useState } from "react";

import { ESTAGIOS_LEAD, diasEntre } from "@ntc/lib";

import type { LeadCrmResumo, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface KanbanProps {
  leads: LeadCrmResumo[];
  usuarios: UsuarioCmsResumo[];
  hojeISO: string;
  onAbrir: (id: string) => void;
  onMover: (id: string, estagio: string) => void;
}

/**
 * Quadro kanban do fluxo comercial (spec 2026-09-15 §4.2). Arraste com a API
 * HTML5 nativa (sem lib). O select de estágio do modal é o caminho por
 * teclado — o card em si abre o modal com Enter/Espaço.
 */
export function Kanban({ leads, usuarios, hojeISO, onAbrir, onMover }: KanbanProps) {
  const [busca, setBusca] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [mostrarPerdidos, setMostrarPerdidos] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<string | null>(null);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (!mostrarPerdidos && l.perdido) return false;
      if (responsavel !== "" && l.responsavelId !== responsavel) return false;
      if (termo === "") return true;
      return [l.instituicao, l.nome, l.clienteNome ?? "", l.programaSigla ?? ""].some((v) =>
        v.toLowerCase().includes(termo),
      );
    });
  }, [leads, busca, responsavel, mostrarPerdidos]);

  function soltar(estagio: string) {
    if (arrastando !== null) {
      const lead = leads.find((l) => l.id === arrastando);
      if (lead && lead.estagio !== estagio) onMover(arrastando, estagio);
    }
    setArrastando(null);
    setColunaAlvo(null);
  }

  return (
    <section className="pcms-kanban" aria-label="Quadro comercial">
      <div className="pcms-toolbar pcms-kanban__toolbar">
        <div className="pcms-field pcms-kanban__busca">
          <input
            type="search"
            placeholder="Buscar por órgão, contato ou programa"
            aria-label="Buscar no quadro"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="pcms-field pcms-field--curto">
          <select
            aria-label="Filtrar por responsável"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
          >
            <option value="">Todos os responsáveis</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>
        <label className="pcms-kanban__toggle">
          <input type="checkbox" checked={mostrarPerdidos} onChange={(e) => setMostrarPerdidos(e.target.checked)} />
          Mostrar perdidos
        </label>
      </div>

      <div className="pcms-kanban__colunas">
        {ESTAGIOS_LEAD.map((estagio) => {
          const cards = visiveis.filter((l) => l.estagio === estagio.value);
          const alvo = colunaAlvo === estagio.value;
          return (
            <div
              key={estagio.value}
              className={`pcms-kanban__coluna${alvo ? " pcms-kanban__coluna--alvo" : ""}`}
              onDragOver={(e) => { e.preventDefault(); if (colunaAlvo !== estagio.value) setColunaAlvo(estagio.value); }}
              onDragLeave={() => { if (colunaAlvo === estagio.value) setColunaAlvo(null); }}
              onDrop={(e) => { e.preventDefault(); soltar(estagio.value); }}
            >
              <header className="pcms-kanban__cabecalho">
                <h2>{estagio.label}</h2>
                <span className="pcms-kanban__contagem" aria-label={`${cards.length} no estágio`}>{cards.length}</span>
              </header>
              <div className="pcms-kanban__cards">
                {cards.map((l) => (
                  <article
                    key={l.id}
                    className={`pcms-kanban__card${l.perdido ? " pcms-kanban__card--perdido" : ""}${arrastando === l.id ? " pcms-kanban__card--arrastando" : ""}`}
                    draggable={!l.perdido}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir lead de ${l.instituicao}`}
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setArrastando(l.id); }}
                    onDragEnd={() => { setArrastando(null); setColunaAlvo(null); }}
                    onClick={() => onAbrir(l.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrir(l.id); } }}
                  >
                    <strong className="pcms-kanban__orgao">{l.clienteNome ?? l.instituicao}</strong>
                    <span className="pcms-kanban__contato">{l.nome}</span>
                    <div className="pcms-kanban__meta">
                      {l.programaSigla && <span className="pcms-modalidade">{l.programaSigla}</span>}
                      {l.valorEstimado !== null && <span>{formatarMoedaBRL(l.valorEstimado)}</span>}
                    </div>
                    <div className="pcms-kanban__rodape">
                      <span>{diasEntre(l.atualizadoEmISO, hojeISO)} d na coluna</span>
                      {l.perdido && <span className="pcms-selo pcms-selo--erro">Perdido</span>}
                    </div>
                  </article>
                ))}
                {cards.length === 0 && <div className="pcms-kanban__vazio">—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
