"use client";

import type { LeadCrmResumo } from "@/lib/cms/painelCrm";
import { calcularKpisComercial, formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaPainelComercialProps {
  leads: LeadCrmResumo[];
  hojeISO: string;
  erroLeitura: boolean;
}

/** Dashboard comercial — KPIs sobre os leads do funil (spec 2026-09-15 §4.2). */
export function TelaPainelComercial({ leads, hojeISO, erroLeitura }: TelaPainelComercialProps) {
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
          <p>Visão do funil comercial.</p>
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

      <div className="pcms-vazio">Quadro kanban — Task 9.</div>
    </>
  );
}
