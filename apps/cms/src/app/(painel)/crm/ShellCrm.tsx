"use client";

import { useState, useTransition } from "react";

import type { LeadCmsDetalhe, LeadCmsResumo } from "@/lib/cms/painelCms";
import type {
  CatalogoCrm,
  ClienteCrmDetalhe,
  ClienteCrmResumo,
  ContatoCrmResumo,
  OportunidadeCrmDetalhe,
  OportunidadeCrmResumo,
  UsuarioCmsResumo,
} from "@/lib/cms/painelCrm";

import { carregarLead } from "../acoes";
import { carregarClienteCrm, carregarOportunidadeCrm } from "../acoesCrm";
import { DetalheLead } from "../DetalheLead";
import { TelaLeads } from "../TelaLeads";
import { ShellPainel, type GrupoNav } from "../shell/ShellPainel";
import { DetalheCliente } from "./DetalheCliente";
import { DetalheOportunidade } from "./DetalheOportunidade";
import { FormCliente } from "./FormCliente";
import { FormContato } from "./FormContato";
import { FormOportunidade } from "./FormOportunidade";
import { TelaClientes } from "./TelaClientes";
import { TelaContatos } from "./TelaContatos";
import { TelaOportunidades } from "./TelaOportunidades";
import { TelaPainelComercial } from "./TelaPainelComercial";

interface ShellCrmProps {
  usuario: { nome: string; email: string };
  clientes: ClienteCrmResumo[];
  contatos: ContatoCrmResumo[];
  oportunidades: OportunidadeCrmResumo[];
  leads: LeadCmsResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  hojeISO: string;
  erroLeitura: boolean;
}

type TelaCrmId = "painel" | "leads" | "clientes" | "contatos" | "oportunidades";

/** Formulário de criação/edição aberto em tela cheia. */
type FormCrmAberto =
  | { entidade: "cliente"; inicial: ClienteCrmDetalhe | null }
  | { entidade: "contato"; inicial: ContatoCrmResumo | null }
  | { entidade: "oportunidade"; inicial: OportunidadeCrmDetalhe | null };

/* Ícones lineares funcionais, peso 1.5 (CLAUDE.md §3). */
const Ico = {
  painel: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  leads: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  clientes: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 21V5l6-2v18" />
      <path d="M10 21h10V9l-10-2" />
      <path d="M14 12h2M14 16h2" />
    </svg>
  ),
  contatos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
    </svg>
  ),
  oportunidades: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 21 12l-9 9-9-9z" />
    </svg>
  ),
};

const NAV_COMERCIAL: { id: TelaCrmId; rotulo: string; icone: React.ReactNode }[] = [
  { id: "painel", rotulo: "Painel Comercial", icone: Ico.painel },
  { id: "leads", rotulo: "Leads", icone: Ico.leads },
  { id: "clientes", rotulo: "Clientes", icone: Ico.clientes },
  { id: "contatos", rotulo: "Contatos", icone: Ico.contatos },
  { id: "oportunidades", rotulo: "Oportunidades", icone: Ico.oportunidades },
];

const CRUMB: Record<TelaCrmId, string> = {
  painel: "CRM · Painel Comercial",
  leads: "CRM · Leads",
  clientes: "CRM · Clientes",
  contatos: "CRM · Contatos",
  oportunidades: "CRM · Oportunidades",
};

export function ShellCrm({
  usuario,
  clientes,
  contatos,
  oportunidades,
  leads,
  catalogo,
  usuarios,
  hojeISO,
  erroLeitura,
}: ShellCrmProps) {
  const [tela, setTela] = useState<TelaCrmId>("painel");
  const [clienteDet, setClienteDet] = useState<ClienteCrmDetalhe | null>(null);
  const [oportunidadeDet, setOportunidadeDet] = useState<OportunidadeCrmDetalhe | null>(null);
  const [leadDet, setLeadDet] = useState<LeadCmsDetalhe | null>(null);
  const [formAberto, setFormAberto] = useState<FormCrmAberto | null>(null);
  const [carregando, iniciarCarga] = useTransition();

  function fecharTudo() {
    setClienteDet(null);
    setOportunidadeDet(null);
    setLeadDet(null);
    setFormAberto(null);
  }

  function irPara(id: string) {
    fecharTudo();
    setTela(id as TelaCrmId);
  }

  function abrirCliente(id: string) {
    iniciarCarga(async () => {
      const det = await carregarClienteCrm(id);
      if (det) setClienteDet(det);
    });
  }

  function abrirOportunidade(id: string) {
    iniciarCarga(async () => {
      const det = await carregarOportunidadeCrm(id);
      if (det) setOportunidadeDet(det);
    });
  }

  function abrirLead(id: string) {
    iniciarCarga(async () => {
      const det = await carregarLead(id);
      if (det) setLeadDet(det);
    });
  }

  const grupos: GrupoNav[] = [{ rotulo: "Comercial", itens: NAV_COMERCIAL }];

  return (
    <ShellPainel
      modulo="crm"
      usuario={usuario}
      grupos={grupos}
      telaAtiva={tela}
      onIrPara={irPara}
      breadcrumb={CRUMB[tela]}
      carregando={carregando}
    >
      {/* Detalhes e formulários em tela cheia têm precedência sobre a tela ativa. */}
      {leadDet ? (
        <DetalheLead lead={leadDet} onVoltar={() => setLeadDet(null)} />
      ) : formAberto?.entidade === "cliente" ? (
        <FormCliente
          inicial={formAberto.inicial}
          usuarios={usuarios}
          onSalvo={fecharTudo}
          onCancelar={fecharTudo}
        />
      ) : formAberto?.entidade === "contato" ? (
        <FormContato
          inicial={formAberto.inicial}
          clientes={clientes}
          clientePreSelecionado={clienteDet?.id}
          onSalvo={fecharTudo}
          onCancelar={fecharTudo}
        />
      ) : formAberto?.entidade === "oportunidade" ? (
        <FormOportunidade
          inicial={formAberto.inicial}
          clientes={clientes}
          catalogo={catalogo}
          usuarios={usuarios}
          clientePreSelecionado={clienteDet?.id}
          onSalvo={fecharTudo}
          onCancelar={fecharTudo}
        />
      ) : clienteDet ? (
        <DetalheCliente
          cliente={clienteDet}
          onVoltar={fecharTudo}
          onEditar={() => setFormAberto({ entidade: "cliente", inicial: clienteDet })}
          onAbrirOportunidade={abrirOportunidade}
          onNovaOportunidade={() => setFormAberto({ entidade: "oportunidade", inicial: null })}
          onNovoContato={() => setFormAberto({ entidade: "contato", inicial: null })}
        />
      ) : oportunidadeDet ? (
        <DetalheOportunidade
          oportunidade={oportunidadeDet}
          onVoltar={fecharTudo}
          onEditar={() => setFormAberto({ entidade: "oportunidade", inicial: oportunidadeDet })}
        />
      ) : (
        <>
          {tela === "painel" && (
            <TelaPainelComercial
              oportunidades={oportunidades}
              leads={leads}
              hojeISO={hojeISO}
              erroLeitura={erroLeitura}
              onAbrirOportunidade={abrirOportunidade}
            />
          )}
          {tela === "leads" && <TelaLeads leads={leads} onAbrir={abrirLead} />}
          {tela === "clientes" && (
            <TelaClientes
              clientes={clientes}
              onAbrir={abrirCliente}
              onNovo={() => setFormAberto({ entidade: "cliente", inicial: null })}
            />
          )}
          {tela === "contatos" && (
            <TelaContatos
              contatos={contatos}
              onEditar={(c) => setFormAberto({ entidade: "contato", inicial: c })}
              onNovo={() => setFormAberto({ entidade: "contato", inicial: null })}
            />
          )}
          {tela === "oportunidades" && (
            <TelaOportunidades
              oportunidades={oportunidades}
              onAbrir={abrirOportunidade}
              onNovo={() => setFormAberto({ entidade: "oportunidade", inicial: null })}
            />
          )}
        </>
      )}
    </ShellPainel>
  );
}
