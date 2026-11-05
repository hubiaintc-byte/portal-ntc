"use client";

import { useRef, useState } from "react";

import {
  LISTAS_FIN,
  nomeCentro,
  validarCusto,
  type CustoFin,
  type EventoFin,
  type LivroFinanceiro,
} from "@ntc/lib";

import { salvarCustoFinAcao } from "../../acoesFinanceiro";
import { CampoDinheiro } from "../ui/CampoDinheiro";
import { Gaveta } from "../ui/Gaveta";
import { Historico } from "../ui/Historico";
import { Icone } from "../ui/Icone";
import { SeloStatus } from "../ui/Selo";
import {
  comValidade,
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
  CAMPOS_DETALHES_CUSTO,
  CAMPOS_DINHEIRO_CUSTO,
  calculosCusto,
  classeDesvio,
  dadosDoCusto,
  descricaoCustoSalvo,
  formCusto,
  fornecedoresSugeridos,
  mostraCriterioApropriacao,
  opcoesCategoria,
  subcategoriasDe,
  type FormCusto,
} from "./dadosLancamentos";

/**
 * Gaveta de custo do evento (`openCustoDrawer` do protótipo). Acrescenta o
 * **Centro de custo** (padrão OPE, spec §3.7) em "Mais detalhes" e, ao editar,
 * o Histórico. Competência: o protótipo usa campo de data; o portal grava o
 * mês (`AAAA-MM`) dessa data.
 */

interface GavetaCustoProps {
  evento: EventoFin;
  /** `null` = novo. */
  custo: CustoFin | null;
  livro: LivroFinanceiro;
  aoSalvo: (titulo: string, descricao: string) => void;
  aoFechar: () => void;
}

const CENTROS = LISTAS_FIN.centrosCusto.map((c) => c.cod);
const rotuloCentro = (cod: string) => `${cod} · ${nomeCentro(cod)}`;
const FASES = LISTAS_FIN.fases.map((f) => ({ valor: f, rotulo: f }));

const ROTULOS_HISTORICO: Record<string, string> = {
  fase: "Fase",
  categoria: "Categoria",
  subcategoria: "Subcategoria",
  descricao: "Descrição",
  fornecedor: "Fornecedor / prestador",
  qtde: "Quantidade",
  unidade: "Unidade",
  valorUnitPrev: "Valor unitário previsto",
  valorRealizado: "Valor realizado",
  natureza: "Natureza",
  comportamento: "Comportamento",
  driver: "Fator de custo",
  criterioApropriacao: "Critério de apropriação",
  documento: "Documento",
  dataPrevista: "Data prevista",
  competencia: "Competência",
  centroCusto: "Centro de custo",
  observacao: "Observação",
};

export function GavetaCusto({ evento: ev, custo: c, livro, aoSalvo, aoFechar }: GavetaCustoProps) {
  const [f, setF] = useState<FormCusto>(() => formCusto(ev, c));
  const [erro, setErro] = useState<{ campo: string; texto: string } | null>(null);
  const [detalhes, setDetalhes] = useState(() => f.fase === "Estrutura compartilhada");
  const [validade, setValidade] = useState<ValidadeDinheiro>({});
  const validadeDe = (campo: string) => (ok: boolean) =>
    setValidade((v) => comValidade(v, campo, ok));
  const [salvando, setSalvando] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar =
    <K extends keyof FormCusto>(k: K) =>
    (v: FormCusto[K]) => {
      setF((x) => ({ ...x, [k]: v }));
      if (erro?.campo === k) setErro(null);
    };
  const erroDe = (campo: string) => (erro?.campo === campo ? erro.texto : undefined);
  const calc = calculosCusto(f, ev, c, livro);

  const mostrarErro = (campo: string, texto: string) => {
    const emDetalhes = CAMPOS_DETALHES_CUSTO.includes(campo);
    const visivel = !!campo && corpo.current?.querySelector(`#f_${campo}`) !== null;
    if (emDetalhes) setDetalhes(true);
    setErro({ campo: visivel || emDetalhes ? campo : "", texto });
    window.setTimeout(() => corpo.current?.querySelector<HTMLElement>(`#f_${campo}`)?.focus(), 0);
  };

  const salvar = async () => {
    if (salvando) return;
    const invalido = primeiroDinheiroInvalido(validade, CAMPOS_DINHEIRO_CUSTO);
    if (invalido) return mostrarErro(invalido, ERRO_FORMATO_DINHEIRO);
    const dados = dadosDoCusto(f, ev, c);
    const v = validarCusto(dados, livro, c?.id ?? null);
    if (!v.ok) return mostrarErro(v.campo, v.erro);
    setSalvando(true);
    try {
      const res = await salvarCustoFinAcao(c?.id ?? null, dados);
      if (res.ok)
        aoSalvo(c ? "Custo atualizado" : "Custo adicionado", descricaoCustoSalvo(res.id, dados));
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
        {c ? "Salvar alterações" : "Adicionar custo"}
      </button>
    </>
  );

  return (
    <Gaveta
      titulo={c ? "Editar custo" : "Adicionar custo"}
      eyebrow={`${ev.id} · Custos${c ? ` · ${c.id}` : ""} · ${ev.modalidade}`}
      sub={ev.nome}
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
        <CampoChips
          campo="fase"
          rotulo="Fase"
          obrigatorio
          opcoes={FASES}
          valor={f.fase}
          aoMudar={mudar("fase")}
          erro={erroDe("fase")}
        />
        <CampoSelect
          campo="categoria"
          rotulo="Categoria"
          span={3}
          obrigatorio
          dica="Taxonomia [BASELINE A LEVANTAR]. Categorias priorizadas conforme a modalidade do evento."
          opcoes={[]}
          grupos={opcoesCategoria(ev.modalidade)}
          valor={f.categoria}
          aoMudar={mudar("categoria")}
          erro={erroDe("categoria")}
        />
        <CampoTexto
          campo="subcategoria"
          rotulo="Subcategoria"
          span={3}
          opcional
          sugestoes={subcategoriasDe(f.categoria)}
          valor={f.subcategoria}
          aoMudar={mudar("subcategoria")}
          erro={erroDe("subcategoria")}
        />
        <CampoTexto
          campo="descricao"
          rotulo="Descrição"
          obrigatorio
          placeholder="Ex.: Honorários dos especialistas"
          valor={f.descricao}
          aoMudar={mudar("descricao")}
          erro={erroDe("descricao")}
        />
        <CampoTexto
          campo="fornecedor"
          rotulo="Fornecedor / prestador"
          opcional
          sugestoes={fornecedoresSugeridos(livro)}
          ajuda="Recomendado — custo sem fornecedor gera alerta de ATENÇÃO."
          valor={f.fornecedor}
          aoMudar={mudar("fornecedor")}
          erro={erroDe("fornecedor")}
        />
        <Grupo titulo="Valores" />
        <CampoTexto
          campo="qtde"
          rotulo="Quantidade"
          span={2}
          obrigatorio
          tipo="number"
          valor={f.qtde}
          aoMudar={mudar("qtde")}
          erro={erroDe("qtde")}
        />
        <CampoSelect
          campo="unidade"
          rotulo="Unidade"
          span={2}
          placeholder="Unidade"
          opcoes={LISTAS_FIN.unidades}
          valor={f.unidade}
          aoMudar={mudar("unidade")}
          erro={erroDe("unidade")}
        />
        <CampoDinheiro
          id="f_valorUnitPrev"
          rotulo="Valor unitário previsto"
          span={2}
          obrigatorio
          valor={f.valorUnitPrev}
          aoMudar={mudar("valorUnitPrev")}
          aoMudarValidade={validadeDe("valorUnitPrev")}
          erro={erroDe("valorUnitPrev")}
        />
        <Calculado campo="prev" rotulo="Valor total previsto" span={3}>
          <b>
            <span className="num">{moeda(calc.previsto, false)}</span>
          </b>
        </Calculado>
        <CampoDinheiro
          id="f_valorRealizado"
          rotulo="Valor realizado"
          span={3}
          opcional
          dica="Custo incorrido (competência). Custo realizado ≠ pago — a baixa é feita em Pagamentos."
          valor={f.valorRealizado}
          aoMudar={mudar("valorRealizado")}
          aoMudarValidade={validadeDe("valorRealizado")}
          erro={erroDe("valorRealizado")}
        />
        <Calculado campo="desv" rotulo="Desvio" span={3}>
          {calc.desvio === null ? (
            <span className="muted">— (não realizado)</span>
          ) : (
            <span className={`num ${classeDesvio(calc.desvio)}`}>
              {calc.desvio > 0 ? "+" : ""}
              {moeda(calc.desvio, false)}
            </span>
          )}
        </Calculado>
        <Calculado campo="st" rotulo="Status (automático)" span={3} esquerda>
          <SeloStatus status={calc.status} tipo="financeiro" />
        </Calculado>
        <MaisDetalhes
          aberto={detalhes}
          aoAlternar={setDetalhes}
          dica="classificação econômica · documento · datas · centro de custo"
        >
          <Nota>
            Classificação econômica: natureza, comportamento e fator de custo. Pode ser completada
            depois.
          </Nota>
          <CampoSelect
            campo="natureza"
            rotulo="Natureza"
            span={2}
            opcoes={LISTAS_FIN.naturezas}
            valor={f.natureza}
            aoMudar={mudar("natureza")}
            erro={erroDe("natureza")}
          />
          <CampoSelect
            campo="comportamento"
            rotulo="Comportamento"
            span={2}
            opcoes={LISTAS_FIN.comportamentos}
            valor={f.comportamento}
            aoMudar={mudar("comportamento")}
            erro={erroDe("comportamento")}
          />
          <CampoSelect
            campo="driver"
            rotulo="Fator de custo"
            span={2}
            placeholder="—"
            opcoes={LISTAS_FIN.drivers}
            valor={f.driver}
            aoMudar={mudar("driver")}
            erro={erroDe("driver")}
          />
          {mostraCriterioApropriacao(f) && (
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
          <CampoTexto
            campo="documento"
            rotulo="Documento"
            span={2}
            opcional
            placeholder="NF / recibo"
            valor={f.documento}
            aoMudar={mudar("documento")}
            erro={erroDe("documento")}
          />
          <CampoTexto
            campo="dataPrevista"
            rotulo="Data prevista"
            span={2}
            tipo="date"
            valor={f.dataPrevista}
            aoMudar={mudar("dataPrevista")}
            erro={erroDe("dataPrevista")}
          />
          <CampoTexto
            campo="competencia"
            rotulo="Competência"
            span={2}
            tipo="date"
            valor={f.competencia}
            aoMudar={mudar("competencia")}
            erro={erroDe("competencia")}
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
