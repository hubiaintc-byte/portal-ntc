"use client";

import { useRef, useState } from "react";

import {
  validarFaturamento,
  valorReceita,
  type ContaFin,
  type FaturamentoFin,
  type LivroFinanceiro,
  type ReceitaFin,
} from "@ntc/lib";

import { temTela, type AcessoPainel } from "@/lib/cms/telas";

import { salvarFaturamentoFinAcao } from "../../acoesFinanceiro";
import { CampoConta, GavetaConta } from "../receber/GavetaConta";
import { CampoDinheiro } from "../ui/CampoDinheiro";
import { Gaveta } from "../ui/Gaveta";
import { Historico } from "../ui/Historico";
import { Icone } from "../ui/Icone";
import { TagValidar } from "../ui/Selo";
import type { MostrarToast } from "../ui/Toasts";
import {
  comValidade,
  dataCurta,
  ERRO_FORMATO_DINHEIRO,
  moeda,
  primeiroDinheiroInvalido,
  type ValidadeDinheiro,
} from "../ui/formato";
import {
  Calculado,
  CampoAreaTexto,
  CampoChips,
  CampoSelect,
  CampoTexto,
  Grupo,
  MaisDetalhes,
  Nota,
} from "./CamposWizard";
import {
  aoEscolherReceita,
  CAMPOS_DINHEIRO_FATURAMENTO,
  CAMPOS_RECEBIMENTO,
  calculosFaturamento,
  contasComExtras,
  dadosDoFaturamento,
  descricaoFaturamentoSalvo,
  formFaturamento,
  liquidoEsperado,
  preencherRecebido,
  receitasFaturaveis,
  saldoAFaturar,
  validadeAoMudarRetencaoContratual,
  type FormFaturamento,
} from "./dadosLancamentos";

/**
 * Faturamento e recebimento na mesma linha (`openFatrecDrawer` do protótipo):
 * modo `editar` (registrar/editar o faturamento, com o bloco "Recebimento"
 * recolhido) e modo `receber` (resumo da parcela, atalhos de valor e o
 * recebimento em caixa). O select de conta tem o atalho "Nova conta"; a conta
 * criada já fica escolhida. Reutilizada em Receber (Task 16), com
 * `contexto = { id: "", nome: "Receita corporativa · …" }` e `receitas`.
 */

export interface GavetaFaturamentoProps {
  /** Parcela a editar/receber; `null` = novo faturamento. */
  faturamento: FaturamentoFin | null;
  /** Receita já escolhida (botão "Faturar" da receita, "Registrar faturamento" da linha). */
  receitaId?: string;
  modo: "editar" | "receber";
  /** Evento do lançamento (`id` + `nome`); `id: ""` = corporativo (eyebrow "CORPORATIVO"). */
  contexto: { id: string; nome: string };
  /** Receitas do select; padrão: as contratadas do evento (`receitasFaturaveis`). */
  receitas?: readonly ReceitaFin[];
  livro: LivroFinanceiro;
  hojeISO: string;
  /** Decide o atalho "Nova conta" (a action de conta exige Receber ou Pagar). */
  acesso: AcessoPainel;
  aoSalvo: (titulo: string, descricao: string) => void;
  /** Aviso "Conta criada" do atalho "Nova conta". */
  avisar?: MostrarToast;
  aoFechar: () => void;
}

const QUITADO = [
  { valor: "false", rotulo: "Em aberto" },
  { valor: "true", rotulo: "Liquidada" },
] as const;

const ROTULOS_HISTORICO: Record<string, string> = {
  receita: "Receita vinculada",
  parcela: "Parcela / etapa",
  nf: "NF / documento fiscal",
  dataFaturamento: "Data de faturamento",
  vencimento: "Vencimento",
  valorFaturado: "Valor faturado",
  retencaoTributaria: "Retenção tributária na fonte",
  retencaoContratual: "Retenção contratual (garantia)",
  retencaoContratualLiberada: "Retenção contratual já liberada",
  dataRecebimento: "Data de recebimento",
  valorRecebido: "Valor recebido",
  conta: "Conta financeira creditada",
  quitado: "Parcela liquidada",
  observacao: "Observação",
};

export function GavetaFaturamento({
  faturamento: fat,
  receitaId,
  modo,
  contexto,
  receitas,
  livro,
  hojeISO,
  acesso,
  aoSalvo,
  avisar,
  aoFechar,
}: GavetaFaturamentoProps) {
  const receber = modo === "receber";
  const base = receitas ?? receitasFaturaveis(livro, contexto.id);
  // A parcela editada mostra sua receita mesmo que ela tenha deixado de ser faturável.
  const daParcela =
    fat && !base.some((r) => r.id === fat.receitaId)
      ? livro.receitas.find((r) => r.id === fat.receitaId)
      : undefined;
  const recs = daParcela ? [...base, daParcela] : base;

  // Conta criada pelo atalho entra já, antes de o livro revalidado chegar.
  const [contasNovas, setContasNovas] = useState<ContaFin[]>([]);
  const contas = contasComExtras(livro.contas, contasNovas);
  const livroAtual: LivroFinanceiro = { ...livro, contas };

  const [f, setF] = useState<FormFaturamento>(() =>
    formFaturamento({ faturamento: fat, receitaId, receitas: recs, livro, modo, hoje: hojeISO }),
  );
  const [erro, setErro] = useState<{ campo: string; texto: string } | null>(null);
  const [recebimento, setRecebimento] = useState(() => !!(fat && fat.valorRecebido));
  const [validade, setValidade] = useState<ValidadeDinheiro>({});
  const validadeDe = (campo: string) => (ok: boolean) =>
    setValidade((v) => comValidade(v, campo, ok));
  const [novaConta, setNovaConta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar =
    <K extends keyof FormFaturamento>(k: K) =>
    (v: FormFaturamento[K]) => {
      setF((x) => ({ ...x, [k]: v }));
      if (erro?.campo === k) setErro(null);
    };
  const mudarRetencaoContratual = (v: FormFaturamento["retencaoContratual"]) => {
    mudar("retencaoContratual")(v);
    setValidade((x) => validadeAoMudarRetencaoContratual(x, v));
  };
  const erroDe = (campo: string) => (erro?.campo === campo ? erro.texto : undefined);
  const calc = calculosFaturamento(f);
  const rt = f.retencaoTributaria ?? 0;
  const rc = f.retencaoContratual ?? 0;
  const podeCriarConta = temTela(acesso, ["fin.receber", "fin.pagar"]);

  const mostrarErro = (campo: string, texto: string) => {
    const emRecebimento = !receber && CAMPOS_RECEBIMENTO.includes(campo);
    if (emRecebimento) setRecebimento(true);
    const visivel = !!campo && corpo.current?.querySelector(`#f_${campo}`) !== null;
    setErro({ campo: visivel || emRecebimento ? campo : "", texto });
    window.setTimeout(() => corpo.current?.querySelector<HTMLElement>(`#f_${campo}`)?.focus(), 0);
  };

  const escolherReceita = (id: string) => {
    if (erro?.campo === "receitaId") setErro(null);
    if (fat || !id) return setF((x) => ({ ...x, receitaId: id }));
    setF((x) => aoEscolherReceita(x, id, recs, livro));
    // Valor sugerido entra por fora do campo: vale como válido.
    setValidade((v) => comValidade(v, "valorFaturado", true));
  };

  const preencher = (como: "bruto" | "liq") => {
    setF((x) => preencherRecebido(x, como, hojeISO));
    setValidade((v) => comValidade(v, "valorRecebido", true));
    if (erro?.campo === "valorRecebido") setErro(null);
  };

  const salvar = async () => {
    if (salvando) return;
    // Sem retenção contratual o campo "já liberada" some: o texto que ficou nele não conta.
    const valendo = validadeAoMudarRetencaoContratual(validade, rc);
    const invalido = primeiroDinheiroInvalido(valendo, CAMPOS_DINHEIRO_FATURAMENTO);
    if (invalido) return mostrarErro(invalido, ERRO_FORMATO_DINHEIRO);
    const dados = dadosDoFaturamento(f);
    const v = validarFaturamento(dados, livroAtual, fat?.id ?? null);
    if (!v.ok) return mostrarErro(v.campo, v.erro);
    setSalvando(true);
    try {
      const res = await salvarFaturamentoFinAcao(fat?.id ?? null, dados);
      if (res.ok)
        aoSalvo(
          receber
            ? "Recebimento registrado"
            : fat
              ? "Faturamento atualizado"
              : "Faturamento registrado",
          descricaoFaturamentoSalvo(dados),
        );
      else mostrarErro(res.campo ?? "", res.erro);
    } catch {
      setErro({ campo: "", texto: "Não foi possível salvar. Tente de novo." });
    } finally {
      setSalvando(false);
    }
  };

  const rodape = (
    <>
      <span className="spacer" />
      <button type="button" className="btn btn-secondary" onClick={aoFechar}>
        Cancelar
      </button>
      <button
        type="button"
        className="btn btn-primary"
        disabled={salvando}
        onClick={() => void salvar()}
      >
        <Icone nome="check" tamanho="sm" />
        {receber ? "Confirmar recebimento" : fat ? "Salvar alterações" : "Registrar faturamento"}
      </button>
    </>
  );

  const brl = (v: number) => <span className="num">{moeda(v, false)}</span>;

  const camposRecebimento = (
    <>
      <CampoTexto
        campo="dataRecebimento"
        rotulo="Data de recebimento"
        span={3}
        opcional={!receber}
        tipo="date"
        valor={f.dataRecebimento}
        aoMudar={mudar("dataRecebimento")}
        erro={erroDe("dataRecebimento")}
      />
      <CampoDinheiro
        id="f_valorRecebido"
        rotulo="Valor recebido"
        span={3}
        opcional={!receber}
        valor={f.valorRecebido}
        aoMudar={mudar("valorRecebido")}
        aoMudarValidade={validadeDe("valorRecebido")}
        erro={erroDe("valorRecebido")}
      />
      <CampoConta
        rotulo="Conta financeira creditada"
        dica="Toda entrada de caixa é registrada em uma conta. Faturar não altera o caixa."
        obrigatorio={(f.valorRecebido ?? 0) > 0}
        contas={contas}
        valor={f.contaId}
        aoMudar={mudar("contaId")}
        erro={erroDe("contaId")}
        aoNovaConta={podeCriarConta ? () => setNovaConta(true) : undefined}
      />
      <Calculado campo="liq" rotulo="Líquido esperado" span={3}>
        {brl(calc.liquido)}
      </Calculado>
      <Calculado campo="exig" rotulo="Valor a receber" span={3}>
        <b>{brl(calc.aReceber)}</b>
      </Calculado>
      <Calculado campo="saldo" rotulo="Faturado em aberto" span={3}>
        {brl(calc.emAberto)}
      </Calculado>
      <CampoChips
        campo="quitado"
        rotulo="Parcela liquidada"
        span={3}
        dica="Ao marcar como liquidada, qualquer diferença entre o recebido e o líquido esperado passa a ser tratada como diferença de conciliação."
        opcoes={QUITADO}
        valor={String(f.quitado)}
        aoMudar={(v) => mudar("quitado")(v === "true")}
        erro={erroDe("quitado")}
      />
      <Calculado campo="dif" rotulo="Diferença de conciliação" span={3}>
        {calc.diferenca === null ? (
          <span className="muted">— (parcela em aberto)</span>
        ) : (
          brl(calc.diferenca)
        )}
      </Calculado>
    </>
  );

  const receita = recs.find((r) => r.id === f.receitaId);
  const saldo = saldoAFaturar(recs, livro, f.receitaId, fat?.id ?? null);

  return (
    <>
      <Gaveta
        titulo={
          receber ? "Registrar recebimento" : fat ? "Editar faturamento" : "Registrar faturamento"
        }
        eyebrow={`${contexto.id || "CORPORATIVO"} · Faturamento e recebimentos${fat ? ` · ${fat.id}` : ""}`}
        sub={contexto.nome}
        aoFechar={aoFechar}
        rodape={rodape}
      >
        <div
          ref={corpo}
          className="form"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void salvar();
          }}
        >
          {erro && !erro.campo && (
            <div className="form-error" role="alert">
              <Icone nome="alert" tamanho="sm" />
              {erro.texto}
            </div>
          )}
          {receber ? (
            <>
              <div className="summary-box">
                <Linha rotulo="Receita">{receita?.cliente ?? ""}</Linha>
                <Linha rotulo="Parcela / NF">
                  {f.parcela} · {f.nf || "sem NF"}
                </Linha>
                <Linha rotulo="Faturamento">{dataCurta(f.dataFaturamento)}</Linha>
                <Linha rotulo="Vencimento">{dataCurta(f.vencimento)}</Linha>
                <Linha rotulo="Valor faturado">{brl(f.valorFaturado ?? 0)}</Linha>
                <Linha rotulo="Retenção tributária">
                  {rt ? (
                    <>
                      {brl(rt)} <TagValidar texto="VALIDAR COM CONTABILIDADE" />
                    </>
                  ) : (
                    "—"
                  )}
                </Linha>
                <Linha rotulo="Retenção contratual">
                  {rc ? <>{brl(rc)} · garantia (não é inadimplência)</> : "—"}
                </Linha>
                <Linha rotulo="Líquido esperado">{brl(liquidoEsperado(f))}</Linha>
              </div>
              <div className="fld" style={{ gridColumn: "span 6" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => preencher("bruto")}
                  >
                    <Icone nome="check" tamanho="xs" />
                    Recebido integral (faturado)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => preencher("liq")}
                  >
                    <Icone nome="check" tamanho="xs" />
                    Recebido líquido de retenções
                  </button>
                </div>
              </div>
              <Grupo titulo="Recebimento (caixa)" />
              {camposRecebimento}
              <Nota>
                Faturar não é receber, e receita não é entrada de caixa. Em recebimentos parciais,
                informe o valor acumulado já recebido.
              </Nota>
            </>
          ) : (
            <>
              <CampoSelect
                campo="receitaId"
                rotulo="Receita vinculada"
                obrigatorio
                opcoes={recs.map((r) => r.id)}
                rotuloDe={(id) => {
                  const r = recs.find((x) => x.id === id);
                  return r ? `${r.id} · ${r.cliente} · ${moeda(valorReceita(r))}` : id;
                }}
                ajuda={
                  saldo ? (
                    <>
                      Contratado {moeda(saldo.contratado)} · já faturado{" "}
                      {moeda(saldo.jaFaturado, false)} ·{" "}
                      <b>saldo a faturar {moeda(saldo.saldo, false)}</b>
                    </>
                  ) : undefined
                }
                valor={f.receitaId}
                aoMudar={escolherReceita}
                erro={erroDe("receitaId")}
              />
              <CampoTexto
                campo="parcela"
                rotulo="Parcela / etapa"
                span={3}
                obrigatorio
                placeholder="Ex.: Etapa 1 · Parcela 1/2"
                valor={f.parcela}
                aoMudar={mudar("parcela")}
                erro={erroDe("parcela")}
              />
              <CampoTexto
                campo="nf"
                rotulo="NF / documento fiscal"
                span={3}
                opcional
                valor={f.nf}
                aoMudar={mudar("nf")}
                erro={erroDe("nf")}
              />
              <Grupo titulo="Faturamento (competência)" />
              <CampoTexto
                campo="dataFaturamento"
                rotulo="Data de faturamento"
                span={3}
                obrigatorio
                tipo="date"
                valor={f.dataFaturamento}
                aoMudar={mudar("dataFaturamento")}
                erro={erroDe("dataFaturamento")}
              />
              <CampoTexto
                campo="vencimento"
                rotulo="Vencimento"
                span={3}
                obrigatorio
                tipo="date"
                valor={f.vencimento}
                aoMudar={mudar("vencimento")}
                erro={erroDe("vencimento")}
              />
              <CampoDinheiro
                id="f_valorFaturado"
                rotulo="Valor faturado"
                span={3}
                obrigatorio
                valor={f.valorFaturado}
                aoMudar={mudar("valorFaturado")}
                aoMudarValidade={validadeDe("valorFaturado")}
                erro={erroDe("valorFaturado")}
              />
              <CampoDinheiro
                id="f_retencaoTributaria"
                rotulo="Retenção tributária na fonte"
                span={3}
                opcional
                dica="Valor retido pelo contratante e recolhido a órgão arrecadador. Não é custo do evento, não é inadimplência e não reduz a receita reconhecida. Regime/alíquota: [VALIDAR COM CONTABILIDADE]."
                valor={f.retencaoTributaria}
                aoMudar={mudar("retencaoTributaria")}
                aoMudarValidade={validadeDe("retencaoTributaria")}
                erro={erroDe("retencaoTributaria")}
              />
              <CampoDinheiro
                id="f_retencaoContratual"
                rotulo="Retenção contratual (garantia)"
                span={3}
                opcional
                dica="Valor retido pelo contratante com previsão de liberação futura (garantia de execução). Não é inadimplência."
                valor={f.retencaoContratual}
                aoMudar={mudarRetencaoContratual}
                aoMudarValidade={validadeDe("retencaoContratual")}
                erro={erroDe("retencaoContratual")}
              />
              {rc > 0 && (
                <CampoDinheiro
                  id="f_retencaoContratualLiberada"
                  rotulo="Retenção contratual já liberada"
                  span={3}
                  opcional
                  valor={f.retencaoContratualLiberada}
                  aoMudar={mudar("retencaoContratualLiberada")}
                  aoMudarValidade={validadeDe("retencaoContratualLiberada")}
                  erro={erroDe("retencaoContratualLiberada")}
                />
              )}
              <Calculado campo="liqEsp" rotulo="Líquido esperado" span={3}>
                <b>{brl(calc.liquido)}</b>
              </Calculado>
              {rt > 0 && (
                <Nota icone="scale" dourada>
                  Tratamento tributário não confirmado —{" "}
                  <TagValidar texto="VALIDAR COM CONTABILIDADE" />{" "}
                  <TagValidar texto="VALIDAR COM JURÍDICO" />
                </Nota>
              )}
              {rc > 0 && (
                <Nota icone="scale" dourada>
                  Retenção contratual é <b>garantia</b>, com liberação prevista em contrato. Não
                  deve ser tratada como inadimplência nem como perda.
                </Nota>
              )}
              <MaisDetalhes
                titulo="Recebimento"
                dica="data · valor recebido"
                aberto={recebimento}
                aoAlternar={setRecebimento}
              >
                {camposRecebimento}
              </MaisDetalhes>
              <CampoAreaTexto
                campo="observacao"
                rotulo="Observação"
                opcional
                valor={f.observacao}
                aoMudar={mudar("observacao")}
                erro={erroDe("observacao")}
              />
            </>
          )}
          {fat && (
            <Historico
              key={fat.id}
              slug="fin-faturamentos"
              id={fat.id}
              rotulos={ROTULOS_HISTORICO}
              camposDinheiro={[...CAMPOS_DINHEIRO_FATURAMENTO]}
            />
          )}
        </div>
      </Gaveta>

      {novaConta && (
        <GavetaConta
          hojeISO={hojeISO}
          aoCriar={(conta, aviso) => {
            setNovaConta(false);
            setContasNovas((xs) => [...xs.filter((x) => x.id !== conta.id), conta]);
            setF((x) => ({ ...x, contaId: conta.id }));
            if (erro?.campo === "contaId") setErro(null);
            avisar?.(aviso.titulo, aviso.descricao);
          }}
          aoFechar={() => setNovaConta(false)}
        />
      )}
    </>
  );
}

/** `.cline` do `summary-box`. */
export function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="cline">
      <span className="cl">{rotulo}</span>
      <span className="cv">{children}</span>
    </div>
  );
}
