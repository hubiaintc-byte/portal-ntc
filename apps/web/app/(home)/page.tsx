import type { Metadata } from "next";

import { SliderHero, type SlidePremium } from "./SliderHero";

/**
 * Home v3 Premium — portada literal do
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html.
 *
 * Estrutura na ordem do protótipo:
 *  1. SliderHero (6 slides)
 *  2. Eventos · grade 3+3 (#eventos-abertos)
 *  3. Agenda · faixa (#capacitacao)
 *  4. Apresentação institucional enxuta (#sobre)
 *  5. Programas · arquitetura em duas camadas (#programas)
 *  6. Especialistas e curadoria científica (#docentes)
 *  7. Soluções estratégicas (#solucoes)
 *  8. Online × Presencial
 *  9. EventOn (#eventon)
 * 10. Contratação institucional (#contratacao)
 * 11. Diferenciais
 * 12. Números · duas décadas
 * 13. Prova institucional
 * 14. Conteúdos (#conteudos)
 * 15. CTA final (#contato)
 *
 * No commit C5 os dados dinâmicos (slides, cards de evento, programas
 * destacados, especialistas, números) passarão a vir do CMS; por ora
 * vivem como constantes neste arquivo com os textos exatos do
 * protótipo aprovado.
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
    titulo:
      "O novo padrão da formação <accent>institucional</accent> para a Administração Pública brasileira.",
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
    titulo:
      "Governança, financiamento e <accent>performance</accent> no SUS — Brasília 2026.",
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
    titulo:
      "Transmissão ao vivo, replay, certificado e <accent>suporte</accent> em uma única plataforma.",
    subtitulo:
      "A infraestrutura digital própria do Grupo NTC para realização de eventos institucionais ao vivo — capacitações, seminários, jornadas executivas e trilhas formativas voltadas à Administração Pública brasileira.",
    ctas: [
      { rotulo: "Acessar EventOn", href: "#eventon", variante: "gold" },
      { rotulo: "Suporte ao participante", href: "#contato", variante: "ghost-light" },
    ],
  },
];

const URL_AREA_SAU = `${SUPABASE_URL}/area-saude.png`;
const URL_AREA_EDU = `${SUPABASE_URL}/area-educacao.jpg`;
const URL_AREA_GOV = `${SUPABASE_URL}/area-gestao-publica.png`;
const URL_SOLUCOES_LAB = `${SUPABASE_URL}/solucoes-lab.png`;
const URL_EVENTON_ONLINE = `${SUPABASE_URL}/eventon-estudio.png`;
const URL_PLENARIO = `${SUPABASE_URL}/plenario-publico.png`;

export default function HomePage() {
  return (
    <main id="main">
      <SliderHero slides={SLIDES_FALLBACK} intervaloMs={7000} />

      {/* =================== EVENTOS · GRADE 3+3 =================== */}
      <section
        className="events-prime"
        id="eventos-abertos"
        aria-label="Eventos e módulos com inscrições abertas"
      >
        <div className="container">
          <div className="events-status-bar fade-in">
            <span className="live-pill">Inscrições abertas agora</span>
            <span>Atualizado · Maio · 2026</span>
          </div>

          <div className="section-head fade-in">
            <p className="eyebrow gold">Capacitação e Desenvolvimento</p>
            <h2>Eventos com inscrições abertas</h2>
            <p className="section-intro">
              Seminários, oficinas, jornadas, simpósios e cursos executivos do Grupo NTC,
              disponíveis para participação individual, inscrição de equipes e contratação
              institucional.
            </p>
          </div>

          <div className="events-grid fade-in">
            {/* Card 1 · PROSUS+ · NTC Saúde · destaque */}
            <article className="event-card is-featured" data-area="sau">
              <span className="event-featured-badge">Evento em destaque</span>
              <span className="event-status-tag status-last">Últimas vagas</span>
              <div className="event-cover">
                <div
                  className="event-cover-img"
                  style={{ backgroundImage: `url('${URL_AREA_SAU}')` }}
                  aria-hidden="true"
                />
                <div className="event-cover-overlay" />
                <div className="event-cover-meta">
                  <div className="event-date-block range">
                    <span className="days">
                      05<span className="dash">–</span>07
                    </span>
                    <span className="mon-yr">Jun · 2026</span>
                  </div>
                  <span className="event-modality presencial">Presencial · Brasília</span>
                </div>
              </div>
              <div className="event-body">
                <p className="event-program-link">
                  Seminário <span className="dot">·</span> NTC Saúde
                </p>
                <h3>Governança, financiamento e performance no SUS — Edição 2026</h3>
                <div className="event-speakers-line">
                  <span className="label">Coordenação científica</span>
                  <span className="names">
                    NTC Saúde · Especialistas em gestão do SUS, governança e financiamento · com
                    convidados
                  </span>
                </div>
                <div className="event-meta-essentials">
                  <span>20h · 3 dias</span>
                  <span>Brasília · DF</span>
                </div>
                <div className="event-program-binding">
                  <span className="epb-label">Integra o programa</span>
                  <span className="epb-program">
                    <a href="#programas">PROSUS+</a>
                  </span>
                </div>
                <div className="event-pricing">
                  <span className="event-price">
                    Inscrição individual<strong>R$ 2.890</strong>
                  </span>
                  <span className="event-price institutional">
                    Equipes / órgãos<strong>Sob consulta</strong>
                  </span>
                </div>
              </div>
              <div className="event-actions">
                <a className="btn btn--gold" href="#contato">
                  Inscrever-se <span className="btn-arrow">→</span>
                </a>
                <div className="event-actions-row">
                  <a className="link-arrow" href="#programas">
                    Ver detalhes
                  </a>
                  <a className="link-arrow" href="#contratacao">
                    Proposta para grupo
                  </a>
                </div>
              </div>
            </article>

            {/* Card 2 · PEAR · NTC Educação · online */}
            <article className="event-card" data-area="edu">
              <span className="event-status-tag status-open">Inscrições abertas</span>
              <div className="event-cover">
                <div
                  className="event-cover-img"
                  style={{ backgroundImage: `url('${URL_AREA_EDU}')` }}
                  aria-hidden="true"
                />
                <div className="event-cover-overlay" />
                <div className="event-cover-meta">
                  <div className="event-date-block range">
                    <span className="days">
                      22<span className="dash">–</span>23
                    </span>
                    <span className="mon-yr">Mai · 2026</span>
                  </div>
                  <span className="event-modality">Online ao vivo + replay</span>
                </div>
              </div>
              <div className="event-body">
                <p className="event-program-link">
                  Seminário <span className="dot">·</span> NTC Educação
                </p>
                <h3>
                  Alfabetização de Alta Performance: estratégias para recomposição da aprendizagem
                </h3>
                <div className="event-speakers-line">
                  <span className="label">Coordenação científica</span>
                  <span className="names">
                    NTC Educação · Especialistas em alfabetização, currículo e formação docente ·
                    com convidados
                  </span>
                </div>
                <div className="event-meta-essentials">
                  <span>16h · 2 dias</span>
                  <span>Plataforma EventOn</span>
                </div>
                <div className="event-program-binding">
                  <span className="epb-label">Integra o programa</span>
                  <span className="epb-program">
                    <a href="#programas">PEAR</a>
                  </span>
                </div>
                <div className="event-pricing">
                  <span className="event-price">
                    Inscrição individual<strong>R$ 1.490</strong>
                  </span>
                  <span className="event-price institutional">
                    Equipes / órgãos<strong>Sob consulta</strong>
                  </span>
                </div>
              </div>
              <div className="event-actions">
                <a className="btn btn--gold" href="#contato">
                  Inscrever-se <span className="btn-arrow">→</span>
                </a>
                <div className="event-actions-row">
                  <a className="link-arrow" href="#programas">
                    Ver detalhes
                  </a>
                  <a className="link-arrow" href="#contratacao">
                    Inscrever equipe
                  </a>
                </div>
              </div>
            </article>

            {/* Card 3 · AGIP · NTC Gestão Pública · híbrido */}
            <article className="event-card" data-area="gov">
              <span className="event-status-tag status-open">Inscrições abertas</span>
              <div className="event-cover">
                <div
                  className="event-cover-img"
                  style={{ backgroundImage: `url('${URL_AREA_GOV}')` }}
                  aria-hidden="true"
                />
                <div className="event-cover-overlay" />
                <div className="event-cover-meta">
                  <div className="event-date-block multi">
                    <span className="count">
                      <span className="number">4</span> encontros
                    </span>
                    <span className="period">Jun – Jul · 2026</span>
                  </div>
                  <span className="event-modality hibrido">Híbrido · SP</span>
                </div>
              </div>
              <div className="event-body">
                <p className="event-program-link">
                  Oficina <span className="dot">·</span> NTC Gestão Pública
                </p>
                <h3>
                  Integridade e performance nas contratações públicas — fundamentos avançados
                </h3>
                <div className="event-speakers-line">
                  <span className="label">Coordenação científica</span>
                  <span className="names">
                    NTC Gestão Pública · Especialistas em contratações, integridade e governança ·
                    com convidados
                  </span>
                </div>
                <div className="event-meta-essentials">
                  <span>24h · 4 encontros</span>
                  <span>São Paulo · SP</span>
                </div>
                <div className="event-program-binding">
                  <span className="epb-label">Integra o programa</span>
                  <span className="epb-program">
                    <a href="#programas">AGIP</a>
                  </span>
                </div>
                <div className="event-pricing">
                  <span className="event-price">
                    Inscrição individual<strong>R$ 1.890</strong>
                  </span>
                  <span className="event-price institutional">
                    Equipes / órgãos<strong>Sob consulta</strong>
                  </span>
                </div>
              </div>
              <div className="event-actions">
                <a className="btn btn--gold" href="#contato">
                  Inscrever-se <span className="btn-arrow">→</span>
                </a>
                <div className="event-actions-row">
                  <a className="link-arrow" href="#programas">
                    Ver detalhes
                  </a>
                  <a className="link-arrow" href="#contratacao">
                    Inscrever equipe
                  </a>
                </div>
              </div>
            </article>
          </div>

          {/* Linha secundária · 3 cards horizontais */}
          <div className="events-secondary fade-in">
            <div className="events-secondary-head">
              <div>
                <p className="eyebrow gold">Também em destaque</p>
                <h3>Outros eventos abertos no período</h3>
              </div>
              <a className="link-arrow" href="#capacitacao">
                Ver agenda completa
              </a>
            </div>

            <div className="events-secondary-grid">
              <article className="event-secondary-card" data-area="gov">
                <div className="es-cover">
                  <div
                    className="es-cover-img"
                    style={{ backgroundImage: `url('${URL_AREA_GOV}')` }}
                    aria-hidden="true"
                  />
                  <div className="es-cover-overlay" />
                  <div className="es-date range">
                    <span className="days">
                      28<span className="dash">–</span>29
                    </span>
                    <span className="mon-yr">Mai · 2026</span>
                  </div>
                </div>
                <div className="es-body">
                  <div>
                    <p className="es-program">Curso Executivo · NTC Gestão Pública</p>
                    <h4 className="es-title">
                      Liderança e direção estratégica para secretários e diretores
                    </h4>
                    <p className="es-program-binding">
                      Integra o programa <strong>LIDERA</strong>
                    </p>
                  </div>
                  <div className="es-meta-row">
                    <span className="es-meta">
                      Online · 12h · 2 tardes <strong>R$ 1.290</strong>
                    </span>
                  </div>
                  <a className="es-cta" href="#contato">
                    Inscrever-se
                  </a>
                </div>
              </article>

              <article className="event-secondary-card" data-area="edu">
                <div className="es-cover">
                  <div
                    className="es-cover-img"
                    style={{ backgroundImage: `url('${URL_AREA_EDU}')` }}
                    aria-hidden="true"
                  />
                  <div className="es-cover-overlay" />
                  <div className="es-date multi">
                    <span className="count">
                      <span className="number">3</span> encontros
                    </span>
                    <span className="period">Jun · 2026</span>
                  </div>
                </div>
                <div className="es-body">
                  <div>
                    <p className="es-program">Jornada · NTC Educação</p>
                    <h4 className="es-title">Tecnologias e IA aplicadas à gestão escolar pública</h4>
                    <p className="es-program-binding">
                      Integra o programa <strong>EDUTEC</strong>
                    </p>
                  </div>
                  <div className="es-meta-row">
                    <span className="es-meta">
                      Híbrido · SP · 18h · 3 encontros <strong>R$ 1.690</strong>
                    </span>
                  </div>
                  <a className="es-cta" href="#contato">
                    Inscrever-se
                  </a>
                </div>
              </article>

              <article className="event-secondary-card" data-area="sau">
                <div className="es-cover">
                  <div
                    className="es-cover-img"
                    style={{ backgroundImage: `url('${URL_AREA_SAU}')` }}
                    aria-hidden="true"
                  />
                  <div className="es-cover-overlay" />
                  <div className="es-date range">
                    <span className="days">
                      02<span className="dash">–</span>03
                    </span>
                    <span className="mon-yr">Jul · 2026</span>
                  </div>
                </div>
                <div className="es-body">
                  <div>
                    <p className="es-program">Simpósio · NTC Saúde</p>
                    <h4 className="es-title">
                      Alta performance na atenção primária e redes de cuidado
                    </h4>
                    <p className="es-program-binding">
                      Integra o programa <strong>PROAPS+</strong>
                    </p>
                  </div>
                  <div className="es-meta-row">
                    <span className="es-meta">
                      Online · 16h · 2 dias <strong>R$ 1.490</strong>
                    </span>
                  </div>
                  <a className="es-cta" href="#contato">
                    Inscrever-se
                  </a>
                </div>
              </article>
            </div>
          </div>

          <div className="events-prime-foot fade-in">
            <a className="btn btn--primary" href="#capacitacao">
              Ver agenda completa <span className="btn-arrow">→</span>
            </a>
            <a className="btn btn--secondary" href="#contratacao">
              Solicitar proposta para minha instituição
            </a>
          </div>
        </div>
      </section>

      {/* =================== AGENDA · FAIXA =================== */}
      <section className="agenda-band" id="capacitacao" aria-label="Acesso rápido à agenda">
        <div className="container">
          <div className="agenda-band-inner fade-in">
            <div>
              <h3>Agenda Geral NTC</h3>
              <p>
                Consulte todos os eventos, módulos, turmas e capacitações disponíveis no calendário
                do Grupo NTC.
              </p>
            </div>
            <div
              className="agenda-filters"
              role="tablist"
              aria-label="Filtros rápidos da agenda"
            >
              <button type="button" className="agenda-chip">Educação</button>
              <button type="button" className="agenda-chip">Gestão Pública</button>
              <button type="button" className="agenda-chip">Saúde</button>
              <button type="button" className="agenda-chip">Online</button>
              <button type="button" className="agenda-chip">Presencial</button>
              <button type="button" className="agenda-chip">Híbrido</button>
              <button type="button" className="agenda-chip">Inscrições abertas</button>
              <button type="button" className="agenda-chip">Próximas turmas</button>
            </div>
            <a className="btn btn--gold" href="#capacitacao">
              Ver agenda completa <span className="btn-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* =================== APRESENTAÇÃO INSTITUCIONAL ENXUTA =================== */}
      <section className="intro-short section--cream" id="sobre">
        <div className="container">
          <div className="intro-short-inner fade-in">
            <p className="intro-short-headline">
              O Grupo NTC estrutura programas, eventos, trilhas e soluções institucionais para
              desenvolver capacidades públicas com rigor, escala e aplicabilidade.
            </p>
            <div className="intro-short-body">
              <p>
                Atuamos em três verticais — <strong>NTC Educação</strong>,{" "}
                <strong>NTC Gestão Pública</strong> e <strong>NTC Saúde</strong> — com 15 programas
                estruturados, corpo docente especializado e capacidade nacional de entrega para a
                Administração Pública brasileira.
              </p>
              <div className="intro-short-highlights">
                <div className="intro-highlight">
                  <div className="num">15</div>
                  <div className="lbl">
                    Programas estratégicos
                    <br />
                    nas três verticais
                  </div>
                </div>
                <div className="intro-highlight">
                  <div className="num text">3 áreas</div>
                  <div className="lbl">
                    Educação · Gestão Pública
                    <br />· Saúde
                  </div>
                </div>
                <div className="intro-highlight">
                  <div className="num text">Eventos e turmas</div>
                  <div className="lbl">
                    Abertos · Fechados
                    <br />· Sob medida
                  </div>
                </div>
              </div>
              <a className="link-arrow" href="#sobre">
                Conheça o Grupo NTC
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =================== PROGRAMAS =================== */}
      <section className="programs-section" id="programas">
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow gold">Portfólio estruturante</p>
            <h2>Programas estratégicos que estruturam a atuação do Grupo NTC</h2>
            <p className="section-intro">
              Cada programa é uma solução estruturada — com identidade, módulos e coordenação
              científica próprias — distribuída em três verticais que organizam todo o portfólio.
            </p>
          </div>

          <p className="programs-intro-line">Camada institucional · três áreas estratégicas</p>

          {/* Camada 1: 3 cards premium de áreas */}
          <div className="area-cards fade-in">
            <article className="area-card" data-vert="edu">
              <div
                className="area-card-img"
                style={{ backgroundImage: `url('${URL_AREA_EDU}')` }}
                aria-hidden="true"
              />
              <div className="area-card-overlay" />
              <span className="area-card-num">01</span>
              <div className="area-card-content">
                <p className="area-vertical-tag">NTC Educação</p>
                <h3>
                  Educação
                  <br />
                  com excelência.
                </h3>
                <p className="area-tagline">
                  Soluções estruturadas para redes públicas de ensino — gestão escolar,
                  alfabetização, educação inclusiva, tecnologia, currículo e primeira infância.
                </p>
                <div className="area-card-divider" />
                <p className="area-card-meta">
                  <strong>9</strong> Programas estratégicos
                </p>
                <div className="area-card-actions">
                  <a className="link-arrow light" href="#programas">
                    Ver programas da área
                  </a>
                  <a className="link-arrow light" href="#eventos-abertos">
                    Ver módulos e eventos abertos
                  </a>
                </div>
              </div>
            </article>

            <article className="area-card" data-vert="gov">
              <div
                className="area-card-img"
                style={{ backgroundImage: `url('${URL_AREA_GOV}')` }}
                aria-hidden="true"
              />
              <div className="area-card-overlay" />
              <span className="area-card-num">02</span>
              <div className="area-card-content">
                <p className="area-vertical-tag">NTC Gestão Pública</p>
                <h3>
                  Governança
                  <br />
                  com transformação.
                </h3>
                <p className="area-tagline">
                  Capacitação executiva e técnica para a Administração Pública — liderança,
                  contratações, governança, integridade e performance institucional.
                </p>
                <div className="area-card-divider" />
                <p className="area-card-meta">
                  <strong>3</strong> Programas estratégicos
                </p>
                <div className="area-card-actions">
                  <a className="link-arrow light" href="#programas">
                    Ver programas da área
                  </a>
                  <a className="link-arrow light" href="#eventos-abertos">
                    Ver módulos e eventos abertos
                  </a>
                </div>
              </div>
            </article>

            <article className="area-card" data-vert="sau">
              <div
                className="area-card-img"
                style={{ backgroundImage: `url('${URL_AREA_SAU}')` }}
                aria-hidden="true"
              />
              <div className="area-card-overlay" />
              <span className="area-card-num">03</span>
              <div className="area-card-content">
                <p className="area-vertical-tag">NTC Saúde</p>
                <h3>
                  Saúde
                  <br />
                  com qualidade.
                </h3>
                <p className="area-tagline">
                  Inteligência institucional aplicada ao SUS — atenção primária, governança
                  digital, financiamento e transformação dos sistemas públicos de saúde.
                </p>
                <div className="area-card-divider" />
                <p className="area-card-meta">
                  <strong>3</strong> Programas estratégicos
                </p>
                <div className="area-card-actions">
                  <a className="link-arrow light" href="#programas">
                    Ver programas da área
                  </a>
                  <a className="link-arrow light" href="#eventos-abertos">
                    Ver módulos e eventos abertos
                  </a>
                </div>
              </div>
            </article>
          </div>

          {/* Camada 2: 6 programas em evidência */}
          <div className="programs-curated-head fade-in">
            <div>
              <h3>Programas em evidência</h3>
              <p>Seleção comercial · Atualizado para Maio · 2026</p>
            </div>
            <a className="link-arrow" href="#programas">
              Ver todos os 15 programas
            </a>
          </div>

          <div className="programs-curated fade-in">
            <article
              className="program-card-evidence"
              data-area="edu"
              title="PEAR — Programa Estratégico de Alfabetização de Alta Performance e Recomposição da Aprendizagem"
            >
              <div className="program-evidence-head">
                <h4 className="program-evidence-sigla">PEAR</h4>
                <span className="program-evidence-area">NTC Educação</span>
              </div>
              <p className="program-evidence-name">Alfabetização e Recomposição</p>
              <p className="program-evidence-value">
                Recompor a aprendizagem com método e velocidade nas redes públicas de ensino.
              </p>
              <span className="program-evidence-flag">Módulo aberto</span>
              <div className="program-evidence-meta">
                <span>8 módulos</span>
                <span>64h</span>
              </div>
              <div className="program-evidence-actions">
                <a className="link-arrow" href="#programas">
                  Conhecer programa
                </a>
                <a className="link-arrow" href="#eventos-abertos">
                  Ver módulo aberto
                </a>
              </div>
            </article>

            <article
              className="program-card-evidence"
              data-area="gov"
              title="AGIP — Programa Avançado de Governança, Integridade e Performance nas Contratações Públicas"
            >
              <div className="program-evidence-head">
                <h4 className="program-evidence-sigla">AGIP</h4>
                <span className="program-evidence-area">NTC Gestão Pública</span>
              </div>
              <p className="program-evidence-name">Contratações Públicas</p>
              <p className="program-evidence-value">
                Elevar integridade e performance das contratações como vantagem institucional.
              </p>
              <span className="program-evidence-flag">Módulo aberto</span>
              <div className="program-evidence-meta">
                <span>8 módulos</span>
                <span>64h</span>
              </div>
              <div className="program-evidence-actions">
                <a className="link-arrow crimson" href="#programas">
                  Conhecer programa
                </a>
                <a className="link-arrow crimson" href="#eventos-abertos">
                  Ver módulo aberto
                </a>
              </div>
            </article>

            <article
              className="program-card-evidence"
              data-area="sau"
              title="PROSUS+ — Programa Estratégico de Governança, Financiamento e Performance no SUS"
            >
              <div className="program-evidence-head">
                <h4 className="program-evidence-sigla">PROSUS+</h4>
                <span className="program-evidence-area">NTC Saúde</span>
              </div>
              <p className="program-evidence-name">Governança no SUS</p>
              <p className="program-evidence-value">
                Governança, financiamento e performance estratégica do Sistema Único de Saúde.
              </p>
              <span className="program-evidence-flag">Módulo aberto</span>
              <div className="program-evidence-meta">
                <span>6 módulos</span>
                <span>48h</span>
              </div>
              <div className="program-evidence-actions">
                <a className="link-arrow olive" href="#programas">
                  Conhecer programa
                </a>
                <a className="link-arrow olive" href="#eventos-abertos">
                  Ver módulo aberto
                </a>
              </div>
            </article>

            <article
              className="program-card-evidence"
              data-area="edu"
              title="EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino"
            >
              <div className="program-evidence-head">
                <h4 className="program-evidence-sigla">EDUTEC</h4>
                <span className="program-evidence-area">NTC Educação</span>
              </div>
              <p className="program-evidence-name">Educação Digital</p>
              <p className="program-evidence-value">
                Tecnologias e inovação aplicadas à gestão das redes públicas de ensino.
              </p>
              <span className="program-evidence-flag">Módulo aberto</span>
              <div className="program-evidence-meta">
                <span>10 módulos</span>
                <span>80h</span>
              </div>
              <div className="program-evidence-actions">
                <a className="link-arrow" href="#programas">
                  Conhecer programa
                </a>
                <a className="link-arrow" href="#eventos-abertos">
                  Ver módulo aberto
                </a>
              </div>
            </article>

            <article
              className="program-card-evidence"
              data-area="edu"
              title="PROGE — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Resultados"
            >
              <div className="program-evidence-head">
                <h4 className="program-evidence-sigla">PROGE</h4>
                <span className="program-evidence-area">NTC Educação</span>
              </div>
              <p className="program-evidence-name">Gestão Escolar</p>
              <p className="program-evidence-value">
                Gestão escolar e coordenação pedagógica orientadas a resultados mensuráveis.
              </p>
              <div className="program-evidence-meta">
                <span>10 módulos</span>
                <span>80h</span>
              </div>
              <div className="program-evidence-actions">
                <a className="link-arrow" href="#programas">
                  Conhecer programa
                </a>
                <a className="link-arrow" href="#contratacao">
                  Solicitar proposta
                </a>
              </div>
            </article>

            <article
              className="program-card-evidence"
              data-area="gov"
              title="LIDERA — Liderança, Direção Estratégica e Resultados na Administração"
            >
              <div className="program-evidence-head">
                <h4 className="program-evidence-sigla">LIDERA</h4>
                <span className="program-evidence-area">NTC Gestão Pública</span>
              </div>
              <p className="program-evidence-name">Liderança e Direção</p>
              <p className="program-evidence-value">
                Direção estratégica e formação executiva para a Administração Pública.
              </p>
              <div className="program-evidence-meta">
                <span>8 módulos</span>
                <span>64h</span>
              </div>
              <div className="program-evidence-actions">
                <a className="link-arrow crimson" href="#programas">
                  Conhecer programa
                </a>
                <a className="link-arrow crimson" href="#contratacao">
                  Solicitar proposta
                </a>
              </div>
            </article>
          </div>

          <div className="programs-cta-foot fade-in">
            <a className="btn btn--primary" href="#programas">
              Ver todos os 15 programas <span className="btn-arrow">→</span>
            </a>
            <a className="btn btn--secondary" href="#contratacao">
              Solicitar proposta institucional
            </a>
          </div>
        </div>
      </section>

      {/* =================== ESPECIALISTAS / CURADORIA =================== */}
      <section
        className="experts-section experts-section--premium"
        id="docentes"
        aria-label="Curadoria científica e corpo docente"
      >
        <div className="experts-parallax" aria-hidden="true" />
        <div className="container">
          <header className="curadoria-selo fade-in">
            <div className="curadoria-selo-text">
              <p className="curadoria-selo-eyebrow">Curadoria científica · Corpo docente</p>
              <h2 className="curadoria-selo-headline">
                <strong>Ministros e ex-ministros do STF e do TCU.</strong>
              </h2>
              <p className="curadoria-selo-subhead">
                Juristas, gestores públicos, pesquisadores e autoridades técnicas.
              </p>
              <p className="curadoria-selo-context">
                A curadoria científica do Grupo NTC reúne profissionais de referência nacional nas
                áreas de Educação, Gestão Pública, Contratações Públicas e Saúde. A composição
                docente é estruturada conforme o programa, o evento, a demanda institucional e os
                objetivos de cada contratante.
              </p>
            </div>

            <a className="curadoria-selo-link" href="#docentes">
              Corpo docente completo →
            </a>
          </header>

          <div className="curadoria-grid fade-in" role="list">
            <a className="vitrine" data-vertical="gov" role="listitem" href="#docentes">
              <div className="vitrine-img" aria-hidden="true" />
              <div className="vitrine-content">
                <p className="vitrine-eyebrow">Curadoria por vertical</p>
                <h3 className="vitrine-curadoria-label">
                  Curadoria técnica <em>nacional</em>
                </h3>
                <p className="vitrine-name">NTC Gestão Pública e Contratações</p>
                <div className="vitrine-divider" aria-hidden="true" />
                <ul className="vitrine-credenciais">
                  <li>Juristas e doutrinadores em Direito Administrativo</li>
                  <li>Auditores do TCU e especialistas em Lei 14.133/2021</li>
                  <li>Procuradores federais e gestores públicos</li>
                  <li>Referências em governança, integridade e performance</li>
                </ul>
                <span className="vitrine-cta">Conhecer curadoria</span>
              </div>
            </a>

            <a className="vitrine" data-vertical="edu" role="listitem" href="#docentes">
              <div className="vitrine-img" aria-hidden="true" />
              <div className="vitrine-content">
                <p className="vitrine-eyebrow">Curadoria por vertical</p>
                <h3 className="vitrine-curadoria-label">
                  Curadoria educacional <em>nacional</em>
                </h3>
                <p className="vitrine-name">NTC Educação</p>
                <div className="vitrine-divider" aria-hidden="true" />
                <ul className="vitrine-credenciais">
                  <li>Pesquisadores e gestores educacionais de referência</li>
                  <li>Especialistas em alfabetização, currículo e avaliação</li>
                  <li>Autoridades em primeira infância e educação inclusiva</li>
                  <li>Lideranças em transformação digital de redes públicas</li>
                </ul>
                <span className="vitrine-cta">Conhecer curadoria</span>
              </div>
            </a>

            <a className="vitrine" data-vertical="sau" role="listitem" href="#docentes">
              <div className="vitrine-img" aria-hidden="true" />
              <div className="vitrine-content">
                <p className="vitrine-eyebrow">Curadoria por vertical</p>
                <h3 className="vitrine-curadoria-label">
                  Curadoria SUS e <em>saúde pública</em>
                </h3>
                <p className="vitrine-name">NTC Saúde</p>
                <div className="vitrine-divider" aria-hidden="true" />
                <ul className="vitrine-credenciais">
                  <li>Gestores do SUS e ex-secretários estaduais</li>
                  <li>Sanitaristas e pesquisadores de referência nacional</li>
                  <li>Especialistas em atenção primária e redes de cuidado</li>
                  <li>Autoridades em saúde digital, financiamento e dados</li>
                </ul>
                <span className="vitrine-cta">Conhecer curadoria</span>
              </div>
            </a>
          </div>

          <div className="curadoria-cta-final fade-in">
            <p className="curadoria-cta-final-text">
              A curadoria científica do Grupo NTC é construída programa a programa, evento a
              evento, conforme a demanda institucional do cliente.
            </p>
            <a href="#docentes">
              Conhecer corpo docente completo
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* =================== SOLUÇÕES =================== */}
      <section className="solutions" id="solucoes">
        <div className="container">
          <div className="solutions-grid fade-in">
            <div className="solutions-content">
              <p className="eyebrow">Visão arquitetural</p>
              <h2>Soluções estratégicas para o desenvolvimento institucional do setor público</h2>
              <p>
                O Grupo NTC organiza sua atuação em uma arquitetura ampla de soluções, que vai
                além da oferta de eventos abertos — combinando programas, trilhas, jornadas,
                turmas fechadas e formatos institucionais customizados.
              </p>
              <ul className="solutions-list">
                <li>Programas estratégicos</li>
                <li>Trilhas formativas</li>
                <li>Jornadas executivas</li>
                <li>Eventos abertos</li>
                <li>Turmas fechadas</li>
                <li>Soluções in company</li>
                <li>Projetos institucionais</li>
                <li>Soluções sob medida</li>
              </ul>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a className="btn btn--primary" href="#solucoes">
                  Conhecer soluções estratégicas <span className="btn-arrow">→</span>
                </a>
                <a className="btn btn--secondary" href="#contratacao">
                  Solicitar proposta
                </a>
              </div>
            </div>
            <div className="solutions-image">
              <img
                src={URL_SOLUCOES_LAB}
                alt="Ambiente institucional do setor público"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =================== ONLINE × PRESENCIAL =================== */}
      <section className="section section--cream">
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow">Modalidades de participação</p>
            <h2>Eventos online e eventos presenciais</h2>
            <p className="section-intro">
              O Grupo NTC opera com forte presença em capitais estratégicas e simultaneamente
              sustenta uma plataforma digital própria de transmissão e replay.
            </p>
          </div>

          <div className="modes-grid fade-in">
            <article className="mode-card">
              <div
                className="mode-card-bg"
                style={{ backgroundImage: `url('${URL_EVENTON_ONLINE}')` }}
                aria-hidden="true"
              />
              <div className="mode-card-overlay" />
              <div className="mode-card-content">
                <p className="eyebrow gold">Modalidade</p>
                <h3>Eventos online</h3>
                <div className="mode-list">
                  <span>Transmissão ao vivo</span>
                  <span>Interação com docentes</span>
                  <span>Replay protegido</span>
                  <span>Certificado</span>
                  <span>Acesso EventOn</span>
                </div>
                <a className="btn btn--gold" href="#eventos-abertos">
                  Ver eventos online <span className="btn-arrow">→</span>
                </a>
              </div>
            </article>

            <article className="mode-card">
              <div
                className="mode-card-bg"
                style={{ backgroundImage: `url('${URL_PLENARIO}')` }}
                aria-hidden="true"
              />
              <div className="mode-card-overlay" />
              <div className="mode-card-content">
                <p className="eyebrow gold">Modalidade</p>
                <h3>Eventos presenciais</h3>
                <div className="mode-list">
                  <span>Experiência imersiva</span>
                  <span>Networking executivo</span>
                  <span>Capitais estratégicas</span>
                  <span>Certificação</span>
                  <span>Atendimento institucional</span>
                </div>
                <a className="btn btn--gold" href="#eventos-abertos">
                  Ver eventos presenciais <span className="btn-arrow">→</span>
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =================== EVENTON =================== */}
      <section className="eventon eventon-section--parallax" id="eventon">
        <div className="eventon-parallax" aria-hidden="true" />
        <div className="eventon-bg" aria-hidden="true" />
        <div className="container eventon-grid fade-in">
          <div>
            <p className="eyebrow gold">EventOn · Plataforma do Grupo NTC</p>
            <h2>EventOn: acesso, replay e certificado em um só ambiente</h2>
            <p>
              O EventOn é a infraestrutura digital dos eventos online do Grupo NTC, reunindo
              acesso ao vivo, replay protegido, materiais de apoio, suporte ao participante e
              emissão de certificados.
            </p>
            <div className="eventon-ctas">
              <a className="btn btn--gold" href="#eventon">
                Acessar EventOn <span className="btn-arrow">→</span>
              </a>
              <a className="btn btn--ghost-light" href="#eventon">
                Suporte ao participante
              </a>
            </div>
          </div>

          <div className="eventon-ops">
            <div className="eventon-op">
              <span className="op-num">01</span>
              <h4>Acessar evento ao vivo</h4>
              <p>Sala de transmissão protegida com login e interação com docentes.</p>
              <a href="#eventon">Acessar agora →</a>
            </div>
            <div className="eventon-op">
              <span className="op-num">02</span>
              <h4>Assistir replay</h4>
              <p>Conteúdo gravado disponível em prazo determinado para inscritos.</p>
              <a href="#eventon">Ver replays →</a>
            </div>
            <div className="eventon-op">
              <span className="op-num">03</span>
              <h4>Emitir certificado</h4>
              <p>Certificado validável por código QR após cumprimento dos requisitos.</p>
              <a href="#eventon">Emitir certificado →</a>
            </div>
            <div className="eventon-op">
              <span className="op-num">04</span>
              <h4>Falar com suporte</h4>
              <p>Atendimento dedicado para participantes durante e após o evento.</p>
              <a href="#eventon">Abrir chamado →</a>
            </div>
          </div>
        </div>
      </section>

      {/* =================== CONTRATAÇÃO INSTITUCIONAL =================== */}
      <section className="contracting contratacao-section--parallax" id="contratacao">
        <div className="contratacao-parallax" aria-hidden="true" />
        <div className="contracting-bg" aria-hidden="true" />
        <div className="container contracting-grid fade-in">
          <div>
            <p className="eyebrow gold">Contratação institucional</p>
            <h2>
              Precisa formar uma equipe, rede ou <em>instituição inteira</em>?
            </h2>
            <p>
              Além dos eventos abertos, o Grupo NTC desenvolve turmas fechadas, programas
              completos, módulos específicos, trilhas formativas e soluções sob medida para
              secretarias, autarquias, fundações, escolas de governo, redes públicas e órgãos
              governamentais.
            </p>
            <div className="contracting-ctas">
              <a className="btn btn--gold" href="#contato">
                Solicitar proposta institucional <span className="btn-arrow">→</span>
              </a>
              <a className="btn btn--ghost-light" href="#contato">
                Inscrever minha equipe
              </a>
              <a className="btn btn--ghost-light" href="#contato">
                Agendar apresentação
              </a>
            </div>
          </div>

          <aside className="contracting-options">
            <h4>Modelos disponíveis</h4>
            <ul>
              <li>Programa completo entregue exclusivamente à instituição contratante</li>
              <li>Módulos específicos em formato in company</li>
              <li>Turma fechada presencial, online ou híbrida</li>
              <li>Trilhas e jornadas curadas para necessidades específicas</li>
              <li>Soluções sob medida com customização de ementas e cargas</li>
              <li>Atendimento dedicado para órgãos públicos em todo o país</li>
            </ul>
          </aside>
        </div>
      </section>

      {/* =================== DIFERENCIAIS =================== */}
      <section className="section section--tight">
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow">Diferenciais institucionais</p>
            <h2>O que sustenta a entrega do Grupo NTC.</h2>
          </div>

          <div className="diff-grid fade-in">
            {[
              {
                num: "01",
                titulo: "Trajetória consolidada",
                descricao:
                  "Cerca de duas décadas dedicadas à formação institucional para a Administração Pública brasileira.",
              },
              {
                num: "02",
                titulo: "Excelência docente",
                descricao:
                  "Corpo docente formado por especialistas reconhecidos com atuação na gestão pública nacional.",
              },
              {
                num: "03",
                titulo: "Arquitetura programática",
                descricao:
                  "Programas estruturados em módulos e trilhas, com ementas, coordenação científica e linha editorial próprias.",
              },
              {
                num: "04",
                titulo: "Aderência ao setor público",
                descricao:
                  "Cada programa é desenhado a partir de desafios concretos da Administração Pública, com aplicabilidade direta.",
              },
              {
                num: "05",
                titulo: "Flexibilidade de contratação",
                descricao:
                  "Eventos abertos, módulos avulsos, turmas fechadas, trilhas customizadas e soluções in company.",
              },
              {
                num: "06",
                titulo: "Execução nacional",
                descricao:
                  "Capacidade operacional para atendimento simultâneo a múltiplos órgãos em diferentes regiões do país.",
              },
              {
                num: "07",
                titulo: "Eventos online e presenciais",
                descricao:
                  "Plataforma EventOn própria para transmissão ao vivo e replay; estrutura ativa em capitais estratégicas.",
              },
              {
                num: "08",
                titulo: "Certificação e suporte",
                descricao:
                  "Emissão de certificados validáveis e atendimento dedicado ao participante e às instituições contratantes.",
              },
            ].map((d) => (
              <div key={d.num} className="diff-card">
                <span className="diff-num">{d.num}</span>
                <h4>{d.titulo}</h4>
                <p>{d.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== NÚMEROS =================== */}
      <section className="numbers-band">
        <div className="container">
          <div className="numbers-grid fade-in">
            <div className="number-item">
              <div className="num text">Duas décadas</div>
              <div className="label">De atuação institucional</div>
            </div>
            <div className="number-item">
              <div className="num text">Milhares</div>
              <div className="label">Participantes capacitados</div>
            </div>
            <div className="number-item">
              <div className="num text">Múltiplas regiões</div>
              <div className="label">Eventos realizados</div>
            </div>
            <div className="number-item">
              <div className="num text">Diferentes esferas</div>
              <div className="label">Órgãos públicos atendidos</div>
            </div>
            <div className="number-item">
              <div className="num text">Nacional</div>
              <div className="label">Presença operacional</div>
            </div>
          </div>
          <p className="numbers-disclaimer">
            Indicadores institucionais — números exatos sujeitos à validação interna do Grupo NTC.
          </p>
        </div>
      </section>

      {/* =================== PROVA INSTITUCIONAL =================== */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-banner fade-in">
            <p className="eyebrow">Atuação institucional</p>
            <h3>
              Atuação junto a órgãos públicos, redes de ensino, sistemas de saúde e instituições
              governamentais em diferentes regiões do país.
            </h3>
          </div>
          <div className="trust-categories fade-in">
            {[
              "Secretarias estaduais",
              "Prefeituras",
              "Autarquias",
              "Escolas de governo",
              "Redes públicas de ensino",
              "Instituições parceiras",
            ].map((cat) => (
              <div key={cat} className="trust-cat">
                <div className="icon-line" />
                <h4>{cat}</h4>
              </div>
            ))}
          </div>
          <p className="placeholder-note">
            Logos institucionais serão inseridos após autorização formal de cada órgão.
          </p>
        </div>
      </section>

      {/* =================== CTA FINAL =================== */}
      <section className="cta-final" id="contato">
        <div className="container fade-in">
          <p className="eyebrow gold">Próximos passos</p>
          <h2>
            Encontre a formação certa para sua <em>instituição</em> ou equipe.
          </h2>
          <p className="cta-final-sub">
            Participe dos eventos abertos, inscreva sua equipe ou solicite uma proposta
            institucional para programas, módulos e soluções sob medida.
          </p>
          <div className="cta-final-buttons">
            <a className="btn btn--gold" href="#eventos-abertos">
              Ver eventos com inscrições abertas <span className="btn-arrow">→</span>
            </a>
            <a className="btn btn--ghost-light" href="#contratacao">
              Solicitar proposta institucional
            </a>
            <a className="btn btn--ghost-light" href="#contato">
              Falar com a equipe
            </a>
          </div>
          <p className="cta-tagline">— Inteligência institucional. Impacto real. —</p>
        </div>
      </section>
    </main>
  );
}
