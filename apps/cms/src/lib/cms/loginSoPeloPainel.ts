import { APIError, type CollectionBeforeLoginHook } from "payload";

/**
 * O passkey (2º fator) só é exigido no fluxo do painel — a Server Action
 * `entrar` chama `payload.login` pela Local API e, havendo passkey, só grava o
 * cookie depois da cerimônia WebAuthn. A REST (`POST /api/users/login`) e o
 * GraphQL (`loginUsers`) nativos do Payload devolviam o mesmo JWT só com a
 * senha. Este hook fecha o login em qualquer API que não seja a Local.
 */
export const recusarLoginForaDoPainel: CollectionBeforeLoginHook = ({ req, user }) => {
  if (req.payloadAPI !== "local") {
    throw new APIError("Login disponível apenas pelo Painel Admin.", 403);
  }
  return user;
};
