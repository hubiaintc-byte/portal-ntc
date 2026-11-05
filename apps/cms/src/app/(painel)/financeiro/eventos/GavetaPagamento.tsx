"use client";

import { useRef, useState } from "react";

import {
  validarPagamento,
  type ContaFin,
  type CustoFin,
  type LivroFinanceiro,
  type PagamentoFin,
} from "@ntc/lib";

import { temTela, type AcessoPainel } from "@/lib/cms/telas";

import { salvarPagamentoFinAcao } from "../../acoesFinanceiro";
import { CampoConta, GavetaConta } from "../receber/GavetaConta";
import { CampoDinheiro } from "../ui/CampoDinheiro";
import { Gaveta } from "../ui/Gaveta";
import { Historico } from "../ui/Historico";
import { Icone } from "../ui/Icone";
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
  CampoSelect,
  CampoTexto,
  Grupo,
  MaisDetalhes,
  Nota,
} from "./CamposWizard";
import {
  aoEscolherCusto,
  CAMPOS_BAIXA,
  CAMPOS_DINHEIRO_PAGAMENTO,
  contasComExtras,
  custosDoEvento,
  dadosDoPagamento,
  descricaoPagamentoSalvo,
  formPagamento,
  infoCusto,
  opcoesCustos,
  pagarIntegral,
  type FormPagamento,
} from "./dadosLancamentos";
import { Linha } from "./GavetaFaturamento";

/**
 * Título e baixa na mesma linha (`openPagamentoDrawer` do protótipo): modo
 * `editar` (programar/editar o título, com "Baixa do pagamento" recolhida) e
 * modo `baixar` (resumo do título, "Pagar valor integral" e a baixa em
 * caixa). O select de conta tem o atalho "Nova conta". Reutilizada em Pagar
 * (Task 17), com `contexto = { id: "", nome: "Despesa corporativa" }` e
 * `custos` (agrupados por categoria corporativa).
 */

export interface GavetaPagamentoProps {
  /** Título a editar/baixar; `null` = novo. */
  pagamento: PagamentoFin | null;
  /** Custo já escolhido (botão "Pagamento" do custo, "Registrar pagamento" da linha). */
  custoId?: string;
  modo: "editar" | "baixar";
  /** Evento do lançamento (`id` + `nome`); `id: ""` = corporativo (eyebrow "CORPORATIVO"). */
  contexto: { id: string; nome: string };
  /** Custos do select; padrão: os do evento (`custosDoEvento`). */
  custos?: readonly CustoFin[];
  livro: LivroFinanceiro;
  hojeISO: string;
  /** Decide o atalho "Nova conta" (a action de conta exige Receber ou Pagar). */
  acesso: AcessoPainel;
  aoSalvo: (titulo: string, descricao: string) => void;
  /** Aviso "Conta criada" do atalho "Nova conta". */
  avisar?: MostrarToast;
  aoFechar: () => void;
}

const ROTULOS_HISTORICO: Record<string, string> = {
  custo: "Custo vinculado",
  documento: "Documento / título",
  vencimento: "Vencimento",
  valor: "Valor do título",
  dataPagamento: "Data de pagamento",
  valorPago: "Valor pago",
  conta: "Conta financeira debitada",
  observacao: "Observação",
};

export function GavetaPagamento({
  pagamento: pg,
  custoId,
  modo,
  contexto,
  custos: custosProp,
  livro,
  hojeISO,
  acesso,
  aoSalvo,
  avisar,
  aoFechar,
}: GavetaPagamentoProps) {
  const baixar = modo === "baixar";
  const custos = custosProp ?? custosDoEvento(livro, contexto.id);
  const corporativo = !contexto.id;

  const [contasNovas, setContasNovas] = useState<ContaFin[]>([]);
  const contas = contasComExtras(livro.contas, contasNovas);
  const livroAtual: LivroFinanceiro = { ...livro, contas };

  const [f, setF] = useState<FormPagamento>(() =>
    formPagamento({ pagamento: pg, custoId, custos, livro, modo, hoje: hojeISO }),
  );
  const [erro, setErro] = useState<{ campo: string; texto: string } | null>(null);
  const [baixa, setBaixa] = useState(() => !!(pg && pg.valorPago));
  const [validade, setValidade] = useState<ValidadeDinheiro>({});
  const validadeDe = (campo: string) => (ok: boolean) =>
    setValidade((v) => comValidade(v, campo, ok));
  const [novaConta, setNovaConta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar =
    <K extends keyof FormPagamento>(k: K) =>
    (v: FormPagamento[K]) => {
      setF((x) => ({ ...x, [k]: v }));
      if (erro?.campo === k) setErro(null);
    };
  const erroDe = (campo: string) => (erro?.campo === campo ? erro.texto : undefined);
  const podeCriarConta = temTela(acesso, ["fin.receber", "fin.pagar"]);

  const mostrarErro = (campo: string, texto: string) => {
    const emBaixa = !baixar && CAMPOS_BAIXA.includes(campo);
    if (emBaixa) setBaixa(true);
    const visivel = !!campo && corpo.current?.querySelector(`#f_${campo}`) !== null;
    setErro({ campo: visivel || emBaixa ? campo : "", texto });
    window.setTimeout(() => corpo.current?.querySelector<HTMLElement>(`#f_${campo}`)?.focus(), 0);
  };

  const escolherCusto = (id: string) => {
    if (erro?.campo === "custoId") setErro(null);
    if (pg || !id) return setF((x) => ({ ...x, custoId: id }));
    setF((x) => aoEscolherCusto(x, id, custos, livro));
    setValidade((v) => comValidade(v, "valor", true));
  };

  const integral = () => {
    setF((x) => pagarIntegral(x, hojeISO));
    setValidade((v) => comValidade(v, "valorPago", true));
    if (erro?.campo === "valorPago") setErro(null);
  };

  const salvar = async () => {
    if (salvando) return;
    const invalido = primeiroDinheiroInvalido(validade, CAMPOS_DINHEIRO_PAGAMENTO);
    if (invalido) return mostrarErro(invalido, ERRO_FORMATO_DINHEIRO);
    const dados = dadosDoPagamento(f);
    const v = validarPagamento(dados, livroAtual, pg?.id ?? null);
    if (!v.ok) return mostrarErro(v.campo, v.erro);
    setSalvando(true);
    try {
      const res = await salvarPagamentoFinAcao(pg?.id ?? null, dados);
      if (res.ok)
        aoSalvo(
          baixar ? "Pagamento baixado" : pg ? "Pagamento atualizado" : "Pagamento registrado",
          descricaoPagamentoSalvo(res.id, dados),
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
        {baixar ? "Confirmar pagamento" : pg ? "Salvar alterações" : "Registrar pagamento"}
      </button>
    </>
  );

  const brl = (v: number) => <span className="num">{moeda(v, false)}</span>;

  const camposBaixa = (
    <>
      <CampoTexto
        campo="dataPagamento"
        rotulo="Data de pagamento"
        span={3}
        opcional={!baixar}
        tipo="date"
        valor={f.dataPagamento}
        aoMudar={mudar("dataPagamento")}
        erro={erroDe("dataPagamento")}
      />
      <CampoDinheiro
        id="f_valorPago"
        rotulo="Valor pago"
        span={3}
        opcional={!baixar}
        valor={f.valorPago}
        aoMudar={mudar("valorPago")}
        aoMudarValidade={validadeDe("valorPago")}
        erro={erroDe("valorPago")}
      />
      <CampoConta
        rotulo="Conta financeira debitada"
        dica="Toda saída de caixa é registrada em uma conta. A obrigação existe antes do pagamento."
        obrigatorio={(f.valorPago ?? 0) > 0}
        contas={contas}
        valor={f.contaId}
        aoMudar={mudar("contaId")}
        erro={erroDe("contaId")}
        aoNovaConta={podeCriarConta ? () => setNovaConta(true) : undefined}
      />
      <Calculado campo="saldo" rotulo="Valor em aberto" span={3}>
        <b>{brl((f.valor ?? 0) - (f.valorPago ?? 0))}</b>
      </Calculado>
    </>
  );

  const custo = custos.find((k) => k.id === f.custoId);
  const info = infoCusto(custos, livro, f.custoId);

  return (
    <>
      <Gaveta
        titulo={baixar ? "Registrar baixa" : pg ? "Editar pagamento" : "Registrar pagamento"}
        eyebrow={`${contexto.id || "CORPORATIVO"} · Pagamentos${pg ? ` · ${pg.id}` : ""}`}
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
          {baixar ? (
            <>
              <div className="summary-box">
                <Linha rotulo="Custo">{custo ? `${custo.id} · ${custo.descricao}` : "—"}</Linha>
                <Linha rotulo="Fornecedor">{custo?.fornecedor || "—"}</Linha>
                <Linha rotulo="Documento">{f.documento || "—"}</Linha>
                <Linha rotulo="Vencimento">{dataCurta(f.vencimento)}</Linha>
                <Linha rotulo="Valor do título">{brl(f.valor ?? 0)}</Linha>
                <Linha rotulo="Custo realizado">{brl(custo?.valorRealizado ?? 0)}</Linha>
              </div>
              <div className="fld" style={{ gridColumn: "span 6" }}>
                <div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={integral}>
                    <Icone nome="check" tamanho="xs" />
                    Pagar valor integral do título
                  </button>
                </div>
              </div>
              <Grupo titulo="Baixa (caixa)" />
              {camposBaixa}
              <Nota>
                Custo realizado não é o mesmo que custo pago. O pagamento apenas referencia o
                lançamento de custo — não o substitui.
              </Nota>
            </>
          ) : (
            <>
              <CampoSelect
                campo="custoId"
                rotulo="Custo vinculado"
                obrigatorio
                opcoes={[]}
                grupos={opcoesCustos(custos, corporativo)}
                rotuloDe={(id) => {
                  const c = custos.find((x) => x.id === id);
                  return c ? `${c.id} · ${c.descricao}` : id;
                }}
                ajuda={
                  info ? (
                    <>
                      {info.fornecedor} · previsto {moeda(info.previsto)} ·{" "}
                      <b>realizado {moeda(info.realizado, false)}</b> · pago{" "}
                      {moeda(info.pago, false)}
                      {info.realizado === 0 && (
                        <>
                          {" "}
                          ·{" "}
                          <span className="neg">
                            custo ainda não realizado — só é possível programar
                          </span>
                        </>
                      )}
                    </>
                  ) : undefined
                }
                valor={f.custoId}
                aoMudar={escolherCusto}
                erro={erroDe("custoId")}
              />
              <CampoTexto
                campo="documento"
                rotulo="Documento / título"
                span={3}
                opcional
                placeholder="NF, boleto, recibo"
                valor={f.documento}
                aoMudar={mudar("documento")}
                erro={erroDe("documento")}
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
                id="f_valor"
                rotulo="Valor do título"
                obrigatorio
                ajuda="Sugestão: saldo do custo ainda não programado."
                valor={f.valor}
                aoMudar={mudar("valor")}
                aoMudarValidade={validadeDe("valor")}
                erro={erroDe("valor")}
              />
              <MaisDetalhes
                titulo="Baixa do pagamento"
                dica="data · valor pago"
                aberto={baixa}
                aoAlternar={setBaixa}
              >
                {camposBaixa}
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
          {pg && (
            <Historico
              key={pg.id}
              slug="fin-pagamentos"
              id={pg.id}
              rotulos={ROTULOS_HISTORICO}
              camposDinheiro={[...CAMPOS_DINHEIRO_PAGAMENTO]}
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
