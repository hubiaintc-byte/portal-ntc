import type { CollectionConfig } from "payload";

import { superAdmin } from "../access/superAdmin";

/**
 * Registro efêmero de tentativas por (IP, rota) — lastro do rate limit
 * (Sessão C2). Não é log de auditoria: linhas velhas são apagadas pelo
 * próprio fluxo de checagem, e o dado só existe dentro da janela.
 *
 * LGPD (CLAUDE.md §12): guarda IP, que é dado pessoal. Retenção curta e
 * limpeza automática são requisito, não otimização — quem mexer aqui
 * precisa manter as duas.
 *
 * Escrita e leitura acontecem só pela Local API, a partir das rotas de
 * formulário e da action de recuperação de senha. `access` fica fechado
 * como defesa em profundidade (mesma postura de AuditLog).
 */
export const TentativasAcesso: CollectionConfig = {
  slug: "tentativas-acesso",
  labels: { singular: "Tentativa de Acesso", plural: "Tentativas de Acesso" },
  admin: {
    useAsTitle: "rota",
    defaultColumns: ["rota", "ip", "createdAt"],
    group: "Sistema",
    description: "Lastro efêmero do rate limit. Linhas se apagam sozinhas fora da janela.",
  },
  access: {
    read: superAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "rota", type: "text", required: true, index: true },
    { name: "ip", type: "text", required: true, index: true },
  ],
};
