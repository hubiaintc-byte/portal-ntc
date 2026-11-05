"use client";

import { useRef, useState } from "react";

import {
  LISTAS_FIN,
  nomeCentro,
  validarReceita,
  type EventoFin,
  type LivroFinanceiro,
  type ReceitaFin,
} from "@ntc/lib";

import { salvarReceitaFinAcao } from "../../acoesFinanceiro";
import { CampoDinheiro } from "../ui/CampoDinheiro";
import { Gaveta } from "../ui/Gaveta";
import { Historico } from "../ui/Historico";
import { Icone } from "../ui/Icone";
import { TagValidar } from "../ui/Selo";
import {
  comValidade,
  ERRO_FORMATO_DINHEIRO,
  inteiro,
  moeda,
  primeiroDinheiroInvalido,
  type ValidadeDinheiro,
} from "../ui/formato";
import { CampoAreaTexto, CampoSelect, CampoTexto, Grupo, Nota } from "./CamposWizard";
import {
  CAMPOS_DINHEIRO_RECEITA,
  calculosReceita,
  camposDetalhesReceita,
  clientesSugeridos,
  dadosDaReceita,
  descricaoReceitaSalva,
  ehAberto,
  formReceita,
  type FormReceita,
} from "./dadosArea";

/**
 * Gaveta de receita do evento (`openReceitaDrawer` do protótipo): dois
 * esquemas, evento aberto (por inscrição) e In Company/B2G (valor global).
 * Acrescenta o **Centro de custo** que o protótipo esquecia (spec §3.7,
 * padrão OPE) e, ao editar, o Histórico.
 */

interface GavetaReceitaProps {
  evento: EventoFin;
  /** `null` = nova. */
  receita: ReceitaFin | null;
  livro: LivroFinanceiro;
  aoSalvo: (titulo: string, descricao: string) => void;
  aoFechar: () => void;
}

const CENTROS = LISTAS_FIN.centrosCusto.map((c) => c.cod);
const rotuloCentro = (cod: string) => `${cod} · ${nomeCentro(cod)}`;

/** Rótulos dos campos no Histórico. */
const ROTULOS_HISTORICO: Record<string, string> = {
  cliente: "Órgão / cliente",
  segmento: "Segmento",
  statusEconomico: "Situação",
  qtde: "Inscrições",
  valorUnit: "Valor",
  desconto: "Desconto",
  pagantes: "Pagantes",
  cortesias: "Cortesias",
  origem: "Origem",
  tipoReceita: "Tipo de receita",
  etapa: "Etapa / módulo",
  referencia: "Referência contratual",
  observacao: "Observação",
  centroCusto: "Centro de custo",
  etapas: "Etapas",
  criterioReconhecimento: "Critério de reconhecimento",
};

export function GavetaReceita({
  evento: ev,
  receita: r,
  livro,
  aoSalvo,
  aoFechar,
}: GavetaReceitaProps) {
  const aberto = ehAberto(ev);
  const [f, setF] = useState<FormReceita>(() => formReceita(ev, r));
  const [erro, setErro] = useState<{ campo: string; texto: string } | null>(null);
  const [detalhes, setDetalhes] = useState(false);
  // Texto que não é valor nos campos de dinheiro: recusa o envio (não grava R$ 0,00).
  const [validade, setValidade] = useState<ValidadeDinheiro>({});
  const validadeDe = (campo: string) => (ok: boolean) =>
    setValidade((v) => comValidade(v, campo, ok));
  const [salvando, setSalvando] = useState(false);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar =
    <K extends keyof FormReceita>(k: K) =>
    (v: FormReceita[K]) => {
      setF((x) => ({ ...x, [k]: v }));
      if (erro?.campo === k) setErro(null);
    };
  const erroDe = (campo: string) => (erro?.campo === campo ? erro.texto : undefined);
  const calc = calculosReceita(f, ev);
  const clientes = clientesSugeridos(livro);

  const mostrarErro = (campo: string, texto: string) => {
    const visivel = !!campo && corpo.current?.querySelector(`#f_${campo}`) !== null;
    const emDetalhes = camposDetalhesReceita(ev).includes(campo);
    if (emDetalhes) setDetalhes(true);
    setErro({ campo: visivel || emDetalhes ? campo : "", texto });
    // Depois do render (o bloco "Mais detalhes" pode ter acabado de abrir).
    window.setTimeout(() => corpo.current?.querySelector<HTMLElement>(`#f_${campo}`)?.focus(), 0);
  };

  const salvar = async () => {
    if (salvando) return;
    const invalido = primeiroDinheiroInvalido(validade, CAMPOS_DINHEIRO_RECEITA);
    if (invalido) return mostrarErro(invalido, ERRO_FORMATO_DINHEIRO);
    const dados = dadosDaReceita(f, ev, r);
    const v = validarReceita(dados, livro, r?.id ?? null);
    if (!v.ok) return mostrarErro(v.campo, v.erro);
    setSalvando(true);
    try {
      const res = await salvarReceitaFinAcao(r?.id ?? null, dados);
      if (res.ok)
        aoSalvo(
          r ? "Receita atualizada" : "Receita adicionada",
          descricaoReceitaSalva(res.id, dados),
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

  const situacao = (
    <CampoSelect
      campo="statusEconomico"
      rotulo="Situação"
      span={3}
      obrigatorio
      opcoes={["Prevista", "Contratada"]}
      dica={
        aberto
          ? "Faturada e Recebida são calculadas a partir dos faturamentos registrados."
          : undefined
      }
      valor={f.statusEconomico}
      aoMudar={mudar("statusEconomico")}
      erro={erroDe("statusEconomico")}
    />
  );
  const segmento = (
    <CampoSelect
      campo="segmento"
      rotulo="Segmento"
      span={3}
      obrigatorio
      opcoes={LISTAS_FIN.segmentos}
      valor={f.segmento}
      aoMudar={mudar("segmento")}
      erro={erroDe("segmento")}
    />
  );
  const origem = (
    <CampoSelect
      campo="origem"
      rotulo="Origem"
      span={3}
      opcoes={LISTAS_FIN.origensReceita}
      valor={f.origem}
      aoMudar={mudar("origem")}
      erro={erroDe("origem")}
    />
  );
  const centro = (
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
  );
  const observacao = (
    <CampoAreaTexto
      campo="observacao"
      rotulo="Observação"
      opcional
      valor={f.observacao}
      aoMudar={mudar("observacao")}
      erro={erroDe("observacao")}
    />
  );
  const desconto = (span: 2 | 3, dica: boolean) => (
    <CampoDinheiro
      id="f_desconto"
      rotulo="Desconto (R$)"
      span={span}
      opcional
      valor={f.desconto}
      aoMudar={mudar("desconto")}
      aoMudarValidade={validadeDe("desconto")}
      erro={erroDe("desconto")}
      ajuda={
        dica ? (
          <>
            Faixas e políticas de desconto:{" "}
            <TagValidar texto="BASELINE A LEVANTAR · VALIDAR COM A DIREÇÃO" />.
          </>
        ) : undefined
      }
    />
  );

  return (
    <Gaveta
      titulo={r ? "Editar receita" : "Adicionar receita"}
      eyebrow={`${ev.id} · Receitas${r ? ` · ${r.id}` : ""}`}
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
        {aberto ? (
          <>
            <Nota>
              Evento aberto · cada órgão/cliente é uma receita.{" "}
              <b>Valor contratado = inscrições × valor unitário − desconto.</b>
            </Nota>
            <CampoTexto
              campo="cliente"
              rotulo="Órgão / cliente"
              obrigatorio
              sugestoes={clientes}
              placeholder="Ex.: Tribunal de Contas B"
              valor={f.cliente}
              aoMudar={mudar("cliente")}
              erro={erroDe("cliente")}
            />
            {segmento}
            {situacao}
            <Grupo titulo="Inscrições" />
            <CampoTexto
              campo="qtde"
              rotulo="Inscrições"
              span={2}
              obrigatorio
              tipo="number"
              valor={f.qtde}
              aoMudar={mudar("qtde")}
              erro={erroDe("qtde")}
            />
            <CampoDinheiro
              id="f_valorUnit"
              rotulo="Valor unitário"
              span={2}
              obrigatorio
              valor={f.valorUnit}
              aoMudar={mudar("valorUnit")}
              aoMudarValidade={validadeDe("valorUnit")}
              erro={erroDe("valorUnit")}
            />
            {desconto(2, true)}
            <Calculado campo="bruto" rotulo="Valor bruto" span={3}>
              <span className="num">{moeda(calc.bruto, false)}</span>
            </Calculado>
            <Calculado campo="contratado" rotulo="Valor contratado" span={3}>
              <b>
                <span className="num">{moeda(calc.contratado, false)}</span>
              </b>
            </Calculado>
            <Grupo titulo="Participantes" />
            <CampoTexto
              campo="pagantes"
              rotulo="Pagantes"
              span={2}
              obrigatorio
              tipo="number"
              ajuda="Normalmente igual às inscrições."
              valor={f.pagantes}
              aoMudar={mudar("pagantes")}
              erro={erroDe("pagantes")}
            />
            <CampoTexto
              campo="cortesias"
              rotulo="Cortesias"
              span={2}
              opcional
              tipo="number"
              valor={f.cortesias}
              aoMudar={mudar("cortesias")}
              erro={erroDe("cortesias")}
            />
            <Calculado campo="totalp" rotulo="Total" span={2}>
              <span className="num">{inteiro(calc.participantes)}</span>
            </Calculado>
            <Nota icone="ticket" dourada>
              Cortesia não é custo negativo nem desconto — é participante sem receita diretamente
              associada.
            </Nota>
            <MaisDetalhes
              aberto={detalhes}
              aoAlternar={setDetalhes}
              dica="origem · tipo · centro de custo · observação"
            >
              {origem}
              <CampoSelect
                campo="tipoReceita"
                rotulo="Tipo de receita"
                span={3}
                opcoes={LISTAS_FIN.tiposReceita}
                valor={f.tipoReceita}
                aoMudar={mudar("tipoReceita")}
                erro={erroDe("tipoReceita")}
              />
              {centro}
              {observacao}
            </MaisDetalhes>
          </>
        ) : (
          <>
            <Nota>
              In Company / B2G · receita por <b>valor global</b>, <b>etapa</b> ou <b>módulo</b>. As
              parcelas são registradas em Faturamento e Recebimentos.
            </Nota>
            <CampoTexto
              campo="cliente"
              rotulo="Órgão / cliente"
              obrigatorio
              sugestoes={clientes}
              valor={f.cliente}
              aoMudar={mudar("cliente")}
              erro={erroDe("cliente")}
            />
            {segmento}
            <CampoSelect
              campo="tipoReceita"
              rotulo="Tipo de receita"
              span={3}
              obrigatorio
              opcoes={LISTAS_FIN.tiposReceita.filter((t) => t !== "Inscrição")}
              valor={f.tipoReceita}
              aoMudar={mudar("tipoReceita")}
              erro={erroDe("tipoReceita")}
            />
            <CampoTexto
              campo="etapa"
              rotulo="Etapa / módulo"
              span={3}
              opcional
              placeholder="Ex.: Módulos 01 e 03"
              valor={f.etapa}
              aoMudar={mudar("etapa")}
              erro={erroDe("etapa")}
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
            <CampoDinheiro
              id="f_valorUnit"
              rotulo="Valor global contratado"
              span={3}
              obrigatorio
              valor={f.valorUnit}
              aoMudar={mudar("valorUnit")}
              aoMudarValidade={validadeDe("valorUnit")}
              erro={erroDe("valorUnit")}
            />
            {situacao}
            <MaisDetalhes
              aberto={detalhes}
              aoAlternar={setDetalhes}
              dica="origem · participantes · centro de custo · observação"
            >
              {origem}
              {desconto(3, false)}
              <CampoTexto
                campo="pagantes"
                rotulo="Pagantes"
                span={3}
                opcional
                tipo="number"
                ajuda="Quando houver participantes vinculados."
                valor={f.pagantes}
                aoMudar={mudar("pagantes")}
                erro={erroDe("pagantes")}
              />
              <CampoTexto
                campo="cortesias"
                rotulo="Cortesias"
                span={3}
                opcional
                tipo="number"
                valor={f.cortesias}
                aoMudar={mudar("cortesias")}
                erro={erroDe("cortesias")}
              />
              {centro}
              {observacao}
            </MaisDetalhes>
          </>
        )}
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

/** Campo calculado do `FormEngine` (`type: 'computed'`). */
function Calculado({
  campo,
  rotulo,
  span,
  children,
}: {
  campo: string;
  rotulo: string;
  span: 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <div className={`fld s${span}`}>
      <label htmlFor={`f_${campo}`}>{rotulo}</label>
      <output id={`f_${campo}`} className="computed">
        {children}
      </output>
    </div>
  );
}

/** `{ details: 'Mais detalhes', hint, items }` do `FormEngine`. */
function MaisDetalhes({
  aberto,
  aoAlternar,
  dica,
  children,
}: {
  aberto: boolean;
  aoAlternar: (aberto: boolean) => void;
  dica: string;
  children: React.ReactNode;
}) {
  return (
    <details className="details" open={aberto} onToggle={(e) => aoAlternar(e.currentTarget.open)}>
      <summary>
        <Icone nome="chevR" tamanho="sm" className="chev" />
        Mais detalhes
        <span className="opt">{dica}</span>
      </summary>
      <div className="form">{children}</div>
    </details>
  );
}
