"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Vertical } from "@ntc/lib";

import type { MenuProgramas } from "@/lib/cms/listasProgramas";

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
 * - Mega-menu "Programas" com a lista de programas publicados no CMS,
 *   recebida por prop do layout (server); o drawer mobile continua com a
 *   seleção curada de 6, escrita aqui.
 */

type MegaId = "programas" | "capacitacao" | "solucoes";

/** Colunas do mega-menu "Programas", na ordem do protótipo. */
const COLUNAS_MENU: { vertical: Vertical; rotulo: string }[] = [
  { vertical: "educacao", rotulo: "NTC Educação" },
  { vertical: "gestao-publica", rotulo: "NTC Gestão Pública" },
  { vertical: "saude", rotulo: "NTC Saúde" },
];

function contagem(n: number): string {
  return `${n} ${n === 1 ? "programa" : "programas"}`;
}

interface HeaderHomeProps {
  /** Programas publicados no CMS (`obterMenuProgramas`), lidos no layout. */
  programas: MenuProgramas;
}

export function HeaderHome({ programas }: HeaderHomeProps) {
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
            <Link className="btn btn--secondary btn--mini" href="/contato?assunto=proposta">
              Solicitar proposta
            </Link>
            <a className="btn btn--participant btn--mini" href="https://ntceventon.com.br/" target="_blank" rel="noopener noreferrer">
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
              {COLUNAS_MENU.map(({ vertical, rotulo }) => {
                const itens = programas.porVertical[vertical];
                return (
                  <div key={vertical} className="mega-col">
                    <h4>{programas.total === null ? rotulo : `${rotulo} · ${contagem(itens.length)}`}</h4>
                    <ul className="mega-list">
                      {itens.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/programas/${p.slug}`}>
                            <strong>{p.sigla}</strong>
                            <span>{p.descricao}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
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
                    <Link href="/solucoes#modalidades">
                      <strong>Soluções in company</strong>
                      <span>Programa entregue exclusivamente à instituição</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#modalidades">
                      <strong>Turmas fechadas</strong>
                      <span>Edição operacional dedicada à equipe contratante</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#modalidades">
                      <strong>Soluções sob medida</strong>
                      <span>Customização profunda de ementas, módulos e formato</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#modalidades">
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
                    <Link href="/agenda">
                      <strong>Agenda Geral NTC</strong>
                      <span>Todos os eventos abertos no calendário</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/agenda?modalidade=online">
                      <strong>Eventos online</strong>
                      <span>Transmissão ao vivo, replay e certificado</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/agenda?modalidade=presencial">
                      <strong>Eventos presenciais</strong>
                      <span>Encontros executivos em capitais estratégicas</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/agenda?modalidade=hibrido">
                      <strong>Eventos híbridos</strong>
                      <span>Combinação de presença e plataforma digital</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/agenda?tab=realizados">
                      <strong>Eventos passados</strong>
                      <span>Acervo de eventos realizados com replay disponível</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mega-col">
                <h4>Plataforma e curadoria</h4>
                <ul className="mega-list">
                  <li>
                    <Link href="/eventon">
                      <strong>EventOn</strong>
                      <span>Plataforma de acesso, replay e certificado do Grupo NTC</span>
                    </Link>
                  </li>
                  <li>
                    <a href="https://ntceventon.com.br/" target="_blank" rel="noopener noreferrer">
                      <strong>Área do Participante</strong>
                      <span>Histórico de eventos, materiais e certificados</span>
                    </a>
                  </li>
                  <li>
                    <Link href="/o-grupo/corpo-docente">
                      <strong>Corpo Docente</strong>
                      <span>Curadoria científica e especialistas das 3 verticais</span>
                    </Link>
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
          <Link className="drawer-item" href="/#sobre" onClick={() => setDrawerAberto(false)}>
            Grupo NTC
          </Link>

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
            <Link href="/programas"><strong>{programas.total === null ? "Ver todos os programas →" : `Ver todos os ${contagem(programas.total)} →`}</strong><span>Página completa</span></Link>
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
            <Link href="/agenda"><strong>Agenda Geral NTC</strong><span>Todos os eventos abertos</span></Link>
            <Link href="/agenda?modalidade=online"><strong>Eventos online</strong><span>Ao vivo + replay</span></Link>
            <Link href="/agenda?modalidade=presencial"><strong>Eventos presenciais</strong><span>Capitais estratégicas</span></Link>
            <Link href="/agenda?modalidade=hibrido"><strong>Eventos híbridos</strong><span>Presença + plataforma</span></Link>
            <Link href="/agenda?tab=realizados"><strong>Eventos passados</strong><span>Acervo com replay disponível</span></Link>
            <Link href="/eventon"><strong>EventOn</strong><span>Plataforma de acesso e replay</span></Link>
            <a href="https://ntceventon.com.br/" target="_blank" rel="noopener noreferrer"><strong>Área do Participante</strong><span>Materiais e certificados</span></a>
            <Link href="/o-grupo/corpo-docente"><strong>Corpo Docente</strong><span>Curadoria científica das 3 verticais</span></Link>
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
            <Link href="/solucoes#modalidades"><strong>Soluções in company</strong><span>Turmas fechadas e sob medida</span></Link>
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
          <Link className="btn btn--gold" href="/contato?assunto=proposta">
            Solicitar proposta
          </Link>
          <a className="btn btn--participant" href="https://ntceventon.com.br/" target="_blank" rel="noopener noreferrer">
            Área do Participante
          </a>
        </div>
      </aside>
    </>
  );
}
