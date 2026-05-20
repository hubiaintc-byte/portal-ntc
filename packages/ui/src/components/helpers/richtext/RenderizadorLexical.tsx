import type { ReactNode } from "react";
import { LinkEditorial } from "../../utilitarios/LinkEditorial";
import type { RichTextContent } from "./tipos";

export interface RenderizadorLexicalProps {
  content: RichTextContent;
}

interface BaseNode {
  type: string;
  version: number;
  [k: string]: unknown;
}

interface TextNode extends BaseNode {
  type: "text";
  text: string;
  format: number;
}

interface LinkFieldsLexical {
  url?: string;
  newTab?: boolean;
  linkType?: "custom" | "internal";
}

interface LinkNode extends BaseNode {
  type: "link";
  fields: LinkFieldsLexical;
  children: BaseNode[];
}

interface ElementNode extends BaseNode {
  children: BaseNode[];
}

const FMT_BOLD = 1;
const FMT_ITALIC = 2;
const FMT_UNDERLINE = 8;

function renderTexto(no: TextNode): ReactNode {
  let conteudo: ReactNode = no.text;
  if ((no.format & FMT_UNDERLINE) !== 0) conteudo = <u>{conteudo}</u>;
  if ((no.format & FMT_ITALIC) !== 0) conteudo = <em>{conteudo}</em>;
  if ((no.format & FMT_BOLD) !== 0) conteudo = <strong>{conteudo}</strong>;
  return conteudo;
}

function renderFilhos(nos: BaseNode[]): ReactNode[] {
  return nos.map((no, i) => <NoLexical key={i} no={no} />);
}

function NoLexical({ no }: { no: BaseNode }): ReactNode {
  switch (no.type) {
    case "text":
      return renderTexto(no as TextNode);
    case "linebreak":
      return <br />;
    case "paragraph": {
      const filhos = renderFilhos((no as ElementNode).children);
      return <p className="font-corpo text-corpo text-grafite text-pretty">{filhos}</p>;
    }
    case "heading": {
      const tag = (no as ElementNode & { tag: string }).tag;
      const filhos = renderFilhos((no as ElementNode).children);
      if (tag === "h2") return <h2 className="font-titulo text-h2 text-oxford">{filhos}</h2>;
      if (tag === "h3") return <h3 className="font-titulo text-h3 text-oxford">{filhos}</h3>;
      if (tag === "h4") return <h4 className="font-titulo text-h4 text-oxford">{filhos}</h4>;
      return <>{filhos}</>;
    }
    case "list": {
      const listTag = (no as ElementNode & { tag: string; listType?: string }).tag;
      const filhos = renderFilhos((no as ElementNode).children);
      if (listTag === "ol")
        return <ol className="ml-6 list-decimal font-corpo text-corpo text-grafite space-y-2">{filhos}</ol>;
      return <ul className="ml-6 list-disc font-corpo text-corpo text-grafite space-y-2">{filhos}</ul>;
    }
    case "listitem": {
      const filhos = renderFilhos((no as ElementNode).children);
      return <li>{filhos}</li>;
    }
    case "link": {
      const link = no as LinkNode;
      const url = link.fields?.url ?? "#";
      const externo = link.fields?.newTab === true || link.fields?.linkType === "custom";
      const filhos = renderFilhos(link.children);
      return (
        <LinkEditorial href={url} externo={externo}>
          {filhos}
        </LinkEditorial>
      );
    }
    default:
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`[RenderizadorLexical] node type não suportado: ${no.type}`);
      }
      return null;
  }
}

export function RenderizadorLexical({ content }: RenderizadorLexicalProps) {
  const filhos = renderFilhos(content.root.children as BaseNode[]);
  return <div className="prose-soberana flex flex-col gap-6">{filhos}</div>;
}
