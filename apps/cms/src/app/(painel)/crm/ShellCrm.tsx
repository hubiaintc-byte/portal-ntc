"use client";

import { useEffect, useState, useTransition } from "react";

import type { DadosEnvio } from "@/lib/cms/painelCrmEscrita";
import type {
  CatalogoCrm,
  ClienteCrmDetalhe,
  ClienteCrmResumo,
  EnvioResumo,
  LeadCrmDetalhe,
  LeadCrmResumo,
  ProdutoCrmResumo,
  PropostaDetalhe,
  PropostaResumo,
  UsuarioCmsResumo,
} from "@/lib/cms/painelCrm";
import type {
  AreaOpcao,
  ModuloCatalogoDetalhe,
  ModuloCrmResumo,
  ProgramaCatalogoDetalhe,
  ProgramaCrmResumo,
} from "@/lib/cms/catalogoCrm";

import {
  adicionarNotaCrm,
  carregarClienteCrm,
  carregarLeadCrm,
  carregarPropostaCrm,
  moverLeadCrm,
  novaVersaoPropostaCrm,
  registrarEnvioCrm,
} from "../acoesCrm";
import { carregarModuloCatalogoCrm, carregarProgramaCatalogoCrm } from "../acoesCatalogo";
import { ShellPainel, type GrupoNav } from "../shell/ShellPainel";
import { AvisoForm } from "./CamposCrm";
import { DetalheCliente } from "./DetalheCliente";
import { DetalheModuloCatalogo } from "./DetalheModuloCatalogo";
import { DetalheProgramaCatalogo } from "./DetalheProgramaCatalogo";
import { DetalheProposta } from "./DetalheProposta";
import { FormCliente } from "./FormCliente";
import { FormProposta } from "./FormProposta";
import { ModalLead } from "./ModalLead";
import { TelaClientes } from "./TelaClientes";
import { TelaEnvios } from "./TelaEnvios";
import { TelaLeadsCrm } from "./TelaLeadsCrm";
import { TelaModulos } from "./TelaModulos";
import { TelaPainelComercial } from "./TelaPainelComercial";
import { TelaProdutos } from "./TelaProdutos";
import { TelaProgramas } from "./TelaProgramas";
import { TelaPropostas } from "./TelaPropostas";

interface ShellCrmProps {
  usuario: { nome: string; email: string; perfil: string };
  clientes: ClienteCrmResumo[];
  leads: LeadCrmResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  programas: ProgramaCrmResumo[];
  areas: AreaOpcao[];
  modulos: ModuloCrmResumo[];
  produtos: ProdutoCrmResumo[];
  propostas: PropostaResumo[];
  envios: EnvioResumo[];
  hojeISO: string;
  erroLeitura: boolean;
}

type TelaCrmId =
  | "painel" | "leads" | "clientes" | "propostas" | "envios"
  | "programas" | "modulos" | "produtos";

/** Formulário de criação/edição aberto em tela cheia. */
type FormCrmAberto =
  | { entidade: "cliente"; inicial: ClienteCrmDetalhe | null }
  | { entidade: "proposta"; inicial: PropostaDetalhe | null };

/** Modal do lead: sobreposição à tela ativa (spec §4.4) — ver um lead ou criar um novo. */
type ModalLeadAberto = { modo: "ver"; lead: LeadCrmDetalhe } | { modo: "novo" };

/** Detalhe/criação de programa ou módulo do catálogo, aberto em tela cheia. */
type DetalheCatalogoAberto =
  | { tipo: "programa"; programa: ProgramaCatalogoDetalhe | null }
  | { tipo: "modulo"; modulo: ModuloCatalogoDetalhe | null; programaIdInicial?: string };

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
  propostas: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h9l3 3v17H6z" /><path d="M14 2v4h4" /><path d="M9 12h6M9 16h6" />
    </svg>
  ),
  envios: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5h18v14H3z" /><path d="m3 6 9 7 9-7" />
    </svg>
  ),
  programas: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 2 8l10 5 10-5z" /><path d="m6 10.5 6 3 6-3" />
    </svg>
  ),
  modulos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" /><rect x="3" y="10" width="18" height="4" /><rect x="3" y="16" width="18" height="4" />
    </svg>
  ),
  produtos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M12 12 3 7M12 12l9-5M12 12v10" />
    </svg>
  ),
};

const NAV_COMERCIAL: { id: TelaCrmId; rotulo: string; icone: React.ReactNode }[] = [
  { id: "painel", rotulo: "Dashboard", icone: Ico.painel },
  { id: "leads", rotulo: "Leads", icone: Ico.leads },
  { id: "clientes", rotulo: "Clientes", icone: Ico.clientes },
  { id: "propostas", rotulo: "Propostas", icone: Ico.propostas },
  { id: "envios", rotulo: "Envios", icone: Ico.envios },
];

const NAV_CATALOGO: { id: TelaCrmId; rotulo: string; icone: React.ReactNode }[] = [
  { id: "programas", rotulo: "Programas", icone: Ico.programas },
  { id: "modulos", rotulo: "Módulos", icone: Ico.modulos },
  { id: "produtos", rotulo: "Produtos / Eventos", icone: Ico.produtos },
];

const CRUMB: Record<TelaCrmId, string> = {
  painel: "CRM · Dashboard",
  leads: "CRM · Leads",
  clientes: "CRM · Clientes",
  propostas: "CRM · Propostas",
  envios: "CRM · Envios",
  programas: "CRM · Programas",
  modulos: "CRM · Módulos",
  produtos: "CRM · Produtos / Eventos",
};

export function ShellCrm({
  usuario,
  clientes,
  leads,
  catalogo,
  usuarios,
  programas,
  areas,
  modulos,
  produtos,
  propostas,
  envios,
  hojeISO,
  erroLeitura,
}: ShellCrmProps) {
  const [tela, setTela] = useState<TelaCrmId>("painel");
  const [clienteDet, setClienteDet] = useState<ClienteCrmDetalhe | null>(null);
  const [modalLead, setModalLead] = useState<ModalLeadAberto | null>(null);
  const [propostaDet, setPropostaDet] = useState<PropostaDetalhe | null>(null);
  const [formAberto, setFormAberto] = useState<FormCrmAberto | null>(null);
  // As Tasks 7/8 passam a ler o primeiro item para renderizar os detalhes do catálogo.
  const [catalogoDet, setCatalogoDet] = useState<DetalheCatalogoAberto | null>(null);
  /** Sobe a cada detalhe do catálogo recarregado, para o formulário remontar com os dados novos. */
  const [versaoDet, setVersaoDet] = useState(0);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [carregando, iniciarCarga] = useTransition();
  const [leadsLocal, setLeadsLocal] = useState<LeadCrmResumo[]>(leads);
  // Relatório de geração do PDF (spec §1.1): títulos das seções que ficaram
  // fora do documento. `null` = nenhuma geração nesta visita do detalhe.

  useEffect(() => setLeadsLocal(leads), [leads]);

  function fecharTudo() {
    setClienteDet(null);
    setModalLead(null);
    setPropostaDet(null);
    setFormAberto(null);
    setCatalogoDet(null);
    setErroAcao(null);
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

  /** Abre (ou recarrega, após uma escrita) o lead no modal. */
  function abrirLead(id: string) {
    iniciarCarga(async () => {
      const det = await carregarLeadCrm(id);
      if (det) setModalLead({ modo: "ver", lead: det });
    });
  }

  function moverLead(id: string, estagio: string) {
    const original = leadsLocal.find((l) => l.id === id);
    const estagioOriginal = original?.estagio;
    const atualizadoOriginal = original?.atualizadoEmISO;
    setLeadsLocal((ls) => ls.map((l) => (l.id === id ? { ...l, estagio, atualizadoEmISO: new Date().toISOString() } : l)));
    iniciarCarga(async () => {
      const r = await moverLeadCrm(id, estagio);
      if (!r.ok) {
        if (estagioOriginal !== undefined && atualizadoOriginal !== undefined) {
          setLeadsLocal((ls) =>
            ls.map((l) => (l.id === id ? { ...l, estagio: estagioOriginal, atualizadoEmISO: atualizadoOriginal } : l)),
          );
        }
        setErroAcao(r.erro ?? "Erro ao mover o lead.");
      }
    });
  }

  function abrirProposta(id: string) {
    iniciarCarga(async () => {
      const det = await carregarPropostaCrm(id);
      if (det) {
        setErroAcao(null);
        setPropostaDet(det);
      }
    });
  }

  function abrirProgramaCatalogo(id: string) {
    iniciarCarga(async () => {
      const det = await carregarProgramaCatalogoCrm(id);
      if (det) {
        setErroAcao(null);
        setCatalogoDet({ tipo: "programa", programa: det });
        setVersaoDet((v) => v + 1);
      }
      else setErroAcao("Não foi possível abrir o programa.");
    });
  }

  function abrirModuloCatalogo(id: string) {
    iniciarCarga(async () => {
      const det = await carregarModuloCatalogoCrm(id);
      if (det) {
        setErroAcao(null);
        setCatalogoDet({ tipo: "modulo", modulo: det });
        setVersaoDet((v) => v + 1);
      }
      else setErroAcao("Não foi possível abrir o módulo.");
    });
  }

  function novaVersao(codBase: string, motivo: string) {
    iniciarCarga(async () => {
      const r = await novaVersaoPropostaCrm(codBase, motivo);
      if (r.ok) fecharTudo();
      else setErroAcao(r.erro ?? "Erro ao criar nova versão.");
    });
  }

  function registrarEnvio(dados: DadosEnvio) {
    iniciarCarga(async () => {
      const r = await registrarEnvioCrm(dados);
      if (r.ok) {
        // Reabre a proposta para refletir o envio recém-registrado na lista.
        const det = await carregarPropostaCrm(dados.proposta);
        if (det) setPropostaDet(det);
      } else {
        setErroAcao(r.erro ?? "Erro ao registrar envio.");
      }
    });
  }

  const grupos: GrupoNav[] = [
    { rotulo: "Comercial", itens: NAV_COMERCIAL },
    { rotulo: "Catálogo Institucional", itens: NAV_CATALOGO },
  ];

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
      {catalogoDet?.tipo === "programa" ? (
        <DetalheProgramaCatalogo
          key={`${catalogoDet.programa?.id ?? "novo"}:${versaoDet}`}
          programa={catalogoDet.programa}
          areas={areas}
          onVoltar={fecharTudo}
          onSalvo={abrirProgramaCatalogo}
          onExcluido={() => {
            fecharTudo();
            setTela("programas");
          }}
          onAbrirModulo={abrirModuloCatalogo}
          onNovoModulo={(programaId) => setCatalogoDet({ tipo: "modulo", modulo: null, programaIdInicial: programaId })}
        />
      ) : catalogoDet?.tipo === "modulo" ? (
        <DetalheModuloCatalogo
          key={`${catalogoDet.modulo?.id ?? `novo-${catalogoDet.programaIdInicial ?? ""}`}:${versaoDet}`}
          modulo={catalogoDet.modulo}
          programaIdInicial={catalogoDet.programaIdInicial}
          programas={programas}
          onVoltar={fecharTudo}
          onSalvo={abrirModuloCatalogo}
          onExcluido={() => {
            fecharTudo();
            setTela("modulos");
          }}
        />
      ) : formAberto?.entidade === "cliente" ? (
        <FormCliente
          inicial={formAberto.inicial}
          usuarios={usuarios}
          onSalvo={fecharTudo}
          onCancelar={fecharTudo}
        />
      ) : formAberto?.entidade === "proposta" ? (
        <FormProposta
          inicial={formAberto.inicial}
          clientes={clientes}
          catalogo={catalogo}
          usuarios={usuarios}
          leads={leads}
          onSalvo={fecharTudo}
          onCancelar={fecharTudo}
        />
      ) : clienteDet ? (
        <DetalheCliente
          cliente={clienteDet}
          onVoltar={fecharTudo}
          onEditar={() => setFormAberto({ entidade: "cliente", inicial: clienteDet })}
          onAbrirLead={abrirLead}
          onNovoLead={() => setModalLead({ modo: "novo" })}
          onNota={async (t) => {
            const r = await adicionarNotaCrm(clienteDet.id, null, t);
            if (r.ok) abrirCliente(clienteDet.id);
            return r.ok ? null : (r.erro ?? "Erro.");
          }}
          onAtualizado={() => abrirCliente(clienteDet.id)}
          onApagado={() => {
            fecharTudo();
            setTela("clientes");
          }}
        />
      ) : propostaDet ? (
        <>
          <AvisoForm erro={erroAcao} />
          <DetalheProposta
            proposta={propostaDet}
            catalogo={catalogo}
            onVoltar={fecharTudo}
            onEditar={() => setFormAberto({ entidade: "proposta", inicial: propostaDet })}
            onNovaVersao={novaVersao}
            onRegistrarEnvio={registrarEnvio}
            onAtualizado={() => abrirProposta(propostaDet.id)}
          />
        </>
      ) : (
        <>
          <AvisoForm erro={erroAcao} />
          {tela === "painel" && (
            <TelaPainelComercial
              leads={leadsLocal}
              usuarios={usuarios}
              hojeISO={hojeISO}
              erroLeitura={erroLeitura}
              onAbrirLead={abrirLead}
              onMoverLead={moverLead}
            />
          )}
          {tela === "leads" && (
            <TelaLeadsCrm
              leads={leadsLocal}
              usuarios={usuarios}
              onAbrir={abrirLead}
              onNovo={() => setModalLead({ modo: "novo" })}
            />
          )}
          {tela === "clientes" && (
            <TelaClientes
              clientes={clientes}
              onAbrir={abrirCliente}
              onNovo={() => setFormAberto({ entidade: "cliente", inicial: null })}
            />
          )}
          {tela === "programas" && (
            <TelaProgramas
              programas={programas}
              areas={areas}
              onAbrir={abrirProgramaCatalogo}
              onNovo={() => setCatalogoDet({ tipo: "programa", programa: null })}
            />
          )}
          {tela === "modulos" && (
            <TelaModulos
              modulos={modulos}
              programas={programas}
              onAbrir={abrirModuloCatalogo}
              onNovo={() => setCatalogoDet({ tipo: "modulo", modulo: null })}
            />
          )}
          {tela === "produtos" && <TelaProdutos produtos={produtos} />}
          {tela === "propostas" && (
            <TelaPropostas
              propostas={propostas}
              onAbrir={abrirProposta}
              onNovo={() => setFormAberto({ entidade: "proposta", inicial: null })}
            />
          )}
          {tela === "envios" && <TelaEnvios envios={envios} />}
        </>
      )}

      {/* O modal do lead sobrepõe a tela ativa (kanban, Leads ou cliente) em vez de substituí-la. */}
      {modalLead && (
        <ModalLead
          key={modalLead.modo === "ver" ? modalLead.lead.id : "novo"}
          lead={modalLead.modo === "ver" ? modalLead.lead : null}
          clientes={clientes}
          catalogo={catalogo}
          usuarios={usuarios}
          clientePreSelecionado={clienteDet?.id}
          onFechar={() => {
            setModalLead(null);
            // O modal pode ter criado/movido um negócio deste cliente — recarrega
            // para a linha do tempo e a lista de negócios refletirem o que mudou.
            if (clienteDet) abrirCliente(clienteDet.id);
          }}
          onAtualizado={abrirLead}
          onAbrirCliente={(id) => {
            setModalLead(null);
            abrirCliente(id);
          }}
          onApagado={() => {
            // `leadsLocal` só se re-sincroniza com o prop `leads` numa nova
            // leitura do servidor (useEffect acima) — sem tirar o id daqui,
            // o card apagado fica no quadro até a próxima navegação, e
            // clicar nele não faz mais nada (o modal não acha o lead).
            const idApagado = modalLead.modo === "ver" ? modalLead.lead.id : null;
            setModalLead(null);
            if (idApagado !== null) setLeadsLocal((ls) => ls.filter((l) => l.id !== idApagado));
            if (clienteDet) abrirCliente(clienteDet.id);
          }}
        />
      )}
    </ShellPainel>
  );
}
