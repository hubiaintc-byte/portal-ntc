import type { ItemMenu } from "@ntc/ui";

/**
 * Menu canônico do Portal Grupo NTC (doc 13).
 *
 * Hardcoded a partir do mapa página-a-página. Quando uma rota ainda
 * não existe (sessões F.5+ implementarão Programas, Eventos, Conteúdos,
 * EventOn, Contato), o link permanece — Next 15 mostra 404 elegante.
 */
export const ROTAS_MENU: ItemMenu[] = [
  { rotulo: "Grupo NTC", href: "/o-grupo" },
  {
    rotulo: "Soluções",
    filhos: [
      {
        rotulo: "Visão geral",
        href: "/solucoes-estrategicas",
        descricao: "As 3 áreas de atuação institucional",
      },
      {
        rotulo: "NTC Educação",
        href: "/solucoes-estrategicas/educacao",
        descricao: "Redes públicas de ensino",
      },
      {
        rotulo: "NTC Gestão Pública",
        href: "/solucoes-estrategicas/gestao-publica",
        descricao: "Administração e governança",
      },
      {
        rotulo: "NTC Saúde",
        href: "/solucoes-estrategicas/saude",
        descricao: "Sistema Único de Saúde",
      },
    ],
  },
  { rotulo: "Programas", href: "/programas" },
  {
    rotulo: "Capacitação",
    filhos: [
      { rotulo: "Agenda geral", href: "/agenda", descricao: "Eventos com inscrição aberta" },
      { rotulo: "Eventos passados", href: "/eventos/passados", descricao: "Acervo e replays" },
      { rotulo: "EventOn", href: "/eventon", descricao: "Plataforma de acesso e replay" },
    ],
  },
  { rotulo: "Conteúdos", href: "/conteudos" },
  { rotulo: "Contato", href: "/contato" },
];

export const CTA_PRINCIPAL = { rotulo: "Solicitar proposta", href: "/contato/proposta" };
export const CTA_SECUNDARIO = { rotulo: "Área do Participante", href: "/eventon" };
