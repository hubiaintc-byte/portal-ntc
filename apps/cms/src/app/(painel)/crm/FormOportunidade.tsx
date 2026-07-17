"use client";

import { useState, useTransition } from "react";

import { ORIGENS_CRM, STATUS_OPORTUNIDADE, UFS } from "@ntc/lib";

import type {
  CatalogoCrm,
  ClienteCrmResumo,
  OportunidadeCrmDetalhe,
  UsuarioCmsResumo,
} from "@/lib/cms/painelCrm";
import type { DadosOportunidade } from "@/lib/cms/painelCrmEscrita";

import { salvarOportunidadeCrm } from "../acoesCrm";
import {
  AvisoForm,
  BarraForm,
  CampoArea,
  CampoCheck,
  CampoData,
  CampoNumero,
  CampoSelect,
  CampoTexto,
} from "./CamposCrm";

interface FormOportunidadeProps {
  inicial: OportunidadeCrmDetalhe | null;
  clientes: ClienteCrmResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  clientePreSelecionado?: string;
  onSalvo: () => void;
  onCancelar: () => void;
}

const paraOpcoes = (valores: string[]) => valores.map((v) => ({ label: v, value: v }));

const alternar = (lista: string[], id: string): string[] =>
  lista.includes(id) ? lista.filter((v) => v !== id) : [...lista, id];

export function FormOportunidade({
  inicial,
  clientes,
  catalogo,
  usuarios,
  clientePreSelecionado,
  onSalvo,
  onCancelar,
}: FormOportunidadeProps) {
  const [dados, setDados] = useState<DadosOportunidade>({
    cliente: inicial?.clienteId ?? clientePreSelecionado ?? "",
    programa: inicial?.programaId ?? "",
    modulos: inicial?.modulos.map((m) => m.id) ?? [],
    eventos: inicial?.eventos.map((e) => e.id) ?? [],
    uf: inicial?.uf ?? "",
    origem: inicial?.origem ?? "",
    quantidade: inicial !== null && inicial.quantidade !== null ? String(inicial.quantidade) : "",
    modalidade: inicial?.modalidade ?? "",
    valor: inicial !== null && inicial.valor !== null ? String(inicial.valor) : "",
    probabilidade:
      inicial !== null && inicial.probabilidade !== null ? String(inicial.probabilidade) : "",
    status: inicial?.status ?? "em-qualificacao",
    dataAbertura: inicial?.dataAberturaISO ?? new Date().toISOString().slice(0, 10),
    dataPrevFechamento: inicial?.dataPrevFechamentoISO ?? "",
    proximaAcao: inicial?.proximaAcao ?? "",
    followup: inicial?.followupISO ?? "",
    responsavel: inicial?.responsavelId ?? "",
    observacoes: inicial?.observacoes ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  const m = <K extends keyof DadosOportunidade>(campo: K) => (v: DadosOportunidade[K]) =>
    setDados((d) => ({ ...d, [campo]: v }));

  const modulosDisponiveis = catalogo.modulos.filter(
    (mod) => dados.programa === "" || mod.programaId === dados.programa,
  );

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciarSalvar(async () => {
      const r = await salvarOportunidadeCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar}>
      <BarraForm
        titulo={inicial === null ? "Nova oportunidade" : `Editar · ${inicial.codigo}`}
        salvando={salvando}
        onCancelar={onCancelar}
      />
      <AvisoForm erro={erro} />
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo="Cliente"
          valor={dados.cliente}
          onMudar={m("cliente")}
          opcoes={clientes.map((c) => ({ label: c.orgao, value: c.id }))}
        />
        <CampoSelect
          rotulo="Programa"
          valor={dados.programa}
          onMudar={(v) => setDados((d) => ({ ...d, programa: v, modulos: [] }))}
          opcoes={catalogo.programas.map((p) => ({ label: `${p.sigla} — ${p.nome}`, value: p.id }))}
        />
        <CampoSelect rotulo="UF" valor={dados.uf} onMudar={m("uf")} opcoes={paraOpcoes(UFS)} curto />
        <CampoSelect rotulo="Origem" valor={dados.origem} onMudar={m("origem")} opcoes={ORIGENS_CRM} />
        <CampoNumero rotulo="Quantidade" valor={dados.quantidade} onMudar={m("quantidade")} curto />
        <CampoTexto rotulo="Modalidade" valor={dados.modalidade} onMudar={m("modalidade")} />
        <CampoNumero rotulo="Valor (R$)" valor={dados.valor} onMudar={m("valor")} curto />
        <CampoNumero rotulo="Probabilidade (%)" valor={dados.probabilidade} onMudar={m("probabilidade")} curto />
        <CampoSelect rotulo="Status" valor={dados.status} onMudar={m("status")} opcoes={STATUS_OPORTUNIDADE} />
        <CampoData rotulo="Data de abertura" valor={dados.dataAbertura} onMudar={m("dataAbertura")} />
        <CampoData
          rotulo="Previsão de fechamento"
          valor={dados.dataPrevFechamento}
          onMudar={m("dataPrevFechamento")}
        />
        <CampoData rotulo="Follow-up" valor={dados.followup} onMudar={m("followup")} />
        <CampoTexto rotulo="Próxima ação" valor={dados.proximaAcao} onMudar={m("proximaAcao")} />
        <CampoSelect
          rotulo="Responsável"
          valor={dados.responsavel}
          onMudar={m("responsavel")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
      </div>

      <div className="pcms-editor__head--sub">Módulos</div>
      {modulosDisponiveis.length === 0 ? (
        <p className="pcms-editor__hint">Nenhum módulo disponível{dados.programa !== "" ? " para o programa selecionado" : ""}.</p>
      ) : (
        <div className="pcms-editor__grid">
          {modulosDisponiveis.map((mod) => (
            <CampoCheck
              key={mod.id}
              rotulo={`M${mod.numero} — ${mod.titulo}`}
              marcado={dados.modulos.includes(mod.id)}
              onMudar={() => m("modulos")(alternar(dados.modulos, mod.id))}
            />
          ))}
        </div>
      )}

      <div className="pcms-editor__head--sub">Eventos</div>
      {catalogo.eventos.length === 0 ? (
        <p className="pcms-editor__hint">Nenhum evento disponível.</p>
      ) : (
        <div className="pcms-editor__grid">
          {catalogo.eventos.map((ev) => (
            <CampoCheck
              key={ev.id}
              rotulo={ev.nome}
              marcado={dados.eventos.includes(ev.id)}
              onMudar={() => m("eventos")(alternar(dados.eventos, ev.id))}
            />
          ))}
        </div>
      )}

      <CampoArea rotulo="Observações" valor={dados.observacoes} onMudar={m("observacoes")} />
    </form>
  );
}
