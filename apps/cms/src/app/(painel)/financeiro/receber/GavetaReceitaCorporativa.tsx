"use client";

import { useRef, useState } from "react";

import {
  LISTAS_FIN,
  nomeCentro,
  validarReceita,
  type LivroFinanceiro,
  type ReceitaFin,
} from "@ntc/lib";

import { salvarReceitaFinAcao } from "../../acoesFinanceiro";
import {
  CampoAreaTexto,
  CampoCompetencia,
  CampoSelect,
  CampoTexto,
  Grupo,
  MaisDetalhes,
  Nota,
} from "../eventos/CamposWizard";
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
import {
  CAMPOS_DETALHES_RECEITA_CORP,
  CAMPOS_DINHEIRO_RECEITA_CORP,
  clientesCorporativos,
  dadosDaReceitaCorp,
  descricaoReceitaCorpSalva,
  formReceitaCorp,
  type FormReceitaCorp,
} from "./dadosReceber";

/**
 * Receita corporativa, sem evento (`openReceitaCorpDrawer` do protótipo):
 * institucional, consultoria, patrocínio, convênio ou receita financeira,
 * apropriada a um centro de custo. Sem o aviso de fechamento de competência
 * (`avisoFech`, Fase 2). Ao editar, o Histórico.
 */

interface GavetaReceitaCorporativaProps {
  /** `null` = nova. */
  receita: ReceitaFin | null;
  livro: LivroFinanceiro;
  hojeISO: string;
  aoSalvo: (titulo: string, descricao: string) => void;
  aoFechar: () => void;
}

const CENTROS = LISTAS_FIN.centrosCusto.map((c) => c.cod);
const rotuloCentro = (cod: string) => `${cod} · ${nomeCentro(cod)}`;

const ROTULOS_HISTORICO: Record<string, string> = {
  cliente: "Cliente / contraparte",
  origem: "Origem da receita",
  centroCusto: "Centro de custo",
  valorUnit: "Valor contratado",
  competencia: "Competência econômica",
  statusEconomico: "Situação",
  referencia: "Referência contratual",
  segmento: "Segmento",
  tipoReceita: "Tipo de receita",
  criterioReconhecimento: "Critério de reconhecimento",
  observacao: "Observação",
};

export function GavetaReceitaCorporativa({
  receita: r,
  livro,
  hojeISO,
  aoSalvo,
  aoFechar,
}: GavetaReceitaCorporativaProps) {
  const [f, setF] = useState<FormReceitaCorp>(() => formReceitaCorp(r, hojeISO));
  const [erro, setErro] = useState<{ campo: string; texto: string } | null>(null);
  const [detalhes, setDetalhes] = useState(false);
  const [validade, setValidade] = useState<ValidadeDinheiro>({});
  const [salvando, setSalvando] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar =
    <K extends keyof FormReceitaCorp>(k: K) =>
    (v: FormReceitaCorp[K]) => {
      setF((x) => ({ ...x, [k]: v }));
      if (erro?.campo === k) setErro(null);
    };
  const erroDe = (campo: string) => (erro?.campo === campo ? erro.texto : undefined);

  const mostrarErro = (campo: string, texto: string) => {
    const visivel = !!campo && corpo.current?.querySelector(`#f_${campo}`) !== null;
    const emDetalhes = CAMPOS_DETALHES_RECEITA_CORP.includes(campo);
    if (emDetalhes) setDetalhes(true);
    setErro({ campo: visivel || emDetalhes ? campo : "", texto });
    window.setTimeout(() => corpo.current?.querySelector<HTMLElement>(`#f_${campo}`)?.focus(), 0);
  };

  const salvar = async () => {
    if (salvando) return;
    const invalido = primeiroDinheiroInvalido(validade, CAMPOS_DINHEIRO_RECEITA_CORP);
    if (invalido) return mostrarErro(invalido, ERRO_FORMATO_DINHEIRO);
    const dados = dadosDaReceitaCorp(f, r);
    const v = validarReceita(dados, livro, r?.id ?? null);
    if (!v.ok) return mostrarErro(v.campo, v.erro);
    setSalvando(true);
    try {
      const res = await salvarReceitaFinAcao(r?.id ?? null, dados);
      if (res.ok)
        aoSalvo(
          r ? "Receita corporativa atualizada" : "Receita corporativa adicionada",
          descricaoReceitaCorpSalva(res.id, dados),
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
        {r ? "Salvar alterações" : "Adicionar receita"}
      </button>
    </>
  );

  return (
    <Gaveta
      titulo={r ? "Editar receita corporativa" : "Nova receita corporativa"}
      eyebrow={`Corporativo · Receitas${r ? ` · ${r.id}` : ""}`}
      sub="Sem evento vinculado"
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
          Receita <b>sem evento vinculado</b>: institucional, consultoria, patrocínio, convênio ou
          receita financeira. O centro de custo substitui o evento como chave de apropriação.
        </Nota>
        <CampoTexto
          campo="cliente"
          rotulo="Cliente / contraparte"
          obrigatorio
          sugestoes={clientesCorporativos(livro)}
          placeholder="Ex.: Fundação Fictícia Gama"
          valor={f.cliente}
          aoMudar={mudar("cliente")}
          erro={erroDe("cliente")}
        />
        <CampoSelect
          campo="origem"
          rotulo="Origem da receita"
          span={3}
          obrigatorio
          opcoes={LISTAS_FIN.origensReceitaCorp}
          valor={f.origem}
          aoMudar={mudar("origem")}
          erro={erroDe("origem")}
        />
        <CampoSelect
          campo="centroCusto"
          rotulo="Centro de custo"
          span={3}
          obrigatorio
          dica="Todo lançamento corporativo é apropriado a um centro de custo. Não há rateio automático."
          opcoes={CENTROS}
          rotuloDe={rotuloCentro}
          valor={f.centroCusto}
          aoMudar={mudar("centroCusto")}
          erro={erroDe("centroCusto")}
        />
        <Grupo titulo="Valor e competência" />
        <CampoDinheiro
          id="f_valorUnit"
          rotulo="Valor contratado"
          span={3}
          obrigatorio
          valor={f.valorUnit}
          aoMudar={mudar("valorUnit")}
          aoMudarValidade={(ok) => setValidade((v) => comValidade(v, "valorUnit", ok))}
          erro={erroDe("valorUnit")}
        />
        <CampoCompetencia
          campo="competencia"
          rotulo="Competência econômica"
          span={3}
          obrigatorio
          dica="Mês em que o fato econômico é reconhecido — independe do faturamento e do recebimento."
          valor={f.competencia}
          aoMudar={mudar("competencia")}
          anoReferencia={Number(hojeISO.slice(0, 4))}
          erro={erroDe("competencia")}
        />
        <CampoSelect
          campo="statusEconomico"
          rotulo="Situação"
          span={3}
          obrigatorio
          opcoes={["Prevista", "Contratada"]}
          valor={f.statusEconomico}
          aoMudar={mudar("statusEconomico")}
          erro={erroDe("statusEconomico")}
        />
        <CampoTexto
          campo="referencia"
          rotulo="Referência contratual"
          span={3}
          opcional
          valor={f.referencia}
          aoMudar={mudar("referencia")}
          erro={erroDe("referencia")}
        />
        <MaisDetalhes
          aberto={detalhes}
          aoAlternar={setDetalhes}
          dica="segmento · tipo · observação"
        >
          <CampoSelect
            campo="segmento"
            rotulo="Segmento"
            span={3}
            opcoes={LISTAS_FIN.segmentos}
            valor={f.segmento}
            aoMudar={mudar("segmento")}
            erro={erroDe("segmento")}
          />
          <CampoSelect
            campo="tipoReceita"
            rotulo="Tipo de receita"
            span={3}
            opcoes={LISTAS_FIN.tiposReceita.filter((t) => t !== "Inscrição")}
            valor={f.tipoReceita}
            aoMudar={mudar("tipoReceita")}
            erro={erroDe("tipoReceita")}
          />
          <CampoSelect
            campo="criterioReconhecimento"
            rotulo="Critério de reconhecimento"
            dica="Critério PROVISÓRIO — pendente de validação contábil."
            opcoes={LISTAS_FIN.criteriosReconhecimento}
            valor={f.criterioReconhecimento}
            aoMudar={mudar("criterioReconhecimento")}
            erro={erroDe("criterioReconhecimento")}
          />
          <CampoAreaTexto
            campo="observacao"
            rotulo="Observação"
            opcional
            valor={f.observacao}
            aoMudar={mudar("observacao")}
            erro={erroDe("observacao")}
          />
        </MaisDetalhes>
        {r && (
          <Historico
            key={r.id}
            slug="fin-receitas"
            id={r.id}
            rotulos={ROTULOS_HISTORICO}
            camposDinheiro={["valorUnit", "desconto"]}
          />
        )}
      </div>
    </Gaveta>
  );
}
