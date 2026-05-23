import { respostaFormsOff } from "@/lib/respostaFormsOff";

/**
 * POST /api/forms/candidatura-especialista
 *
 * Endpoint stubado para o primeiro deploy (2026-05-23). O Payload/CMS
 * ainda não está implantado em produção; este handler retorna 503
 * com mensagem clara até a sessão de reativação dos formulários.
 *
 * Spec: docs/superpowers/specs/2026-05-23-deploy-apps-web-vercel-design.md
 */
export function POST() {
  return respostaFormsOff();
}
