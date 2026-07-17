"use client";

import { useState, useTransition } from "react";

import {
  AREAS_CRM,
  ESFERAS_CRM,
  ORIGENS_CRM,
  STATUS_CLIENTE_CRM,
  TIPOS_INSTITUICAO,
  UFS,
} from "@ntc/lib";

import type { ClienteCrmDetalhe, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import type { DadosClienteCrm } from "@/lib/cms/painelCrmEscrita";

import { salvarClienteCrm } from "../acoesCrm";
import {
  AvisoForm,
  BarraForm,
  CampoArea,
  CampoNumero,
  CampoSelect,
  CampoTexto,
} from "./CamposCrm";

interface FormClienteProps {
  inicial: ClienteCrmDetalhe | null;
  usuarios: UsuarioCmsResumo[];
  onSalvo: () => void;
  onCancelar: () => void;
}

const paraOpcoes = (valores: string[]) => valores.map((v) => ({ label: v, value: v }));

export function FormCliente({ inicial, usuarios, onSalvo, onCancelar }: FormClienteProps) {
  const [dados, setDados] = useState<DadosClienteCrm>({
    orgao: inicial?.orgao ?? "",
    sigla: inicial?.sigla ?? "",
    tipo: inicial?.tipo ?? "",
    municipio: inicial?.municipio ?? "",
    uf: inicial?.uf ?? "",
    esfera: inicial?.esfera ?? "",
    area: inicial?.area ?? "",
    cnpj: inicial?.cnpj ?? "",
    dirigente: inicial?.dirigente ?? "",
    cargoDirigente: inicial?.cargoDirigente ?? "",
    email: inicial?.email ?? "",
    origem: inicial?.origem ?? "",
    potencial: inicial !== null && inicial.potencial !== null ? String(inicial.potencial) : "",
    status: inicial?.status ?? "prospect",
    responsavel: inicial?.responsavelId ?? "",
    proximaAcao: inicial?.proximaAcao ?? "",
    observacoes: inicial?.observacoes ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  const m = <K extends keyof DadosClienteCrm>(campo: K) => (v: DadosClienteCrm[K]) =>
    setDados((d) => ({ ...d, [campo]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciarSalvar(async () => {
      const r = await salvarClienteCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar}>
      <BarraForm
        titulo={inicial === null ? "Novo cliente" : `Editar · ${inicial.orgao}`}
        salvando={salvando}
        onCancelar={onCancelar}
      />
      <AvisoForm erro={erro} />
      {/* Campos largos fora do grid, como nome/resumo no editor de evento. */}
      <CampoTexto rotulo="Órgão" valor={dados.orgao} onMudar={m("orgao")} obrigatorio />
      <div className="pcms-editor__grid">
        <CampoTexto rotulo="Sigla" valor={dados.sigla} onMudar={m("sigla")} curto />
        <CampoSelect rotulo="Tipo" valor={dados.tipo} onMudar={m("tipo")} opcoes={TIPOS_INSTITUICAO} />
        <CampoTexto rotulo="Município" valor={dados.municipio} onMudar={m("municipio")} />
        <CampoSelect rotulo="UF" valor={dados.uf} onMudar={m("uf")} opcoes={paraOpcoes(UFS)} curto />
        <CampoSelect rotulo="Esfera" valor={dados.esfera} onMudar={m("esfera")} opcoes={ESFERAS_CRM} />
        <CampoSelect rotulo="Área" valor={dados.area} onMudar={m("area")} opcoes={AREAS_CRM} />
        <CampoTexto rotulo="CNPJ" valor={dados.cnpj} onMudar={m("cnpj")} curto />
        <CampoTexto rotulo="Dirigente" valor={dados.dirigente} onMudar={m("dirigente")} />
        <CampoTexto rotulo="Cargo do dirigente" valor={dados.cargoDirigente} onMudar={m("cargoDirigente")} />
        <CampoTexto rotulo="E-mail" tipo="email" valor={dados.email} onMudar={m("email")} />
        <CampoSelect rotulo="Origem" valor={dados.origem} onMudar={m("origem")} opcoes={ORIGENS_CRM} />
        <CampoNumero rotulo="Potencial (R$)" valor={dados.potencial} onMudar={m("potencial")} curto />
        <CampoSelect rotulo="Status" valor={dados.status} onMudar={m("status")} opcoes={STATUS_CLIENTE_CRM} />
        <CampoSelect
          rotulo="Responsável"
          valor={dados.responsavel}
          onMudar={m("responsavel")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
        <CampoTexto rotulo="Próxima ação" valor={dados.proximaAcao} onMudar={m("proximaAcao")} />
      </div>
      <CampoArea rotulo="Observações" valor={dados.observacoes} onMudar={m("observacoes")} />
    </form>
  );
}
