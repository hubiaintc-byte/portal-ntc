"use client";

import { useState, useTransition } from "react";

import { AREAS_CRM, ESFERAS_CRM, ORIGENS_CLIENTE, TIPOS_INSTITUICAO, UFS } from "@ntc/lib";

import type { ClienteCrmDetalhe, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import type { DadosClienteCrm } from "@/lib/cms/painelCrmEscrita";

import { salvarClienteCrm } from "../acoesCrm";
import { AvisoForm, BarraForm, CampoArea, CampoSelect, CampoTexto } from "./CamposCrm";

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
    email: inicial?.email ?? "",
    origem: inicial?.origem ?? "manual",
    responsavel: inicial?.responsavelId ?? "",
    observacoes: inicial?.observacoes ?? "",
    // Contatos ainda não são editáveis aqui (Task 11 traz o EditorContatos):
    // o form só preserva o array que veio, para o save não apagá-los.
    contatos:
      inicial?.contatos.map((c) => ({
        nome: c.nome,
        cargo: c.cargo ?? "",
        setor: c.setor ?? "",
        email: c.email ?? "",
        whatsapp: c.whatsapp ?? "",
        principal: c.principal,
        decisor: c.decisor,
      })) ?? [],
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
        <CampoTexto rotulo="E-mail" tipo="email" valor={dados.email} onMudar={m("email")} />
        <CampoSelect rotulo="Origem" valor={dados.origem} onMudar={m("origem")} opcoes={ORIGENS_CLIENTE} />
        <CampoSelect
          rotulo="Responsável"
          valor={dados.responsavel}
          onMudar={m("responsavel")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
      </div>
      <CampoArea rotulo="Observações" valor={dados.observacoes} onMudar={m("observacoes")} />
    </form>
  );
}
