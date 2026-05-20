import type { Area } from "@ntc/types";

/**
 * Tipo do conteúdo Rich Text Lexical conforme gerado pelo Payload.
 *
 * Derivado do campo `posicionamento` da coleção Areas — qualquer campo
 * Rich Text gerado pelo Payload tem a mesma estrutura raiz, pois o
 * lexical-config.ts restritivo é compartilhado entre coleções.
 */
export type RichTextContent = NonNullable<Area["posicionamento"]>;

export type LexicalNode = RichTextContent["root"]["children"][number];
