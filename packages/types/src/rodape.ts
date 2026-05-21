import type { Rodape } from "./payload-types";

/**
 * Dados do Global `Rodape` consumidos por `<RodapeSoberano>` (doc 12 §11.1).
 *
 * Re-exportado como `RodapeData` para deixar o contrato semântico nas
 * importações do app/web sem deixar transparecer o nome interno do Payload.
 */
export type RodapeData = Rodape;

export type RedeSocial = "linkedin" | "instagram" | "youtube" | "facebook" | "x" | "tiktok";

export interface ItemRedeSocial {
  rede: RedeSocial;
  url: string;
}

export interface ItemLinkLegal {
  rotulo: string;
  link: string;
}
