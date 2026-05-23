import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LGPD — Governança Institucional · Grupo NTC",
  description:
    "LGPD — Governança Institucional do Grupo NTC · Programa de Privacidade, Encarregado (DPO), exercício dos direitos do titular, fluxo institucional de atendimento, relação com a ANPD e plano de incidentes.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.grupontc.com.br/lgpd",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "LGPD — Governança Institucional · Grupo NTC",
    description:
      "Programa institucional de proteção de dados pessoais do Instituto NTC do Brasil · Encarregado (DPO) e exercício de direitos.",
    url: "https://www.grupontc.com.br/lgpd",
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
    title: "LGPD — Governança Institucional · Grupo NTC",
    description:
      "Programa institucional de proteção de dados pessoais do Instituto NTC do Brasil · Encarregado (DPO) e exercício de direitos.",
  },
};

export default function LgpdPage() {
  return (
    <main id="main">

      {/* HERO INSTITUCIONAL */}
      <section className="hero-page" aria-label="Cabeçalho institucional · LGPD">
        <div className="hero-page-bg" aria-hidden="true"></div>
        <div className="container hero-page-content fade-in">
          <nav className="crumb" aria-label="Você está em">
            <Link href="/">Grupo NTC</Link>
            <span className="sep" aria-hidden="true"></span>
            <Link href="/mapa-do-site">Governança de dados</Link>
            <span className="sep" aria-hidden="true"></span>
            <span className="current">LGPD</span>
          </nav>

          <p className="eyebrow gold">Governança institucional · Grupo NTC · Edição 2026</p>
          <h1>LGPD<span className="accent">.</span><br />A governança institucional de proteção de dados do Grupo NTC.</h1>
          <p className="hero-page-sub">O <strong style={{ color: 'var(--pergaminho)' }}>Instituto NTC do Brasil</strong> compreende a proteção de dados pessoais como pilar inafastável da formação institucional pública. Esta página apresenta a estrutura institucional adotada para implementação da Lei n.º 13.709/2018 e os canais oficiais para o exercício dos direitos do titular.</p>
          <div className="hero-meta"><span><strong>Base legal:</strong> Lei n.º 13.709/2018</span><span><strong>Encarregado (DPO):</strong> dpo@institutontc.com.br</span><span><strong>Prazos:</strong> conforme LGPD (art. 19)</span></div>
        </div>
      </section>

      <nav className="legal-subnav" aria-label="Navegação interna da página">
        <div className="legal-subnav-inner">
          <a href="#posicionamento">Posicionamento institucional</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#agentes">Agentes de tratamento</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#principios">Princípios da LGPD</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#programa">Programa de Governança</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#dpo-canal">Encarregado (DPO)</a>
        </div>
      </nav>

      <section className="legal-shell">
        <div className="container">
          <div className="legal-grid">

            <aside className="legal-aside" aria-label="Sumário da página">
              <h4>Sumário</h4>
              <ol>
                <li><a href="#posicionamento">Posicionamento institucional</a></li>
                <li><a href="#agentes">Agentes de tratamento</a></li>
                <li><a href="#principios">Princípios da LGPD</a></li>
                <li><a href="#programa">Programa de Governança</a></li>
                <li><a href="#dpo-canal">Encarregado (DPO)</a></li>
                <li><a href="#exercicio-direitos">Exercício de direitos</a></li>
                <li><a href="#fluxo-atendimento">Fluxo institucional de atendimento</a></li>
                <li><a href="#relacao-anpd">Relação com a ANPD</a></li>
                <li><a href="#incidentes-lgpd">Plano de incidentes</a></li>
                <li><a href="#documentos">Documentos relacionados</a></li>
              </ol>
              <div className="legal-aside-foot">
                <strong>Vigência</strong>
                Revisada em 14/05/2026 pelo Encarregado de Tratamento de Dados (DPO) do Instituto NTC do Brasil.
              </div>
            </aside>

            <div className="legal-content">

              {/* SEÇÃO 01 — POSICIONAMENTO INSTITUCIONAL */}
              <section id="posicionamento" className="legal-section">
                <span className="secn-num">Seção 01</span>
                <h2>Posicionamento <em>institucional</em></h2>
                <p>O Instituto NTC do Brasil compreende a proteção de dados pessoais como pilar inafastável da formação institucional pública. Por isso, mantém um programa de governança formal de privacidade que se aplica integralmente a todas as marcas do <strong>Grupo NTC</strong> — Instituto NTC do Brasil, NTC Educação, NTC Gestão Pública, NTC Saúde — e à Plataforma EventOn.</p>
                <p>Esta página apresenta, de forma consolidada, a estrutura institucional adotada para implementação da <strong>Lei Geral de Proteção de Dados Pessoais — Lei n.º 13.709/2018 (LGPD)</strong>, os canais oficiais e os procedimentos para o exercício de direitos pelo titular.</p>
                <div className="legal-callout">
                  <span className="callout-label">Princípio editorial</span>
                  <p>Formação institucional pública não pode ser feita sem cuidado integral com os dados de quem nela confia. A LGPD não é, para o Grupo NTC, um exercício de conformidade — é um compromisso editorial.</p>
                </div>
              </section>

              {/* SEÇÃO 02 — AGENTES DE TRATAMENTO */}
              <section id="agentes" className="legal-section">
                <span className="secn-num">Seção 02</span>
                <h2>Agentes de <em>tratamento</em></h2>
                <p>Conforme a LGPD, o tratamento de dados pessoais envolve três figuras principais:</p>
                <table className="legal-table">
                  <thead>
                    <tr><th>Figura</th><th>Conceito</th><th>Quem é, no contexto Grupo NTC</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Controlador</strong></td><td>A quem competem as decisões sobre o tratamento de dados pessoais.</td><td>Instituto NTC do Brasil — CNPJ 10.614.200/0001-98.</td></tr>
                    <tr><td><strong>Operador</strong></td><td>Quem realiza o tratamento de dados em nome do controlador.</td><td>Prestadores de tecnologia, infraestrutura de eventos, e-mail transacional, contratualmente vinculados.</td></tr>
                    <tr><td><strong>Encarregado (DPO)</strong></td><td>Pessoa indicada como canal de comunicação entre controlador, titulares e ANPD.</td><td>Encarregado de Tratamento de Dados do Instituto NTC do Brasil — <a href="mailto:dpo@institutontc.com.br">dpo@institutontc.com.br</a>.</td></tr>
                  </tbody>
                </table>
                <p>Em programas contratados por instituições públicas, é frequente o regime de <strong>controle conjunto</strong> — caso em que o Instituto NTC do Brasil e a Instituição Contratante atuam em cooperação e responsabilidade compartilhada, sempre formalizados por instrumento contratual específico.</p>
              </section>

              {/* SEÇÃO 03 — PRINCÍPIOS DA LGPD */}
              <section id="principios" className="legal-section">
                <span className="secn-num">Seção 03</span>
                <h2>Princípios da <em>LGPD</em></h2>
                <p>Todas as decisões institucionais sobre tratamento de dados são orientadas pelos 10 princípios elencados no art. 6.º da LGPD:</p>
                <ol className="numbered">
                  <li><strong>Finalidade</strong> — propósito legítimo, específico, explícito e informado.</li>
                  <li><strong>Adequação</strong> — compatibilidade com a finalidade informada.</li>
                  <li><strong>Necessidade</strong> — coleta mínima dos dados estritamente necessários.</li>
                  <li><strong>Livre acesso</strong> — consulta facilitada e gratuita pelo titular.</li>
                  <li><strong>Qualidade dos dados</strong> — exatidão, clareza e atualização.</li>
                  <li><strong>Transparência</strong> — informações claras sobre o tratamento.</li>
                  <li><strong>Segurança</strong> — medidas técnicas e administrativas adequadas.</li>
                  <li><strong>Prevenção</strong> — adoção de medidas para evitar danos.</li>
                  <li><strong>Não discriminação</strong> — vedação ao uso para fins discriminatórios, ilícitos ou abusivos.</li>
                  <li><strong>Responsabilização e prestação de contas</strong> — demonstração da adoção de medidas eficazes.</li>
                </ol>
              </section>

              {/* SEÇÃO 04 — PROGRAMA DE GOVERNANÇA */}
              <section id="programa" className="legal-section">
                <span className="secn-num">Seção 04</span>
                <h2>Programa de <em>Governança</em></h2>
                <p>O Programa de Governança em Privacidade do Instituto NTC do Brasil é estruturado em sete frentes coordenadas pelo Encarregado:</p>
                <ul>
                  <li><strong>Cultura organizacional:</strong> capacitação contínua dos colaboradores e docentes em proteção de dados.</li>
                  <li><strong>Mapeamento e Registro de Operações de Tratamento (ROT):</strong> inventário vivo de todas as operações de tratamento, com bases legais, finalidades, retenção e responsáveis.</li>
                  <li><strong>Avaliação de impacto (RIPD):</strong> análise de risco sempre que uma nova operação envolver volumes significativos, dados sensíveis ou impacto sobre liberdades fundamentais.</li>
                  <li><strong>Gestão de operadores:</strong> due diligence prévia, contratação com cláusulas de proteção de dados e monitoramento periódico.</li>
                  <li><strong>Direitos dos titulares:</strong> canal exclusivo, fluxo formal e SLA de 15 dias úteis.</li>
                  <li><strong>Segurança da informação:</strong> políticas, controles técnicos e administrativos, testes periódicos.</li>
                  <li><strong>Resposta a incidentes:</strong> plano formal, equipe designada, comunicação à ANPD e aos titulares quando aplicável.</li>
                </ul>
              </section>

              {/* SEÇÃO 05 — ENCARREGADO (DPO) */}
              <section id="dpo-canal" className="legal-section">
                <span className="secn-num">Seção 05</span>
                <h2>Encarregado <em>(DPO)</em></h2>
                <p>O Encarregado (DPO) é o canal oficial de comunicação entre o controlador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD). Atua com autonomia funcional, recursos adequados e acesso direto à diretoria executiva do Instituto NTC do Brasil.</p>

                <div className="dpo-card" role="region" aria-label="Canal oficial do Encarregado (DPO)">
                  <div className="dpo-card-inner">
                    <div className="dpo-icon" aria-hidden="true">
                      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M24 4 8 11v11c0 9.6 6.5 18.3 16 22 9.5-3.7 16-12.4 16-22V11L24 4z" /><path d="M18 24l4 4 8-9" /></svg>
                    </div>
                    <div>
                      <h3>Encarregado (DPO) — Encarregado de Tratamento de Dados</h3>
                      <p><strong>E-mail oficial:</strong> <a href="mailto:dpo@institutontc.com.br" data-cms-link="contato-dpo">dpo@institutontc.com.br</a><br />
                      <strong>Endereço postal:</strong> SCS Quadra 9, Bloco C, Ed. Parque Cidade Corporate, Sala 1001, Asa Sul — Brasília – DF · CEP 70308-200 (A/C Encarregado de Tratamento de Dados)</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SEÇÃO 06 — EXERCÍCIO DE DIREITOS */}
              <section id="exercicio-direitos" className="legal-section">
                <span className="secn-num">Seção 06</span>
                <h2>Exercício de <em>direitos</em></h2>
                <p>O titular dos dados pode exercer todos os direitos previstos no art. 18 da LGPD enviando solicitação ao Encarregado (DPO). Para garantir atendimento ágil e seguro, recomenda-se:</p>
                <ol className="numbered">
                  <li>Acessar o e-mail <a href="mailto:dpo@institutontc.com.br">dpo@institutontc.com.br</a>;</li>
                  <li>Informar nome completo e e-mail vinculado ao tratamento, quando aplicável;</li>
                  <li>Indicar de forma objetiva o direito que se deseja exercer (confirmação, acesso, correção, eliminação, portabilidade, revogação de consentimento etc.);</li>
                  <li>Quando relevante, contextualizar o canal ou evento em que o tratamento ocorreu (por exemplo: &ldquo;Inscrição no Seminário Nacional EventOn de 12/04/2026&rdquo;).</li>
                </ol>
                <p>O atendimento será realizado nos prazos previstos na LGPD e na regulamentação aplicável. Quando cabível declaração completa nos termos do <strong>art. 19 da LGPD</strong>, a resposta será fornecida em até 15 dias, contados do recebimento da solicitação, ressalvadas hipóteses legalmente justificadas.</p>
                <p>O atendimento é gratuito. Em casos de manifestação repetitiva ou abusiva, o controlador poderá, fundamentadamente, recusar pedidos manifestamente infundados, conforme arts. 18, §6.º, e 19 da LGPD.</p>
              </section>

              {/* SEÇÃO 07 — FLUXO INSTITUCIONAL DE ATENDIMENTO */}
              <section id="fluxo-atendimento" className="legal-section">
                <span className="secn-num">Seção 07</span>
                <h2>Fluxo institucional de <em>atendimento</em></h2>
                <p>Toda solicitação relacionada à LGPD segue um fluxo formal documentado pelo Encarregado:</p>
                <ol className="numbered">
                  <li><strong>Recebimento e protocolo</strong> — registro imediato, atribuição de protocolo único e confirmação ao titular.</li>
                  <li><strong>Validação de identidade</strong> — confirmação razoável da identidade do solicitante para evitar fraude.</li>
                  <li><strong>Análise jurídica e operacional</strong> — verificação da pertinência, da base legal aplicável e dos sistemas envolvidos.</li>
                  <li><strong>Execução</strong> — atendimento concreto do pedido (envio dos dados, retificação, anonimização, eliminação, portabilidade, etc.).</li>
                  <li><strong>Resposta formal ao titular</strong> — comunicação estruturada do desfecho, com fundamentação adequada em caso de eventual recusa.</li>
                  <li><strong>Encerramento e registro</strong> — arquivamento do caso no histórico para futura prestação de contas.</li>
                </ol>
              </section>

              {/* SEÇÃO 08 — RELAÇÃO COM A ANPD */}
              <section id="relacao-anpd" className="legal-section">
                <span className="secn-num">Seção 08</span>
                <h2>Relação com a <em>ANPD</em></h2>
                <p>O Instituto NTC do Brasil reconhece a Autoridade Nacional de Proteção de Dados (ANPD) como autoridade competente para fiscalização, regulação e aplicação da LGPD. Mantém canal aberto de comunicação institucional, cumpre regulamentos editados pela Autoridade e responde tempestivamente a eventuais requisições.</p>
                <p>O titular cuja solicitação não tenha sido atendida pelo Encarregado, ou que entenda haver violação à LGPD, pode peticionar diretamente à ANPD, conforme arts. 18, §1.º, e 55-J, IV, da Lei.</p>
              </section>

              {/* SEÇÃO 09 — PLANO DE INCIDENTES */}
              <section id="incidentes-lgpd" className="legal-section">
                <span className="secn-num">Seção 09</span>
                <h2>Plano de <em>incidentes</em></h2>
                <p>O Instituto NTC do Brasil mantém Plano de Resposta a Incidentes formalmente aprovado, com a seguinte estrutura sumária:</p>
                <ul>
                  <li><strong>Detecção:</strong> alertas técnicos, comunicados de operadores ou de titulares dos dados, monitoramento contínuo.</li>
                  <li><strong>Acionamento:</strong> equipe interna de segurança, jurídico e Encarregado (DPO), com fluxo de escalonamento.</li>
                  <li><strong>Contenção:</strong> isolamento técnico do vetor, suspensão preventiva de acessos comprometidos.</li>
                  <li><strong>Avaliação de risco:</strong> análise do volume, natureza, gravidade e potencial de dano aos titulares dos dados.</li>
                  <li><strong>Comunicação:</strong> quando configurado incidente de segurança com dados pessoais que possa acarretar risco ou dano relevante aos titulares, o Instituto NTC do Brasil adotará as medidas de contenção, avaliação, registro e comunicação cabíveis, observando o prazo de <strong>até 3 dias úteis para comunicação à ANPD e aos titulares</strong>, quando aplicável, contado do conhecimento de que o incidente afetou dados pessoais, nos termos da regulamentação vigente da ANPD.</li>
                  <li><strong>Aprendizado:</strong> relatório pós-incidente e revisão dos controles preventivos.</li>
                </ul>
              </section>

              {/* SEÇÃO 10 — DOCUMENTOS RELACIONADOS */}
              <section id="documentos" className="legal-section">
                <span className="secn-num">Seção 10</span>
                <h2>Documentos <em>relacionados</em></h2>
                <p>Esta página deve ser lida em conjunto com os seguintes documentos institucionais:</p>
                <ul>
                  <li><Link href="/politica-de-privacidade" data-cms-link="legal-privacidade"><strong>Política de Privacidade</strong></Link> — detalhes do tratamento por finalidade e base legal.</li>
                  <li><Link href="/politica-de-cookies" data-cms-link="legal-cookies"><strong>Política de Cookies</strong></Link> — categorias, tabela e controles de preferência.</li>
                  <li><Link href="/termos-de-uso" data-cms-link="legal-termos"><strong>Termos de Uso</strong></Link> — regras de uso dos Canais Digitais.</li>
                  <li><Link href="/mapa-do-site" data-cms-link="legal-mapa-do-site"><strong>Mapa do site</strong></Link> — visão completa da estrutura institucional do portal.</li>
                </ul>
                <p><strong>Versão vigente:</strong> v1.0 · 14/05/2026. Toda alteração substantiva é revisada e aprovada pelo Encarregado.</p>
              </section>

            </div>
          </div>
        </div>
      </section>

      {/* CTA INSTITUCIONAL FINAL */}
      <section className="legal-cta-final" aria-label="Encerramento institucional">
        <div className="container legal-cta-final-inner fade-in">
          <p className="eyebrow gold" style={{ color: 'var(--dourado-soft)' }}>Instituto NTC do Brasil · Governança institucional</p>
          <h2>Quer exercer um direito do titular? <em>Fale diretamente com o Encarregado (DPO).</em></h2>
          <p>O Encarregado (DPO) do Instituto NTC do Brasil é o canal oficial para o exercício dos direitos do titular dos dados. O atendimento será realizado nos prazos previstos na LGPD e na regulamentação aplicável, conforme o fluxo institucional documentado nesta página.</p>
          <div className="legal-cta-final-actions">
            <a className="btn btn--gold" href="mailto:dpo@institutontc.com.br" data-cms-link="contato-dpo">Falar com o DPO →</a><Link className="btn btn--ghost-light" href="/lgpd#exercicio-direitos" data-cms-link="exercicio-direitos">Exercer direitos do titular</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
