"use client";

import { useRef, useState } from "react";

import { LISTAS_FIN, validarConta, type ContaFin } from "@ntc/lib";

import { salvarContaFinAcao } from "../../acoesFinanceiro";
import { CampoAreaTexto, CampoChips, CampoSelect, CampoTexto, Nota } from "../eventos/CamposWizard";
import {
  contasSelecionaveis,
  dadosDaConta,
  formConta,
  rotuloConta,
  type FormConta,
} from "../eventos/dadosLancamentos";
import { CampoDinheiro } from "../ui/CampoDinheiro";
import { Gaveta } from "../ui/Gaveta";
import { Historico } from "../ui/Historico";
import { Icone } from "../ui/Icone";
import {
  comValidade,
  ERRO_FORMATO_DINHEIRO,
  primeiroDinheiroInvalido,
  type ValidadeDinheiro,
} from "../ui/formato";

/**
 * Conta financeira (`openContaDrawer` do protótipo), cadastro mínimo
 * emprestado da Fase 2 (spec §3.4). Abre pelo atalho "Nova conta" dos
 * formulários de recebimento e de baixa (empilhada sobre eles) e pela lista
 * de contas de Receber/Pagar (Task 16). O saldo inicial aceita negativo
 * (Ruling R9).
 */

export interface GavetaContaProps {
  /** Conta a editar; `null`/ausente = nova. */
  conta?: ContaFin | null;
  hojeISO: string;
  /**
   * Depois de gravar (criar ou editar): a conta como ficou, para quem abriu
   * já poder selecioná-la, e o aviso do protótipo ("Conta criada · id · nome").
   */
  aoCriar: (conta: ContaFin, aviso: { titulo: string; descricao: string }) => void;
  aoFechar: () => void;
}

const ROTULOS_HISTORICO: Record<string, string> = {
  nome: "Nome da conta",
  tipo: "Tipo",
  banco: "Instituição",
  agencia: "Agência",
  numero: "Conta",
  saldoInicial: "Saldo inicial",
  dataSaldoInicial: "Data do saldo inicial",
  ativa: "Ativa",
  observacao: "Observação",
};

const SITUACAO = [
  { valor: "true", rotulo: "Ativa" },
  { valor: "false", rotulo: "Inativa" },
] as const;

export function GavetaConta({ conta: c = null, hojeISO, aoCriar, aoFechar }: GavetaContaProps) {
  const [f, setF] = useState<FormConta>(() => formConta(c, hojeISO));
  const [erro, setErro] = useState<{ campo: string; texto: string } | null>(null);
  const [validade, setValidade] = useState<ValidadeDinheiro>({});
  const [salvando, setSalvando] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar =
    <K extends keyof FormConta>(k: K) =>
    (v: FormConta[K]) => {
      setF((x) => ({ ...x, [k]: v }));
      if (erro?.campo === k) setErro(null);
    };
  const erroDe = (campo: string) => (erro?.campo === campo ? erro.texto : undefined);

  const mostrarErro = (campo: string, texto: string) => {
    const visivel = !!campo && corpo.current?.querySelector(`#f_${campo}`) !== null;
    setErro({ campo: visivel ? campo : "", texto });
    window.setTimeout(() => corpo.current?.querySelector<HTMLElement>(`#f_${campo}`)?.focus(), 0);
  };

  const salvar = async () => {
    if (salvando) return;
    if (primeiroDinheiroInvalido(validade, ["saldoInicial"]))
      return mostrarErro("saldoInicial", ERRO_FORMATO_DINHEIRO);
    const dados = dadosDaConta(f);
    const v = validarConta(dados);
    if (!v.ok) return mostrarErro(v.campo, v.erro);
    setSalvando(true);
    try {
      const res = await salvarContaFinAcao(c?.id ?? null, dados);
      if (res.ok)
        aoCriar(
          { ...dados, id: res.id },
          {
            titulo: c ? "Conta atualizada" : "Conta criada",
            descricao: `${res.id} · ${dados.nome}`,
          },
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
        {c ? "Salvar alterações" : "Criar conta"}
      </button>
    </>
  );

  return (
    <Gaveta
      titulo={c ? "Editar conta financeira" : "Nova conta financeira"}
      eyebrow={`Caixa · Contas${c ? ` · ${c.id}` : ""}`}
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
        <Nota>
          Toda entrada e saída de caixa é registrada em uma conta financeira. O saldo é sempre{" "}
          <b>saldo inicial + movimentações</b> — nunca digitado.
        </Nota>
        <CampoTexto
          campo="nome"
          rotulo="Nome da conta"
          obrigatorio
          valor={f.nome}
          aoMudar={mudar("nome")}
          erro={erroDe("nome")}
        />
        <CampoSelect
          campo="tipo"
          rotulo="Tipo"
          span={3}
          obrigatorio
          opcoes={LISTAS_FIN.tiposConta}
          valor={f.tipo}
          aoMudar={mudar("tipo")}
          erro={erroDe("tipo")}
        />
        <CampoTexto
          campo="banco"
          rotulo="Instituição"
          span={3}
          opcional
          valor={f.banco}
          aoMudar={mudar("banco")}
          erro={erroDe("banco")}
        />
        <CampoTexto
          campo="agencia"
          rotulo="Agência"
          span={3}
          opcional
          valor={f.agencia}
          aoMudar={mudar("agencia")}
          erro={erroDe("agencia")}
        />
        <CampoTexto
          campo="numero"
          rotulo="Conta"
          span={3}
          opcional
          valor={f.numero}
          aoMudar={mudar("numero")}
          erro={erroDe("numero")}
        />
        <CampoDinheiro
          id="f_saldoInicial"
          rotulo="Saldo inicial"
          span={3}
          opcional
          comSinal
          valor={f.saldoInicial}
          aoMudar={mudar("saldoInicial")}
          aoMudarValidade={(ok) => setValidade((v) => comValidade(v, "saldoInicial", ok))}
          erro={erroDe("saldoInicial")}
        />
        <CampoTexto
          campo="dataSaldoInicial"
          rotulo="Data do saldo inicial"
          span={3}
          obrigatorio
          tipo="date"
          valor={f.dataSaldoInicial}
          aoMudar={mudar("dataSaldoInicial")}
          erro={erroDe("dataSaldoInicial")}
        />
        <CampoChips
          campo="ativa"
          rotulo="Situação"
          opcoes={SITUACAO}
          valor={String(f.ativa)}
          aoMudar={(v) => mudar("ativa")(v === "true")}
          erro={erroDe("ativa")}
        />
        <CampoAreaTexto
          campo="observacao"
          rotulo="Observação"
          opcional
          valor={f.observacao}
          aoMudar={mudar("observacao")}
          erro={erroDe("observacao")}
        />
        {c && (
          <Historico
            key={c.id}
            slug="fin-contas"
            id={c.id}
            rotulos={ROTULOS_HISTORICO}
            camposDinheiro={["saldoInicial"]}
          />
        )}
      </div>
    </Gaveta>
  );
}

export interface CampoContaProps {
  /** Rótulo do protótipo: "Conta financeira creditada" / "… debitada". */
  rotulo: string;
  dica: string;
  obrigatorio: boolean;
  /** Todas as contas (as inativas saem do select, menos a já escolhida). */
  contas: readonly ContaFin[];
  valor: string;
  aoMudar: (contaId: string) => void;
  erro?: string;
  /** Atalho "Nova conta" (só para quem tem Receber ou Pagar: a action de conta exige uma das duas). */
  aoNovaConta?: () => void;
}

/** Select de conta financeira (`contaOpts`) com o atalho "Nova conta" (spec §3.4). */
export function CampoConta({
  rotulo,
  dica,
  obrigatorio,
  contas,
  valor,
  aoMudar,
  erro,
  aoNovaConta,
}: CampoContaProps) {
  const opcoes = contasSelecionaveis(contas, valor);
  const rotulos = new Map(opcoes.map((c) => [c.id, rotuloConta(c)]));
  return (
    <CampoSelect
      campo="contaId"
      rotulo={rotulo}
      span={3}
      obrigatorio={obrigatorio}
      dica={dica}
      opcoes={opcoes.map((c) => c.id)}
      rotuloDe={(id) => rotulos.get(id) ?? id}
      valor={valor}
      aoMudar={aoMudar}
      erro={erro}
      ajuda={
        aoNovaConta ? (
          <button type="button" className="linkbtn" onClick={aoNovaConta}>
            <Icone nome="plus" tamanho="xs" />
            Nova conta
          </button>
        ) : undefined
      }
    />
  );
}
