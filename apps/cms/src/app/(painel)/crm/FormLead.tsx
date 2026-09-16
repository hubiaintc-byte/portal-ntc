"use client";

import { useState, useTransition } from "react";

import { ESFERA_INSTITUCIONAL, MODALIDADE_PROPOSTA } from "@ntc/lib";

import type { CatalogoCrm, ClienteCrmResumo, LeadCrmDetalhe, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import type { DadosLeadManual } from "@/lib/cms/painelCrmEscrita";

import { salvarLeadCrm } from "../acoesCrm";
import { AvisoForm, CampoArea, CampoData, CampoNumero, CampoSelect, CampoTexto } from "./CamposCrm";

interface FormLeadProps {
  inicial: LeadCrmDetalhe | null;
  clientes: ClienteCrmResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  onSalvo: () => void;
  onCancelar: () => void;
}

const paraOpcoes = (valores: readonly string[]) => valores.map((v) => ({ label: v, value: v }));

/** Criação manual (Novo lead) e edição dos campos manuais do lead — dentro do ModalLead. */
export function FormLead({ inicial, clientes, catalogo, usuarios, onSalvo, onCancelar }: FormLeadProps) {
  const [dados, setDados] = useState<DadosLeadManual>({
    nome: inicial?.nome ?? "",
    email: inicial?.email ?? "",
    telefone: inicial?.telefone ?? "",
    cargo: inicial?.cargo ?? "",
    instituicao: inicial?.instituicao === "—" ? "" : (inicial?.instituicao ?? ""),
    esfera: inicial?.esfera ?? "",
    programa: inicial?.programaId ?? "",
    modalidade: inicial?.modalidade ?? "",
    participantesEstimados:
      inicial !== null && inicial.participantesEstimados !== null ? String(inicial.participantesEstimados) : "",
    mensagem: inicial?.mensagem ?? "",
    cliente: inicial?.clienteId ?? "",
    novoClienteOrgao: "",
    responsavel: inicial?.responsavelId ?? "",
    valorEstimado: inicial !== null && inicial.valorEstimado !== null ? String(inicial.valorEstimado) : "",
    dataPrevistaEvento: inicial?.dataPrevistaEventoISO ?? "",
    observacoes: inicial?.observacoes ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const m =
    <K extends keyof DadosLeadManual>(campo: K) =>
    (v: DadosLeadManual[K]) =>
      setDados((d) => ({ ...d, [campo]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await salvarLeadCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar} className="pcms-form-lead">
      <AvisoForm erro={erro} />
      <div className="pcms-editor__head--sub">Contato</div>
      <div className="pcms-editor__grid">
        <CampoTexto rotulo="Nome" valor={dados.nome} onMudar={m("nome")} obrigatorio />
        <CampoTexto rotulo="E-mail" tipo="email" valor={dados.email} onMudar={m("email")} obrigatorio />
        <CampoTexto rotulo="Telefone" valor={dados.telefone} onMudar={m("telefone")} curto />
        <CampoTexto rotulo="Cargo" valor={dados.cargo} onMudar={m("cargo")} />
      </div>
      <div className="pcms-editor__head--sub">Órgão</div>
      <div className="pcms-editor__grid">
        <CampoTexto rotulo="Instituição (como informada)" valor={dados.instituicao} onMudar={m("instituicao")} />
        <CampoSelect rotulo="Esfera" valor={dados.esfera} onMudar={m("esfera")} opcoes={paraOpcoes(ESFERA_INSTITUCIONAL)} />
        <CampoSelect
          rotulo="Cliente"
          valor={dados.cliente}
          onMudar={m("cliente")}
          opcoes={clientes.map((c) => ({ label: c.orgao, value: c.id }))}
        />
        {inicial === null && dados.cliente === "" && (
          <CampoTexto rotulo="Ou criar cliente novo (órgão)" valor={dados.novoClienteOrgao} onMudar={m("novoClienteOrgao")} />
        )}
      </div>
      <div className="pcms-editor__head--sub">Interesse</div>
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo="Programa"
          valor={dados.programa}
          onMudar={m("programa")}
          opcoes={catalogo.programas.map((p) => ({ label: `${p.sigla} — ${p.nome}`, value: p.id }))}
        />
        <CampoSelect rotulo="Modalidade" valor={dados.modalidade} onMudar={m("modalidade")} opcoes={paraOpcoes(MODALIDADE_PROPOSTA)} />
        <CampoNumero rotulo="Participantes estimados" valor={dados.participantesEstimados} onMudar={m("participantesEstimados")} curto />
        <CampoNumero rotulo="Valor estimado (R$)" valor={dados.valorEstimado} onMudar={m("valorEstimado")} curto />
        <CampoData rotulo="Data prevista do evento" valor={dados.dataPrevistaEvento} onMudar={m("dataPrevistaEvento")} />
        <CampoSelect
          rotulo="Responsável"
          valor={dados.responsavel}
          onMudar={m("responsavel")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
      </div>
      <CampoArea rotulo="Mensagem" valor={dados.mensagem} onMudar={m("mensagem")} />
      <CampoArea rotulo="Observações internas" valor={dados.observacoes} onMudar={m("observacoes")} />
      <div className="pcms-modal__foot">
        <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </button>
        <button type="submit" className="pcms-btn" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
