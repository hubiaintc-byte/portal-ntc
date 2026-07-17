"use client";

import type { LeadCmsResumo } from "@/lib/cms/painelCms";
import type { OportunidadeCrmResumo } from "@/lib/cms/painelCrm";
import {
  abertasPorStatus,
  calcularKpisComercial,
  followupsProximos,
  formatarMoedaBRL,
  funilOportunidades,
} from "@/lib/cms/kpisComercial";
import { STATUS_OPORTUNIDADE } from "@ntc/lib";

import { DonutStatus, FunilBarras } from "./GraficosComercial";
import { rotuloDeLista, seloDeOportunidade } from "./seloStatus";

interface TelaPainelComercialProps {
  oportunidades: OportunidadeCrmResumo[];
  leads: LeadCmsResumo[];
  hojeISO: string;
  erroLeitura: boolean;
  onAbrirOportunidade: (id: string) => void;
}

/** Painel Comercial — KPIs do funil + follow-ups da semana. */
export function TelaPainelComercial({
  oportunidades,
  leads,
  hojeISO,
  erroLeitura,
  onAbrirOportunidade,
}: TelaPainelComercialProps) {
  const kpis = calcularKpisComercial(oportunidades, leads);
  const followups = followupsProximos(oportunidades, hojeISO);
  const porStatus = abertasPorStatus(oportunidades);
  const funil = funilOportunidades(oportunidades);

  const metricas = [
    { rotulo: "Oportunidades abertas", valor: String(kpis.oportunidadesAbertas) },
    { rotulo: "Valor em negociação", valor: formatarMoedaBRL(kpis.valorEmNegociacao) },
    { rotulo: "Pipeline ponderado", valor: formatarMoedaBRL(kpis.pipelinePonderado) },
    { rotulo: "Leads novos", valor: String(kpis.leadsNovos) },
  ];

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Dashboard Executivo</h1>
          <p>Visão do funil de oportunidades e follow-ups da semana.</p>
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

      <div className="pcms-graficos">
        <section className="pcms-chart-box">
          <h2>Oportunidades por status</h2>
          <DonutStatus faixas={porStatus} />
        </section>
        <section className="pcms-chart-box">
          <h2>Funil de oportunidades</h2>
          <FunilBarras faixas={funil} />
        </section>
      </div>

      <h2 className="pcms-pagehead__eyebrow">Follow-ups · próximos 7 dias</h2>
      {followups.length === 0 ? (
        <div className="pcms-vazio">Nenhum follow-up programado para os próximos 7 dias.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Programa</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((o) => (
              <tr
                key={o.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                aria-label={`Abrir oportunidade ${o.codigo}`}
                onClick={() => onAbrirOportunidade(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrirOportunidade(o.id);
                  }
                }}
              >
                <td>{o.codigo}</td>
                <td>{o.clienteNome}</td>
                <td>{o.programaSigla ?? "—"}</td>
                <td>{o.valor !== null ? formatarMoedaBRL(o.valor) : "—"}</td>
                <td>
                  <span className={seloDeOportunidade(o.status)}>
                    {rotuloDeLista(STATUS_OPORTUNIDADE, o.status)}
                  </span>
                </td>
                <td>{o.followupISO?.split("-").reverse().join("/") ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
