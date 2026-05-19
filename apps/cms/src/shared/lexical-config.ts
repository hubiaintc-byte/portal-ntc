import {
  BoldFeature,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from "@payloadcms/richtext-lexical";

/**
 * Lexical restritivo do Portal Grupo NTC (doc 11 §3).
 *
 * O default do Payload é mais permissivo (cores, fontes, alinhamento). Esta
 * restrição garante que o editor não consegue romper a tipografia e a paleta
 * Soberana 2026 — só pode estruturar texto (headings h2-h4, parágrafos,
 * ênfases, listas e links). Tudo o que vira HTML no front é controlado por
 * componentes React tipados, sem campos de HTML livre (DAB §2.2).
 */
export const lexicalRestrictiveFeatures = [
  ParagraphFeature(),
  HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  LinkFeature({ enabledCollections: [] }),
  UnorderedListFeature(),
  OrderedListFeature(),
];
