"use client";

import { useMemo, useState, useTransition } from "react";

import { calcularValoresProposta, STATUS_PROPOSTA, TIPOS_PROPOSTA } from "@ntc/lib";

import type {
  CatalogoCrm,
  ClienteCrmResumo,
  OportunidadeCrmResumo,
  PropostaDetalhe,
  UsuarioCmsResumo,
} from "@/lib/cms/painelCrm";
import type { DadosProposta } from "@/lib/cms/painelCrmEscrita";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { salvarPropostaCrm } from "../acoesCrm";
import {
  AvisoForm,
  BarraForm,
  CampoArea,
  CampoCheck,
  CampoNumero,
  CampoSelect,
  CampoTexto,
} from "./CamposCrm";

interface FormPropostaProps {
  inicial: PropostaDetalhe | null;
  clientes: ClienteCrmResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  oportunidades: OportunidadeCrmResumo[];
  onSalvo: () => void;
  onCancelar: () => void;
}

const alternar = (lista: string[], id: string): string[] =>
  lista.includes(id) ? lista.filter((v) => v !== id) : [...lista, id];

/** Reproduz o parse de packages/lib/painelCrmEscrita.numeroOuNulo — só o suficiente para o resumo ao vivo. */
function numeroOuZero(v: string): number {
  const limpo = v.trim().replace(/\./g, "").replace(",", ".");
  if (limpo === "") return 0;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Wizard de criação/edição de proposta (5 blocos). `inicial === null` cria;
 * caso contrário edita a proposta vigente (id fixo, campos herdados dos
 * dados persistidos — DetalheProposta não expõe valorUnitario/qtdPagantes/
 * cortesias/percDesconto/etc., então a edição parte de valores em branco
 * exceto o que já está em PropostaDetalhe/PropostaResumo).
 */
export function FormProposta({
  inicial,
  clientes,
  catalogo,
  usuarios,
  oportunidades,
  onSalvo,
  onCancelar,
}: FormPropostaProps) {
  const [dados, setDados] = useState<DadosProposta>({
    cliente: clientes.find((c) => c.orgao === inicial?.clienteNome)?.id ?? "",
    programa: catalogo.programas.find((p) => p.sigla === inicial?.programaSigla)?.id ?? "",
    oportunidade: "",
    tipo: "",
    modulos: [],
    eventos: [],
    valorUnitario: "",
    qtdPagantes: "",
    cortesias: "",
    percDesconto: "",
    modalidade: "",
    replay: "",
    condPagto: "",
    condEspecificas: "",
    observacoes: "",
    elaborador: inicial !== null ? (usuarios.find((u) => u.nome === inicial.elaboradorNome)?.id ?? "") : "",
    aprovador: inicial !== null ? (usuarios.find((u) => u.nome === inicial.aprovadorNome)?.id ?? "") : "",
    validadeDias: "30",
    status: inicial?.status ?? "rascunho",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  const m = <K extends keyof DadosProposta>(campo: K) => (v: DadosProposta[K]) =>
    setDados((d) => ({ ...d, [campo]: v }));

  const modulosDisponiveis = catalogo.modulos.filter(
    (mod) => dados.programa === "" || mod.programaId === dados.programa,
  );

  const resumo = useMemo(
    () =>
      calcularValoresProposta({
        valorUnitario: numeroOuZero(dados.valorUnitario),
        qtdPagantes: numeroOuZero(dados.qtdPagantes),
        cortesias: numeroOuZero(dados.cortesias),
        percDesconto: numeroOuZero(dados.percDesconto),
      }),
    [dados.valorUnitario, dados.qtdPagantes, dados.cortesias, dados.percDesconto],
  );

  /**
   * Selecionar oportunidade pré-preenche cliente e programa. `OportunidadeCrmResumo`
   * (prop recebida por este form) não traz módulos/quantidade/modalidade — só
   * `OportunidadeCrmDetalhe` os tem; o pré-preenchimento fica restrito ao que o
   * resumo oferece.
   */
  function selecionarOportunidade(id: string) {
    const op = oportunidades.find((o) => o.id === id);
    if (op === undefined) {
      setDados((d) => ({ ...d, oportunidade: "" }));
      return;
    }
    setDados((d) => ({
      ...d,
      oportunidade: id,
      cliente: op.clienteId,
      programa: catalogo.programas.find((p) => p.sigla === op.programaSigla)?.id ?? d.programa,
    }));
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciarSalvar(async () => {
      const r = await salvarPropostaCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar}>
      <BarraForm
        titulo={inicial === null ? "Nova proposta" : `Editar · ${inicial.codigo}`}
        salvando={salvando}
        onCancelar={onCancelar}
      />
      <AvisoForm erro={erro} />

      {/* Bloco 1 — Identificação */}
      <div className="pcms-editor__head--sub">Identificação</div>
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo="Oportunidade (opcional)"
          valor={dados.oportunidade}
          onMudar={selecionarOportunidade}
          opcoes={oportunidades.map((o) => ({ label: `${o.codigo} — ${o.clienteNome}`, value: o.id }))}
        />
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
        <CampoSelect rotulo="Tipo" valor={dados.tipo} onMudar={m("tipo")} opcoes={TIPOS_PROPOSTA} />
        <CampoSelect rotulo="Status" valor={dados.status} onMudar={m("status")} opcoes={STATUS_PROPOSTA} />
      </div>

      {/* Bloco 2 — Módulos */}
      <div className="pcms-editor__head--sub">Módulos</div>
      {modulosDisponiveis.length === 0 ? (
        <p className="pcms-editor__hint">
          Nenhum módulo disponível{dados.programa !== "" ? " para o programa selecionado" : ""}.
        </p>
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

      {/* Bloco 3 — Produtos/Eventos */}
      <div className="pcms-editor__head--sub">Produtos / Eventos</div>
      {catalogo.eventos.length === 0 ? (
        <p className="pcms-editor__hint">Nenhum produto/evento disponível.</p>
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

      {/* Bloco 4 — Quantitativos/valores + resumo ao vivo */}
      <div className="pcms-editor__head--sub">Quantitativos e valores</div>
      <div className="pcms-editor__grid">
        <CampoNumero rotulo="Valor unitário (R$)" valor={dados.valorUnitario} onMudar={m("valorUnitario")} curto />
        <CampoNumero rotulo="Qtd. pagantes" valor={dados.qtdPagantes} onMudar={m("qtdPagantes")} curto />
        <CampoNumero rotulo="Cortesias" valor={dados.cortesias} onMudar={m("cortesias")} curto />
        <CampoNumero rotulo="Desconto (%)" valor={dados.percDesconto} onMudar={m("percDesconto")} curto />
        <CampoTexto rotulo="Modalidade" valor={dados.modalidade} onMudar={m("modalidade")} curto />
        <CampoTexto rotulo="Replay" valor={dados.replay} onMudar={m("replay")} curto />
      </div>

      <div className="pcms-metricas">
        <div className="pcms-metrica">
          <div className="pcms-metrica__valor">{formatarMoedaBRL(resumo.valorBruto)}</div>
          <div className="pcms-metrica__rotulo">Valor bruto</div>
        </div>
        <div className="pcms-metrica">
          <div className="pcms-metrica__valor">{formatarMoedaBRL(resumo.desconto)}</div>
          <div className="pcms-metrica__rotulo">Desconto</div>
        </div>
        <div className="pcms-metrica">
          <div className="pcms-metrica__valor">{formatarMoedaBRL(resumo.valorLiquido)}</div>
          <div className="pcms-metrica__rotulo">Valor líquido</div>
        </div>
        <div className="pcms-metrica">
          <div className="pcms-metrica__valor">{resumo.acessosTotais}</div>
          <div className="pcms-metrica__rotulo">Acessos totais</div>
        </div>
      </div>

      {/* Bloco 5 — Condições/responsáveis */}
      <div className="pcms-editor__head--sub">Condições e responsáveis</div>
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo="Elaborador"
          valor={dados.elaborador}
          onMudar={m("elaborador")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
        <CampoSelect
          rotulo="Aprovador"
          valor={dados.aprovador}
          onMudar={m("aprovador")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
        <CampoNumero rotulo="Validade (dias)" valor={dados.validadeDias} onMudar={m("validadeDias")} curto />
      </div>
      <div className="pcms-editor__grid">
        <CampoArea rotulo="Condições de pagamento" valor={dados.condPagto} onMudar={m("condPagto")} />
        <CampoArea rotulo="Condições específicas" valor={dados.condEspecificas} onMudar={m("condEspecificas")} />
      </div>
      <CampoArea rotulo="Observações" valor={dados.observacoes} onMudar={m("observacoes")} />
    </form>
  );
}
