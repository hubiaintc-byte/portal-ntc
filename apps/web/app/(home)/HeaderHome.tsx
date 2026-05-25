"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `HeaderHome` — header sticky com mega-menu hover + mobile drawer.
 *
 * Markup literal do 02_Prototipo_Home_GrupoNTC_v3_Premium.html (linhas
 * 2000–2169) com:
 * - Lógica do `<script>` inline do HTML reescrita em React:
 *   - Mega-menu abre/fecha por hover no nav-item ou no próprio mega
 *     (delay de fechamento curto para tolerar travessia do mouse).
 *   - Mobile drawer abre/fecha via toggle + backdrop, com classe
 *     no-scroll no body para travar scroll.
 *   - Submenus do drawer expandem com `+/−`.
 */

type MegaId = "programas" | "capacitacao" | "solucoes";

export function HeaderHome() {
  const [megaAberto, setMegaAberto] = useState<MegaId | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [subDrawerAberto, setSubDrawerAberto] = useState<Record<string, boolean>>({});
  const closeTimerRef = useRef<number | null>(null);

  const abrirMega = useCallback((id: MegaId) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMegaAberto(id);
  }, []);

  const fecharMegaComDelay = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setMegaAberto(null), 180);
  }, []);

  const fecharTudo = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMegaAberto(null);
    setDrawerAberto(false);
  }, []);

  /**
   * Event delegation: qualquer clique em <a> (incluindo <Link> do
   * Next, que renderiza um <a> internamente) dentro do header
   * fecha o mega-menu e o drawer mobile. Garante que cliques em
   * NTC Educação, AGIP, EventOn, etc. levem para a nova rota
   * SEM deixar o overlay aberto.
   */
  const handleHeaderClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a")) fecharTudo();
    },
    [fecharTudo],
  );

  // ESC fecha tudo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaAberto(null);
        setDrawerAberto(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll quando drawer abre
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (drawerAberto) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [drawerAberto]);

  const propsItemMega = (id: MegaId) => ({
    onMouseEnter: () => abrirMega(id),
    onMouseLeave: fecharMegaComDelay,
    onFocus: () => abrirMega(id),
    onBlur: fecharMegaComDelay,
  });

  const propsMega = (id: MegaId) => ({
    className: `mega ${megaAberto === id ? "is-open" : ""}`,
    "data-mega-id": id,
    onMouseEnter: () => abrirMega(id),
    onMouseLeave: fecharMegaComDelay,
  });

  const toggleSub = (key: string) =>
    setSubDrawerAberto((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <header className="site-header" id="topo" onClick={handleHeaderClick}>
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="Grupo NTC — Página inicial">
            <img src="/logos/logo-light.svg" alt="Grupo NTC" />
          </Link>

          <nav className="nav-primary" aria-label="Navegação principal">
            <Link className="nav-item" href="/o-grupo">
              Grupo NTC
            </Link>
            <button
              type="button"
              className="nav-item has-mega"
              aria-haspopup="true"
              aria-expanded={megaAberto === "programas"}
              {...propsItemMega("programas")}
            >
              Programas
            </button>
            <button
              type="button"
              className="nav-item has-mega"
              aria-haspopup="true"
              aria-expanded={megaAberto === "capacitacao"}
              {...propsItemMega("capacitacao")}
            >
              Capacitação
            </button>
            <button
              type="button"
              className="nav-item has-mega"
              aria-haspopup="true"
              aria-expanded={megaAberto === "solucoes"}
              {...propsItemMega("solucoes")}
            >
              Soluções
            </button>
            <Link className="nav-item" href="/conteudos">
              Conteúdos
            </Link>
            <Link className="nav-item" href="/contato">
              Contato
            </Link>
          </nav>

          <div className="header-cta">
            <Link className="btn btn--secondary btn--mini" href="/contato">
              Solicitar proposta
            </Link>
            <a className="btn btn--participant btn--mini" href="#eventon">
              Área do Participante
            </a>
            <button
              type="button"
              className="mobile-toggle"
              id="mobileToggle"
              aria-label="Abrir menu"
              aria-expanded={drawerAberto}
              aria-controls="mobileDrawer"
              onClick={() => setDrawerAberto(true)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div {...propsMega("programas")} id="mega-programas">
          <div className="container">
            <div className="mega-inner">
              <div className="mega-col">
                <h4>NTC Educação · 9 programas</h4>
                <ul className="mega-list">
                  <li>
                    <Link href="/programas/edutec">
                      <strong>EDUTEC</strong>
                      <span>Educação Digital, Inovação e Tecnologias para Redes Públicas</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/pear">
                      <strong>PEAR</strong>
                      <span>Alfabetização de Alta Performance e Recomposição da Aprendizagem</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/pei">
                      <strong>PEI</strong>
                      <span>Educação Integral — Gestão, Currículo e Resultados</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/progir">
                      <strong>PROGIR</strong>
                      <span>Gestão da Inclusão com Resultado</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/proge">
                      <strong>PROGE</strong>
                      <span>Gestão Escolar, Coordenação Pedagógica e Resultados</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/egide">
                      <strong>EGIDE</strong>
                      <span>IA, Dados e Governança da Transformação Digital</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/vivaescola">
                      <strong>VIVAESCOLA</strong>
                      <span>Convivência, Permanência, Bem-Estar e Proteção Integral</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/pinei">
                      <strong>PINEI</strong>
                      <span>Primeira Infância e Educação Infantil</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/futura">
                      <strong>FUTURA</strong>
                      <span>Ensino Médio, Itinerários de Futuro, Empregabilidade</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mega-col">
                <h4>NTC Gestão Pública · 3 programas</h4>
                <ul className="mega-list">
                  <li>
                    <Link href="/programas/agip">
                      <strong>AGIP</strong>
                      <span>Governança, Integridade e Performance nas Contratações Públicas</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/lidera">
                      <strong>LIDERA</strong>
                      <span>Liderança, Direção Estratégica e Resultados na Administração</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/siga">
                      <strong>SIGA</strong>
                      <span>Soluções Inteligentes de Governança e Administração</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mega-col">
                <h4>NTC Saúde · 3 programas</h4>
                <ul className="mega-list">
                  <li>
                    <Link href="/programas/sigs">
                      <strong>SIGS</strong>
                      <span>Saúde Inteligente, Governança Digital, IA e Transformação do SUS</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/proaps">
                      <strong>PROAPS+</strong>
                      <span>Alta Performance na Atenção Primária e Redes de Cuidado</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programas/prosus">
                      <strong>PROSUS+</strong>
                      <span>Governança, Financiamento e Performance no SUS</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div {...propsMega("solucoes")} id="mega-solucoes">
          <div className="container">
            <div className="mega-inner" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="mega-col">
                <h4>Verticais</h4>
                <ul className="mega-list">
                  <li>
                    <Link href="/solucoes-estrategicas/educacao">
                      <strong>NTC Educação</strong>
                      <span>Soluções estruturadas para redes públicas de ensino</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes-estrategicas/gestao-publica">
                      <strong>NTC Gestão Pública</strong>
                      <span>Governança, integridade e performance na Administração</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes-estrategicas/saude">
                      <strong>NTC Saúde</strong>
                      <span>Inteligência institucional aplicada ao SUS</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mega-col">
                <h4>Modelos de contratação</h4>
                <ul className="mega-list">
                  <li>
                    <Link href="/solucoes#in-company">
                      <strong>Soluções in company</strong>
                      <span>Programa entregue exclusivamente à instituição</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#turmas-fechadas">
                      <strong>Turmas fechadas</strong>
                      <span>Edição operacional dedicada à equipe contratante</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#sob-medida">
                      <strong>Soluções sob medida</strong>
                      <span>Customização profunda de ementas, módulos e formato</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#trilhas">
                      <strong>Trilhas e jornadas</strong>
                      <span>Sequências formativas curadas para necessidades específicas</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#contratacao-institucional">
                      <strong>Contratação institucional</strong>
                      <span>Atendimento dedicado a órgãos públicos</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div {...propsMega("capacitacao")} id="mega-capacitacao">
          <div className="container">
            <div className="mega-inner" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="mega-col">
                <h4>Agenda e formatos</h4>
                <ul className="mega-list">
                  <li>
                    <a href="#capacitacao">
                      <strong>Agenda Geral NTC</strong>
                      <span>Todos os eventos abertos no calendário</span>
                    </a>
                  </li>
                  <li>
                    <a href="#eventos-abertos">
                      <strong>Eventos online</strong>
                      <span>Transmissão ao vivo, replay e certificado</span>
                    </a>
                  </li>
                  <li>
                    <a href="#eventos-abertos">
                      <strong>Eventos presenciais</strong>
                      <span>Encontros executivos em capitais estratégicas</span>
                    </a>
                  </li>
                  <li>
                    <a href="#eventos-abertos">
                      <strong>Eventos híbridos</strong>
                      <span>Combinação de presença e plataforma digital</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mega-col">
                <h4>Plataforma e curadoria</h4>
                <ul className="mega-list">
                  <li>
                    <a href="#eventon">
                      <strong>EventOn</strong>
                      <span>Plataforma de acesso, replay e certificado do Grupo NTC</span>
                    </a>
                  </li>
                  <li>
                    <a href="#eventon">
                      <strong>Área do Participante</strong>
                      <span>Histórico de eventos, materiais e certificados</span>
                    </a>
                  </li>
                  <li>
                    <a href="#capacitacao">
                      <strong>Próximas turmas</strong>
                      <span>Turmas em formação e inscrições antecipadas</span>
                    </a>
                  </li>
                  <li>
                    <a href="#capacitacao">
                      <strong>Eventos passados</strong>
                      <span>Acervo de eventos realizados com replay disponível</span>
                    </a>
                  </li>
                  <li>
                    <a href="#docentes">
                      <strong>Corpo Docente</strong>
                      <span>Curadoria científica e especialistas das 3 verticais</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`mobile-drawer-backdrop ${drawerAberto ? "is-open" : ""}`}
        id="mobileBackdrop"
        onClick={() => setDrawerAberto(false)}
        aria-hidden="true"
      />
      <aside
        className={`mobile-drawer ${drawerAberto ? "is-open" : ""}`}
        id="mobileDrawer"
        aria-label="Menu principal"
        aria-hidden={!drawerAberto}
      >
        <div className="drawer-head">
          <img src="/logos/logo-light.svg" alt="Grupo NTC" />
          <button
            type="button"
            className="drawer-close"
            aria-label="Fechar menu"
            onClick={() => setDrawerAberto(false)}
          >
            ×
          </button>
        </div>
        <nav className="drawer-nav" aria-label="Navegação móvel">
          <a className="drawer-item" href="#sobre" onClick={() => setDrawerAberto(false)}>
            Grupo NTC
          </a>

          <button
            type="button"
            className={`drawer-item has-sub ${subDrawerAberto["programas-mobile"] ? "is-expanded" : ""}`}
            aria-expanded={subDrawerAberto["programas-mobile"] ?? false}
            onClick={() => toggleSub("programas-mobile")}
          >
            Programas
          </button>
          <div className={`drawer-sub ${subDrawerAberto["programas-mobile"] ? "is-open" : ""}`}>
            <Link href="/programas/edutec"><strong>EDUTEC</strong><span>NTC Educação · Educação digital</span></Link>
            <Link href="/programas/pear"><strong>PEAR</strong><span>NTC Educação · Alfabetização</span></Link>
            <Link href="/programas/proge"><strong>PROGE</strong><span>NTC Educação · Gestão escolar</span></Link>
            <Link href="/programas/agip"><strong>AGIP</strong><span>NTC Gestão Pública · Contratações</span></Link>
            <Link href="/programas/lidera"><strong>LIDERA</strong><span>NTC Gestão Pública · Liderança</span></Link>
            <Link href="/programas/prosus"><strong>PROSUS+</strong><span>NTC Saúde · Governança SUS</span></Link>
            <a href="#programas"><strong>Ver todos os 15 programas →</strong><span>Página completa</span></a>
          </div>

          <button
            type="button"
            className={`drawer-item has-sub ${subDrawerAberto["capacitacao-mobile"] ? "is-expanded" : ""}`}
            aria-expanded={subDrawerAberto["capacitacao-mobile"] ?? false}
            onClick={() => toggleSub("capacitacao-mobile")}
          >
            Capacitação
          </button>
          <div className={`drawer-sub ${subDrawerAberto["capacitacao-mobile"] ? "is-open" : ""}`}>
            <a href="#capacitacao"><strong>Agenda Geral NTC</strong><span>Todos os eventos abertos</span></a>
            <a href="#eventos-abertos"><strong>Eventos online</strong><span>Ao vivo + replay</span></a>
            <a href="#eventos-abertos"><strong>Eventos presenciais</strong><span>Capitais estratégicas</span></a>
            <a href="#eventos-abertos"><strong>Eventos híbridos</strong><span>Presença + plataforma</span></a>
            <a href="#eventon"><strong>EventOn</strong><span>Plataforma de acesso e replay</span></a>
            <a href="#eventon"><strong>Área do Participante</strong><span>Materiais e certificados</span></a>
            <a href="#docentes"><strong>Corpo Docente</strong><span>Curadoria científica das 3 verticais</span></a>
          </div>

          <button
            type="button"
            className={`drawer-item has-sub ${subDrawerAberto["solucoes-mobile"] ? "is-expanded" : ""}`}
            aria-expanded={subDrawerAberto["solucoes-mobile"] ?? false}
            onClick={() => toggleSub("solucoes-mobile")}
          >
            Soluções
          </button>
          <div className={`drawer-sub ${subDrawerAberto["solucoes-mobile"] ? "is-open" : ""}`}>
            <Link href="/solucoes-estrategicas/educacao" onClick={() => setDrawerAberto(false)}>
              <strong>NTC Educação</strong>
              <span>9 programas estratégicos</span>
            </Link>
            <Link href="/solucoes-estrategicas/gestao-publica" onClick={() => setDrawerAberto(false)}>
              <strong>NTC Gestão Pública</strong>
              <span>3 programas estratégicos</span>
            </Link>
            <Link href="/solucoes-estrategicas/saude" onClick={() => setDrawerAberto(false)}>
              <strong>NTC Saúde</strong>
              <span>3 programas estratégicos</span>
            </Link>
            <Link href="/solucoes#in-company"><strong>Soluções in company</strong><span>Turmas fechadas e sob medida</span></Link>
            <Link href="/solucoes#contratacao-institucional"><strong>Contratação institucional</strong><span>Atendimento a órgãos públicos</span></Link>
          </div>

          <Link className="drawer-item" href="/conteudos" onClick={() => setDrawerAberto(false)}>
            Conteúdos
          </Link>
          <Link className="drawer-item" href="/contato" onClick={() => setDrawerAberto(false)}>
            Contato
          </Link>
        </nav>
        <div className="drawer-cta">
          <Link className="btn btn--gold" href="/contato">
            Solicitar proposta
          </Link>
          <a className="btn btn--participant" href="#eventon">
            Área do Participante
          </a>
        </div>
      </aside>
    </>
  );
}
