"use client";

import { useState, useTransition } from "react";

import type { ClienteCrmResumo, ContatoCrmResumo } from "@/lib/cms/painelCrm";
import type { DadosContatoCrm } from "@/lib/cms/painelCrmEscrita";

import { salvarContatoCrm } from "../acoesCrm";
import { AvisoForm, BarraForm, CampoCheck, CampoSelect, CampoTexto } from "./CamposCrm";

interface FormContatoProps {
  inicial: ContatoCrmResumo | null;
  clientes: ClienteCrmResumo[];
  clientePreSelecionado?: string;
  onSalvo: () => void;
  onCancelar: () => void;
}

export function FormContato({
  inicial,
  clientes,
  clientePreSelecionado,
  onSalvo,
  onCancelar,
}: FormContatoProps) {
  const [dados, setDados] = useState<DadosContatoCrm>({
    nome: inicial?.nome ?? "",
    cliente: inicial?.clienteId ?? clientePreSelecionado ?? "",
    cargo: inicial?.cargo ?? "",
    setor: inicial?.setor ?? "",
    email: inicial?.email ?? "",
    whatsapp: inicial?.whatsapp ?? "",
    principal: inicial?.principal ?? false,
    decisor: inicial?.decisor ?? false,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  const m = <K extends keyof DadosContatoCrm>(campo: K) => (v: DadosContatoCrm[K]) =>
    setDados((d) => ({ ...d, [campo]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciarSalvar(async () => {
      const r = await salvarContatoCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar}>
      <BarraForm
        titulo={inicial === null ? "Novo contato" : `Editar · ${inicial.nome}`}
        salvando={salvando}
        onCancelar={onCancelar}
      />
      <AvisoForm erro={erro} />
      {/* Campos largos fora do grid, como órgão no editor de cliente. */}
      <CampoTexto rotulo="Nome" valor={dados.nome} onMudar={m("nome")} obrigatorio />
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo="Cliente"
          valor={dados.cliente}
          onMudar={m("cliente")}
          opcoes={clientes.map((c) => ({ label: c.orgao, value: c.id }))}
        />
        <CampoTexto rotulo="Cargo" valor={dados.cargo} onMudar={m("cargo")} />
        <CampoTexto rotulo="Setor" valor={dados.setor} onMudar={m("setor")} />
        <CampoTexto rotulo="E-mail" tipo="email" valor={dados.email} onMudar={m("email")} />
        <CampoTexto rotulo="WhatsApp" valor={dados.whatsapp} onMudar={m("whatsapp")} curto />
        <CampoCheck rotulo="Principal" marcado={dados.principal} onMudar={m("principal")} />
        <CampoCheck rotulo="Decisor" marcado={dados.decisor} onMudar={m("decisor")} />
      </div>
    </form>
  );
}
