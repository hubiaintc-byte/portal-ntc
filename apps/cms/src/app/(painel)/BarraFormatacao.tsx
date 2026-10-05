"use client";

import { aplicarAcaoMarkdown, type AcaoMarkdown } from "@ntc/lib";

/**
 * Barra de formatação do corpo do conteúdo.
 *
 * O editor é um `<textarea>` com Markdown leve (spec §5): a barra não é um
 * WYSIWYG, ela escreve a marcação por quem não quer decorá-la. Quem prefere
 * digitar `##` continua podendo — é o mesmo texto.
 *
 * Os botões cobrem exatamente os sete elementos que `markdownParaLexical`
 * entende; a cirurgia de string mora em `aplicarAcaoMarkdown` (`@ntc/lib`),
 * testada lá.
 */

interface BotaoBarra {
  acao: AcaoMarkdown;
  /** Texto curto no botão. Sem ícone: o painel não tem iconografia para isto. */
  rotulo: string;
  /** Nome acessível completo — "H2" sozinho não diz nada a um leitor de tela. */
  descricao: string;
  /** Abre um grupo novo (separador visual à esquerda). */
  separar?: boolean;
}

const BOTOES: readonly BotaoBarra[] = [
  { acao: "h2", rotulo: "H2", descricao: "Subtítulo" },
  { acao: "h3", rotulo: "H3", descricao: "Subtítulo menor" },
  { acao: "negrito", rotulo: "B", descricao: "Negrito", separar: true },
  { acao: "italico", rotulo: "I", descricao: "Itálico" },
  { acao: "link", rotulo: "Link", descricao: "Inserir link", separar: true },
  { acao: "citacao", rotulo: "Citação", descricao: "Citação", separar: true },
  { acao: "lista", rotulo: "Lista", descricao: "Lista com marcadores" },
  { acao: "numerada", rotulo: "Numerada", descricao: "Lista numerada" },
];

/**
 * Aplica uma ação ao textarea e devolve o cursor onde o autor continua
 * escrevendo.
 *
 * Único caminho de escrita da barra: botão e atalho de teclado chamam esta
 * função, para não haver duas cópias da mesma cirurgia.
 */
export function aplicarNoTextarea(
  area: HTMLTextAreaElement | null,
  valor: string,
  acao: AcaoMarkdown,
  onMudar: (novo: string) => void,
): void {
  if (!area) return;

  const saida = aplicarAcaoMarkdown(
    { texto: valor, inicio: area.selectionStart, fim: area.selectionEnd },
    acao,
  );
  onMudar(saida.texto);

  // O React só reescreve o `value` no próximo commit; mexer na seleção antes
  // disso a perderia. O rAF devolve o cursor depois que o DOM atualizou.
  requestAnimationFrame(() => {
    area.focus();
    area.setSelectionRange(saida.inicio, saida.fim);
  });
}

/**
 * Atalhos do corpo: ⌘/Ctrl+B e ⌘/Ctrl+I — o que todo mundo tenta por reflexo.
 */
export function atalhoDaTecla(e: React.KeyboardEvent<HTMLTextAreaElement>): AcaoMarkdown | null {
  if (!e.metaKey && !e.ctrlKey) return null;
  const tecla = e.key.toLowerCase();
  if (tecla === "b") return "negrito";
  if (tecla === "i") return "italico";
  return null;
}

export interface BarraFormatacaoProps {
  /** Textarea do corpo — a barra lê a seleção dele e devolve o foco a ele. */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  valor: string;
  onMudar: (novo: string) => void;
}

export function BarraFormatacao({ textareaRef, valor, onMudar }: BarraFormatacaoProps) {
  return (
    <div className="pcms-barra-md" role="group" aria-label="Formatação do texto">
      {BOTOES.map((b) => (
        <button
          key={b.acao}
          type="button"
          className={`pcms-barra-md__botao${b.separar ? " pcms-barra-md__botao--grupo" : ""} pcms-barra-md__botao--${b.acao}`}
          aria-label={b.descricao}
          title={b.descricao}
          onClick={() => aplicarNoTextarea(textareaRef.current, valor, b.acao, onMudar)}
        >
          {b.rotulo}
        </button>
      ))}
    </div>
  );
}
