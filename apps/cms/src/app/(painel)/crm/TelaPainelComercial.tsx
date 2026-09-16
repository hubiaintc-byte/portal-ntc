"use client";

import type { LeadCrmResumo, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import { calcularKpisComercial, formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { Kanban } from "./Kanban";

interface TelaPainelComercialProps {
  leads: LeadCrmResumo[];
  usuarios: UsuarioCmsResumo[];
  hojeISO: string;
  erroLeitura: boolean;
  onAbrirLead: (id: string) => void;
  onMoverLead: (id: string, estagio: string) => void;
}

/** Dashboard comercial — KPIs + quadro kanban do funil (spec 2026-09-15 §4.2). */
export function TelaPainelComercial({
  leads,
  usuarios,
  hojeISO,
  erroLeitura,
  onAbrirLead,
  onMoverLead,
}: TelaPainelComercialProps) {
  const kpis = calcularKpisComercial(leads, hojeISO);

  const metricas = [
    { rotulo: "Leads (30 dias)", valor: String(kpis.leadsNovos30d) },
    { rotulo: "Negócios ativos", valor: String(kpis.negociosAtivos) },
    { rotulo: "Valor em negociação", valor: formatarMoedaBRL(kpis.valorEmNegociacao) },
    { rotulo: "Eventos agendados", valor: String(kpis.eventosAgendados) },
  ];

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Dashboard</h1>
          <p>Leads em andamento por estágio. Arraste para mover; clique para abrir.</p>
        </div>
      </div>

      {erroLeitura && (
        <p className="pcms-form-aviso pcms-form-aviso--erro" role="alert">
          Não foi possível ler o banco de dados. Os números abaixo podem estar incompletos.
        </p>
      )}

      <div className="pcms-metricas">
        {metricas.map((m) => (
          <div key={m.rotulo} className="pcms-metrica">
            <div className="pcms-metrica__valor">{m.valor}</div>
            <div className="pcms-metrica__rotulo">{m.rotulo}</div>
          </div>
        ))}
      </div>

      <Kanban leads={leads} usuarios={usuarios} hojeISO={hojeISO} onAbrir={onAbrirLead} onMover={onMoverLead} />
    </>
  );
}
