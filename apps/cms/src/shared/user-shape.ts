import type { PerfilAdmin } from "./types";

/**
 * Shape mínimo do user usado em access controls — tipagem segura sem `any`
 * antes da geração dos types do Payload (que vão substituir/refinar este
 * tipo via @ntc/types/payload-types).
 */
export interface User {
  id: number;
  email: string;
  perfil?: PerfilAdmin | null;
}
