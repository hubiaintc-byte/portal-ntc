import type { Metadata } from "next";

import { SliderHero, type SlidePremium } from "./SliderHero";

/**
 * Home v3 Premium — portada do
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html.
 *
 * Conteúdo dos 6 slides extraído literal do HTML aprovado (linhas
 * 2179–2334). No commit C5 esta lista passará a vir do CMS
 * (Global Home.heroSlider.slides) com fallback para esta lista
 * literal.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Grupo NTC · Inteligência institucional. Impacto real.",
  description:
    "O novo padrão da formação institucional para a Administração Pública brasileira. Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida para órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais.",
};

const SUPABASE_URL =
  "https://irekejunwknguzdfszyi.supabase.co/storage/v1/object/public/ntc-portal-media/media";

const SLIDES_FALLBACK: SlidePremium[] = [
  {
    tipo: "institucional",
    imagemSrc: `${SUPABASE_URL}/hero-principal.jpg`,
    eyebrow: "Grupo NTC · Núcleo de Tecnologia e Conhecimento",
    titulo: "O novo padrão da formação <accent>institucional</accent> para a Administração Pública brasileira.",
    subtitulo:
      "Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida para órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais.",
    ctas: [
      { rotulo: "Ver eventos com inscrições abertas", href: "#eventos-abertos", variante: "gold" },
      { rotulo: "Solicitar proposta institucional", href: "#contratacao", variante: "ghost-light" },
    ],
    textlink: { rotulo: "Conhecer programas estratégicos", href: "#programas" },
  },
  {
    tipo: "evento",
    vertical: "sau",
    imagemSrc: `${SUPABASE_URL}/area-saude.png`,
    eyebrow: "Evento em destaque · Inscrições abertas",
    eventoPill: { texto: "05–07 Jun · Brasília · Presencial" },
    titulo: "Governança, financiamento e <accent>performance</accent> no SUS — Brasília 2026.",
    subtitulo:
      "Curso executivo presencial em Brasília · 05 a 07 de junho · 24 horas · com a coordenação científica do NTC Saúde e convidados especialistas em gestão do SUS, governança e financiamento.",
    ctas: [
      { rotulo: "Inscrever-se", href: "#eventos-abertos", variante: "gold" },
      { rotulo: "Ver detalhes do evento", href: "#eventos-abertos", variante: "ghost-light" },
    ],
  },
  {
    tipo: "evento",
    vertical: "gov",
    imagemSrc: `${SUPABASE_URL}/area-gestao-publica.png`,
    eyebrow: "NTC Gestão Pública · AGIP · São Paulo",
    eventoPill: { texto: "18–20 Jun · São Paulo · Híbrido" },
    titulo: "Integridade e performance nas <accent>contratações públicas</accent>.",
    subtitulo:
      "Seminário presencial em São Paulo · 18 a 20 de junho · 20 horas · ministros, juristas e autoridades em Lei 14.133/2021 compõem o painel do programa.",
    ctas: [
      { rotulo: "Conhecer evento", href: "#programas", variante: "gold" },
      { rotulo: "Inscrever-se", href: "#eventos-abertos", variante: "ghost-light" },
    ],
  },
  {
    tipo: "programa",
    vertical: "edu",
    imagemSrc: `${SUPABASE_URL}/area-educacao.jpg`,
    eyebrow: "NTC Educação · PEAR · Programa Estratégico",
    titulo: "Alfabetização de <accent>Alta Performance</accent> para redes públicas.",
    subtitulo:
      "Recomposição da aprendizagem, currículo e formação docente em escala. Programa estruturado para secretarias de educação, redes municipais e estaduais que buscam resultados sustentáveis.",
    ctas: [
      { rotulo: "Conhecer programa", href: "#programas", variante: "gold" },
      { rotulo: "Ver módulos abertos", href: "#capacitacao", variante: "ghost-light" },
    ],
  },
  {
    tipo: "solucao",
    imagemSrc: `${SUPABASE_URL}/contratacao.png`,
    eyebrow: "Soluções institucionais · In company · Turmas fechadas",
    titulo: "Capacitações <accent>sob medida</accent> para a sua instituição.",
    subtitulo:
      "Programas, jornadas e trilhas do portfólio NTC entregues exclusivamente à sua equipe, rede ou órgão público — com desenho, especialistas, formato e calendário alinhados aos objetivos da contratante.",
    ctas: [
      { rotulo: "Solicitar proposta", href: "#contratacao", variante: "gold" },
      { rotulo: "Agendar apresentação", href: "#contratacao", variante: "ghost-light" },
    ],
  },
  {
    tipo: "eventon",
    imagemSrc: `${SUPABASE_URL}/eventon-estudio.png`,
    eyebrow: "EventOn · Plataforma própria · Infraestrutura digital",
    titulo: "Transmissão ao vivo, replay, certificado e <accent>suporte</accent> em uma única plataforma.",
    subtitulo:
      "A infraestrutura digital própria do Grupo NTC para realização de eventos institucionais ao vivo — capacitações, seminários, jornadas executivas e trilhas formativas voltadas à Administração Pública brasileira.",
    ctas: [
      { rotulo: "Acessar EventOn", href: "#eventon", variante: "gold" },
      { rotulo: "Suporte ao participante", href: "#contato", variante: "ghost-light" },
    ],
  },
];

export default function HomePage() {
  return (
    <main id="main">
      <SliderHero slides={SLIDES_FALLBACK} intervaloMs={7000} />
    </main>
  );
}
