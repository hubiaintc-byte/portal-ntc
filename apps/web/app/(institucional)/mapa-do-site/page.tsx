import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mapa do site · Grupo NTC",
  description:
    "Mapa do Site do portal Grupo NTC · estrutura completa em 6 macrocategorias (Institucional · Verticais · Programas · Capacitação · Comercial · Governança) com links diretos para todas as páginas-mãe publicadas.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.grupontc.com.br/mapa-do-site",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Mapa do site · Grupo NTC",
    description:
      "Estrutura completa do portal Grupo NTC organizada em 6 macrocategorias institucionais.",
    url: "https://www.grupontc.com.br/mapa-do-site",
    images: [
      {
        url: "https://www.grupontc.com.br/img/og/og-institucional.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mapa do site · Grupo NTC",
    description:
      "Estrutura completa do portal Grupo NTC organizada em 6 macrocategorias institucionais.",
  },
};

export default function MapaDoSitePage() {
  return (
    <main id="main">

      {/* HERO INSTITUCIONAL */}
      <section className="hero-page" aria-label="Cabeçalho institucional · Mapa do site">
        <div className="hero-page-bg" aria-hidden="true"></div>
        <div className="container hero-page-content fade-in">
          <nav className="crumb" aria-label="Você está em">
            <Link href="/">Grupo NTC</Link>
            <span className="sep" aria-hidden="true"></span>
            <Link href="/mapa-do-site">Governança de dados</Link>
            <span className="sep" aria-hidden="true"></span>
            <span className="current">Mapa do site</span>
          </nav>

          <p className="eyebrow gold">Estrutura institucional · Grupo NTC · Edição 2026</p>
          <h1>Mapa do site<span className="accent">.</span><br />Todas as páginas-mãe do portal Grupo NTC, em um só lugar.</h1>
          <p className="hero-page-sub">Este Mapa apresenta a estrutura completa do portal <strong style={{ color: 'var(--pergaminho)' }}>Grupo NTC</strong> organizada em 6 macrocategorias institucionais — Institucional · Verticais · Programas · Capacitação · Comercial · Governança — com link direto para cada uma das páginas-mãe publicadas.</p>
          <div className="hero-meta"><span><strong>15 programas</strong> estratégicos</span><span><strong>3 verticais</strong> · Educação · Gestão Pública · Saúde</span><span><strong>17+ páginas-mãe</strong> publicadas</span></div>
        </div>
      </section>

      <nav className="legal-subnav" aria-label="Navegação interna da página">
        <div className="legal-subnav-inner">
          <a href="#institucional">Institucional</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#verticais">Verticais</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#programas">Programas estratégicos</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#capacitacao">Capacitação e plataforma</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#comercial">Comercial e atendimento</a>
        </div>
      </nav>

      <section className="legal-shell">
        <div className="container">
          <div className="legal-grid">

            <aside className="legal-aside" aria-label="Sumário da página">
              <h4>Sumário</h4>
              <ol>
                <li><a href="#institucional">Institucional</a></li>
                <li><a href="#verticais">Verticais</a></li>
                <li><a href="#programas">Programas estratégicos</a></li>
                <li><a href="#capacitacao">Capacitação e plataforma</a></li>
                <li><a href="#comercial">Comercial e atendimento</a></li>
                <li><a href="#governanca">Governança e legal</a></li>
              </ol>
              <div className="legal-aside-foot">
                <strong>Vigência</strong>
                Revisada em 14/05/2026 pelo Encarregado de Tratamento de Dados (DPO) do Instituto NTC do Brasil.
              </div>
            </aside>

            <div className="legal-content">

              {/* SEÇÃO 01 — INSTITUCIONAL */}
              <section id="institucional" className="legal-section">
                <span className="secn-num">Seção 01</span>
                <h2>Institucional</h2>
                <p>Páginas-mãe que apresentam o Instituto NTC do Brasil e a marca Grupo NTC.</p>
                <div className="sitemap-grid">
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Páginas institucionais</span>
                    <h3>Apresentação <small>Instituto NTC do Brasil</small></h3>
                    <ul>
                      <li><Link href="/"><strong>Home Grupo NTC</strong><span>Página inicial · hero institucional</span></Link></li>
                      <li><Link href="/o-grupo"><strong>O Grupo NTC</strong><span>Quem somos · MVV · linha do tempo</span></Link></li>
                      <li><Link href="/conteudos"><strong>Conteúdos</strong><span>Biblioteca editorial institucional</span></Link></li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Curadoria</span>
                    <h3>Corpo Docente <small>Especialistas das 3 áreas</small></h3>
                    <ul>
                      <li><Link href="/o-grupo/corpo-docente"><strong>Corpo Docente</strong><span>Curadoria científica e especialistas</span></Link></li>
                      <li><a href="#"><strong>Agenda Geral</strong><span>Próximos eventos abertos no calendário</span></a>{/* rota /agenda não portada */}</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 02 — VERTICAIS */}
              <section id="verticais" className="legal-section">
                <span className="secn-num">Seção 02</span>
                <h2>Verticais</h2>
                <p>Páginas-mãe das três áreas estratégicas do Grupo NTC, cada uma com manifesto, programas, especialistas e contratação institucional.</p>
                <div className="sitemap-grid">
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">NTC Educação</span>
                    <h3>Educação <small>Excelência e formação com resultado</small></h3>
                    <ul>
                      <li><Link href="/solucoes-estrategicas/educacao"><strong>NTC Educação</strong><span>Vertical completa · 9 programas</span></Link></li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">NTC Gestão Pública</span>
                    <h3>Gestão Pública <small>Governança com transformação</small></h3>
                    <ul>
                      <li><Link href="/solucoes-estrategicas/gestao-publica"><strong>NTC Gestão Pública</strong><span>Vertical completa · 3 programas</span></Link></li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">NTC Saúde</span>
                    <h3>Saúde <small>Gestão com competência</small></h3>
                    <ul>
                      <li><Link href="/solucoes-estrategicas/saude"><strong>NTC Saúde</strong><span>Vertical completa · 3 programas</span></Link></li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 03 — PROGRAMAS ESTRATÉGICOS */}
              <section id="programas" className="legal-section">
                <span className="secn-num">Seção 03</span>
                <h2>Programas <em>estratégicos</em></h2>
                <p>Os 15 programas estratégicos do Grupo NTC, distribuídos pelas 3 verticais.</p>

                <div className="sitemap-grid">
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">NTC Educação · 9 programas</span>
                    <h3>Educação</h3>
                    <ul>
                      <li><Link href="/programas/edutec"><strong>EDUTEC</strong><span>Educação Digital · Inovação · Tecnologias</span></Link></li>
                      <li><Link href="/programas/pear"><strong>PEAR</strong><span>Alfabetização e recomposição da aprendizagem</span></Link></li>
                      <li><Link href="/programas/pei"><strong>PEI</strong><span>Educação Integral · gestão e currículo</span></Link></li>
                      <li><Link href="/programas/progir"><strong>PROGIR</strong><span>Gestão da Inclusão com resultado</span></Link></li>
                      <li><Link href="/programas/proge"><strong>PROGE</strong><span>Gestão Escolar e coordenação pedagógica</span></Link></li>
                      <li><Link href="/programas/egide"><strong>EGIDE</strong><span>IA, dados e governança digital</span></Link></li>
                      <li><Link href="/programas/vivaescola"><strong>VIVAESCOLA</strong><span>Convivência, bem-estar e proteção integral</span></Link></li>
                      <li><Link href="/programas/pinei"><strong>PINEI</strong><span>Primeira Infância e Educação Infantil</span></Link></li>
                      <li><Link href="/programas/futura"><strong>FUTURA</strong><span>Ensino Médio e empregabilidade</span></Link></li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">NTC Gestão Pública · 3 programas</span>
                    <h3>Gestão Pública</h3>
                    <ul>
                      <li><Link href="/programas/lidera"><strong>LIDERA</strong><span>Liderança e direção estratégica</span></Link></li>
                      <li><Link href="/programas/agip"><strong>AGIP</strong><span>Governança e performance em contratações</span></Link></li>
                      <li><Link href="/programas/siga"><strong>SIGA</strong><span>Soluções inteligentes de governança</span></Link></li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">NTC Saúde · 3 programas</span>
                    <h3>Saúde</h3>
                    <ul>
                      <li><Link href="/programas/sigs"><strong>SIGS</strong><span>Sistema integrado de gestão em saúde</span></Link></li>
                      <li><Link href="/programas/proaps"><strong>PROAPS+</strong><span>Atenção Primária e redes de cuidado</span></Link></li>
                      <li><Link href="/programas/prosus"><strong>PROSUS+</strong><span>Direção institucional em saúde pública</span></Link></li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 04 — CAPACITAÇÃO E PLATAFORMA */}
              <section id="capacitacao" className="legal-section">
                <span className="secn-num">Seção 04</span>
                <h2>Capacitação e <em>plataforma</em></h2>
                <p>Páginas-mãe relacionadas à entrega formativa, à Plataforma EventOn e à Área do Participante.</p>
                <div className="sitemap-grid">
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Agenda e formatos</span>
                    <h3>Agenda <small>Eventos abertos · próximas turmas</small></h3>
                    <ul>
                      <li><a href="#"><strong>Agenda Geral NTC</strong><span>Todos os eventos abertos</span></a>{/* rota /agenda não portada */}</li>
                      <li><a href="#"><strong>Evento · PROSUS+ · Brasília</strong><span>Página de evento · presencial</span></a>{/* rota /eventos/... não portada */}</li>
                      <li><a href="#"><strong>Evento · EDUTEC · Online</strong><span>Página de evento · módulo online</span></a>{/* rota /eventos/... não portada */}</li>
                      <li><a href="#"><strong>Evento · AGIP · Híbrido</strong><span>Página de evento · híbrido</span></a>{/* rota /eventos/... não portada */}</li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Plataforma EventOn</span>
                    <h3>EventOn <small>Ambiente digital institucional</small></h3>
                    <ul>
                      <li><a href="#"><strong>EventOn</strong><span>Plataforma · recursos · suporte</span></a>{/* rota /eventon não portada */}</li>
                      <li><a href="#"><strong>Área do Participante</strong><span>Hub logado do participante</span></a>{/* rota /area-do-participante não portada */}</li>
                      <li><Link href="/o-grupo/corpo-docente"><strong>Corpo Docente</strong><span>Curadoria das 3 áreas</span></Link></li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 05 — COMERCIAL E ATENDIMENTO */}
              <section id="comercial" className="legal-section">
                <span className="secn-num">Seção 05</span>
                <h2>Comercial e <em>atendimento</em></h2>
                <p>Páginas-mãe para relacionamento institucional, modelos de contratação e suporte comercial.</p>
                <div className="sitemap-grid">
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Modelos de contratação</span>
                    <h3>Soluções <small>Como o Grupo NTC contrata</small></h3>
                    <ul>
                      <li><a href="#"><strong>Soluções</strong><span>Página comercial · 4 modalidades canon</span></a>{/* rota /solucoes não portada */}</li>
                      <li><a href="#"><strong>In company</strong><span>Programa entregue à instituição</span></a>{/* rota /solucoes#in-company não portada */}</li>
                      <li><a href="#"><strong>Turmas fechadas</strong><span>Edição operacional dedicada</span></a>{/* rota /solucoes#turmas-fechadas não portada */}</li>
                      <li><a href="#"><strong>Sob medida</strong><span>Customização profunda</span></a>{/* rota /solucoes#sob-medida não portada */}</li>
                      <li><a href="#"><strong>Contratação institucional</strong><span>Atendimento dedicado · órgãos públicos</span></a>{/* rota /solucoes#contratacao-institucional não portada */}</li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Atendimento</span>
                    <h3>Contato <small>Canais oficiais</small></h3>
                    <ul>
                      <li><Link href="/contato"><strong>Contato</strong><span>Atendimento institucional</span></Link></li>
                      <li><Link href="/contato?assunto=proposta"><strong>Solicitar proposta</strong><span>Formulário de proposta institucional</span></Link></li>
                      <li><Link href="/contato?assunto=equipe"><strong>Inscrever equipe</strong><span>Inscrição em grupo institucional</span></Link></li>
                      <li><Link href="/contato"><strong>Atendimento comercial</strong><span>Equipe comercial dedicada</span></Link></li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 06 — GOVERNANÇA E LEGAL */}
              <section id="governanca" className="legal-section">
                <span className="secn-num">Seção 06</span>
                <h2>Governança e <em>legal</em></h2>
                <p>Páginas-mãe de governança institucional, proteção de dados e relacionamento com órgãos reguladores.</p>
                <div className="sitemap-grid">
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Proteção de dados</span>
                    <h3>LGPD e canais <small>Encarregado · direitos do titular</small></h3>
                    <ul>
                      <li><Link href="/politica-de-privacidade"><strong>Política de Privacidade</strong><span>Bases legais · direitos · DPO</span></Link></li>
                      <li><Link href="/lgpd"><strong>LGPD — Governança</strong><span>Programa institucional de proteção</span></Link></li>
                      <li><Link href="/lgpd#exercicio-direitos"><strong>Exercer direitos do titular</strong><span>Fluxo formal · 15 dias úteis</span></Link></li>
                      <li><a href="mailto:dpo@institutontc.com.br"><strong>dpo@institutontc.com.br</strong><span>Canal exclusivo do Encarregado</span></a></li>
                    </ul>
                  </div>
                  <div className="sitemap-col">
                    <span className="sitemap-col-num">Uso dos Canais</span>
                    <h3>Termos e cookies <small>Regras dos canais digitais</small></h3>
                    <ul>
                      <li><Link href="/termos-de-uso"><strong>Termos de Uso</strong><span>Regras de uso dos Canais Digitais</span></Link></li>
                      <li><Link href="/politica-de-cookies"><strong>Política de Cookies</strong><span>Tabela · preferências · base legal</span></Link></li>
                      <li><Link href="/mapa-do-site" aria-current="page"><strong>Mapa do site</strong><span>Você está aqui · todas as páginas</span></Link></li>
                    </ul>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>

      {/* CTA INSTITUCIONAL FINAL */}
      <section className="legal-cta-final" aria-label="Encerramento institucional">
        <div className="container legal-cta-final-inner fade-in">
          <p className="eyebrow gold" style={{ color: 'var(--dourado-soft)' }}>Grupo NTC · Navegação institucional</p>
          <h2>Não encontrou o que procurava? <em>Fale direto com o time institucional.</em></h2>
          <p>O atendimento institucional do Grupo NTC está pronto para orientar sobre programas, eventos, contratação e suporte ao participante. A Agenda Geral concentra todos os eventos abertos com inscrição disponível.</p>
          <div className="legal-cta-final-actions">
            <a className="btn btn--gold" href="#" data-cms-link="atendimento-institucional">Falar com o atendimento institucional →</a>{/* rota /contato não portada */}<a className="btn btn--ghost-light" href="#" data-cms-link="agenda-geral">Ver a Agenda Geral NTC</a>{/* rota /agenda não portada */}
          </div>
        </div>
      </section>

    </main>
  );
}
