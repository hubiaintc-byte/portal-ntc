"use client";

import { useRef, useState } from "react";

import {
  LISTAS_FIN,
  nomeCentro,
  validarCusto,
  type CustoFin,
  type LivroFinanceiro,
} from "@ntc/lib";

import { salvarCustoFinAcao } from "../../acoesFinanceiro";
import {
  Calculado,
  CampoAreaTexto,
  CampoChips,
  CampoCompetencia,
  CampoSelect,
  CampoTexto,
  Grupo,
  MaisDetalhes,
  Nota,
} from "../eventos/CamposWizard";
import { classeDesvio } from "../eventos/dadosLancamentos";
import { CampoDinheiro } from "../ui/CampoDinheiro";
import { Gaveta } from "../ui/Gaveta";
import { Historico } from "../ui/Historico";
import { Icone } from "../ui/Icone";
import { TagValidar } from "../ui/Selo";
import {
  comValidade,
  ERRO_FORMATO_DINHEIRO,
  moeda,
  primeiroDinheiroInvalido,
  type ValidadeDinheiro,
} from "../ui/formato";
import {
  CAMPOS_DETALHES_DESPESA_CORP,
  CAMPOS_DINHEIRO_DESPESA_CORP,
  dadosDaDespesaCorp,
  descricaoDespesaCorpSalva,
  desvioDespesaCorp,
  formDespesaCorp,
  fornecedoresCorporativos,
  type FormDespesaCorp,
} from "./dadosPagar";

/**
 * Despesa corporativa, sem evento (`openCustoCorpDrawer` do protótipo):
 * estrutura, administração, tecnologia, pessoal, tributos, apropriada a um
 * centro de custo. A periodicidade é só rótulo (não gera recorrência). Sem o
 * aviso de fechamento de competência (`avisoFech`, Fase 2). Acrescenta, em
 * "Mais detalhes" e só para a estrutura compartilhada, o "Critério de
 * apropriação" com o placeholder do protótipo (plano, Task 17). Ao editar, o
 * Histórico.
 */

interface GavetaDespesaCorporativaProps {
  /** `null` = nova. */
  custo: CustoFin | null;
  livro: LivroFinanceiro;
  hojeISO: string;
  aoSalvo: (titulo: string, descricao: string) => void;
  aoFechar: () => void;
}

const CENTROS = LISTAS_FIN.centrosCusto.map((c) => c.cod);
const rotuloCentro = (cod: string) => `${cod} · ${nomeCentro(cod)}`;
const OPCOES_COMPARTILHADA = [
  { valor: "false", rotulo: "Despesa própria do centro" },
  { valor: "true", rotulo: "Compartilhada entre áreas" },
];

const ROTULOS_HISTORICO: Record<string, string> = {
  descricao: "Descrição",
  categoria: "Categoria corporativa",
  centroCusto: "Centro de custo",
  compartilhada: "Estrutura compartilhada",
  valorUnitPrev: "Valor previsto",
  valorRealizado: "Valor realizado",
  competencia: "Competência econômica",
  dataPrevista: "Data prevista de pagamento",
  fornecedor: "Fornecedor",
  documento: "Documento",
  periodicidade: "Periodicidade",
  comportamento: "Comportamento",
  subcategoria: "Subcategoria",
  qtde: "Quantidade",
  criterioApropriacao: "Critério de apropriação",
  observacao: "Observação",
};

export function GavetaDespesaCorporativa({
  custo: c,
  livro,
  hojeISO,
  aoSalvo,
  aoFechar,
}: GavetaDespesaCorporativaProps) {
  const [f, setF] = useState<FormDespesaCorp>(() => formDespesaCorp(c, hojeISO));
  const [erro, setErro] = useState<{ campo: string; texto: string } | null>(null);
  const [detalhes, setDetalhes] = useState(false);
  const [validade, setValidade] = useState<ValidadeDinheiro>({});
  const validadeDe = (campo: string) => (ok: boolean) =>
    setValidade((v) => comValidade(v, campo, ok));
  const [salvando, setSalvando] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar =
    <K extends keyof FormDespesaCorp>(k: K) =>
    (v: FormDespesaCorp[K]) => {
      setF((x) => ({ ...x, [k]: v }));
      if (erro?.campo === k) setErro(null);
    };
  const erroDe = (campo: string) => (erro?.campo === campo ? erro.texto : undefined);
  const desvio = desvioDespesaCorp(f);

  const mostrarErro = (campo: string, texto: string) => {
    const emDetalhes = CAMPOS_DETALHES_DESPESA_CORP.includes(campo);
    const visivel = !!campo && corpo.current?.querySelector(`#f_${campo}`) !== null;
    if (emDetalhes) setDetalhes(true);
    setErro({ campo: visivel || emDetalhes ? campo : "", texto });
    window.setTimeout(() => corpo.current?.querySelector<HTMLElement>(`#f_${campo}`)?.focus(), 0);
  };

  const salvar = async () => {
    if (salvando) return;
    const invalido = primeiroDinheiroInvalido(validade, CAMPOS_DINHEIRO_DESPESA_CORP);
    if (invalido) return mostrarErro(invalido, ERRO_FORMATO_DINHEIRO);
    const dados = dadosDaDespesaCorp(f, c);
    const v = validarCusto(dados, livro, c?.id ?? null);
    if (!v.ok) return mostrarErro(v.campo, v.erro);
    setSalvando(true);
    try {
      const res = await salvarCustoFinAcao(c?.id ?? null, dados);
      if (res.ok)
        aoSalvo(
          c ? "Despesa corporativa atualizada" : "Despesa corporativa adicionada",
          descricaoDespesaCorpSalva(res.id, dados),
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
        {c ? "Salvar alterações" : "Adicionar despesa"}
      </button>
    </>
  );

  return (
    <Gaveta
      titulo={c ? "Editar despesa corporativa" : "Nova despesa corporativa"}
      eyebrow={`Corporativo · Despesas${c ? ` · ${c.id}` : ""}`}
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
          Despesa <b>sem evento vinculado</b>: estrutura, administração, tecnologia, pessoal,
          tributos. Toda despesa corporativa exige centro de custo e competência.
        </Nota>
        <CampoTexto
          campo="descricao"
          rotulo="Descrição"
          obrigatorio
          placeholder="Ex.: Aluguel e condomínio da sede · mar/2026"
          valor={f.descricao}
          aoMudar={mudar("descricao")}
          erro={erroDe("descricao")}
        />
        <CampoSelect
          campo="categoria"
          rotulo="Categoria corporativa"
          span={3}
          obrigatorio
          opcoes={LISTAS_FIN.categoriasCorporativas}
          valor={f.categoria}
          aoMudar={mudar("categoria")}
          erro={erroDe("categoria")}
        />
        <CampoSelect
          campo="centroCusto"
          rotulo="Centro de custo"
          span={3}
          obrigatorio
          opcoes={CENTROS}
          rotuloDe={rotuloCentro}
          valor={f.centroCusto}
          aoMudar={mudar("centroCusto")}
          erro={erroDe("centroCusto")}
        />
        <CampoChips
          campo="compartilhada"
          rotulo="Estrutura compartilhada"
          dica="Despesas compartilhadas são identificadas separadamente e NÃO são rateadas automaticamente: não há critério institucional aprovado."
          opcoes={OPCOES_COMPARTILHADA}
          valor={String(f.compartilhada)}
          aoMudar={(v) => mudar("compartilhada")(v === "true")}
          erro={erroDe("compartilhada")}
        />
        {f.compartilhada && (
          <Nota icone="scale" dourada>
            Esta despesa será exibida separadamente como <b>estrutura compartilhada</b>. Nenhum
            rateio é aplicado — o critério de apropriação permanece{" "}
            <TagValidar texto="A VALIDAR · DIRETORIA" />.
          </Nota>
        )}
        <Grupo titulo="Valor e competência" />
        <CampoDinheiro
          id="f_valorUnitPrev"
          rotulo="Valor previsto"
          span={3}
          obrigatorio
          valor={f.valorUnitPrev}
          aoMudar={mudar("valorUnitPrev")}
          aoMudarValidade={validadeDe("valorUnitPrev")}
          erro={erroDe("valorUnitPrev")}
        />
        <CampoDinheiro
          id="f_valorRealizado"
          rotulo="Valor realizado"
          span={3}
          opcional
          dica="Despesa incorrida. CUSTO/DESPESA ≠ SAÍDA DE CAIXA."
          valor={f.valorRealizado}
          aoMudar={mudar("valorRealizado")}
          aoMudarValidade={validadeDe("valorRealizado")}
          erro={erroDe("valorRealizado")}
        />
        <CampoCompetencia
          campo="competencia"
          rotulo="Competência econômica"
          span={3}
          obrigatorio
          valor={f.competencia}
          aoMudar={mudar("competencia")}
          anoReferencia={Number(hojeISO.slice(0, 4))}
          erro={erroDe("competencia")}
        />
        <CampoTexto
          campo="dataPrevista"
          rotulo="Data prevista de pagamento"
          span={3}
          opcional
          tipo="date"
          valor={f.dataPrevista}
          aoMudar={mudar("dataPrevista")}
          erro={erroDe("dataPrevista")}
        />
        <Calculado campo="desvC" rotulo="Desvio">
          {desvio === null ? (
            <span className="muted">— (não realizada)</span>
          ) : (
            <span className={`num ${classeDesvio(desvio)}`}>
              {desvio > 0 ? "+" : ""}
              {moeda(desvio, false)}
            </span>
          )}
        </Calculado>
        <MaisDetalhes
          aberto={detalhes}
          aoAlternar={setDetalhes}
          dica="fornecedor · documento · periodicidade"
        >
          <CampoTexto
            campo="fornecedor"
            rotulo="Fornecedor"
            span={3}
            sugestoes={fornecedoresCorporativos(livro)}
            valor={f.fornecedor}
            aoMudar={mudar("fornecedor")}
            erro={erroDe("fornecedor")}
          />
          <CampoTexto
            campo="documento"
            rotulo="Documento"
            span={3}
            opcional
            valor={f.documento}
            aoMudar={mudar("documento")}
            erro={erroDe("documento")}
          />
          <CampoSelect
            campo="periodicidade"
            rotulo="Periodicidade"
            span={3}
            opcoes={LISTAS_FIN.periodicidades}
            valor={f.periodicidade}
            aoMudar={mudar("periodicidade")}
            erro={erroDe("periodicidade")}
          />
          <CampoSelect
            campo="comportamento"
            rotulo="Comportamento"
            span={3}
            opcoes={LISTAS_FIN.comportamentos}
            valor={f.comportamento}
            aoMudar={mudar("comportamento")}
            erro={erroDe("comportamento")}
          />
          <CampoTexto
            campo="subcategoria"
            rotulo="Subcategoria"
            span={3}
            opcional
            valor={f.subcategoria}
            aoMudar={mudar("subcategoria")}
            erro={erroDe("subcategoria")}
          />
          <CampoTexto
            campo="qtde"
            rotulo="Quantidade"
            span={3}
            tipo="number"
            valor={f.qtde}
            aoMudar={mudar("qtde")}
            erro={erroDe("qtde")}
          />
          {f.compartilhada && (
            <CampoTexto
              campo="criterioApropriacao"
              rotulo="Critério de apropriação"
              opcional
              placeholder="[CRITÉRIO DE APROPRIAÇÃO A VALIDAR COM CONTABILIDADE/DIREÇÃO]"
              ajuda="Não ratear sem critério aprovado."
              valor={f.criterioApropriacao}
              aoMudar={mudar("criterioApropriacao")}
              erro={erroDe("criterioApropriacao")}
            />
          )}
          <CampoAreaTexto
            campo="observacao"
            rotulo="Observação"
            opcional
            valor={f.observacao}
            aoMudar={mudar("observacao")}
            erro={erroDe("observacao")}
          />
        </MaisDetalhes>
        {c && (
          <Historico
            key={c.id}
            slug="fin-custos"
            id={c.id}
            rotulos={ROTULOS_HISTORICO}
            camposDinheiro={["valorUnitPrev", "valorRealizado"]}
          />
        )}
      </div>
    </Gaveta>
  );
}
