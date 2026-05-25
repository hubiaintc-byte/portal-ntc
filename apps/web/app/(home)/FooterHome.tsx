import Link from "next/link";

/**
 * `FooterHome` — rodapé institucional literal do protótipo
 * (02_Prototipo_Home_GrupoNTC_v3_Premium.html, linhas 3392–3458).
 *
 * Server Component sem interações. Links seguem os mesmos anchors do
 * HTML; à medida que outras rotas forem portadas, serão substituídos
 * por `/programas`, `/agenda`, etc.
 */
export function FooterHome() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logos/logo-dark.svg" alt="Grupo NTC" />
            <span className="footer-tagline">O novo padrão da formação institucional.</span>
            <p className="footer-address">
              <strong>Instituto NTC do Brasil</strong>
              <br />
              SCS Quadra 9, Bloco C — Ed. Parque Cidade Corporate, Sala 1001
              <br />
              Asa Sul · CEP 70308-200 · Brasília – DF
              <br />
              (63) 3212-1199 · contato@institutontc.com.br
            </p>
          </div>

          <div className="footer-col">
            <h5>Navegação</h5>
            <ul>
              <li><a href="#sobre">Grupo NTC</a></li>
              <li><a href="#programas">Programas</a></li>
              <li><a href="#capacitacao">Capacitação</a></li>
              <li><a href="#solucoes">Soluções</a></li>
              <li><Link href="/conteudos">Conteúdos</Link></li>
              <li><a href="#docentes">Corpo Docente</a></li>
              <li><a href="#eventon">EventOn</a></li>
              <li><Link href="/contato">Contato</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Verticais</h5>
            <ul>
              <li><a href="#programas">NTC Educação</a></li>
              <li><a href="#programas">NTC Gestão Pública</a></li>
              <li><a href="#programas">NTC Saúde</a></li>
              <li><a href="#contratacao">Soluções in company</a></li>
              <li><a href="#contratacao">Turmas fechadas</a></li>
              <li><a href="#contratacao">Soluções sob medida</a></li>
              <li><a href="#contratacao">Contratação institucional</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Atendimento</h5>
            <ul>
              <li><a href="#eventos-abertos">Eventos com inscrições abertas</a></li>
              <li><a href="#contratacao">Solicitar proposta</a></li>
              <li><a href="#contratacao">Inscrever equipe</a></li>
              <li><Link href="/contato">Atendimento comercial</Link></li>
              <li><a href="#eventon">Suporte ao participante</a></li>
              <li><a href="#eventon">Área do Participante</a></li>
              <li><Link href="/contato">WhatsApp · (63) 98444-4040</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-badge">
            Grupo NTC — Núcleo de Tecnologia e Conhecimento · 2026
          </p>
          <ul className="footer-legal">
            <li><a href="/politica-de-privacidade">Política de Privacidade</a></li>
            <li><a href="/termos-de-uso">Termos de Uso</a></li>
            <li><a href="/politica-de-cookies">Política de Cookies</a></li>
            <li><a href="/lgpd">LGPD</a></li>
            <li><a href="/mapa-do-site">Mapa do site</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
