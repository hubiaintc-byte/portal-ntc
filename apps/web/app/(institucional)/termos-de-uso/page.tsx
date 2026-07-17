import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso · Grupo NTC",
  description:
    "Termos de Uso dos Canais Digitais do Grupo NTC · sítios institucionais, Plataforma EventOn e Área do Participante · regras de acesso, propriedade intelectual, certificação, contratos institucionais e foro.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.grupontc.com.br/termos-de-uso",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Termos de Uso · Grupo NTC",
    description:
      "Regras de uso dos canais digitais, da Plataforma EventOn e dos eventos formativos do Grupo NTC.",
    url: "https://www.grupontc.com.br/termos-de-uso",
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
    title: "Termos de Uso · Grupo NTC",
    description:
      "Regras de uso dos canais digitais, da Plataforma EventOn e dos eventos formativos do Grupo NTC.",
  },
};

export default function TermosDeUsoPage() {
  return (
    <main id="main">

      {/* HERO INSTITUCIONAL */}
      <section className="hero-page" aria-label="Cabeçalho institucional · Termos de Uso">
        <div className="hero-page-bg" aria-hidden="true"></div>
        <div className="container hero-page-content fade-in">
          <nav className="crumb" aria-label="Você está em">
            <Link href="/">Grupo NTC</Link>
            <span className="sep" aria-hidden="true"></span>
            <Link href="/mapa-do-site">Governança de dados</Link>
            <span className="sep" aria-hidden="true"></span>
            <span className="current">Termos de Uso</span>
          </nav>

          <p className="eyebrow gold">Governança institucional · Grupo NTC · Edição 2026</p>
          <h1>Termos de Uso<span className="accent">.</span><br />As regras que organizam o acesso aos canais do Grupo NTC.</h1>
          <p className="hero-page-sub">Estes Termos regem a relação entre o <strong style={{ color: 'var(--pergaminho)' }}>Instituto NTC do Brasil</strong> e qualquer pessoa que acesse ou utilize os canais digitais e formativos do Grupo NTC — sítios institucionais, Plataforma EventOn, Área do Participante e eventos online, presenciais ou híbridos.</p>
          <div className="hero-meta"><span><strong>Vigência:</strong> 14/05/2026</span><span><strong>Foro:</strong> Brasília – DF</span><span><strong>Atendimento:</strong> contato@institutontc.com.br</span></div>
        </div>
      </section>

      <nav className="legal-subnav" aria-label="Navegação interna da página">
        <div className="legal-subnav-inner">
          <a href="#aceite">Aceite e vigência</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#objeto">Objeto dos Termos</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#definicoes">Definições</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#cadastro">Cadastro e acesso</a><span className="legal-subnav-sep" aria-hidden="true">·</span><a href="#conduta">Conduta e responsabilidades</a>
        </div>
      </nav>

      <section className="legal-shell">
        <div className="container">
          <div className="legal-grid">

            <aside className="legal-aside" aria-label="Sumário da página">
              <h4>Sumário</h4>
              <ol>
                <li><a href="#aceite">Aceite e vigência</a></li>
                <li><a href="#objeto">Objeto dos Termos</a></li>
                <li><a href="#definicoes">Definições</a></li>
                <li><a href="#cadastro">Cadastro e acesso</a></li>
                <li><a href="#conduta">Conduta e responsabilidades</a></li>
                <li><a href="#propriedade">Propriedade intelectual</a></li>
                <li><a href="#conteudo">Conteúdo, replay e certificação</a></li>
                <li><a href="#pagamentos">Inscrições, pagamentos e contratos</a></li>
                <li><a href="#limitacao">Limitação de responsabilidade</a></li>
                <li><a href="#rescisao">Suspensão e rescisão</a></li>
                <li><a href="#alteracoes-termos">Alteração dos Termos</a></li>
                <li><a href="#foro">Lei aplicável e foro</a></li>
              </ol>
              <div className="legal-aside-foot">
                <strong>Vigência</strong>
                Revisada em 14/05/2026 pelo Encarregado de Tratamento de Dados (DPO) do Instituto NTC do Brasil.
              </div>
            </aside>

            <div className="legal-content">

              {/* SEÇÃO 01 — ACEITE E VIGÊNCIA */}
              <section id="aceite" className="legal-section">
                <span className="secn-num">Seção 01</span>
                <h2>Aceite e <em>vigência</em></h2>
                <p>Estes Termos de Uso regem a relação jurídica entre o <strong>Instituto NTC do Brasil</strong>, CNPJ 10.614.200/0001-98 (&ldquo;Grupo NTC&rdquo;), e qualquer pessoa que acesse, navegue, se cadastre ou utilize os canais digitais e formativos do Grupo NTC (&ldquo;Usuário&rdquo;), incluindo os sítios institucionais, a Plataforma EventOn, a Área do Participante e os eventos online, presenciais ou híbridos.</p>
                <p>O Usuário declara conhecer, ler e aceitar integralmente estes Termos no momento em que (i) realiza inscrição em qualquer evento, (ii) cria credencial na Plataforma EventOn, (iii) submete formulário institucional ou (iv) navega ativamente em áreas protegidas. A continuidade da navegação implica aceite tácito.</p>
                <p>Caso o Usuário não concorde com qualquer cláusula, deve abster-se de utilizar os canais. Estes Termos devem ser lidos em conjunto com a <Link href="/politica-de-privacidade">Política de Privacidade</Link>, a <Link href="/politica-de-cookies">Política de Cookies</Link> e a página <Link href="/lgpd">LGPD — Governança Institucional</Link>.</p>
              </section>

              {/* SEÇÃO 02 — OBJETO DOS TERMOS */}
              <section id="objeto" className="legal-section">
                <span className="secn-num">Seção 02</span>
                <h2>Objeto dos <em>Termos</em></h2>
                <p>Os canais digitais do Grupo NTC têm como objeto a divulgação institucional, comercialização de programas e eventos formativos e a entrega de capacitação profissional para servidores públicos, gestores e técnicos de instituições públicas e privadas dos setores de educação, gestão pública e saúde.</p>
                <p>Os canais não se destinam a serviços de consultoria personalizada, parecer técnico individual ou suporte operacional permanente a órgãos contratantes — para essas finalidades, há instrumentos contratuais específicos firmados em separado entre as partes.</p>
              </section>

              {/* SEÇÃO 03 — DEFINIÇÕES */}
              <section id="definicoes" className="legal-section">
                <span className="secn-num">Seção 03</span>
                <h2>Definições</h2>
                <table className="legal-table">
                  <thead><tr><th>Termo</th><th>Significado nestes Termos</th></tr></thead>
                  <tbody>
                    <tr><td><strong>Usuário</strong></td><td>Qualquer pessoa natural ou jurídica que acesse os canais do Grupo NTC.</td></tr>
                    <tr><td><strong>Participante</strong></td><td>Usuário regularmente inscrito em um evento ou programa formativo do Grupo NTC.</td></tr>
                    <tr><td><strong>Instituição Contratante</strong></td><td>Pessoa jurídica de direito público ou privado que contrata o Grupo NTC para a prestação de serviços formativos a seus servidores ou colaboradores.</td></tr>
                    <tr><td><strong>EventOn</strong></td><td>Plataforma digital institucional do Grupo NTC para entrega de eventos, replay restrito, materiais e certificação.</td></tr>
                    <tr><td><strong>Área do Participante</strong></td><td>Ambiente logado da Plataforma EventOn destinado a participantes individuais.</td></tr>
                    <tr><td><strong>Canais Digitais</strong></td><td>Os sítios institucionais, a Plataforma EventOn, a Área do Participante e demais aplicações operadas pelo Instituto NTC do Brasil.</td></tr>
                  </tbody>
                </table>
              </section>

              {/* SEÇÃO 04 — CADASTRO E ACESSO */}
              <section id="cadastro" className="legal-section">
                <span className="secn-num">Seção 04</span>
                <h2>Cadastro e <em>acesso</em></h2>
                <p>Para acesso a recursos restritos — em especial a Área do Participante — o Usuário deverá realizar cadastro fornecendo informações verdadeiras, completas e atualizadas. É de responsabilidade do Usuário:</p>
                <ul>
                  <li>Manter sob sigilo a credencial de acesso (CPF e senha pessoal), respondendo integralmente por toda atividade realizada com sua identidade;</li>
                  <li>Notificar imediatamente o suporte (<a href="mailto:suporte@institutontc.com.br">suporte@institutontc.com.br</a>) em caso de suspeita de uso não autorizado;</li>
                  <li>Não compartilhar acessos, mesmo com colegas da mesma instituição contratante — a certificação é nominal e está atrelada a uma única identidade.</li>
                </ul>
                <p>O Grupo NTC pode, a qualquer momento, exigir comprovação documental do vínculo institucional declarado, especialmente em programas reservados a categorias específicas de servidores.</p>
              </section>

              {/* SEÇÃO 05 — CONDUTA E RESPONSABILIDADES */}
              <section id="conduta" className="legal-section">
                <span className="secn-num">Seção 05</span>
                <h2>Conduta e <em>responsabilidades</em></h2>
                <p>Ao utilizar os Canais Digitais, o Usuário compromete-se a:</p>
                <ol className="numbered">
                  <li>Cumprir a legislação brasileira aplicável, em especial o Marco Civil da Internet (Lei n.º 12.965/2014), a LGPD (Lei n.º 13.709/2018) e a Lei de Direitos Autorais (Lei n.º 9.610/1998);</li>
                  <li>Não realizar engenharia reversa, scraping massivo, desofuscação ou qualquer tentativa de subverter os mecanismos de segurança;</li>
                  <li>Não reproduzir, redistribuir, gravar, retransmitir ou compartilhar publicamente qualquer conteúdo formativo (aulas ao vivo, replay, materiais, slides) sem autorização expressa e escrita do Grupo NTC;</li>
                  <li>Não utilizar os Canais para finalidade ilícita, difamatória, discriminatória, fraudulenta ou que viole direitos de terceiros;</li>
                  <li>Adotar postura cordial e institucionalmente compatível nas interações com docentes, demais participantes e equipe de atendimento.</li>
                </ol>
                <div className="legal-callout">
                  <span className="callout-label">Cláusula institucional</span>
                  <p>O Grupo NTC poderá remover comentários, bloquear acessos ou cancelar inscrições em casos comprovados de violação destes Termos, avaliando eventual reembolso conforme a gravidade da conduta, a etapa de execução do serviço e a legislação aplicável, sem prejuízo das medidas legais cabíveis.</p>
                </div>
              </section>

              {/* SEÇÃO 06 — PROPRIEDADE INTELECTUAL */}
              <section id="propriedade" className="legal-section">
                <span className="secn-num">Seção 06</span>
                <h2>Propriedade <em>intelectual</em></h2>
                <p>Todo o conteúdo disponibilizado nos Canais Digitais — incluindo, sem limitação, textos, imagens, vídeos, mockups, ementas, materiais didáticos, identidade visual, paleta cromática &ldquo;Soberana 2026&rdquo;, marcas, logotipos, programas formativos (PROGE · EDUTEC · PEAR · PEI · PROGIR · EGIDE · PINEI · VIVAESCOLA · FUTURA · LIDERA · AGIP · SIGA · PROSUS+ · PROAPS+ · SIGS), nomes dos programas, codinomes de produtos e a expressão <em>&ldquo;Inteligência institucional. Impacto real.&rdquo;</em> — é de titularidade exclusiva do Instituto NTC do Brasil ou de seus licenciantes, devidamente autorizado.</p>
                <p>O acesso ao conteúdo não transfere qualquer direito de propriedade, sendo concedida ao Participante apenas <strong>licença pessoal, intransferível, não exclusiva e revogável</strong> para uso individual com finalidade exclusivamente formativa, durante o período de vigência da inscrição.</p>
                <p>É vedado, sem autorização prévia e expressa: comercialização do conteúdo, incorporação em cursos de terceiros, criação de obra derivada, sublicenciamento ou utilização da marca Grupo NTC para fins promocionais não autorizados.</p>
              </section>

              {/* SEÇÃO 07 — CONTEÚDO, REPLAY E CERTIFICAÇÃO */}
              <section id="conteudo" className="legal-section">
                <span className="secn-num">Seção 07</span>
                <h2>Conteúdo, replay e <em>certificação</em></h2>
                <p>A entrega formativa contratada inclui:</p>
                <ul>
                  <li><strong>Acesso ao vivo</strong> durante a realização do evento, com controle de presença e moderação institucional;</li>
                  <li><strong>Replay restrito</strong> disponibilizado por prazo determinado para Participantes inscritos, com controle de acesso e rastreamento individual de visualizações;</li>
                  <li><strong>Materiais de apoio</strong> em formato digital, disponíveis na Área do Participante durante o período definido para cada evento;</li>
                  <li><strong>Certificação digital</strong> validável mediante código institucional e QR Code, emitida quando atendidos os critérios pedagógicos do evento (presença mínima, conclusão das atividades).</li>
                </ul>
                <p>A certificação é nominal, intransferível e atestada pelo Instituto NTC do Brasil. Caso o Participante não atenda aos critérios pedagógicos, o certificado não será emitido, sem que isso implique direito a reembolso.</p>
                <p>O Grupo NTC poderá, por motivo justificado, alterar datas, formato (presencial/online/híbrido) ou docentes de um evento, comunicando previamente os Participantes inscritos e mantendo as condições essenciais da entrega.</p>
              </section>

              {/* SEÇÃO 08 — INSCRIÇÕES, PAGAMENTOS E CONTRATOS */}
              <section id="pagamentos" className="legal-section">
                <span className="secn-num">Seção 08</span>
                <h2>Inscrições, pagamentos e <em>contratos</em></h2>
                <p>As condições comerciais — valores, formas de pagamento, política de cancelamento e reembolso, prazos de inscrição — são definidas no ato da inscrição ou no contrato firmado entre o Instituto NTC do Brasil e a Instituição Contratante.</p>
                <p>Para contratos institucionais, aplicam-se as cláusulas específicas do instrumento firmado (contrato administrativo, termo de cooperação ou termo de adesão). As contratações públicas decorrentes destes Termos ocorrem <strong>exclusivamente por contratação direta nas hipóteses de dispensa ou inexigibilidade fundamentadas na Lei n.º 14.133/2021</strong>, conforme detalhado na página de <Link href="/solucoes">Soluções</Link>. Estes Termos não disciplinam, e o Instituto NTC do Brasil não participa, de procedimentos de pregão, concorrência tradicional, credenciamento genérico ou ata de registro de preços para a entrega formativa aqui prevista.</p>
                <p>Estes Termos não substituem o contrato — em caso de conflito entre o instrumento firmado e estes Termos, prevalece o contrato institucional na medida das suas cláusulas específicas.</p>
              </section>

              {/* SEÇÃO 09 — LIMITAÇÃO DE RESPONSABILIDADE */}
              <section id="limitacao" className="legal-section">
                <span className="secn-num">Seção 09</span>
                <h2>Limitação de <em>responsabilidade</em></h2>
                <p>O Grupo NTC adota o estado da arte em medidas técnicas e organizacionais para a disponibilidade, integridade e confidencialidade dos Canais Digitais, mas <strong>não garante operação ininterrupta e absolutamente isenta de falhas</strong>, dada a natureza das redes públicas e da infraestrutura de internet.</p>
                <p>Não responde por:</p>
                <ul>
                  <li>Indisponibilidades decorrentes de manutenção programada, comunicada com razoável antecedência;</li>
                  <li>Falhas atribuíveis a operadoras de telecomunicação, ataques cibernéticos de larga escala (DDoS) ou eventos de força maior;</li>
                  <li>Conteúdo de terceiros eventualmente referenciado em links externos, especialmente sites de instituições contratantes, redes sociais ou plataformas governamentais;</li>
                  <li>Uso indevido das credenciais por terceiros decorrente de descuido do próprio Usuário.</li>
                </ul>
                <p>Em qualquer hipótese, a responsabilidade total do Instituto NTC do Brasil limita-se ao valor efetivamente pago pelo Usuário ou pela Instituição Contratante pelo evento ou serviço relacionado ao incidente.</p>
                <p>A limitação prevista nesta cláusula <strong>não afasta responsabilidades que, por disposição legal, não possam ser excluídas ou limitadas</strong>, inclusive em hipóteses de dolo, fraude, violação deliberada de confidencialidade ou outras situações de responsabilidade inafastável.</p>
              </section>

              {/* SEÇÃO 10 — SUSPENSÃO E RESCISÃO */}
              <section id="rescisao" className="legal-section">
                <span className="secn-num">Seção 10</span>
                <h2>Suspensão e <em>rescisão</em></h2>
                <p>O Grupo NTC poderá suspender ou cancelar, a qualquer tempo e sem aviso prévio, o acesso de Usuários que:</p>
                <ul>
                  <li>Violem qualquer cláusula destes Termos;</li>
                  <li>Pratiquem condutas ilícitas, fraudulentas, discriminatórias ou ofensivas;</li>
                  <li>Utilizem indevidamente conteúdo formativo protegido por direito autoral;</li>
                  <li>Forneçam informações cadastrais falsas;</li>
                  <li>Provoquem risco operacional ou reputacional aos demais participantes ou ao Instituto NTC do Brasil.</li>
                </ul>
                <p>A suspensão não exime o Usuário do cumprimento das obrigações assumidas até a data do ato, especialmente quanto à confidencialidade do conteúdo formativo acessado.</p>
              </section>

              {/* SEÇÃO 11 — ALTERAÇÃO DOS TERMOS */}
              <section id="alteracoes-termos" className="legal-section">
                <span className="secn-num">Seção 11</span>
                <h2>Alteração dos <em>Termos</em></h2>
                <p>Estes Termos podem ser atualizados pelo Instituto NTC do Brasil para acompanhar evoluções regulatórias, técnicas ou comerciais. A versão vigente e a data de revisão estarão sempre publicadas nesta página.</p>
                <p>Alterações substantivas — que alterem o escopo de direitos e obrigações — serão comunicadas previamente aos Usuários ativos por canal eletrônico institucional, com prazo razoável de 30 (trinta) dias para manifestação. A continuidade do uso após esse prazo implica aceite da nova versão.</p>
              </section>

              {/* SEÇÃO 12 — LEI APLICÁVEL E FORO */}
              <section id="foro" className="legal-section">
                <span className="secn-num">Seção 12</span>
                <h2>Lei aplicável e <em>foro</em></h2>
                <p>Estes Termos são regidos pela legislação brasileira. Os Usuários e o Instituto NTC do Brasil envidarão seus melhores esforços para resolução amigável de eventuais controvérsias por meio dos canais institucionais e do Encarregado de Tratamento de Dados.</p>
                <p>Persistindo o impasse, fica eleito o foro da Comarca de <strong>Brasília – Distrito Federal</strong> para dirimir quaisquer questões oriundas destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja, ressalvadas as hipóteses de competência absoluta previstas em lei — em especial as relativas a relações de consumo, quando aplicável.</p>
                <p><strong>Versão vigente:</strong> v1.0 · 14/05/2026.</p>
              </section>

            </div>
          </div>
        </div>
      </section>

      {/* CTA INSTITUCIONAL FINAL */}
      <section className="legal-cta-final" aria-label="Encerramento institucional">
        <div className="container legal-cta-final-inner fade-in">
          <p className="eyebrow gold" style={{ color: 'var(--dourado-soft)' }}>Instituto NTC do Brasil · Governança institucional</p>
          <h2>Dúvidas sobre uso, contratação ou certificação? <em>A equipe institucional está pronta para responder.</em></h2>
          <p>Para questões comerciais, contratuais ou de relacionamento institucional, consulte os canais oficiais do Instituto NTC do Brasil. Para questões relacionadas a dados pessoais, o canal exclusivo é o do Encarregado (DPO).</p>
          <div className="legal-cta-final-actions">
            <a className="btn btn--gold" href="mailto:dpo@institutontc.com.br" data-cms-link="contato-dpo">Falar com o DPO →</a><Link className="btn btn--ghost-light" href="/lgpd#exercicio-direitos" data-cms-link="exercicio-direitos">Exercer direitos do titular</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
