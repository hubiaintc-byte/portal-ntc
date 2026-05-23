import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade · Grupo NTC",
  description:
    "Política de Privacidade do Instituto NTC do Brasil · LGPD · Lei 13.709/2018 · canais oficiais do Encarregado (DPO), direitos do titular, bases legais e governança institucional do Grupo NTC.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.grupontc.com.br/politica-de-privacidade",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Política de Privacidade · Grupo NTC",
    description:
      "Tratamento de dados pessoais no Grupo NTC: bases legais, direitos do titular, DPO e governança institucional.",
    url: "https://www.grupontc.com.br/politica-de-privacidade",
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
    title: "Política de Privacidade · Grupo NTC",
    description:
      "Tratamento de dados pessoais no Grupo NTC: bases legais, direitos do titular, DPO e governança institucional.",
  },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main id="main">

      {/* HERO INSTITUCIONAL */}
      <section className="hero-page" aria-label="Cabeçalho institucional · Política de Privacidade">
        <div className="hero-page-bg" aria-hidden="true"></div>
        <div className="container hero-page-content fade-in">
          <nav className="crumb" aria-label="Você está em">
            <Link href="/">Grupo NTC</Link>
            <span className="sep" aria-hidden="true"></span>
            <Link href="/mapa-do-site">Governança de dados</Link>
            <span className="sep" aria-hidden="true"></span>
            <span className="current">Política de Privacidade</span>
          </nav>

          <p className="eyebrow gold">Governança de dados · Grupo NTC · Edição 2026</p>
          <h1>Política de Privacidade<span className="accent">.</span><br />O cuidado com os dados que confiam a nós.</h1>
          <p className="hero-page-sub">Esta Política descreve, de forma transparente, quais dados pessoais o <strong style={{ color: 'var(--pergaminho)' }}>Instituto NTC do Brasil</strong> trata em seus canais, com que finalidades, sob quais bases legais, com quem podem ser compartilhados e como o titular exerce os direitos garantidos pela Lei Geral de Proteção de Dados.</p>
          <div className="hero-meta"><span><strong>Vigência:</strong> 14/05/2026</span><span><strong>Base legal:</strong> Lei n.º 13.709/2018 (LGPD)</span><span><strong>Encarregado:</strong> dpo@institutontc.com.br</span></div>
        </div>
      </section>

      <nav className="legal-subnav" aria-label="Navegação interna da página">
        <div className="legal-subnav-inner">
          <a href="#controlador">Quem somos · Controlador dos dados</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#escopo">Escopo desta Política</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#dados-coletados">Dados pessoais que tratamos</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#finalidades">Finalidades e bases legais</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#compartilhamento">Compartilhamento e operadores</a>
        </div>
      </nav>

      <section className="legal-shell">
        <div className="container">
          <div className="legal-grid">

            <aside className="legal-aside" aria-label="Sumário da página">
              <h4>Sumário</h4>
              <ol>
                <li><a href="#controlador">Quem somos · Controlador dos dados</a></li>
                <li><a href="#escopo">Escopo desta Política</a></li>
                <li><a href="#dados-coletados">Dados pessoais que tratamos</a></li>
                <li><a href="#finalidades">Finalidades e bases legais</a></li>
                <li><a href="#compartilhamento">Compartilhamento e operadores</a></li>
                <li><a href="#transferencia">Transferência internacional</a></li>
                <li><a href="#retencao">Retenção e descarte</a></li>
                <li><a href="#seguranca">Segurança da informação</a></li>
                <li><a href="#direitos">Direitos do titular</a></li>
                <li><a href="#encarregado">Encarregado (DPO) e canais</a></li>
                <li><a href="#incidentes">Incidentes e ANPD</a></li>
                <li><a href="#alteracoes">Atualizações e versões</a></li>
              </ol>
              <div className="legal-aside-foot">
                <strong>Vigência</strong>
                Revisada em 14/05/2026 pelo Encarregado de Tratamento de Dados (DPO) do Instituto NTC do Brasil.
              </div>
            </aside>

            <div className="legal-content">

              {/* SEÇÃO 01 — CONTROLADOR */}
              <section id="controlador" className="legal-section">
                <span className="secn-num">Seção 01</span>
                <h2>Quem somos · <em>Controlador dos dados</em></h2>
                <p>O <strong>Instituto NTC do Brasil</strong> (CNPJ 10.614.200/0001-98), com sede no SCS Quadra 9, Bloco C, Ed. Parque Cidade Corporate, Sala 1001, Asa Sul, Brasília – DF, CEP 70308-200, é o controlador dos dados pessoais tratados no âmbito desta Política. O Instituto opera as marcas <strong>Grupo NTC</strong>, <strong>NTC Educação</strong>, <strong>NTC Gestão Pública</strong>, <strong>NTC Saúde</strong> e a plataforma digital institucional <strong>EventOn</strong>.</p>
                <p>Esta Política descreve, de forma transparente, quais dados pessoais são coletados em nossos canais digitais e formativos, com que finalidades, sob quais bases legais, com quem podem ser compartilhados, por quanto tempo são retidos e como o titular pode exercer os direitos assegurados pela <strong>Lei Geral de Proteção de Dados Pessoais — Lei n.º 13.709/2018 (LGPD)</strong>.</p>
                <div className="legal-callout">
                  <span className="callout-label">Princípio editorial</span>
                  <p>Tratamos dados pessoais com a mesma responsabilidade institucional com que conduzimos a formação de servidores públicos — finalidade declarada, base legal explícita, mínima coleta necessária e ciclo de vida monitorado.</p>
                </div>
              </section>

              {/* SEÇÃO 02 — ESCOPO */}
              <section id="escopo" className="legal-section">
                <span className="secn-num">Seção 02</span>
                <h2>Escopo desta <em>Política</em></h2>
                <p>Esta Política aplica-se ao tratamento de dados pessoais realizado:</p>
                <ul>
                  <li>nos sítios eletrônicos institucionais do Grupo NTC (<code>institutontc.com.br</code>, <code>grupontc.com.br</code> e subdomínios);</li>
                  <li>na Plataforma EventOn e na Área do Participante;</li>
                  <li>nos formulários de contato, inscrição, proposta institucional e inscrição em grupo;</li>
                  <li>nos eventos abertos, fechados, online, presenciais e híbridos coordenados pelo Instituto NTC do Brasil;</li>
                  <li>nas comunicações eletrônicas institucionais (e-mail, WhatsApp institucional e canais oficiais).</li>
                </ul>
                <p>Esta Política não disciplina o tratamento de dados realizado pelas instituições contratantes em suas próprias plataformas, sistemas internos ou bases de dados — sobre os quais o Grupo NTC atua, quando for o caso, como <strong>operador</strong>, conforme contrato de prestação de serviço e Termo de Cooperação Institucional.</p>
              </section>

              {/* SEÇÃO 03 — DADOS COLETADOS */}
              <section id="dados-coletados" className="legal-section">
                <span className="secn-num">Seção 03</span>
                <h2>Dados pessoais que <em>tratamos</em></h2>
                <p>Coletamos apenas os dados estritamente necessários para o cumprimento da finalidade declarada em cada ponto de coleta. As categorias de dados, organizadas por contexto, são:</p>

                <table className="legal-table">
                  <thead>
                    <tr><th>Categoria</th><th>Exemplos</th><th>Ponto de coleta</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Identificação</strong></td><td>Nome completo, CPF (apenas quando exigido pela emissão de certificado), e-mail institucional, telefone, cargo, instituição vinculada.</td><td>Formulários de inscrição, proposta, contato, EventOn.</td></tr>
                    <tr><td><strong>Profissional / vinculo institucional</strong></td><td>Órgão de atuação, esfera (federal/estadual/municipal), área (educação, gestão pública, saúde), nível de cargo.</td><td>Formulários institucionais e inscrição de equipe.</td></tr>
                    <tr><td><strong>Participação em formação</strong></td><td>Eventos inscritos, presença, conclusão modular, materiais acessados, certificados emitidos.</td><td>Plataforma EventOn · Área do Participante.</td></tr>
                    <tr><td><strong>Navegação e técnica</strong></td><td>Endereço IP, agente de usuário (browser), tipo de dispositivo, páginas acessadas, duração da sessão, referenciador (referrer).</td><td>Cookies analíticos (com consentimento prévio).</td></tr>
                    <tr><td><strong>Comunicação</strong></td><td>Conteúdo das mensagens enviadas espontaneamente pelo titular em formulários, e-mails ou WhatsApp institucional.</td><td>Canais de atendimento.</td></tr>
                  </tbody>
                </table>

                <p>O Grupo NTC <strong>não coleta dados pessoais sensíveis</strong> (origem racial ou étnica, convicção religiosa, opinião política, filiação sindical, dado referente à saúde ou à vida sexual, dado genético ou biométrico) salvo quando estritamente necessário e mediante consentimento específico e destacado — hipótese excepcional aplicável apenas a programas que envolvam pesquisa institucional autorizada, e sempre comunicada formalmente ao titular antes da coleta.</p>
              </section>

              {/* SEÇÃO 04 — FINALIDADES E BASES LEGAIS */}
              <section id="finalidades" className="legal-section">
                <span className="secn-num">Seção 04</span>
                <h2>Finalidades e <em>bases legais</em></h2>
                <p>Cada operação de tratamento é amparada em uma base legal específica do art. 7.º da LGPD, registrada no <strong>Registro de Operações de Tratamento (ROT)</strong> mantido pelo Encarregado de Dados:</p>

                <table className="legal-table">
                  <thead>
                    <tr><th>Finalidade</th><th>Base legal · Art. 7.º LGPD</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Resposta a contato institucional, dúvida ou solicitação de proposta.</td><td>Art. 7.º, V — <strong>execução de procedimentos preliminares a contrato</strong>.</td></tr>
                    <tr><td>Inscrição em evento, controle de presença, emissão de certificado, gestão da Área do Participante.</td><td>Art. 7.º, V — <strong>execução de contrato</strong> firmado entre o Instituto NTC do Brasil e a instituição contratante ou o titular.</td></tr>
                    <tr><td>Atendimento a obrigações tributárias, contábeis e regulatórias (emissão de nota fiscal, escrituração).</td><td>Art. 7.º, II — <strong>cumprimento de obrigação legal ou regulatória</strong>.</td></tr>
                    <tr><td>Segurança da informação, prevenção a fraude e proteção do crédito.</td><td>Art. 7.º, IX — <strong>legítimo interesse</strong> do controlador, com teste de balanceamento documentado.</td></tr>
                    <tr><td>Análise estatística agregada, métricas de uso, melhoria contínua dos canais.</td><td>Art. 7.º, IX — <strong>legítimo interesse</strong>, ou Art. 7.º, I — <strong>consentimento</strong> (cookies analíticos).</td></tr>
                    <tr><td>Envio de comunicações editoriais (newsletter, agenda de eventos, conteúdos institucionais).</td><td>Art. 7.º, I — <strong>consentimento</strong>, revogável a qualquer tempo.</td></tr>
                    <tr><td>Atendimento à requisição de autoridade competente.</td><td>Art. 7.º, III — <strong>cumprimento de ordem legal regular</strong>.</td></tr>
                  </tbody>
                </table>

                <p>O consentimento, quando exigido, é colhido de forma destacada, livre, informada e inequívoca, e pode ser revogado pelo titular a qualquer momento, sem prejuízo da licitude do tratamento realizado antes da revogação.</p>
              </section>

              {/* SEÇÃO 05 — COMPARTILHAMENTO E OPERADORES */}
              <section id="compartilhamento" className="legal-section">
                <span className="secn-num">Seção 05</span>
                <h2>Compartilhamento e <em>operadores</em></h2>
                <p>O Grupo NTC <strong>não comercializa dados pessoais</strong>. O compartilhamento ocorre apenas com agentes estritamente necessários à execução das finalidades acima:</p>

                <ul>
                  <li><strong>Operadores de tecnologia</strong> — provedores de hospedagem, e-mail transacional, infraestrutura de transmissão da Plataforma EventOn, plataforma de assinatura digital, plataforma de pagamentos — todos vinculados por contrato com cláusulas de proteção de dados conforme art. 39 da LGPD.</li>
                  <li><strong>Docentes e palestrantes</strong> — apenas os dados necessários para conferência da presença no momento da realização do evento, sem retenção posterior pelos docentes.</li>
                  <li><strong>Instituição contratante</strong> — quando a inscrição é feita por uma instituição pública contratante, esta recebe o relatório institucional de participação dos servidores indicados, na qualidade de controladora conjunta dos dados de seus próprios servidores.</li>
                  <li><strong>Autoridades competentes</strong> — mediante requisição formal e regular, no estrito limite da ordem recebida.</li>
                </ul>
                <p>Todos os operadores contratados pelo Instituto NTC do Brasil são submetidos a um <strong>processo prévio de due diligence de proteção de dados</strong>, incluindo análise contratual, avaliação de medidas técnicas e administrativas, e monitoramento periódico.</p>
              </section>

              {/* SEÇÃO 06 — TRANSFERÊNCIA INTERNACIONAL */}
              <section id="transferencia" className="legal-section">
                <span className="secn-num">Seção 06</span>
                <h2>Transferência <em>internacional</em></h2>
                <p>Determinados operadores de infraestrutura tecnológica utilizados pelo Instituto NTC do Brasil podem manter parte da operação em servidores localizados fora do território nacional. Quando isso ocorre, a transferência internacional é amparada em uma das hipóteses do art. 33 da LGPD — preferencialmente <strong>cláusulas contratuais específicas</strong> ou <strong>normas corporativas globais</strong> aprovadas pela Autoridade Nacional de Proteção de Dados (ANPD) quando disponíveis.</p>
                <p>O titular pode, a qualquer tempo, solicitar ao DPO informações detalhadas sobre os países envolvidos, os fundamentos da transferência e as garantias adotadas para o seu caso específico.</p>
              </section>

              {/* SEÇÃO 07 — RETENÇÃO E DESCARTE */}
              <section id="retencao" className="legal-section">
                <span className="secn-num">Seção 07</span>
                <h2>Retenção e <em>descarte</em></h2>
                <p>Os dados pessoais são retidos apenas pelo tempo estritamente necessário ao cumprimento da finalidade que motivou sua coleta, observados os prazos legais aplicáveis:</p>
                <ul>
                  <li><strong>Dados de inscrição e certificação:</strong> retidos por <strong>até 10 anos</strong> a contar da emissão do certificado, para fins de comprovação de formação e atendimento a auditorias.</li>
                  <li><strong>Dados de contato institucional sem contrato firmado:</strong> retidos por <strong>até 24 meses</strong> a partir da última interação significativa.</li>
                  <li><strong>Dados fiscais e contábeis:</strong> retidos pelo prazo prescricional aplicável à legislação fiscal correspondente — usualmente 5 anos.</li>
                  <li><strong>Dados de navegação técnica:</strong> retidos por períodos variáveis conforme a categoria do cookie, detalhados na <a href="/politica-de-cookies">Política de Cookies</a>.</li>
                  <li><strong>Comunicações por e-mail e WhatsApp:</strong> retidas pelo período necessário ao atendimento, com expurgo posterior salvo necessidade de evidência contratual ou regulatória.</li>
                </ul>
                <p>Findo o prazo de retenção, os dados são eliminados de forma segura ou anonimizados de modo irreversível, conforme arts. 15 e 16 da LGPD.</p>
              </section>

              {/* SEÇÃO 08 — SEGURANÇA DA INFORMAÇÃO */}
              <section id="seguranca" className="legal-section">
                <span className="secn-num">Seção 08</span>
                <h2>Segurança da <em>informação</em></h2>
                <p>O Instituto NTC do Brasil adota medidas técnicas e administrativas para proteção dos dados pessoais contra acessos não autorizados, perda, alteração, divulgação ou destruição indevida:</p>
                <ul>
                  <li>Transmissão criptografada (HTTPS/TLS) em todos os formulários e canais digitais;</li>
                  <li>Controle de acesso por identidade e perfil, com princípio do menor privilégio;</li>
                  <li>Armazenamento segregado e backups periódicos com criptografia em repouso;</li>
                  <li>Política interna de mesa limpa, tela limpa e gestão de dispositivos institucionais;</li>
                  <li>Programa contínuo de capacitação interna em proteção de dados e segurança da informação;</li>
                  <li>Plano de resposta a incidentes com fluxos definidos de comunicação ao titular e à ANPD.</li>
                </ul>
                <p>Apesar de todos os esforços razoáveis, nenhuma medida de segurança é absoluta. Por isso, o titular também é parte essencial da proteção dos seus dados — mantendo credenciais sigilosas, atualizando senhas periodicamente e comunicando imediatamente qualquer suspeita de uso indevido.</p>
              </section>

              {/* SEÇÃO 09 — DIREITOS DO TITULAR */}
              <section id="direitos" className="legal-section">
                <span className="secn-num">Seção 09</span>
                <h2>Direitos do <em>titular</em></h2>
                <p>Conforme art. 18 da LGPD, o titular dos dados pessoais pode exercer, a qualquer momento e mediante requisição formal, os seguintes direitos:</p>

                <ol className="numbered">
                  <li><strong>Confirmação</strong> da existência de tratamento de dados pessoais que o identifiquem.</li>
                  <li><strong>Acesso</strong> aos dados pessoais tratados.</li>
                  <li><strong>Correção</strong> de dados incompletos, inexatos ou desatualizados.</li>
                  <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.</li>
                  <li><strong>Portabilidade</strong> dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa, observados os segredos comercial e industrial.</li>
                  <li><strong>Eliminação</strong> dos dados tratados com o consentimento do titular, ressalvadas as hipóteses de guarda legal.</li>
                  <li><strong>Informação</strong> sobre as entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados.</li>
                  <li><strong>Informação</strong> sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa.</li>
                  <li><strong>Revogação do consentimento</strong>, a qualquer momento, mediante manifestação expressa do titular.</li>
                  <li><strong>Oposição</strong> ao tratamento realizado com fundamento em uma das hipóteses de dispensa de consentimento, em caso de descumprimento ao disposto na LGPD.</li>
                </ol>

                <p>A requisição pode ser feita pelos canais oficiais descritos na seção seguinte. O atendimento será realizado nos prazos previstos na LGPD e na regulamentação aplicável. Quando cabível declaração completa nos termos do <strong>art. 19 da LGPD</strong>, a resposta será fornecida em até 15 dias, contados do recebimento da solicitação, ressalvadas hipóteses legalmente justificadas — sempre com ciência prévia ao titular dos dados.</p>
              </section>

              {/* SEÇÃO 10 — ENCARREGADO (DPO) */}
              <section id="encarregado" className="legal-section">
                <span className="secn-num">Seção 10</span>
                <h2>Encarregado (DPO) e <em>canais oficiais</em></h2>

                <div className="dpo-card" role="region" aria-label="Canal oficial do Encarregado de Tratamento de Dados">
                  <div className="dpo-card-inner">
                    <div className="dpo-icon" aria-hidden="true">
                      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M24 4 8 11v11c0 9.6 6.5 18.3 16 22 9.5-3.7 16-12.4 16-22V11L24 4z" /><path d="M18 24l4 4 8-9" /></svg>
                    </div>
                    <div>
                      <h3>Encarregado (DPO) — Encarregado de Tratamento de Dados</h3>
                      <p>Canal exclusivo e prioritário para o exercício dos direitos do titular dos dados: <a href="mailto:dpo@institutontc.com.br" data-cms-link="contato-dpo">dpo@institutontc.com.br</a>. O atendimento observará os prazos previstos na LGPD e na regulamentação aplicável; quando cabível declaração completa nos termos do art. 19 da LGPD, a resposta será fornecida em até 15 dias, contados do recebimento, ressalvadas hipóteses legalmente justificadas.</p>
                    </div>
                  </div>
                </div>

                <p>Os canais oficiais para exercício de direitos, dúvidas ou denúncias relacionadas à proteção de dados são:</p>
                <ul>
                  <li><strong>E-mail do Encarregado (DPO):</strong> <a href="mailto:dpo@institutontc.com.br">dpo@institutontc.com.br</a> — canal preferencial.</li>
                  <li><strong>Endereço postal:</strong> SCS Quadra 9, Bloco C, Ed. Parque Cidade Corporate, Sala 1001, Asa Sul · Brasília – DF · CEP 70308-200 · A/C Encarregado de Tratamento de Dados.</li>
                  <li><strong>Atendimento institucional:</strong> (63) 3212-1199 (horário comercial, dias úteis).</li>
                </ul>
                <p>Para agilidade no atendimento, recomenda-se que a solicitação contenha: nome completo; e-mail vinculado ao tratamento (se houver); descrição clara do direito que se deseja exercer; e, quando aplicável, eventos ou canais de coleta envolvidos.</p>
              </section>

              {/* SEÇÃO 11 — INCIDENTES E ANPD */}
              <section id="incidentes" className="legal-section">
                <span className="secn-num">Seção 11</span>
                <h2>Incidentes e <em>comunicação à ANPD</em></h2>
                <p>O Instituto NTC do Brasil mantém um plano formal de resposta a incidentes que envolvam dados pessoais. Detectada uma ocorrência relevante:</p>
                <ul>
                  <li>O time de segurança da informação e o Encarregado (DPO) são acionados imediatamente, instaurando-se um <strong>plano de contenção</strong>.</li>
                  <li>É realizada avaliação da gravidade, do volume e da natureza dos dados envolvidos, do risco aos direitos e liberdades dos titulares dos dados e das medidas de mitigação aplicáveis.</li>
                  <li>Quando configurado incidente de segurança com dados pessoais que possa acarretar risco ou dano relevante aos titulares, o Instituto NTC do Brasil adotará as medidas de contenção, avaliação, registro e comunicação cabíveis, observando o prazo de <strong>até 3 dias úteis para comunicação à ANPD e aos titulares</strong>, quando aplicável, contado do conhecimento de que o incidente afetou dados pessoais, nos termos da regulamentação vigente da ANPD.</li>
                  <li>É realizado relatório pós-incidente com recomendações de aperfeiçoamento, internalizadas no programa de governança.</li>
                </ul>
              </section>

              {/* SEÇÃO 12 — ATUALIZAÇÕES E VERSÕES */}
              <section id="alteracoes" className="legal-section">
                <span className="secn-num">Seção 12</span>
                <h2>Atualizações e <em>versões</em></h2>
                <p>Esta Política pode ser atualizada periodicamente para refletir mudanças regulatórias, evoluções tecnológicas ou aperfeiçoamentos no programa de privacidade. A versão vigente, sua data de revisão e o histórico de alterações estarão sempre disponíveis nesta página.</p>
                <p><strong>Versão atual:</strong> v1.0 · 14/05/2026.<br />
                <strong>Última revisão pelo DPO:</strong> 14/05/2026.</p>
                <p>Recomenda-se a consulta periódica. Alterações substantivas que impliquem novas finalidades ou novas bases legais serão objeto de comunicação prévia e expressa aos titulares ativos.</p>
              </section>

            </div>
          </div>
        </div>
      </section>

      {/* CTA INSTITUCIONAL FINAL */}
      <section className="legal-cta-final" aria-label="Encerramento institucional">
        <div className="container legal-cta-final-inner fade-in">
          <p className="eyebrow gold" style={{ color: 'var(--dourado-soft)' }}>Instituto NTC do Brasil · Governança institucional</p>
          <h2>Dúvidas, solicitações ou exercício de direitos? <em>Fale com o Encarregado (DPO).</em></h2>
          <p>O Encarregado (DPO) do Instituto NTC do Brasil é o canal oficial para qualquer questão envolvendo dados pessoais nos canais do Grupo NTC. O atendimento observará os prazos previstos na LGPD e na regulamentação aplicável.</p>
          <div className="legal-cta-final-actions">
            <a className="btn btn--gold" href="mailto:dpo@institutontc.com.br" data-cms-link="contato-dpo">Falar com o DPO →</a><a className="btn btn--ghost-light" href="/lgpd#exercicio-direitos" data-cms-link="exercicio-direitos">Exercer direitos do titular</a>
          </div>
        </div>
      </section>

    </main>
  );
}
