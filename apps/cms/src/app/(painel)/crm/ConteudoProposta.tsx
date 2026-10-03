"use client";

import { useState, useTransition } from "react";

import type { OpcaoLista } from "@ntc/lib";

import type {
  CatalogoCrm,
  ConteudoPropostaEditavel,
  DocenteProposta,
  ModuloDetalhadoProposta,
  ParTituladoProposta,
  SecaoExtraProposta,
} from "@/lib/cms/painelCrm";
import type { AlvoConteudoProposta, ValorSecaoProposta } from "@/lib/cms/painelCrmEscrita";

import { restaurarConteudoPropostaCrm, salvarSecaoConteudoPropostaCrm } from "../acoesCrm";
import { AvisoForm, CampoArea, CampoSelect, CampoTexto } from "./CamposCrm";

/**
 * Bloco "Conteúdo do documento" do detalhe da proposta (Sessão 2 · Task 13):
 * um `<details>` por seção EDITÁVEL do documento, na ordem em que saem no PDF
 * (`lib/documentoProposta/html.ts`, ORDEM_MODELO).
 *
 * O que NÃO aparece aqui, por ser cálculo e não redação (spec §1): Dados de
 * Identificação, Objeto da Proposta, Quadro Comercial e os dados das Condições
 * Comerciais — esses saem de valores do formulário da proposta.
 *
 * Cada seção guarda o próprio rascunho, o próprio estado de "confirmando
 * restauro" e o próprio erro; nenhuma confirmação é compartilhada entre
 * seções (nem entre itens de uma lista), para não repetir a dívida da
 * Sessão 4 (confirmação por bloco em vez de por linha).
 */

/** Chaves de texto corrido: valem ao mesmo tempo como campo do conteúdo e como alvo da escrita. */
type ChaveTexto =
  | "apresentacao"
  | "contexto"
  | "objetivos"
  | "publicoAlvo"
  | "metodologia"
  | "eventon"
  | "certificacaoReplay"
  | "cancelamento"
  | "protecaoConteudo"
  | "fundamentacaoLegal"
  | "proximosPassos"
  | "fechamento";

const POSICOES_EXTRA: OpcaoLista[] = [
  { value: "antes-quadro-comercial", label: "Antes do Quadro Comercial" },
  { value: "apos-condicoes-comerciais", label: "Depois das Condições Comerciais" },
  { value: "fim", label: "No fim, antes do Fechamento" },
];

const AVISO_RESTAURO = "Isso sobrescreve o que você editou nesta seção.";
const AVISO_RESTAURO_TUDO =
  "Isso sobrescreve o que você editou em todas as seções, voltando ao texto padrão do programa e aos textos institucionais. O Corpo Docente e as Seções extras não são tocados — o corpo docente tem o botão próprio dele.";

interface ConteudoPropostaProps {
  propostaId: string;
  conteudo: ConteudoPropostaEditavel;
  catalogo: CatalogoCrm;
  /** Recarrega a proposta do servidor — usado depois de restaurar o padrão. */
  onAtualizado: () => void;
}

export function ConteudoProposta({
  propostaId,
  conteudo,
  catalogo,
  onAtualizado,
}: ConteudoPropostaProps) {
  const [confirmandoTudo, setConfirmandoTudo] = useState(false);

  const texto = (alvo: ChaveTexto, titulo: string, aviso?: string, omitida?: boolean) => (
    <SecaoTexto
      key={alvo}
      propostaId={propostaId}
      alvo={alvo}
      titulo={titulo}
      valorInicial={conteudo[alvo]}
      aviso={aviso}
      omitida={omitida}
      onAtualizado={onAtualizado}
    />
  );

  return (
    <section className="pcms-det-bloco pcms-conteudo">
      <div className="pcms-editor__head--sub">
        Conteúdo do documento
        {!confirmandoTudo && (
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost pcms-btn--mini"
            onClick={() => setConfirmandoTudo(true)}
          >
            Restaurar tudo
          </button>
        )}
      </div>
      {confirmandoTudo && (
        <PainelRestaurarTudo
          propostaId={propostaId}
          onFechar={() => setConfirmandoTudo(false)}
          onAtualizado={onAtualizado}
        />
      )}
      <p className="pcms-conteudo__dica">
        Cada seção é salva por conta própria. No texto, uma linha em branco separa parágrafos, uma
        linha começando com <code>-</code> é item de lista e uma começando com <code>##</code> é
        subtítulo. Seção sem conteúdo <strong>não sai no documento</strong>.
      </p>

      {texto("apresentacao", "Apresentação Executiva")}
      {texto("contexto", "Contexto e Justificativa")}
      {texto("objetivos", "Objetivos")}
      {texto("publicoAlvo", "Público-alvo")}

      <SecaoPares
        propostaId={propostaId}
        alvo="eixos"
        titulo="Arquitetura da Solução"
        rotuloItem="Eixo"
        valorInicial={conteudo.eixos}
        onAtualizado={onAtualizado}
      />

      <SecaoModulos
        propostaId={propostaId}
        valorInicial={conteudo.modulosDetalhados}
        catalogo={catalogo}
        onAtualizado={onAtualizado}
      />

      {texto("metodologia", "Metodologia")}

      <SecaoDocentes
        propostaId={propostaId}
        valorInicial={conteudo.docentes}
        catalogo={catalogo}
        onAtualizado={onAtualizado}
      />

      <SecaoPares
        propostaId={propostaId}
        alvo="diferenciais"
        titulo="Diferenciais NTC"
        rotuloItem="Diferencial"
        valorInicial={conteudo.diferenciais}
        onAtualizado={onAtualizado}
      />

      <SecaoResultados
        propostaId={propostaId}
        valorInicial={conteudo.resultados}
        onAtualizado={onAtualizado}
      />

      {texto(
        "eventon",
        "Condições de Participação · Evento Online EventON",
        conteudo.modalidadeOnline
          ? undefined
          : "A modalidade desta proposta não é online: esta seção NÃO sai no documento. O texto equivalente para evento presencial ainda não foi redigido (spec §7) — o campo segue editável para não esconder o que já está gravado, mas só volta ao documento se a modalidade for online.",
        !conteudo.modalidadeOnline,
      )}
      {texto("certificacaoReplay", "Certificação e Replay")}
      {texto("cancelamento", "Cancelamento, Substituição e Reagendamento")}
      {texto("protecaoConteudo", "Proteção de Conteúdo e Direitos Autorais")}
      {texto("fundamentacaoLegal", "Fundamentação Legal e Segurança Jurídica")}
      {texto("proximosPassos", "Próximos Passos")}
      {texto("fechamento", "Fechamento Institucional")}

      <SecaoExtras
        propostaId={propostaId}
        valorInicial={conteudo.secoesExtras}
        onAtualizado={onAtualizado}
      />
    </section>
  );
}

/* ---------------------------------------------------------------------- *
 * Rascunho local de uma seção
 * ---------------------------------------------------------------------- */

/**
 * Rascunho de uma seção, re-sincronizado com o servidor SÓ quando o valor que
 * chega muda de conteúdo (comparação serializada, não por identidade): depois
 * de restaurar uma seção a proposta inteira é recarregada, e comparar por
 * identidade descartaria, sem aviso, o que estivesse sendo digitado nas
 * outras — o padrão de perda silenciosa que a Sessão 4 registrou como dívida.
 */
function useRascunho<T>(valorInicial: T) {
  const serial = JSON.stringify(valorInicial);
  const [base, setBase] = useState(serial);
  const [valor, setValor] = useState(valorInicial);
  const [sujo, setSujo] = useState(false);

  if (base !== serial) {
    setBase(serial);
    setValor(valorInicial);
    setSujo(false);
  }

  function mudar(novo: T) {
    setValor(novo);
    setSujo(true);
  }

  function desfazer() {
    setValor(valorInicial);
    setSujo(false);
  }

  /** Depois de salvar, o rascunho JÁ é o valor do servidor: nada a recarregar. */
  function marcarSalvo(salvo: T) {
    setBase(JSON.stringify(salvo));
    setValor(salvo);
    setSujo(false);
  }

  return { valor, mudar, desfazer, sujo, marcarSalvo };
}

/* ---------------------------------------------------------------------- *
 * Casca comum: summary com selos, restaurar padrão, salvar/desfazer
 * ---------------------------------------------------------------------- */

interface CascaSecaoProps {
  propostaId: string;
  titulo: string;
  /**
   * Alvo de "Restaurar padrão"; `null` na seção sem padrão (Seções extras —
   * que por isso não está no tipo).
   */
  alvoRestauro: Exclude<AlvoConteudoProposta, "secoesExtras"> | null;
  /** Seção que não vai sair no documento (sem conteúdo, ou omitida pela modalidade). */
  naoSai: boolean;
  sujo: boolean;
  salvando: boolean;
  erro: string | null;
  aviso?: string | undefined;
  onSalvar: () => void;
  onDesfazer: () => void;
  onAtualizado: () => void;
  children: React.ReactNode;
}

function CascaSecao({
  propostaId,
  titulo,
  alvoRestauro,
  naoSai,
  sujo,
  salvando,
  erro,
  aviso,
  onSalvar,
  onDesfazer,
  onAtualizado,
  children,
}: CascaSecaoProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [restaurando, iniciarRestauro] = useTransition();
  const [erroRestauro, setErroRestauro] = useState<string | null>(null);

  function restaurar() {
    if (alvoRestauro === null) return;
    setErroRestauro(null);
    iniciarRestauro(async () => {
      const r = await restaurarConteudoPropostaCrm(propostaId, alvoRestauro);
      if (r.ok) {
        setConfirmando(false);
        onAtualizado();
      } else {
        setErroRestauro(r.erro ?? "Erro ao restaurar o padrão.");
      }
    });
  }

  return (
    <details className="pcms-conteudo__secao">
      <summary>
        <span className="pcms-conteudo__titulo">{titulo}</span>
        {naoSai && <span className="pcms-conteudo__selo">não sai no documento</span>}
        {sujo && (
          <span className="pcms-conteudo__selo pcms-conteudo__selo--sujo">alterações não salvas</span>
        )}
      </summary>

      <div className="pcms-conteudo__corpo">
        {aviso !== undefined && (
          <p className="pcms-conteudo__aviso" role="note">
            {aviso}
          </p>
        )}

        {children}

        <AvisoForm erro={erro} />
        <AvisoForm erro={erroRestauro} />

        {confirmando ? (
          <div className="pcms-conteudo__confirmar">
            <p>{AVISO_RESTAURO}</p>
            <div className="pcms-conteudo__acoes">
              <button
                type="button"
                className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                disabled={restaurando}
                onClick={() => {
                  setConfirmando(false);
                  setErroRestauro(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="pcms-btn pcms-btn--perigo pcms-btn--mini"
                disabled={restaurando}
                onClick={restaurar}
              >
                {restaurando ? "Restaurando…" : "Confirmar restauração"}
              </button>
            </div>
          </div>
        ) : (
          <div className="pcms-conteudo__acoes">
            <button
              type="button"
              className="pcms-btn pcms-btn--mini"
              disabled={salvando || !sujo}
              onClick={onSalvar}
            >
              {salvando ? "Salvando…" : "Salvar seção"}
            </button>
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
              disabled={salvando || !sujo}
              onClick={onDesfazer}
            >
              Desfazer
            </button>
            {alvoRestauro !== null && (
              <button
                type="button"
                className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                onClick={() => setConfirmando(true)}
              >
                Restaurar padrão
              </button>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

/**
 * Segundo clique de "Restaurar tudo": aparece abaixo do cabeçalho do bloco
 * (largura inteira), com o aviso do que a restauração atinge e do que ela
 * deixa em paz.
 */
function PainelRestaurarTudo({
  propostaId,
  onFechar,
  onAtualizado,
}: {
  propostaId: string;
  onFechar: () => void;
  onAtualizado: () => void;
}) {
  const [restaurando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function restaurar() {
    setErro(null);
    iniciar(async () => {
      const r = await restaurarConteudoPropostaCrm(propostaId, "tudo");
      if (r.ok) {
        onFechar();
        onAtualizado();
      } else {
        setErro(r.erro ?? "Erro ao restaurar o padrão.");
      }
    });
  }

  return (
    <div className="pcms-conteudo__confirmar pcms-conteudo__confirmar--tudo">
      <p>{AVISO_RESTAURO_TUDO}</p>
      <AvisoForm erro={erro} />
      <div className="pcms-conteudo__acoes">
        <button
          type="button"
          className="pcms-btn pcms-btn--ghost pcms-btn--mini"
          disabled={restaurando}
          onClick={onFechar}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="pcms-btn pcms-btn--perigo pcms-btn--mini"
          disabled={restaurando}
          onClick={restaurar}
        >
          {restaurando ? "Restaurando…" : "Confirmar restauração de tudo"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- *
 * Uma seção por tipo de conteúdo
 * ---------------------------------------------------------------------- */

/** Dispara a Server Action da seção e devolve o erro, ou null no sucesso. */
function useSalvarSecao(propostaId: string, alvo: AlvoConteudoProposta) {
  const [salvando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function salvar(valor: ValorSecaoProposta, aoSalvar: () => void) {
    setErro(null);
    iniciar(async () => {
      const r = await salvarSecaoConteudoPropostaCrm(propostaId, alvo, valor);
      if (r.ok) aoSalvar();
      else setErro(r.erro ?? "Erro ao salvar a seção.");
    });
  }

  return { salvando, erro, salvar };
}

interface SecaoTextoProps {
  propostaId: string;
  alvo: ChaveTexto;
  titulo: string;
  valorInicial: string;
  aviso?: string | undefined;
  /**
   * Seção que o documento omite mesmo com texto gravado (hoje só EventON, em
   * proposta que não é online) — o selo do `summary` precisa dizer isso, senão
   * o texto parece que vai sair.
   */
  omitida?: boolean | undefined;
  onAtualizado: () => void;
}

function SecaoTexto({
  propostaId,
  alvo,
  titulo,
  valorInicial,
  aviso,
  omitida,
  onAtualizado,
}: SecaoTextoProps) {
  const { valor, mudar, desfazer, sujo, marcarSalvo } = useRascunho(valorInicial);
  const { salvando, erro, salvar } = useSalvarSecao(propostaId, alvo);

  return (
    <CascaSecao
      propostaId={propostaId}
      titulo={titulo}
      alvoRestauro={alvo}
      naoSai={valor.trim().length === 0 || omitida === true}
      sujo={sujo}
      salvando={salvando}
      erro={erro}
      aviso={aviso}
      onDesfazer={desfazer}
      onSalvar={() => salvar({ tipo: "texto", texto: valor }, () => marcarSalvo(valor))}
      onAtualizado={onAtualizado}
    >
      <CampoArea rotulo={titulo} valor={valor} onMudar={mudar} linhas={12} />
    </CascaSecao>
  );
}

interface SecaoParesProps {
  propostaId: string;
  alvo: "eixos" | "diferenciais";
  titulo: string;
  rotuloItem: string;
  valorInicial: ParTituladoProposta[];
  onAtualizado: () => void;
}

function SecaoPares({
  propostaId,
  alvo,
  titulo,
  rotuloItem,
  valorInicial,
  onAtualizado,
}: SecaoParesProps) {
  const { valor, mudar, desfazer, sujo, marcarSalvo } = useRascunho(valorInicial);
  const { salvando, erro, salvar } = useSalvarSecao(propostaId, alvo);

  const comConteudo = valor.filter(
    (i) => i.titulo.trim().length > 0 || i.descricao.trim().length > 0,
  );

  return (
    <CascaSecao
      propostaId={propostaId}
      titulo={titulo}
      alvoRestauro={alvo}
      naoSai={comConteudo.length === 0}
      sujo={sujo}
      salvando={salvando}
      erro={erro}
      onDesfazer={desfazer}
      onSalvar={() => salvar({ tipo: "pares", itens: valor }, () => marcarSalvo(valor))}
      onAtualizado={onAtualizado}
    >
      <div className="pcms-conteudo__itens">
        {valor.length === 0 && <p className="pcms-vazio">Nenhum item.</p>}
        {valor.map((item, i) => (
          <fieldset key={i} className="pcms-conteudo__item">
            <legend>
              {rotuloItem} {i + 1}
            </legend>
            <CampoTexto
              rotulo="Título"
              valor={item.titulo}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, titulo: v } : x)))}
            />
            <CampoArea
              rotulo="Descrição"
              valor={item.descricao}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, descricao: v } : x)))}
            />
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
              aria-label={`Remover ${rotuloItem.toLowerCase()} ${item.titulo || i + 1}`}
              onClick={() => mudar(valor.filter((_, j) => j !== i))}
            >
              Remover
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="pcms-btn pcms-btn--ghost pcms-btn--mini"
          onClick={() => mudar([...valor, { titulo: "", descricao: "" }])}
        >
          Adicionar {rotuloItem.toLowerCase()}
        </button>
      </div>
    </CascaSecao>
  );
}

interface SecaoResultadosProps {
  propostaId: string;
  valorInicial: string[];
  onAtualizado: () => void;
}

function SecaoResultados({ propostaId, valorInicial, onAtualizado }: SecaoResultadosProps) {
  const { valor, mudar, desfazer, sujo, marcarSalvo } = useRascunho(valorInicial);
  const { salvando, erro, salvar } = useSalvarSecao(propostaId, "resultados");

  return (
    <CascaSecao
      propostaId={propostaId}
      titulo="Resultados Esperados"
      alvoRestauro="resultados"
      naoSai={valor.every((t) => t.trim().length === 0)}
      sujo={sujo}
      salvando={salvando}
      erro={erro}
      onDesfazer={desfazer}
      onSalvar={() => salvar({ tipo: "resultados", itens: valor }, () => marcarSalvo(valor))}
      onAtualizado={onAtualizado}
    >
      <div className="pcms-conteudo__itens">
        {valor.length === 0 && <p className="pcms-vazio">Nenhum resultado.</p>}
        {valor.map((item, i) => (
          <fieldset key={i} className="pcms-conteudo__item">
            <legend>Resultado {i + 1}</legend>
            <CampoArea
              rotulo="Texto"
              valor={item}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? v : x)))}
            />
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
              aria-label={`Remover resultado ${i + 1}`}
              onClick={() => mudar(valor.filter((_, j) => j !== i))}
            >
              Remover
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="pcms-btn pcms-btn--ghost pcms-btn--mini"
          onClick={() => mudar([...valor, ""])}
        >
          Adicionar resultado
        </button>
      </div>
    </CascaSecao>
  );
}

interface SecaoDocentesProps {
  propostaId: string;
  valorInicial: DocenteProposta[];
  catalogo: CatalogoCrm;
  onAtualizado: () => void;
}

function SecaoDocentes({ propostaId, valorInicial, catalogo, onAtualizado }: SecaoDocentesProps) {
  const { valor, mudar, desfazer, sujo, marcarSalvo } = useRascunho(valorInicial);
  const { salvando, erro, salvar } = useSalvarSecao(propostaId, "docentes");

  const opcoes: OpcaoLista[] = catalogo.especialistas.map((e) => ({
    value: e.id,
    label: e.nome,
  }));

  /** Escolher da coleção pré-preenche nome e credencial; o campo livre segue editável. */
  function escolherFicha(i: number, id: string) {
    const ficha = catalogo.especialistas.find((e) => e.id === id);
    mudar(
      valor.map((x, j) =>
        j === i
          ? {
              ...x,
              especialistaId: id,
              nome: ficha ? ficha.nome : x.nome,
              credencial: ficha ? ficha.credencial : x.credencial,
            }
          : x,
      ),
    );
  }

  const comConteudo = valor.filter(
    (d) => d.nome.trim().length > 0 || d.especialistaId.trim().length > 0,
  );

  return (
    <CascaSecao
      propostaId={propostaId}
      titulo="Corpo Docente e Curadoria"
      alvoRestauro="docentes"
      naoSai={comConteudo.length === 0}
      sujo={sujo}
      salvando={salvando}
      erro={erro}
      aviso="Nenhum programa tem especialista vinculado no catálogo: o corpo docente é digitado aqui. Por isso esta seção tem o 'Restaurar padrão' dela, e o 'Restaurar tudo' do cabeçalho não a toca."
      onDesfazer={desfazer}
      onSalvar={() => salvar({ tipo: "docentes", itens: valor }, () => marcarSalvo(valor))}
      onAtualizado={onAtualizado}
    >
      <div className="pcms-conteudo__itens">
        {valor.length === 0 && <p className="pcms-vazio">Nenhum docente.</p>}
        {valor.map((item, i) => (
          <fieldset key={i} className="pcms-conteudo__item">
            <legend>Docente {i + 1}</legend>
            <CampoSelect
              rotulo="Especialista do catálogo (opcional)"
              valor={item.especialistaId}
              opcoes={opcoes}
              onMudar={(v) => escolherFicha(i, v)}
            />
            <CampoTexto
              rotulo="Nome"
              valor={item.nome}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, nome: v } : x)))}
            />
            <CampoArea
              rotulo="Credencial"
              valor={item.credencial}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, credencial: v } : x)))}
            />
            <CampoTexto
              rotulo="Eixo"
              valor={item.eixo}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, eixo: v } : x)))}
            />
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
              aria-label={`Remover docente ${item.nome || i + 1}`}
              onClick={() => mudar(valor.filter((_, j) => j !== i))}
            >
              Remover
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="pcms-btn pcms-btn--ghost pcms-btn--mini"
          onClick={() =>
            mudar([...valor, { especialistaId: "", nome: "", credencial: "", eixo: "" }])
          }
        >
          Adicionar docente
        </button>
      </div>
    </CascaSecao>
  );
}

interface SecaoModulosProps {
  propostaId: string;
  valorInicial: ModuloDetalhadoProposta[];
  catalogo: CatalogoCrm;
  onAtualizado: () => void;
}

function SecaoModulos({ propostaId, valorInicial, catalogo, onAtualizado }: SecaoModulosProps) {
  const { valor, mudar, desfazer, sujo, marcarSalvo } = useRascunho(valorInicial);
  const { salvando, erro, salvar } = useSalvarSecao(propostaId, "modulos");

  /** Rótulo só de leitura do módulo do catálogo — o módulo em si vem do wizard. */
  function rotuloModulo(moduloId: string): string {
    const m = catalogo.modulos.find((x) => x.id === moduloId);
    return m ? `M${String(m.numero).padStart(2, "0")} · ${m.titulo}` : "Módulo fora do catálogo";
  }

  return (
    <CascaSecao
      propostaId={propostaId}
      titulo="Módulos Contratados"
      alvoRestauro="modulos"
      naoSai={valor.length === 0}
      sujo={sujo}
      salvando={salvando}
      erro={erro}
      aviso="Quais módulos entram na proposta é escolha do formulário (Editar). Aqui só se edita como cada um aparece no documento."
      onDesfazer={desfazer}
      onSalvar={() => salvar({ tipo: "modulos", itens: valor }, () => marcarSalvo(valor))}
      onAtualizado={onAtualizado}
    >
      <div className="pcms-conteudo__itens">
        {valor.length === 0 && <p className="pcms-vazio">Nenhum módulo na proposta.</p>}
        {valor.map((item, i) => (
          <fieldset key={i} className="pcms-conteudo__item">
            <legend>{rotuloModulo(item.moduloId)}</legend>
            <CampoTexto
              rotulo="Título exibido"
              valor={item.tituloExibido}
              onMudar={(v) =>
                mudar(valor.map((x, j) => (j === i ? { ...x, tituloExibido: v } : x)))
              }
            />
            <CampoArea
              rotulo="Ementa"
              linhas={6}
              valor={item.ementa}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, ementa: v } : x)))}
            />
          </fieldset>
        ))}
      </div>
    </CascaSecao>
  );
}

interface SecaoExtrasProps {
  propostaId: string;
  valorInicial: SecaoExtraProposta[];
  onAtualizado: () => void;
}

function SecaoExtras({ propostaId, valorInicial, onAtualizado }: SecaoExtrasProps) {
  const { valor, mudar, desfazer, sujo, marcarSalvo } = useRascunho(valorInicial);
  const { salvando, erro, salvar } = useSalvarSecao(propostaId, "secoesExtras");

  const comConteudo = valor.filter(
    (s) => s.titulo.trim().length > 0 || s.corpo.trim().length > 0,
  );

  return (
    <CascaSecao
      propostaId={propostaId}
      titulo="Seções extras"
      // Seção livre do PO: não há padrão a restaurar, e perder um texto escrito
      // à mão seria irreversível (mesma decisão da Task 12).
      alvoRestauro={null}
      naoSai={comConteudo.length === 0}
      sujo={sujo}
      salvando={salvando}
      erro={erro}
      aviso="Seções livres do documento (observações, anexos textuais). Não têm padrão: 'Restaurar tudo' nunca as apaga."
      onDesfazer={desfazer}
      onSalvar={() => salvar({ tipo: "extras", itens: valor }, () => marcarSalvo(valor))}
      onAtualizado={onAtualizado}
    >
      <div className="pcms-conteudo__itens">
        {valor.length === 0 && <p className="pcms-vazio">Nenhuma seção extra.</p>}
        {valor.map((item, i) => (
          <fieldset key={i} className="pcms-conteudo__item">
            <legend>Seção extra {i + 1}</legend>
            <CampoTexto
              rotulo="Título"
              valor={item.titulo}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, titulo: v } : x)))}
            />
            <CampoArea
              rotulo="Corpo"
              linhas={8}
              valor={item.corpo}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, corpo: v } : x)))}
            />
            <CampoSelect
              rotulo="Posição no documento"
              valor={item.posicao}
              opcoes={POSICOES_EXTRA}
              onMudar={(v) => mudar(valor.map((x, j) => (j === i ? { ...x, posicao: v } : x)))}
            />
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
              aria-label={`Remover seção extra ${item.titulo || i + 1}`}
              onClick={() => mudar(valor.filter((_, j) => j !== i))}
            >
              Remover
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="pcms-btn pcms-btn--ghost pcms-btn--mini"
          onClick={() => mudar([...valor, { titulo: "", corpo: "", posicao: "fim" }])}
        >
          Adicionar seção extra
        </button>
      </div>
    </CascaSecao>
  );
}
