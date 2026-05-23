import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies · Grupo NTC",
  description:
    "Política de Cookies dos canais digitais do Grupo NTC · categorias canônicas (essenciais, funcionais, analíticos), tabela detalhada de cookies, base legal LGPD e controles de preferência para o Usuário.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.grupontc.com.br/politica-de-cookies",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Política de Cookies · Grupo NTC",
    description:
      "Cookies utilizados pelo Grupo NTC: categorias, base legal, retenção e como gerenciar suas preferências.",
    url: "https://www.grupontc.com.br/politica-de-cookies",
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
    title: "Política de Cookies · Grupo NTC",
    description:
      "Cookies utilizados pelo Grupo NTC: categorias, base legal, retenção e como gerenciar suas preferências.",
  },
};

export default function PoliticaDeCookiesPage() {
  return (
    <main id="main">

      {/* HERO INSTITUCIONAL */}
      <section className="hero-page" aria-label="Cabeçalho institucional · Política de Cookies">
        <div className="hero-page-bg" aria-hidden="true"></div>
        <div className="container hero-page-content fade-in">
          <nav className="crumb" aria-label="Você está em">
            <Link href="/">Grupo NTC</Link>
            <span className="sep" aria-hidden="true"></span>
            <Link href="/mapa-do-site">Governança de dados</Link>
            <span className="sep" aria-hidden="true"></span>
            <span className="current">Política de Cookies</span>
          </nav>

          <p className="eyebrow gold">Governança de dados · Grupo NTC · Edição 2026</p>
          <h1>Política de Cookies<span className="accent">.</span><br />Categorias, finalidade, retenção — e seu pleno controle.</h1>
          <p className="hero-page-sub">Esta Política descreve quais cookies o <strong style={{ color: 'var(--pergaminho)' }}>Grupo NTC</strong> utiliza nos canais digitais, com que finalidade, por quanto tempo são retidos e como o Usuário pode revisar, ativar ou desativar cookies não essenciais a qualquer momento.</p>
          <div className="hero-meta"><span><strong>Vigência:</strong> 14/05/2026</span><span><strong>Base legal:</strong> Art. 7.º LGPD</span><span><strong>Categorias canon:</strong> 4</span></div>
        </div>
      </section>

      <nav className="legal-subnav" aria-label="Navegação interna da página">
        <div className="legal-subnav-inner">
          <a href="#o-que-sao">O que são cookies</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#categorias">Categorias de cookies</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#tabela">Tabela detalhada</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#base-legal">Base legal e consentimento</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#preferencias">Preferências do Usuário</a>
        </div>
      </nav>

      <section className="legal-shell">
        <div className="container">
          <div className="legal-grid">

            <aside className="legal-aside" aria-label="Sumário da página">
              <h4>Sumário</h4>
              <ol>
                <li><a href="#o-que-sao">O que são cookies</a></li>
                <li><a href="#categorias">Categorias de cookies</a></li>
                <li><a href="#tabela">Tabela detalhada</a></li>
                <li><a href="#base-legal">Base legal e consentimento</a></li>
                <li><a href="#preferencias">Preferências do Usuário</a></li>
                <li><a href="#retencao-cookies">Retenção de cookies</a></li>
                <li><a href="#terceiros">Cookies de terceiros</a></li>
                <li><a href="#alteracoes-cook">Atualizações desta Política</a></li>
              </ol>
              <div className="legal-aside-foot">
                <strong>Vigência</strong>
                Revisada em 14/05/2026 pelo Encarregado de Tratamento de Dados (DPO) do Instituto NTC do Brasil.
              </div>
            </aside>

            <div className="legal-content">

              {/* SEÇÃO 01 — O QUE SÃO COOKIES */}
              <section id="o-que-sao" className="legal-section">
                <span className="secn-num">Seção 01</span>
                <h2>O que são <em>cookies</em></h2>
                <p>Cookies são pequenos arquivos de texto que um sítio eletrônico instala no navegador do Usuário durante a visita. Servem para manter informações úteis ao funcionamento da navegação — preferências, sessão, idioma — e, em alguns casos, para medir audiência ou personalizar experiências.</p>
                <p>Esta Política descreve quais cookies o Grupo NTC utiliza nos seus Canais Digitais (<code>institutontc.com.br</code>, <code>grupontc.com.br</code>, Plataforma EventOn e Área do Participante), com que finalidade, por quanto tempo são retidos e como o Usuário pode gerenciar suas preferências, em conformidade com a Lei n.º 13.709/2018 (LGPD) e com o Marco Civil da Internet.</p>
              </section>

              {/* SEÇÃO 02 — CATEGORIAS DE COOKIES */}
              <section id="categorias" className="legal-section">
                <span className="secn-num">Seção 02</span>
                <h2>Categorias de <em>cookies</em></h2>
                <p>Adotamos a classificação canônica em quatro categorias:</p>
                <ul>
                  <li><strong>Cookies essenciais (estritamente necessários)</strong> — indispensáveis ao funcionamento básico do site, autenticação, segurança, balanceamento de carga e prevenção de fraudes. <strong>Não exigem consentimento</strong>, pois sem eles os Canais não funcionam.</li>
                  <li><strong>Cookies funcionais</strong> — armazenam preferências do Usuário (idioma, fuso horário, modalidade preferida — online/presencial) para melhorar a continuidade da experiência. <strong>Exigem consentimento</strong>.</li>
                  <li><strong>Cookies analíticos / de desempenho</strong> — coletam informações agregadas e, sempre que possível, anonimizadas sobre como os Usuários interagem com os Canais. Permitem medir audiência, identificar pontos de fricção e direcionar a melhoria contínua dos canais. <strong>Exigem consentimento</strong>.</li>
                  <li><strong>Cookies de marketing / publicidade</strong> — utilizados para entrega de conteúdo personalizado, retargeting institucional ou medição de campanhas. Atualmente <strong>não utilizamos</strong> esta categoria nos Canais do Grupo NTC; caso passemos a utilizá-la, será mediante atualização desta Política e novo consentimento expresso.</li>
                </ul>
              </section>

              {/* SEÇÃO 03 — TABELA DETALHADA */}
              <section id="tabela" className="legal-section">
                <span className="secn-num">Seção 03</span>
                <h2>Tabela <em>detalhada</em></h2>
                <p>A tabela abaixo é exemplificativa e poderá ser atualizada conforme a evolução tecnológica dos Canais. A versão sempre vigente é a publicada nesta página:</p>

                <table className="legal-table">
                  <thead>
                    <tr><th>Cookie</th><th>Categoria</th><th>Finalidade</th><th>Duração</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><code>ntc_session</code></td><td>Essencial</td><td>Manutenção da sessão autenticada do Participante na Área do Participante.</td><td>Sessão</td></tr>
                    <tr><td><code>ntc_csrf</code></td><td>Essencial</td><td>Proteção contra falsificação de requisição entre sítios (CSRF) em formulários institucionais.</td><td>Sessão</td></tr>
                    <tr><td><code>ntc_consent</code></td><td>Essencial</td><td>Registro do consentimento do Usuário para cookies não essenciais — fundamental para o cumprimento da LGPD.</td><td>12 meses</td></tr>
                    <tr><td><code>ntc_pref_lang</code></td><td>Funcional</td><td>Armazena o idioma preferido do Usuário (atualmente apenas pt-BR está disponível).</td><td>6 meses</td></tr>
                    <tr><td><code>ntc_pref_modo</code></td><td>Funcional</td><td>Memoriza a modalidade favorita do Participante (online / presencial / híbrido) para sugerir eventos na agenda.</td><td>6 meses</td></tr>
                    <tr><td><code>_ntc_an</code></td><td>Analítico</td><td>Identificador anônimo agregado para mensuração de audiência interna.</td><td>13 meses</td></tr>
                    <tr><td><code>_ntc_an_sess</code></td><td>Analítico</td><td>Granularidade de sessão para análise de jornada anonimizada.</td><td>30 minutos</td></tr>
                  </tbody>
                </table>
              </section>

              {/* SEÇÃO 04 — BASE LEGAL E CONSENTIMENTO */}
              <section id="base-legal" className="legal-section">
                <span className="secn-num">Seção 04</span>
                <h2>Base legal e <em>consentimento</em></h2>
                <p>O tratamento dos dados eventualmente associados aos cookies é amparado nas seguintes hipóteses do art. 7.º da LGPD:</p>
                <ul>
                  <li><strong>Cookies essenciais:</strong> Art. 7.º, V — execução de contrato, ou Art. 7.º, IX — legítimo interesse (segurança).</li>
                  <li><strong>Cookies funcionais e analíticos:</strong> Art. 7.º, I — <strong>consentimento</strong> do titular, colhido no banner exibido na primeira visita.</li>
                  <li><strong>Cookies de marketing (não utilizados atualmente):</strong> Art. 7.º, I — consentimento específico e destacado, se vierem a ser implementados.</li>
                </ul>
                <p>O consentimento é livre, informado e inequívoco. O Usuário pode revogar a qualquer momento sem prejuízo da licitude do tratamento realizado antes da revogação.</p>
              </section>

              {/* SEÇÃO 05 — PREFERÊNCIAS DO USUÁRIO */}
              <section id="preferencias" className="legal-section">
                <span className="secn-num">Seção 05</span>
                <h2>Preferências do <em>Usuário</em></h2>
                <p>O Usuário tem controle pleno sobre os cookies não essenciais. Pode revisar e atualizar suas preferências a qualquer momento por meio do painel abaixo, do banner que aparece na primeira visita ou diretamente nas configurações do seu navegador.</p>

                <div className="cookie-prefs" role="region" aria-label="Painel de preferências de cookies">
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--oxford)', margin: '0' }}>Painel de preferências</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.55', color: 'var(--grafite)', margin: '6px 0 0' }}>As preferências de cookies poderão ser gerenciadas por meio do banner global e do painel de preferências integrado pelo CMS.</p>

                  <div className="cookie-prefs-grid">
                    <div className="cookie-pref is-locked">
                      <div className="cookie-pref-info">
                        <h4>Essenciais</h4>
                        <p>Indispensáveis ao funcionamento dos Canais — não podem ser desativados.</p>
                      </div>
                      <button className="cookie-toggle" type="button" aria-pressed="true" disabled aria-label="Cookies essenciais sempre ativos"></button>
                    </div>

                    <div className="cookie-pref">
                      <div className="cookie-pref-info">
                        <h4>Funcionais</h4>
                        <p>Memorizam suas preferências de idioma e modalidade para uma experiência mais fluida.</p>
                      </div>
                      <button className="cookie-toggle" type="button" aria-pressed="true" data-cookie-cat="funcionais" aria-label="Ativar ou desativar cookies funcionais"></button>
                    </div>

                    <div className="cookie-pref">
                      <div className="cookie-pref-info">
                        <h4>Analíticos</h4>
                        <p>Permitem medir audiência agregada para aprimorar continuamente os Canais.</p>
                      </div>
                      <button className="cookie-toggle" type="button" aria-pressed="false" data-cookie-cat="analiticos" aria-label="Ativar ou desativar cookies analíticos"></button>
                    </div>

                    <div className="cookie-pref is-locked">
                      <div className="cookie-pref-info">
                        <h4>Marketing</h4>
                        <p>Atualmente não utilizamos cookies de marketing — se passarmos a usar, comunicaremos previamente.</p>
                      </div>
                      <button className="cookie-toggle" type="button" aria-pressed="false" disabled aria-label="Cookies de marketing atualmente indisponíveis"></button>
                    </div>
                  </div>

                  <div className="cookie-prefs-actions">
                    <button className="btn btn--gold" type="button" data-action="save-prefs">Salvar preferências</button>
                    <button className="btn btn--secondary" type="button" data-action="accept-all">Aceitar todos</button>
                    <button className="btn btn--secondary" type="button" data-action="reject-all">Recusar não essenciais</button>
                  </div>
                </div>

                <h3>Controle no navegador</h3>
                <p>Adicionalmente, é possível bloquear ou excluir cookies diretamente nas configurações de cada navegador:</p>
                <ul>
                  <li>Google Chrome — <em>Configurações → Privacidade e segurança → Cookies e outros dados do site</em>;</li>
                  <li>Mozilla Firefox — <em>Preferências → Privacidade e Segurança → Cookies e dados do site</em>;</li>
                  <li>Microsoft Edge — <em>Configurações → Privacidade, pesquisa e serviços → Cookies</em>;</li>
                  <li>Safari — <em>Preferências → Privacidade → Cookies e dados de sites</em>.</li>
                </ul>
                <p>O bloqueio total de cookies essenciais pode comprometer o funcionamento das áreas autenticadas — em especial a Área do Participante e a Plataforma EventOn.</p>
              </section>

              {/* SEÇÃO 06 — RETENÇÃO DE COOKIES */}
              <section id="retencao-cookies" className="legal-section">
                <span className="secn-num">Seção 06</span>
                <h2>Retenção <em>de cookies</em></h2>
                <p>A duração de cada cookie está indicada na tabela da Seção 3. Em síntese:</p>
                <ul>
                  <li>Cookies de <strong>sessão</strong> são excluídos automaticamente ao encerrar a janela do navegador;</li>
                  <li>Cookies <strong>persistentes</strong> têm duração definida individualmente, sempre dentro do limite estritamente necessário à finalidade declarada;</li>
                  <li>O cookie de <strong>registro de consentimento</strong> (<code>ntc_consent</code>) tem duração de 12 meses, após o que o banner volta a ser exibido para colher um novo consentimento esclarecido.</li>
                </ul>
              </section>

              {/* SEÇÃO 07 — COOKIES DE TERCEIROS */}
              <section id="terceiros" className="legal-section">
                <span className="secn-num">Seção 07</span>
                <h2>Cookies de <em>terceiros</em></h2>
                <p>Quando recursos de terceiros forem incorporados aos Canais — por exemplo, eventual fonte tipográfica externa, reprodutor de vídeo ou conteúdo embutido —, podem ser instalados cookies por esses terceiros, sujeitos às respectivas políticas. O Grupo NTC seleciona prestadores com compromissos contratuais de proteção de dados e prioriza, sempre que viável, soluções que não exijam cookies de terceiros.</p>
                <p>O Usuário pode consultar, na tabela da Seção 3, a categoria do cookie e identificar se trata-se de cookie primário (do próprio domínio do Grupo NTC) ou de terceiro. A versão completa, sempre vigente, está publicada nesta página.</p>
              </section>

              {/* SEÇÃO 08 — ATUALIZAÇÕES DESTA POLÍTICA */}
              <section id="alteracoes-cook" className="legal-section">
                <span className="secn-num">Seção 08</span>
                <h2>Atualizações desta <em>Política</em></h2>
                <p>Esta Política de Cookies pode ser atualizada para refletir mudanças tecnológicas, regulatórias ou de governança institucional. A versão vigente, sua data de revisão e o histórico de versões estarão sempre disponíveis nesta página.</p>
                <p>Alterações substantivas — em especial novas categorias ou novos finalidades de cookies — implicarão novo banner de consentimento, exibido ao Usuário antes da aplicação prática da alteração.</p>
                <p><strong>Versão vigente:</strong> v1.0 · 14/05/2026.<br />
                Dúvidas ou solicitações relacionadas a cookies: <a href="mailto:dpo@institutontc.com.br">dpo@institutontc.com.br</a>.</p>
              </section>

            </div>
          </div>
        </div>
      </section>

      {/* CTA INSTITUCIONAL FINAL */}
      <section className="legal-cta-final" aria-label="Encerramento institucional">
        <div className="container legal-cta-final-inner fade-in">
          <p className="eyebrow gold" style={{ color: 'var(--dourado-soft)' }}>Instituto NTC do Brasil · Governança institucional</p>
          <h2>Quer revisar seus consentimentos de cookies? <em>É possível ajustar a qualquer momento.</em></h2>
          <p>Use o painel de preferências nesta página, o banner exibido na primeira visita ou as configurações do seu navegador. Para qualquer dúvida, o canal oficial é o do Encarregado (DPO).</p>
          <div className="legal-cta-final-actions">
            <a className="btn btn--gold" href="mailto:dpo@institutontc.com.br" data-cms-link="contato-dpo">Falar com o DPO →</a><Link className="btn btn--ghost-light" href="/lgpd#exercicio-direitos" data-cms-link="exercicio-direitos">Exercer direitos do titular</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
