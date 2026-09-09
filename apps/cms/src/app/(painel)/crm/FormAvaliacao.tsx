"use client";

import { useState, useTransition } from "react";

import {
  DIMENSOES_COM04,
  FAIXA_SCORE,
  HARD_GATES_COM04,
  HARD_GATE_ESTADO,
  RESULTADO_QUALIFICACAO,
  STATUS_AVALIACAO,
  calcularScore,
  faixaDoScore,
  type AvaliacaoCom04,
  type OpcaoLista,
} from "@ntc/lib";

import type { AvaliacaoDetalhe, OportunidadeCrmResumo, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import type { DadosAvaliacao } from "@/lib/cms/painelCrmEscrita";

import { salvarAvaliacaoCrm } from "../acoesCrm";
import { AvisoForm, BarraForm, CampoArea, CampoCheck, CampoSelect, CampoTexto } from "./CamposCrm";
import { rotuloDeLista } from "./seloStatus";

interface FormAvaliacaoProps {
  inicial: AvaliacaoDetalhe | null;
  oportunidades: OportunidadeCrmResumo[];
  usuarios: UsuarioCmsResumo[];
  onSalvo: () => void;
  onCancelar: () => void;
}

const NOTA_OPCOES: OpcaoLista[] = ["0", "1", "2", "3"].map((v) => ({ label: v, value: v }));

const paraTexto = (n: number | null | undefined): string => (n !== null && n !== undefined ? String(n) : "");

/** Rótulo do manual por campo — DIMENSOES_COM04/HARD_GATES_COM04 são a fonte única (não reescrever). */
const rotuloDimensao = (campo: string): string =>
  DIMENSOES_COM04.find((d) => d.campo === campo)?.rotulo ?? campo;
const rotuloGate = (campo: string): string =>
  HARD_GATES_COM04.find((g) => g.campo === campo)?.rotulo ?? campo;

/** "3" → 3; vazio ou não numérico vira NaN — mesmo critério de numeroDeNota em painelCrmEscrita.ts. */
function numeroDeNota(v: string): number {
  return v.trim() === "" ? Number.NaN : Number(v);
}

export function FormAvaliacao({ inicial, oportunidades, usuarios, onSalvo, onCancelar }: FormAvaliacaoProps) {
  const [dados, setDados] = useState<DadosAvaliacao>({
    oportunidade: inicial?.oportunidadeId ?? "",
    statusAvaliacao: inicial?.statusAvaliacao ?? "em-preenchimento",
    avaliador: inicial?.avaliadorId ?? "",
    owner: inicial?.ownerId ?? "",
    notaNecessidade: paraTexto(inicial?.notaNecessidade),
    notaAderencia: paraTexto(inicial?.notaAderencia),
    notaPrioridade: paraTexto(inicial?.notaPrioridade),
    notaTiming: paraTexto(inicial?.notaTiming),
    notaCaminho: paraTexto(inicial?.notaCaminho),
    notaStakeholders: paraTexto(inicial?.notaStakeholders),
    notaOrcamento: paraTexto(inicial?.notaOrcamento),
    notaRisco: paraTexto(inicial?.notaRisco),
    notaValor: paraTexto(inicial?.notaValor),
    hgAderencia: inicial?.hgAderencia ?? "",
    hgJuridico: inicial?.hgJuridico ?? "",
    hgCondicao: inicial?.hgCondicao ?? "",
    hgIncapacidade: inicial?.hgIncapacidade ?? "",
    hgDemanda: inicial?.hgDemanda ?? "",
    hgRequisito: inicial?.hgRequisito ?? "",
    hgIntegridade: inicial?.hgIntegridade ?? "",
    resultado: inicial?.resultado ?? "",
    justificativa: inicial?.justificativa ?? "",
    proximoPasso: inicial?.proximoPasso ?? "",
    vigente: inicial?.vigente ?? true,
    observacoes: inicial?.observacoes ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  const m = <K extends keyof DadosAvaliacao>(campo: K) => (v: DadosAvaliacao[K]) =>
    setDados((d) => ({ ...d, [campo]: v }));

  // As 9 notas só são obrigatórias quando a avaliação é salva como
  // "concluída" — em "em preenchimento" o avaliador pode salvar parcial e
  // retomar depois. A UI não pode exigir mais do que a camada de escrita
  // (validarObrigatoriosAvaliacao em painelCrmEscrita.ts) de fato recusa.
  const notasObrigatorias = dados.statusAvaliacao === "concluida";

  // Resumo ao vivo (manual §15) — apoia a leitura do avaliador, não decide:
  // quem decide é o campo Resultado, no bloco Decisão.
  const avaliacaoAoVivo: AvaliacaoCom04 = {
    notaNecessidade: numeroDeNota(dados.notaNecessidade),
    notaAderencia: numeroDeNota(dados.notaAderencia),
    notaPrioridade: numeroDeNota(dados.notaPrioridade),
    notaTiming: numeroDeNota(dados.notaTiming),
    notaCaminho: numeroDeNota(dados.notaCaminho),
    notaStakeholders: numeroDeNota(dados.notaStakeholders),
    notaOrcamento: numeroDeNota(dados.notaOrcamento),
    notaRisco: numeroDeNota(dados.notaRisco),
    notaValor: numeroDeNota(dados.notaValor),
  };
  const scoreAoVivo = calcularScore(avaliacaoAoVivo);
  const faixaAoVivo = faixaDoScore(scoreAoVivo);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciarSalvar(async () => {
      const r = await salvarAvaliacaoCrm(inicial?.id ?? null, dados);
      if (r.ok) onSalvo();
      else setErro(r.erro ?? "Erro ao salvar.");
    });
  }

  return (
    <form onSubmit={enviar}>
      <BarraForm
        eyebrow="Processo Comercial B2G"
        titulo={inicial === null ? "Nova avaliação" : `Editar avaliação · ${inicial.oportunidadeCodigo}`}
        salvando={salvando}
        onCancelar={onCancelar}
      />
      <AvisoForm erro={erro} />

      <div className="pcms-metricas">
        <div className="pcms-metrica">
          <div className="pcms-metrica__valor">{scoreAoVivo !== null ? `${scoreAoVivo} / 27` : "—"}</div>
          <div className="pcms-metrica__rotulo">Score (apoio à leitura)</div>
        </div>
        <div className="pcms-metrica">
          <div className="pcms-metrica__valor">
            {faixaAoVivo !== null ? rotuloDeLista(FAIXA_SCORE, faixaAoVivo) : "—"}
          </div>
          <div className="pcms-metrica__rotulo">Faixa de referência</div>
        </div>
      </div>
      <p className="pcms-editor__hint">
        Score e faixa são cálculo de apoio à leitura (manual §15) — quem decide a qualificação é sempre o
        campo Resultado, escolhido pelo avaliador no bloco Decisão.
      </p>

      <div className="pcms-editor__head--sub">Identificação</div>
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo="Oportunidade"
          valor={dados.oportunidade}
          onMudar={m("oportunidade")}
          opcoes={oportunidades.map((o) => ({ label: `${o.codigo} — ${o.clienteNome}`, value: o.id }))}
          obrigatorio
        />
        <CampoSelect
          rotulo="Status da avaliação"
          valor={dados.statusAvaliacao}
          onMudar={m("statusAvaliacao")}
          opcoes={STATUS_AVALIACAO}
          obrigatorio
        />
        <CampoSelect
          rotulo="Avaliador"
          valor={dados.avaliador}
          onMudar={m("avaliador")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
          obrigatorio
        />
        <CampoSelect
          rotulo="Owner"
          valor={dados.owner}
          onMudar={m("owner")}
          opcoes={usuarios.map((u) => ({ label: u.nome, value: u.id }))}
        />
      </div>

      <div className="pcms-editor__head--sub">As 9 dimensões (manual §14)</div>
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo={rotuloDimensao("notaNecessidade")}
          valor={dados.notaNecessidade}
          onMudar={m("notaNecessidade")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaAderencia")}
          valor={dados.notaAderencia}
          onMudar={m("notaAderencia")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaPrioridade")}
          valor={dados.notaPrioridade}
          onMudar={m("notaPrioridade")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaTiming")}
          valor={dados.notaTiming}
          onMudar={m("notaTiming")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaCaminho")}
          valor={dados.notaCaminho}
          onMudar={m("notaCaminho")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaStakeholders")}
          valor={dados.notaStakeholders}
          onMudar={m("notaStakeholders")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaOrcamento")}
          valor={dados.notaOrcamento}
          onMudar={m("notaOrcamento")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaRisco")}
          valor={dados.notaRisco}
          onMudar={m("notaRisco")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
        <CampoSelect
          rotulo={rotuloDimensao("notaValor")}
          valor={dados.notaValor}
          onMudar={m("notaValor")}
          opcoes={NOTA_OPCOES}
          obrigatorio={notasObrigatorias}
          curto
        />
      </div>

      <div className="pcms-editor__head--sub">Hard gates (manual §16)</div>
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo={`HG · ${rotuloGate("hgAderencia")}`}
          valor={dados.hgAderencia}
          onMudar={m("hgAderencia")}
          opcoes={HARD_GATE_ESTADO}
        />
        <CampoSelect
          rotulo={`HG · ${rotuloGate("hgJuridico")}`}
          valor={dados.hgJuridico}
          onMudar={m("hgJuridico")}
          opcoes={HARD_GATE_ESTADO}
        />
        <CampoSelect
          rotulo={`HG · ${rotuloGate("hgCondicao")}`}
          valor={dados.hgCondicao}
          onMudar={m("hgCondicao")}
          opcoes={HARD_GATE_ESTADO}
        />
        <CampoSelect
          rotulo={`HG · ${rotuloGate("hgIncapacidade")}`}
          valor={dados.hgIncapacidade}
          onMudar={m("hgIncapacidade")}
          opcoes={HARD_GATE_ESTADO}
        />
        <CampoSelect
          rotulo={`HG · ${rotuloGate("hgDemanda")}`}
          valor={dados.hgDemanda}
          onMudar={m("hgDemanda")}
          opcoes={HARD_GATE_ESTADO}
        />
        <CampoSelect
          rotulo={`HG · ${rotuloGate("hgRequisito")}`}
          valor={dados.hgRequisito}
          onMudar={m("hgRequisito")}
          opcoes={HARD_GATE_ESTADO}
        />
        <CampoSelect
          rotulo={`HG · ${rotuloGate("hgIntegridade")}`}
          valor={dados.hgIntegridade}
          onMudar={m("hgIntegridade")}
          opcoes={HARD_GATE_ESTADO}
        />
      </div>

      <div className="pcms-editor__head--sub">Decisão</div>
      <div className="pcms-editor__grid">
        <CampoSelect
          rotulo="Resultado"
          valor={dados.resultado}
          onMudar={m("resultado")}
          opcoes={RESULTADO_QUALIFICACAO}
        />
        <CampoTexto rotulo="Próximo passo" valor={dados.proximoPasso} onMudar={m("proximoPasso")} />
        <CampoCheck rotulo="Vigente" marcado={dados.vigente} onMudar={m("vigente")} />
      </div>
      <CampoArea rotulo="Justificativa" valor={dados.justificativa} onMudar={m("justificativa")} />
      <CampoArea rotulo="Observações" valor={dados.observacoes} onMudar={m("observacoes")} />
    </form>
  );
}
